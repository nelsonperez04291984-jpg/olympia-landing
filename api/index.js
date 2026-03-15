import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();

app.use(cors());
app.use(express.json());

const { Pool } = pg;
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// For local development, if this file is run directly by node
if (process.env.NODE_ENV !== 'production' && process.argv[1].includes('api/index.js')) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
}

export default app;
