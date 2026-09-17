require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const migrate = async () => {
  const migrationsDirectory = path.join(__dirname, '../../db/migrations');
  const migrations = fs.readdirSync(migrationsDirectory).filter((file) => file.endsWith('.sql')).sort();
  const client = await pool.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((row) => row.name));
    for (const migration of migrations) {
      if (applied.has(migration)) continue;
      const sql = fs.readFileSync(path.join(migrationsDirectory, migration), 'utf8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migration]);
      await client.query('COMMIT');
      console.log(`Applied ${migration}`);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  await pool.end();
  console.log('Database migration completed.');
};

migrate().catch(async (error) => {
  console.error('Database migration failed:', error.message);
  await pool.end();
  process.exit(1);
});
