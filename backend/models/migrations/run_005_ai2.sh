#!/bin/bash
# Run migration 005: Create ai2 table
# Uses Node.js instead of psql (no postgresql-client needed)
# Usage: cd backend/models/migrations && ./run_005_ai2.sh

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
echo "     Running Migration 005: ai2         "
echo "========================================"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Read the SQL file
SQL_FILE="$SCRIPT_DIR/005_create_ai2.sql"

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
    console.log('Migration 005 completed successfully!');

    // Verify table was created
    const result = await client.query(
      \"SELECT id, model_name, dryness_predict, ncg_predict, status, processed_at FROM ai2 ORDER BY id LIMIT 5\"
    );
    console.log('');
    console.log('ai2 table created (' + result.rows.length + ' rows):');
    console.log('----------------------------------------');
    if (result.rows.length === 0) {
      console.log('  (empty - ready to receive data)');
    } else {
      result.rows.forEach(row => {
        console.log('  id=' + row.id + ' model=' + row.model_name + ' dryness=' + row.dryness_predict + ' ncg=' + row.ncg_predict + ' status=' + row.status);
      });
    }
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
