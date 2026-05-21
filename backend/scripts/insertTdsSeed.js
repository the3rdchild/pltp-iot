require('dotenv').config({ path: '/www/wwwroot/frontend/backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
  try {
    const result = await pool.query(`
      UPDATE sensor_data
      SET tds = 33.913208
      WHERE id = (SELECT id FROM sensor_data ORDER BY timestamp DESC LIMIT 1)
      RETURNING id, timestamp, tds
    `);

    if (result.rows.length > 0) {
      console.log('✅ TDS seeded:', result.rows[0]);
    } else {
      console.log('❌ No rows in sensor_data');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
