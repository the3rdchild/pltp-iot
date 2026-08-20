#!/bin/bash
# Run migration 007: lock down privileged writes
#   - users.role default 'admin' -> 'viewer' (+ allowed-values CHECK)
#   - metric_limits.updated_by, so threshold changes are attributable
# Uses Node.js instead of psql (no postgresql-client needed)
# Usage: cd backend/models/migrations && ./run_007_secure_admin_writes.sh

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
echo "  Migration 007: secure admin writes    "
echo "========================================"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Read the SQL file
SQL_FILE="$SCRIPT_DIR/007_secure_admin_writes.sql"

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
    console.log('Migration 007 completed successfully!');

    // Verify: new default, the role constraint, and the audit column.
    const def = await client.query(
      \"SELECT column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role'\"
    );
    const col = await client.query(
      \"SELECT column_name FROM information_schema.columns WHERE table_name = 'metric_limits' AND column_name = 'updated_by'\"
    );
    const con = await client.query(
      \"SELECT conname FROM pg_constraint WHERE conname = 'users_role_allowed'\"
    );
    console.log('');
    console.log('users.role default        : ' + (def.rows[0] ? def.rows[0].column_default : 'NOT FOUND'));
    console.log('users_role_allowed check  : ' + (con.rows.length > 0 ? 'present' : 'MISSING'));
    console.log('metric_limits.updated_by  : ' + (col.rows.length > 0 ? 'present' : 'MISSING'));
    console.log('');

    // Existing accounts keep whatever role they already have -- show them so
    // whoever runs this can see who is still an admin.
    const roles = await client.query('SELECT role, COUNT(*)::int AS n FROM users GROUP BY role ORDER BY role');
    console.log('Existing accounts by role:');
    roles.rows.forEach(r => console.log('  ' + r.role + ': ' + r.n));
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
