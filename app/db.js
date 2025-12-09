const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME || 'appdb'
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      count INT NOT NULL
    );
  `);

  const res = await pool.query('SELECT * FROM visits;');
  if (res.rows.length === 0) {
    await pool.query('INSERT INTO visits(count) VALUES($1);', [0]);
  }
}

async function incrementAndGet() {
  await pool.query('UPDATE visits SET count = count + 1 WHERE id = 1;');
  const result = await pool.query('SELECT count FROM visits WHERE id = 1;');
  return result.rows[0].count;
}

module.exports = { initDb, incrementAndGet };
