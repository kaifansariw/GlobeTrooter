const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isRemoteDb = Boolean(
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('localhost') &&
  !process.env.DATABASE_URL.includes('127.0.0.1')
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (isProduction || isRemoteDb) ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Connected to PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

// Auto-initialize schema if tables do not exist (ideal for Render PostgreSQL databases)
async function initDb() {
  if (!process.env.DATABASE_URL) return;
  try {
    const res = await pool.query(`SELECT to_regclass('public.users') as exists;`);
    if (!res.rows[0].exists) {
      console.log('🌱 Fresh database detected. Initializing schema & seed data...');
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await pool.query(schemaSql);
      console.log('✅ Database schema and seeds successfully applied!');
    }
  } catch (err) {
    console.warn('⚠️ Auto-init DB check notice:', err.message);
  }
}

initDb();

module.exports = pool;
