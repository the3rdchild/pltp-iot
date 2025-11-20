#!/bin/bash
# Script untuk menjalankan migration database
# Usage: ./run_migration.sh

# Load environment variables
if [ -f ../../.env ]; then
    export $(cat ../../.env | grep -v '^#' | xargs)
fi

# Database connection info
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-pertasmart}
DB_USER=${DB_USER:-postgres}

echo "╔════════════════════════════════════════╗"
echo "║   🔄 Running Database Migration        ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Run migration
echo "Running migration: 001_add_generator_columns.sql"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 001_add_generator_columns.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Verifying new columns..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\d sensor_data"
else
    echo "❌ Migration failed!"
    exit 1
fi
