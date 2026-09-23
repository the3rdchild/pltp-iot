#!/bin/bash
# Run migration 009: metric_limits keeps only lower_limit / upper_limit
#   - backfills them from the old warning thresholds, then drops the six
#     threshold columns
#   - removes the per-component TDS limits
# Uses Node.js instead of psql (no postgresql-client needed)
# Usage: cd backend/models/migrations && ./run_009_metric_limits_lower_upper.sh

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
echo "  Migration 009: lower/upper limits     "
echo "========================================"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Read the SQL file
SQL_FILE="$SCRIPT_DIR/009_metric_limits_lower_upper.sql"

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
    console.log('Migration 009 completed successfully!');

    const rows = await client.query(
      'SELECT metric_key, min_value, lower_limit, upper_limit, max_value FROM metric_limits ORDER BY metric_key'
    );
    console.log('');
    rows.rows.forEach(r => console.log(
      '  ' + r.metric_key.padEnd(24) + ' ' + r.min_value + ' | ' + r.lower_limit + ' .. ' + r.upper_limit + ' | ' + r.max_value
    ));
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
