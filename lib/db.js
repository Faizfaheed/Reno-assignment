import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function ensureTable() {
  const pool = getPool();
  // Follows the assignment's schema exactly
  const sql = `
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      contact VARCHAR(20),
      image TEXT,
      email_id TEXT
    )
  `;
  await pool.query(sql);
}
