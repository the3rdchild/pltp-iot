#!/usr/bin/env node
/**
 * Script untuk check database schema dan verify kolom yang diperlukan
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function checkSchema() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Database Schema Check');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`User: ${process.env.DB_USER}\n`);

  try {
    // Test connection
    const connResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log(`   Server time: ${connResult.rows[0].now}\n`);

    // Check if sensor_data table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'sensor_data'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table sensor_data does not exist!\n');
      console.log('Please run database migrations first.\n');
      process.exit(1);
    }

    console.log('✅ Table sensor_data exists\n');

    // Get all columns
    const columnsResult = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'sensor_data'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Table Columns:');
    console.log('─────────────────────────────────────────────────────────');

    const columns = columnsResult.rows;
    const columnNames = columns.map(c => c.column_name);

    columns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
      const defaultVal = col.column_default ? ` [default: ${col.column_default}]` : '';
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
    });

    console.log('\n');

    // Check required columns for Honeywell
    const requiredColumns = [
      'id',
      'timestamp', // CRITICAL!
      'device_id',
      'pressure',
      'flow_rate',
      'temperature',
      'gen_reactive_power',
      'gen_output',
      'gen_frequency',
      'speed_detection',
      'mcv_l',
      'mcv_r',
      'gen_voltage_v_w',
      'gen_voltage_w_u'
    ];

    console.log('🔍 Checking Required Columns:');
    console.log('─────────────────────────────────────────────────────────');

    let hasIssues = false;

    for (const reqCol of requiredColumns) {
      const exists = columnNames.includes(reqCol);
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${reqCol}`);

      if (!exists) {
        hasIssues = true;
      }
    }

    console.log('\n');

    // Check if there's data
    const countResult = await pool.query('SELECT COUNT(*) as count FROM sensor_data');
    const totalRecords = parseInt(countResult.rows[0].count);

    console.log('📊 Data Statistics:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  Total records: ${totalRecords}`);

    if (totalRecords > 0) {
      // Get latest record
      const latestResult = await pool.query(`
        SELECT
          timestamp,
          device_id,
          pressure,
          temperature,
          flow_rate
        FROM sensor_data
        ORDER BY timestamp DESC
        LIMIT 1
      `);

      const latest = latestResult.rows[0];
      console.log(`  Latest timestamp: ${latest.timestamp}`);
      console.log(`  Latest device_id: ${latest.device_id || '(null)'}`);
      console.log(`  Sample data:`);
      console.log(`    - pressure: ${latest.pressure || 'null'}`);
      console.log(`    - temperature: ${latest.temperature || 'null'}`);
      console.log(`    - flow_rate: ${latest.flow_rate || 'null'}`);
    } else {
      console.log(`  ⚠️  No data in table yet`);
    }

    console.log('\n');

    // Check indexes
    const indexResult = await pool.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'sensor_data'
      ORDER BY indexname;
    `);

    console.log('📇 Indexes:');
    console.log('─────────────────────────────────────────────────────────');

    if (indexResult.rows.length === 0) {
      console.log('  ⚠️  No indexes found');
    } else {
      indexResult.rows.forEach(idx => {
        console.log(`  ✓ ${idx.indexname}`);
      });
    }

    console.log('\n');

    // Check constraints
    const constraintResult = await pool.query(`
      SELECT
        conname,
        contype,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'sensor_data'::regclass
      ORDER BY conname;
    `);

    console.log('🔒 Constraints:');
    console.log('─────────────────────────────────────────────────────────');

    if (constraintResult.rows.length === 0) {
      console.log('  No constraints found');
    } else {
      constraintResult.rows.forEach(con => {
        const type = {
          'p': 'PRIMARY KEY',
          'f': 'FOREIGN KEY',
          'u': 'UNIQUE',
          'c': 'CHECK'
        }[con.contype] || con.contype;

        console.log(`  ${type}: ${con.conname}`);
        console.log(`    ${con.definition}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════');

    if (hasIssues) {
      console.log('❌ Schema check FAILED - Missing required columns');
      console.log('   Please run migrations or fix the schema');
      console.log('═══════════════════════════════════════════════════════════\n');
      process.exit(1);
    } else {
      console.log('✅ Schema check PASSED - All required columns present');
      console.log('═══════════════════════════════════════════════════════════\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkSchema();
