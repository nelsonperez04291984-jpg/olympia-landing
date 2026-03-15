import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env or .env.local
dotenv.config();
dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function initDB() {
  try {
    console.log("Connecting to the database...");
    
    // Create the providers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        provider_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check for role column (if table exists)
    try {
      await pool.query("ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin'");
    } catch (e) {}

    // Create the referrals table (to track metrics)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        patient_name VARCHAR(100),
        provider_id VARCHAR(50) REFERENCES providers(provider_id),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create the ai_logs table (to track AI interactions)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_logs (
        id SERIAL PRIMARY KEY,
        user_query TEXT,
        ai_response TEXT,
        session_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database schema updated.");

    // Check if the seed provider exists
    const resProvider = await pool.query("SELECT * FROM providers WHERE provider_id = $1", ["provider123"]);
    
    if (resProvider.rows.length === 0) {
      console.log("Seed provider not found. Creating...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("password123", salt);
      await pool.query(
        "INSERT INTO providers (provider_id, name, email, password_hash) VALUES ($1, $2, $3, $4)",
        ["provider123", "Dr. Jane Smith", "jane.smith@example.com", hash]
      );
      console.log("Seed provider created!");
    }

    // Check if seed admin exists
    const resAdmin = await pool.query("SELECT * FROM admins WHERE username = $1", ["admin"]);
    if (resAdmin.rows.length === 0) {
      console.log("Seed admin not found. Creating...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("olympia-admin-2026", salt);
      await pool.query("INSERT INTO admins (username, password_hash, role) VALUES ($1, $2, $3)", ["admin", hash, "superadmin"]);
      console.log("Seed admin created: admin / olympia-admin-2026 (superadmin)");
    } else if (resAdmin.rows[0].role !== 'superadmin') {
      await pool.query("UPDATE admins SET role = 'superadmin' WHERE username = 'admin'");
      console.log("Admin upgraded to superadmin.");
    }

  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    // End the pool
    await pool.end();
    console.log("Database connection closed.");
  }
}

initDB();
