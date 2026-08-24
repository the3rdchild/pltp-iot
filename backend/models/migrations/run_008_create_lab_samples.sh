#!/bin/bash
# Run migration 008: create the lab_samples table
#   - lab readings from the manual form and the CSV importer
#   - sampled_at is the analytical axis; imported_at is bookkeeping
# Uses Node.js instead of psql (no postgresql-client needed)
# Usage: cd backend/models/migrations && ./run_008_create_lab_samples.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Load environment variables from backend/.env
if [ -f "$BACKEND_DIR/.env" ]; then
    export $(cat "$BACKEND_DIR/.env" | tr -d '\r' | grep -v '^#' | grep -v '^$' | xargs)
else
    echo "Error: .env file not found at $BACKEND_DIR/.env"
    exit 1
fi

# Database connection info
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-pertasmart_db}
DB_USER=${DB_USER:-pertasmart_user}

echo "========================================"
echo "  Migration 008: create lab_samples     "
echo "========================================"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Read the SQL file
SQL_FILE="$SCRIPT_DIR/008_create_lab_samples.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "Error: SQL file not found at $SQL_FILE"
    exit 1
fi

# Run migration using Node.js with pg module (already installed in backend)
node -e "
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pertasmart_db',
  user: process.env.DB_USER || 'pertasmart_user',
  password: process.env.DB_PASSWORD || '',
  connectionTimeoutMillis: 10000
});

async function run() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync('$SQL_FILE', 'utf8');
    console.log('Executing migration...');
    await client.query(sql);
    console.log('');
    console.log('Migration 008 completed successfully!');

    const cols = await client.query(
      \"SELECT column_name FROM information_schema.columns WHERE table_name = 'lab_samples' ORDER BY ordinal_position\"
    );
    console.log('');
    if (cols.rows.length === 0) {
      console.log('lab_samples: NOT FOUND');
    } else {
      console.log('lab_samples columns: ' + cols.rows.map(c => c.column_name).join(', '));
    }

    const idx = await client.query(
      \"SELECT indexname FROM pg_indexes WHERE tablename = 'lab_samples' ORDER BY indexname\"
    );
    console.log('lab_samples indexes: ' + (idx.rows.map(i => i.indexname).join(', ') || 'none'));

    const n = await client.query('SELECT COUNT(*)::int AS n FROM lab_samples');
    console.log('existing rows       : ' + n.rows[0].n);
    console.log('');

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
"

if [ $? -eq 0 ]; then
    echo "Done."
else
    echo ""
    echo "Migration failed! Check errors above."
    exit 1
fi
