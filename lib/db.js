// lib/db.js
import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,      // add in Vercel → Environment Variables
      user: process.env.DB_USER,      // add in Vercel → Environment Variables
      password: process.env.DB_PASSWORD, // add in Vercel → Environment Variables
      database: process.env.DB_NAME,  // add in Vercel → Environment Variables
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

// Optional: make sure table exists
export async function ensureTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      contact VARCHAR(20) NOT NULL,
      image VARCHAR(255),
      email_id VARCHAR(255) NOT NULL
    )
  `);
}
