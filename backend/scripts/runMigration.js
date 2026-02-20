const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/runMigration.js <migration-file.sql>');
  console.error('Example: node scripts/runMigration.js 006_add_sensor_data_id_to_ai2.sql');
  process.exit(1);
}

async function runMigration() {
  const filePath = path.isAbsolute(migrationFile)
    ? migrationFile
    : path.join(__dirname, '../models/migrations', migrationFile);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const client = await pool.connect();

  try {
    console.log(`Running migration: ${path.basename(filePath)}`);
    await client.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
