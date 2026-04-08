import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import { put } from '@vercel/blob';
import { mapFhirBundleToReferral } from './utils/fhirMapper.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();

app.use(cors());
app.use(express.json());

const { Pool } = pg;

if (!process.env.POSTGRES_URL) {
  console.error("FATAL ERROR: POSTGRES_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'olympia-secret-key-1234';

app.post('/api/login', async (req, res) => {
  const { provider_id, password } = req.body;

  if (!provider_id || !password) {
    return res.status(400).json({ error: 'Provider ID and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM providers WHERE provider_id = $1', [provider_id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Provider ID or Password.' });
    }

    const provider = result.rows[0];

    // Verify Password
    const validPassword = await bcrypt.compare(password, provider.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid Provider ID or Password.' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: provider.id, provider_id: provider.provider_id, name: provider.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      provider: {
        id: provider.id,
        provider_id: provider.provider_id,
        name: provider.name,
        email: provider.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role || 'admin' },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.json({ token, username: admin.username, role: admin.role || 'admin' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin Create Provider
app.post('/api/admin/providers', async (req, res) => {
  const { provider_id, name, email, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await pool.query(
      "INSERT INTO providers (provider_id, name, email, password_hash) VALUES ($1, $2, $3, $4)",
      [provider_id, name, email, hash]
    );
    res.json({ message: 'Provider created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create provider', details: err.message });
  }
});

// Admin Create Admin Account
app.post('/api/admin/admins', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await pool.query(
      "INSERT INTO admins (username, password_hash, role) VALUES ($1, $2, $3)",
      [username, hash, role || 'admin']
    );
    res.json({ message: 'Staff account created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create staff account', details: err.message });
  }
});

// Admin Get Staff List
app.get('/api/admin/staff', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, role, created_at FROM admins ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff list' });
  }
});

// Admin Delete Provider
app.delete('/api/admin/providers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM providers WHERE id = $1', [id]);
    res.json({ message: 'Provider deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete provider' });
  }
});

// Admin Delete Admin/Staff
app.delete('/api/admin/admins/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM admins WHERE id = $1', [id]);
    res.json({ message: 'Staff member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// --- Provider Referral Endpoints ---

// Create Referral
app.post('/api/referrals', async (req, res) => {
  const { patient_name, patient_dob, patient_phone, diagnosis, services_needed } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const providerId = decoded.id;

    const result = await pool.query(
      `INSERT INTO referrals (provider_id, patient_name, patient_dob, patient_phone, diagnosis, services_needed, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING *`,
      [providerId, patient_name, patient_dob, patient_phone, diagnosis, services_needed]
    );
    res.json({ message: 'Referral submitted successfully', referral: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit referral', details: err.message });
  }
});

// FHIR-Compatible Referral Ingestion (Automated EHR Integration)
app.post('/api/fhir/ingest', async (req, res) => {
  const bundle = req.body;
  const apiKey = req.headers['x-api-key'];
  const VALID_API_KEY = process.env.FHIR_API_KEY || 'olympia_fhir_test_667788';

  // 0. Security Audit (API Key Verification)
  if (apiKey !== VALID_API_KEY) {
      console.error('Unauthorized FHIR Ingestion Attempt - Invalid API Key');
      return res.status(401).json({ error: 'Unauthorized: Invalid or Missing API Key' });
  }
  
  try {
    // 1. Map FHIR Bundle to Internal Model
    const referralData = mapFhirBundleToReferral(bundle);
    
    // 2. Extract Data
    const { 
        patient_name, patient_dob, patient_phone, diagnosis, 
        services_needed, external_id, source, raw_fhir, icd_primary 
    } = referralData;

    // 3. Insert with Conflict Handling (prevent duplicate FHIR ingests)
    const result = await pool.query(
      `INSERT INTO referrals (
        patient_name, patient_dob, patient_phone, diagnosis, 
        services_needed, status, source, external_id, raw_fhir, icd_primary
      ) 
       VALUES ($1, $2, $3, $4, $5, 'Pending', $6, $7, $8, $9)
       ON CONFLICT (external_id) DO UPDATE SET 
         patient_name = EXCLUDED.patient_name,
         diagnosis = EXCLUDED.diagnosis,
         status = 'Pending'
       RETURNING *`,
      [patient_name, patient_dob, patient_phone, diagnosis, services_needed, source, external_id, JSON.stringify(raw_fhir), icd_primary]
    );

    res.json({ 
        message: 'FHIR Referral Ingested Successfully', 
        referral_id: result.rows[0].id,
        status: 'Pending Intake'
    });
  } catch (err) {
    console.error('FHIR Ingestion error:', err);
    res.status(400).json({ error: 'FHIR Ingestion Failed', details: err.message });
  }
});

// Get My Referrals
app.get('/api/referrals/my', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT * FROM referrals WHERE provider_id = $1 ORDER BY created_at DESC',
      [decoded.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get Provider Referral Stats
app.get('/api/referrals/stats', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const providerId = decoded.id;

    const stats = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status ILIKE 'Admitted' OR status ILIKE 'Processing')::int as active,
        COUNT(*) FILTER (WHERE status ILIKE 'Pending')::int as pending
      FROM referrals 
      WHERE provider_id = $1
    `, [providerId]);
    
    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch referral statistics' });
  }
});

// --- Public (Hospital Link) Referrals ---

// Validate Referral Link Token
app.get('/api/public/provider-info/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name FROM providers WHERE referral_token = $1',
      [token]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invalid referral token' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to access referral link' });
  }
});

// Submit Referral via Fast-Link (Public)
app.post('/api/public/referrals', async (req, res) => {
  const { 
    token, patient_name, patient_dob, patient_phone, 
    patient_address, emergency_contact, preferred_language,
    diagnosis, services_needed, 
    insurance_provider, insurance_policy, 
    referral_priority, soc_request, 
    physician_name, physician_npi,
    documents_provided, document_urls,
    primary_diagnosis, secondary_diagnoses
  } = req.body;
  
  const status_token = Math.random().toString(36).substring(2, 15);
  
  try {
    // 1. Verify Token and get Provider ID
    const providerRes = await pool.query('SELECT id FROM providers WHERE referral_token = $1', [token]);
    if (providerRes.rows.length === 0) return res.status(403).json({ error: 'Prohibited: Link and token no longer active' });
    
    const providerId = providerRes.rows[0].id;

    // 2. Ingest Referral with "Manual Link" source and new clinical fields
    const result = await pool.query(
      `INSERT INTO referrals (
        provider_id, patient_name, patient_dob, patient_phone, 
        patient_address, emergency_contact, preferred_language,
        diagnosis, services_needed, status, source,
        insurance_provider, insurance_policy, referral_priority, soc_request,
        physician_name, physician_npi,
        documents_provided, document_urls,
        status_token, primary_diagnosis, secondary_diagnoses
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', 'Manual_FastLink', $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) 
       RETURNING *`,
      [
        providerId, patient_name, patient_dob, patient_phone, 
        patient_address, emergency_contact, preferred_language,
        diagnosis || (primary_diagnosis ? primary_diagnosis.description : ''), 
        services_needed, 
        insurance_provider, insurance_policy, 
        referral_priority || 'Routine', soc_request || 'Routine',
        physician_name, physician_npi,
        documents_provided || false, 
        document_urls ? JSON.stringify(document_urls) : '[]',
        status_token,
        primary_diagnosis ? JSON.stringify(primary_diagnosis) : null,
        secondary_diagnoses ? JSON.stringify(secondary_diagnoses) : '[]'
      ]
    );
    
    res.json({ message: 'Referral captured via Fast-Link', id: result.rows[0].id, status_token: result.rows[0].status_token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit via link', details: err.message });
  }
});

// --- File Upload (Public - Vercel Blob) ---
app.post('/api/public/upload', upload.array('files', 10), async (req, res) => {
  try {
    const uploadResults = [];
    for (const file of req.files) {
      const blob = await put(
        `referrals/${Date.now()}-${file.originalname}`,
        file.buffer,
        { access: 'public', contentType: file.mimetype }
      );
      uploadResults.push({
        name: file.originalname,
        url: blob.url,
        size: file.size,
        type: file.mimetype
      });
    }
    res.json({ files: uploadResults });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// Get Referral Status (Public)
app.get('/api/public/referral-status/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const result = await pool.query(
      `SELECT status, referral_priority, created_at, patient_name 
       FROM referrals 
       WHERE status_token = $1`, 
      [token]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Referral tracking link not found' });
    
    // Obfuscate patient name for public security
    const r = result.rows[0];
    const nameParts = r.patient_name.split(' ');
    const obfuscatedName = nameParts.length > 1 
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : r.patient_name;

    res.json({
        status: r.status,
        priority: r.referral_priority,
        received_at: r.created_at,
        patient: obfuscatedName
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// --- Admin Referral Management ---

// Get All Referrals (for Intake)
app.get('/api/admin/referrals', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.name as provider_name 
      FROM referrals r
      LEFT JOIN providers p ON r.provider_id::text = p.id::text
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals', details: err.message });
  }
});

// Update Referral (Status & Clinical Data)
app.patch('/api/admin/referrals/:id', async (req, res) => {
  const { id } = req.params;
  const { status, icd_primary, icd_secondary, pdgm_weight } = req.body;
  try {
    const result = await pool.query(
      `UPDATE referrals 
       SET status = COALESCE($1, status), 
           icd_primary = COALESCE($2, icd_primary), 
           icd_secondary = COALESCE($3, icd_secondary), 
           pdgm_weight = COALESCE($4, pdgm_weight) 
       WHERE id = $5 RETURNING *`,
      [status, icd_primary, icd_secondary, pdgm_weight, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Referral not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update referral', details: err.message });
  }
});

// Admin Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const providerCount = await pool.query('SELECT COUNT(*) FROM providers');
    const referralCount = await pool.query('SELECT COUNT(*) FROM referrals');
    const staffCount = await pool.query('SELECT COUNT(*) FROM admins');
    const recentLogs = await pool.query('SELECT * FROM ai_logs ORDER BY created_at DESC LIMIT 10');
    const providers = await pool.query('SELECT id, name, provider_id, email, referral_token FROM providers');

    res.json({
      provider_count: parseInt(providerCount.rows[0].count),
      referral_count: parseInt(referralCount.rows[0].count),
      staff_count: parseInt(staffCount.rows[0].count),
      recent_ai_logs: recentLogs.rows,
      providers: providers.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Schema Fix Route (Role & Timestamps & Referral Fields)
app.get('/api/admin/fix-schema', async (req, res) => {
  try {
    // Admin table updates
    await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin'");
    await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    
    // Providers table updates (Referral Link Tokens)
    await pool.query("ALTER TABLE providers ADD COLUMN IF NOT EXISTS referral_token VARCHAR(255) UNIQUE");
    
    // Initialize tokens for existing providers if they are null
    await pool.query(`
      UPDATE providers 
      SET referral_token = LOWER(REPLACE(name, ' ', '-')) || '-' || SUBSTRING(MD5(id::text), 1, 6)
      WHERE referral_token IS NULL
    `);
    
    // Referrals table updates/repairs
    // Ensure table exists with correct base
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER REFERENCES providers(id),
        patient_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns if they don't exist
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS patient_dob VARCHAR(20)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS patient_phone VARCHAR(20)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS diagnosis TEXT");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS services_needed TEXT");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS icd_primary VARCHAR(20)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS icd_secondary TEXT");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS pdgm_weight VARCHAR(20)");
    
    // FHIR Integration Columns (Automated EHR Ingestion)
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'Portal'");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) UNIQUE");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS raw_fhir JSONB");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS pdgm_group_predicted VARCHAR(100)");
    
    // Clinical Intake Fields (Insurance & Priority)
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(255)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS insurance_policy VARCHAR(100)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referral_priority VARCHAR(20) DEFAULT 'Routine'");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS documents_provided BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS status_token VARCHAR(36)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS primary_diagnosis JSONB");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS secondary_diagnoses JSONB DEFAULT '[]'");
    
    // Hospital-Grade Demographic Expansion
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS patient_address TEXT");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50) DEFAULT 'English'");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS soc_request VARCHAR(50) DEFAULT 'Routine'");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS physician_name VARCHAR(255)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS physician_npi VARCHAR(20)");
    await pool.query("ALTER TABLE referrals ADD COLUMN IF NOT EXISTS document_urls JSONB DEFAULT '[]'");
    // Diagnosis Master Tool Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS diagnosis_lookup (
        code VARCHAR(20) PRIMARY KEY,
        description TEXT,
        clinical_group VARCHAR(100),
        priority_order INTEGER DEFAULT 99
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS icd9_mappings (
        icd9_code VARCHAR(20) PRIMARY KEY,
        potential_icd10 TEXT,
        description TEXT,
        needs_review BOOLEAN DEFAULT FALSE
      )
    `);

    // Check if the foreign key is correct. 
    // If it was created pointing to admins(id) by mistake, we fix it here.
    try {
      await pool.query("ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_provider_id_fkey");
      await pool.query("ALTER TABLE referrals ADD CONSTRAINT referrals_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id)");
    } catch (err) {
      console.log("Constraint fix skipped or failed (might not exist yet):", err.message);
    }
    
    res.json({ status: 'Schema updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Schema fix failed', details: err.message });
  }
});

// ── Diagnosis Batch Lookup ─────────────────────────────────────────
// POST /api/admin/diagnosis/batch-lookup
// Body: { codes: ["I10", "4019", "E119", ...] }
app.post('/api/admin/diagnosis/batch-lookup', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const { codes } = req.body;
  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ error: 'Provide a non-empty codes array.' });
  }
  if (codes.length > 200) {
    return res.status(400).json({ error: 'Maximum 200 codes per request.' });
  }

  try {
    // Normalize: strip dots/dashes/spaces, uppercase
    const normalized = codes
      .map(c => String(c).replace(/[\s.-]/g, '').toUpperCase().trim())
      .filter(Boolean);

    // Detect ICD-9 vs ICD-10 (ICD-9 codes are purely numeric, optionally with a decimal)
    const icd10Codes = normalized.filter(c => /[A-Z]/.test(c));
    const icd9Codes  = normalized.filter(c => /^\d{3,5}$/.test(c));

    // ── ICD-10 lookup ──────────────────────────────────────────
    let icd10Rows = [];
    if (icd10Codes.length > 0) {
      const placeholders = icd10Codes.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `SELECT code, description, clinical_group, priority_order, subchapter, comorbidity_group
         FROM diagnosis_lookup
         WHERE code = ANY(ARRAY[${placeholders}])`,
        icd10Codes
      );
      icd10Rows = result.rows;
    }

    // Build ICD-10 result map (code → row)
    const icd10Map = new Map(icd10Rows.map(r => [r.code, r]));

    // ── ICD-9 crosswalk lookup ─────────────────────────────────
    let icd9Rows = [];
    if (icd9Codes.length > 0) {
      const placeholders = icd9Codes.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `SELECT icd9_code, potential_icd10, description, needs_review
         FROM icd9_mappings
         WHERE icd9_code = ANY(ARRAY[${placeholders}])`,
        icd9Codes
      );
      icd9Rows = result.rows;
    }
    const icd9Map = new Map(icd9Rows.map(r => [r.icd9_code, r]));

    // ── For resolved ICD-9 codes, also look up their target ICD-10 in master ──
    const resolvedIcd10Targets = [];
    icd9Rows.forEach(r => {
      if (!r.needs_review && r.potential_icd10) {
        const target = r.potential_icd10.toUpperCase().replace(/[\s.-]/g, '');
        resolvedIcd10Targets.push(target);
      }
    });
    let resolvedMasterRows = [];
    if (resolvedIcd10Targets.length > 0) {
      const ph = resolvedIcd10Targets.map((_, i) => `$${i + 1}`).join(', ');
      const r = await pool.query(
        `SELECT code, description, clinical_group, priority_order, subchapter, comorbidity_group
         FROM diagnosis_lookup WHERE code = ANY(ARRAY[${ph}])`,
        resolvedIcd10Targets
      );
      resolvedMasterRows = r.rows;
    }
    const resolvedMasterMap = new Map(resolvedMasterRows.map(r => [r.code, r]));

    // ── Fetch the groups legend for name mapping ───────────────
    const groupsResult = await pool.query(`
      SELECT DISTINCT clinical_group,
             MIN(priority_order) as priority_order
      FROM diagnosis_lookup
      GROUP BY clinical_group
      ORDER BY MIN(priority_order)
    `);
    const groupPriorityMap = new Map(groupsResult.rows.map(r => [r.clinical_group, parseInt(r.priority_order)]));

    // Group name legend (hard-coded from the Excel Groups sheet for display)
    const GROUP_NAMES = {
      A: 'Other',       B: 'Neuro',           C: 'Wound',
      D: 'Complex Nursing', E: 'MS',           F: 'Cardiac',
      G: 'GIGU',        H: 'Respiratory',     I: 'Infectious',
      J: 'Behavioral',  K: 'Endo/Metabolic',  L: 'Medication Mgmt'
    };

    // ── Build final result list ────────────────────────────────
    const seenInRequest = new Map(); // code → first-occurrence index
    const results = [];

    normalized.forEach((code, idx) => {
      const isIcd9 = /^\d{3,5}$/.test(code);

      if (isIcd9) {
        const crosswalk = icd9Map.get(code);
        if (!crosswalk) {
          results.push({
            input_code: code,
            type: 'ICD-9',
            status: 'Unrecognized',
            description: 'Not found in ICD-9 crosswalk',
            clinical_group: null,
            group_name: null,
            priority_order: 999,
            comorbidity_group: 'No_group',
            needs_review: true,
            icd9_options: [],
            is_duplicate: seenInRequest.has(code),
          });
        } else {
          const isDup = seenInRequest.has(code);
          let masterData = null;
          let targetCode = null;
          if (!crosswalk.needs_review && crosswalk.potential_icd10) {
            targetCode = crosswalk.potential_icd10.toUpperCase().replace(/[\s.-]/g, '');
            masterData = resolvedMasterMap.get(targetCode);
          }

          results.push({
            input_code: code,
            mapped_icd10: crosswalk.needs_review ? null : crosswalk.potential_icd10,
            type: 'ICD-9',
            status: crosswalk.needs_review ? 'Needs Review' : (isDup ? 'Duplicate' : 'Mapped'),
            description: masterData?.description || crosswalk.description || 'See ICD-9 crosswalk',
            clinical_group: masterData?.clinical_group || null,
            group_name: masterData ? (GROUP_NAMES[masterData.clinical_group] || masterData.clinical_group) : null,
            priority_order: masterData?.priority_order || 998,
            comorbidity_group: masterData?.comorbidity_group || 'No_group',
            subchapter: masterData?.subchapter || null,
            needs_review: crosswalk.needs_review,
            icd9_options: crosswalk.needs_review
              ? crosswalk.potential_icd10.split(',').map(s => s.trim()).filter(Boolean)
              : [],
            is_duplicate: isDup,
          });
        }
      } else {
        // ICD-10 path
        const master = icd10Map.get(code);
        const isDup  = seenInRequest.has(code);

        if (!master) {
          results.push({
            input_code: code,
            type: 'ICD-10',
            status: 'Unrecognized',
            description: 'Code not found in master database',
            clinical_group: null,
            group_name: null,
            priority_order: 999,
            comorbidity_group: 'No_group',
            needs_review: false,
            icd9_options: [],
            is_duplicate: isDup,
          });
        } else {
          results.push({
            input_code: code,
            type: 'ICD-10',
            status: isDup ? 'Duplicate' : 'Verified',
            description: master.description,
            clinical_group: master.clinical_group,
            group_name: GROUP_NAMES[master.clinical_group] || master.clinical_group,
            priority_order: parseInt(master.priority_order),
            comorbidity_group: master.comorbidity_group,
            subchapter: master.subchapter,
            needs_review: false,
            icd9_options: [],
            is_duplicate: isDup,
          });
        }
      }

      if (!seenInRequest.has(code)) seenInRequest.set(code, idx);
    });

    // ── Sort by priority order ─────────────────────────────────
    results.sort((a, b) => (a.priority_order || 999) - (b.priority_order || 999));

    // ── Summary stats ──────────────────────────────────────────
    const summary = {
      total:         results.length,
      verified:      results.filter(r => r.status === 'Verified').length,
      mapped_icd9:   results.filter(r => r.status === 'Mapped').length,
      needs_review:  results.filter(r => r.needs_review || r.status === 'Needs Review').length,
      unrecognized:  results.filter(r => r.status === 'Unrecognized').length,
      duplicates:    results.filter(r => r.is_duplicate).length,
      comorbidities: results.filter(r => r.comorbidity_group && r.comorbidity_group !== 'No_group').length,
      groups_covered: [...new Set(results.map(r => r.group_name).filter(Boolean))],
    };

    res.json({ results, summary });
  } catch (err) {
    console.error('Batch lookup error:', err);
    res.status(500).json({ error: 'Lookup failed', details: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// For local development, if this file is run directly by node
if (process.env.NODE_ENV !== 'production' && process.argv[1].includes('api/index.js')) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
}

export default app;
