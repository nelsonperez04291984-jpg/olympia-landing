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
    console.log("Providers table ready.");

    // Check if the seed user exists
    const res = await pool.query("SELECT * FROM providers WHERE provider_id = $1", ["provider123"]);
    
    if (res.rows.length === 0) {
      console.log("Seed provider not found. Creating...");
      
      // Hash a default password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("password123", salt);

      await pool.query(
        "INSERT INTO providers (provider_id, name, email, password_hash) VALUES ($1, $2, $3, $4)",
        ["provider123", "Dr. Jane Smith", "jane.smith@example.com", hash]
      );
      
      console.log("Seed provider created!");
      console.log("Username: provider123 | Password: password123");
    } else {
      console.log("Seed provider already exists. Skipping creation.");
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
