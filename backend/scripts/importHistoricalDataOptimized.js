#!/usr/bin/env node
/**
 * Optimized Historical Data Import from Honeywell API (ZERO-SAFE VERSION + CURRENT CALCULATION)
 * 
 * CRITICAL FIX: Properly handle zero values (0) vs NULL
 * - Previous bug: 0 || null → null (treated 0 as falsy)
 * - Fixed: Explicit null/undefined checks only
 *
 * NEW FEATURE: Automatic current calculation
 * - Formula: current = sqrt((P^2) + (Q^2)) / (sqrt(3) * V_avg)
 * - Where: P = gen_output, Q = gen_reactive_power, V_avg = average of 3 line voltages
 *
 * Features:
 * - Smart resume from last imported timestamp
 * - NULL data detection for ALL parameters
 * - ZERO value preservation (0 is valid data!)
 * - Automatic current calculation and storage
 * - Data quality validation
 * - File logging with rotation
 * - Skip chunks that are already complete
 * - Batch insertion to avoid PostgreSQL parameter limits
 */

require('dotenv').config({ path: '/www/wwwroot/frontend/backend/.env' });
const https = require('https');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const LOG_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Configuration
const CONFIG = {
  SAMPLE_INTERVAL: 60000,
  MAX_ROWS_PER_REQUEST: 10000,
  CHUNK_DAYS: 6,
  BATCH_SIZE: 1000,
  API_URL: process.env.HONEYWELL_API_URL,
  API_KEY: process.env.HONEYWELL_API_X_API_KEY,
  DEVICE_ID: null,
  REQUEST_DELAY: 1000,
  COMPLETENESS_THRESHOLD: 1.0,
  NULL_THRESHOLD: 0.00,
  MIN_NON_NULL_FIELDS: 12,
  MAX_RETRY_FOR_NULLS: 5,
  LOG_MAX_SIZE: 10 * 1024 * 1024,
};

// Tag mapping
const TAGNAME_TO_COLUMN = {
  '5LBB31FP002PVI.PV': 'pressure',
  '5LBB31FF001PVI.PV': 'flow_rate',
  '5LBB31FT001PVI.PV': 'temperature',
  '5BAT01AQ1-B02PVI.PV': 'gen_reactive_power',
  '5MKA01FE008PVI.PV': 'gen_output',
  '5MKA01FE010PVI.PV': 'gen_frequency',
  '5MAD02FS011PVI.PV': 'speed_detection',
  '5CGA01FG001PVI.PV': 'mcv_l',
  '5CGA01FG002PVI.PV': 'mcv_r',
  '5MKA01FE004PVI.PV': 'gen_voltage_u_v',
  '5MKA01FE005PVI.PV': 'gen_voltage_v_w',
  '5MKA01FE006PVI.PV': 'gen_voltage_w_u'
};

const ALL_SENSOR_FIELDS = [
  'pressure', 'flow_rate', 'temperature',
  'gen_reactive_power', 'gen_output', 'gen_frequency',
  'speed_detection', 'mcv_l', 'mcv_r',
  'gen_voltage_u_v', 'gen_voltage_v_w', 'gen_voltage_w_u'
];

const args = process.argv.slice(2);
const forceReimport = args.includes('--force') || args.includes('-f');
const fixNulls = args.includes('--fix-nulls');
const DEFAULT_START = "13-MAY-2025 14:07:33.000";

const stats = {
  totalChunks: 0,
  currentChunk: 0,
  skippedChunks: 0,
  totalRecordsFetched: 0,
  totalRecordsInserted: 0,
  totalErrors: 0,
  nullChunksRefetched: 0,
  nullRecordsFixed: 0,
  zeroValuesPreserved: 0,
  currentCalculated: 0, // NEW: Track calculated current values
  currentCalculationErrors: 0, // NEW: Track calculation errors
  startTime: Date.now(),
  tagStats: {},
  nullFieldStats: {}
};

// Logging system
class Logger {
  constructor() {
    const today = new Date().toISOString().split('T')[0];
    this.mainLogFile = path.join(LOG_DIR, `import-${today}.log`);
    this.errorLogFile = path.join(LOG_DIR, `import-error-${today}.log`);
    this.sessionStartTime = new Date().toISOString();
    
    this.writeToFile(this.mainLogFile, `\n${'='.repeat(80)}\n`);
    this.writeToFile(this.mainLogFile, `NEW SESSION STARTED: ${this.sessionStartTime}\n`);
    this.writeToFile(this.mainLogFile, `${'='.repeat(80)}\n\n`);
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  writeToFile(filePath, message) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > CONFIG.LOG_MAX_SIZE) {
          const timestamp = Date.now();
          const rotatedPath = filePath.replace('.log', `-${timestamp}.log`);
          fs.renameSync(filePath, rotatedPath);
          this.log(`Log file rotated: ${path.basename(rotatedPath)}`, 'info');
        }
      }
      
      fs.appendFileSync(filePath, message, 'utf8');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  log(message, level = 'info') {
    const timestamp = this.formatTimestamp();
    const prefix = {
      info: '📝 INFO',
      success: '✅ SUCCESS',
      error: '❌ ERROR',
      warn: '⚠️  WARN',
      debug: '🔍 DEBUG',
      realtime: '🔄 REALTIME'
    }[level] || '📝 INFO';
    
    const consoleMessage = `[${timestamp}] ${prefix}: ${message}`;
    const fileMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    console.log(consoleMessage);
    this.writeToFile(this.mainLogFile, fileMessage);
    
    if (level === 'error') {
      this.writeToFile(this.errorLogFile, fileMessage);
    }
  }

  logProgress(currentChunk, totalChunks, elapsed, eta, stats) {
    const progress = (currentChunk / totalChunks * 100).toFixed(1);
    const message = `Progress: ${progress}% (${currentChunk}/${totalChunks}) | Elapsed: ${elapsed} | ETA: ${eta} | Inserted: ${stats.totalRecordsInserted.toLocaleString()} | Current Calc: ${stats.currentCalculated.toLocaleString()} | Errors: ${stats.totalErrors}`;
    this.log(message, 'info');
  }

  logChunkStart(chunkNum, totalChunks, startTime, endTime) {
    const message = `Chunk ${chunkNum}/${totalChunks}: ${startTime} → ${endTime}`;
    this.log(message, 'info');
  }

  logChunkComplete(inserted, recordsFetched, quality, nullStats) {
    const message = `Chunk complete: ${inserted} records inserted, ${recordsFetched} fetched, ${quality}% quality | ${nullStats}`;
    this.log(message, 'success');
  }

  logDataQuality(valid, total, quality, avgNullFields) {
    const message = `Data Quality: ${valid}/${total} valid records (${quality}% quality, avg ${avgNullFields.toFixed(1)} NULL fields per record)`;
    this.log(message, 'info');
  }

  logFinalSummary(stats, duration) {
    const nullFieldsReport = Object.entries(stats.nullFieldStats)
      .sort((a, b) => b[1] - a[1])
      .map(([field, count]) => `  ${field.padEnd(30)} ${count.toLocaleString()} NULL occurrences`)
      .join('\n');

    const summary = `
${'='.repeat(80)}
IMPORT SUMMARY
${'='.repeat(80)}
Duration:                 ${duration}
Total Chunks:             ${stats.totalChunks}
Skipped Chunks:           ${stats.skippedChunks}
Processed Chunks:         ${stats.totalChunks - stats.skippedChunks}
NULL Chunks Refetched:    ${stats.nullChunksRefetched}
Records Fetched:          ${stats.totalRecordsFetched.toLocaleString()}
Records Inserted:         ${stats.totalRecordsInserted.toLocaleString()}
Zero Values Preserved:    ${stats.zeroValuesPreserved.toLocaleString()}
Current Values Calculated: ${stats.currentCalculated.toLocaleString()}
Current Calc Errors:      ${stats.currentCalculationErrors.toLocaleString()}
Total Errors:             ${stats.totalErrors}

Per-Tag Statistics:
${Object.entries(stats.tagStats).map(([tag, count]) => 
  `  ${tag.padEnd(30)} ${count.toLocaleString()} records`
).join('\n')}

NULL Field Statistics:
${nullFieldsReport}
${'='.repeat(80)}
`;
    this.writeToFile(this.mainLogFile, summary);
    console.log(summary);
  }
}

const logger = new Logger();

/**
 * CRITICAL: Check if value is truly NULL/undefined (not just falsy like 0)
 */
function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * CRITICAL: Get value or null, but preserve 0
 */
function getValueOrNull(value) {
  return isNullOrUndefined(value) ? null : value;
}

/**
 * Calculate three-phase current from power and voltage
 * 
 * Formula: I = sqrt(P² + Q²) / (sqrt(3) * V_avg)
 * 
 * Where:
 * - P = Active Power (gen_output) in MW
 * - Q = Reactive Power (gen_reactive_power) in MVAR
 * - V_avg = Average line-to-line voltage in kV
 * - I = Current in Amperes
 * 
 * @param {Object} record - Record containing power and voltage data
 * @returns {number|null} - Calculated current in Amperes, or null if calculation fails
 */
function calculateCurrent(record) {
  try {
    const genOutput = record.gen_output;
    const genReactivePower = record.gen_reactive_power;
    const voltageUV = record.gen_voltage_u_v;
    const voltageVW = record.gen_voltage_v_w;
    const voltageWU = record.gen_voltage_w_u;

    // Check if all required values are present and not null
    if (isNullOrUndefined(genOutput) || 
        isNullOrUndefined(genReactivePower) ||
        isNullOrUndefined(voltageUV) || 
        isNullOrUndefined(voltageVW) || 
        isNullOrUndefined(voltageWU)) {
      return null;
    }

    // Calculate average voltage
    const avgVoltage = (voltageUV + voltageVW + voltageWU) / 3;

    // Prevent division by zero
    if (avgVoltage === 0) {
      logger.log(`Current calculation skipped: average voltage is zero`, 'debug');
      stats.currentCalculationErrors++;
      return null;
    }

    // Calculate apparent power: S = sqrt(P² + Q²)
    const apparentPower = Math.sqrt(
      (genOutput * genOutput) + (genReactivePower * genReactivePower)
    );

    // Calculate current: I = S / (sqrt(3) * V_avg)
    const current = (apparentPower / (Math.sqrt(3) * avgVoltage)) * 1000;

    // DEBUG LOGGING for problematic values
    if (!isFinite(current) || current > 50000 || current < 0) {
      logger.log(`🔴 OVERFLOW DETECTED:`, 'error');
      logger.log(`   gen_output: ${genOutput} MW`, 'error');
      logger.log(`   gen_reactive_power: ${genReactivePower} MVAR`, 'error');
      logger.log(`   voltage_u_v: ${voltageUV} kV`, 'error');
      logger.log(`   voltage_v_w: ${voltageVW} kV`, 'error');
      logger.log(`   voltage_w_u: ${voltageWU} kV`, 'error');
      logger.log(`   avg_voltage: ${avgVoltage.toFixed(3)} kV`, 'error');
      logger.log(`   apparent_power: ${apparentPower.toFixed(3)} MVA`, 'error');
      logger.log(`   calculated_current: ${current} A`, 'error');
      stats.currentCalculationErrors++;
      return null;
    }

    // Max/min bounds
    if (current > 50000) {
      logger.log(`⚠️  Current too high: ${current.toFixed(2)} A (capped at 50000 A)`, 'warn');
      stats.currentCalculationErrors++;
      return null;
    }

    stats.currentCalculated++;
    return current;

  } catch (error) {
    logger.log(`Current calculation error: ${error.message}`, 'error');
    logger.log(`Stack: ${error.stack}`, 'debug');
    stats.currentCalculationErrors++;
    return null;
  }
}

async function getLastImportedTimestamp() {
  try {
    const result = await pool.query(`
      SELECT MAX(timestamp) as last_timestamp
      FROM sensor_data
      WHERE device_id IS NULL
    `);
    
    return result.rows[0].last_timestamp;
  } catch (error) {
    logger.log(`Could not get last imported timestamp: ${error.message}`, 'warn');
    return null;
  }
}

async function findNullDataRanges() {
  try {
    const nullConditions = ALL_SENSOR_FIELDS.map(field => `${field} IS NULL`).join(' OR ');
    
    const result = await pool.query(`
      WITH null_records AS (
        SELECT 
          timestamp,
          CASE 
            WHEN ${nullConditions}
            THEN 1 ELSE 0 
          END as has_null
        FROM sensor_data
        WHERE device_id IS NULL
          AND (${nullConditions})
        ORDER BY timestamp
      ),
      grouped_nulls AS (
        SELECT 
          timestamp,
          has_null,
          timestamp - (ROW_NUMBER() OVER (ORDER BY timestamp)) * INTERVAL '1 minute' as grp
        FROM null_records
        WHERE has_null = 1
      )
      SELECT 
        MIN(timestamp) as start_time,
        MAX(timestamp) as end_time,
        COUNT(*) as null_count
      FROM grouped_nulls
      GROUP BY grp
      HAVING COUNT(*) > 5
      ORDER BY start_time
      LIMIT 100
    `);
    
    return result.rows;
  } catch (error) {
    logger.log(`Could not find NULL ranges: ${error.message}`, 'error');
    return [];
  }
}

async function isChunkDataComplete(startTime, endTime) {
  try {
    const startISO = parseHoneywellTimestampToISO(startTime);
    const endISO = parseHoneywellTimestampToISO(endTime);
    
    const nullConditions = ALL_SENSOR_FIELDS.map(field => `${field} IS NULL`).join(' OR ');
    
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT timestamp) as count,
        COUNT(DISTINCT CASE 
          WHEN ${nullConditions}
          THEN timestamp 
        END) as null_count,
        SUM(
          ${ALL_SENSOR_FIELDS.map(field => `CASE WHEN ${field} IS NULL THEN 1 ELSE 0 END`).join(' + ')}
        ) as total_null_fields
      FROM sensor_data
      WHERE timestamp >= $1 AND timestamp < $2
        AND device_id IS NULL
    `, [startISO, endISO]);
    
    const existingCount = parseInt(result.rows[0].count) || 0;
    const nullCount = parseInt(result.rows[0].null_count) || 0;
    const totalNullFields = parseInt(result.rows[0].total_null_fields) || 0;
    
    const startDate = parseHoneywellTimestamp(startTime);
    const endDate = parseHoneywellTimestamp(endTime);
    const chunkMs = endDate - startDate;
    const expectedRecords = Math.floor(chunkMs / CONFIG.SAMPLE_INTERVAL);
    
    const completeness = existingCount > 0 ? existingCount / expectedRecords : 0;
    const nullPercentage = existingCount > 0 ? nullCount / existingCount : 0;
    const avgNullFields = existingCount > 0 ? totalNullFields / existingCount : 0;
    
    return {
      isComplete: completeness >= CONFIG.COMPLETENESS_THRESHOLD && nullPercentage < CONFIG.NULL_THRESHOLD,
      existingCount,
      expectedRecords,
      nullCount,
      avgNullFields: avgNullFields.toFixed(1),
      nullPercentage: (nullPercentage * 100).toFixed(1),
      completeness: (completeness * 100).toFixed(1)
    };
  } catch (error) {
    logger.log(`Could not check chunk completeness: ${error.message}`, 'warn');
    return { 
      isComplete: false, 
      existingCount: 0, 
      expectedRecords: 0, 
      nullCount: 0,
      avgNullFields: '0.0',
      nullPercentage: '0.0',
      completeness: '0.0' 
    };
  }
}

function validateRecord(record) {
  let nonNullCount = 0;
  
  for (const field of ALL_SENSOR_FIELDS) {
    if (!isNullOrUndefined(record[field])) {
      nonNullCount++;
    }
  }
  
  return nonNullCount >= CONFIG.MIN_NON_NULL_FIELDS;
}

function calculateNullPercentage(records) {
  if (records.length === 0) return 0;
  
  let totalFields = 0;
  let totalNullFields = 0;
  
  for (const record of records) {
    for (const field of ALL_SENSOR_FIELDS) {
      totalFields++;
      if (isNullOrUndefined(record[field])) {
        totalNullFields++;
        
        if (!stats.nullFieldStats[field]) {
          stats.nullFieldStats[field] = 0;
        }
        stats.nullFieldStats[field]++;
      }
    }
  }
  
  return totalFields > 0 ? totalNullFields / totalFields : 0;
}

function getNullStatistics(records) {
  if (records.length === 0) return { avgNullFields: 0, fieldBreakdown: {} };
  
  const fieldNullCounts = {};
  ALL_SENSOR_FIELDS.forEach(field => fieldNullCounts[field] = 0);
  
  let totalNullFields = 0;
  
  for (const record of records) {
    for (const field of ALL_SENSOR_FIELDS) {
      if (isNullOrUndefined(record[field])) {
        fieldNullCounts[field]++;
        totalNullFields++;
      }
    }
  }
  
  const avgNullFields = totalNullFields / records.length;
  const totalRecords = records.length;
  
  const fieldBreakdown = {};
  for (const field of ALL_SENSOR_FIELDS) {
    fieldBreakdown[field] = ((fieldNullCounts[field] / totalRecords) * 100).toFixed(1);
  }
  
  return { avgNullFields, fieldBreakdown };
}

function formatToHoneywellTimestamp(date) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function parseHoneywellTimestamp(honeywellTimestamp) {
  const months = {
    'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
    'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
  };

  const parts = honeywellTimestamp.split(' ');
  const dateParts = parts[0].split('-');
  const timeParts = parts[1].split(':');

  const day = parseInt(dateParts[0]);
  const month = months[dateParts[1].toUpperCase()];
  const year = parseInt(dateParts[2]);
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const secondsParts = timeParts[2].split('.');
  const seconds = parseInt(secondsParts[0]);
  const milliseconds = secondsParts[1] ? parseInt(secondsParts[1]) : 0;

  return new Date(year, month, day, hours, minutes, seconds, milliseconds);
}

function parseHoneywellTimestampToISO(honeywellTimestamp) {
  const months = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
    'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
    'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
  };

  const parts = honeywellTimestamp.split(' ');
  const dateParts = parts[0].split('-');
  const timePart = parts[1];

  const day = dateParts[0].padStart(2, '0');
  const month = months[dateParts[1].toUpperCase()];
  const year = dateParts[2];

  return `${year}-${month}-${day}T${timePart}Z`;
}

function fetchHoneywellData(params) {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.API_URL);
    const requestBody = {
      SampleInterval: CONFIG.SAMPLE_INTERVAL,
      ResampleMethod: "Around",
      MinimumConfidence: 100,
      MaxRows: CONFIG.MAX_ROWS_PER_REQUEST,
      TimeFormat: 1,
      ReductionData: "now",
      TagName: params.TagName,
      StartTime: params.StartTime,
      EndTime: params.EndTime,
      OutputTimeFormat: 1
    };

    const postData = JSON.stringify(requestBody);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (!jsonData.status) {
            reject(new Error(jsonData.message || 'API returned error'));
            return;
          }
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse API response: ' + error.message));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error('API request failed: ' + error.message));
    });

    req.write(postData);
    req.end();
  });
}

function transformAndMergeData(allTagResponses) {
  const mergedRecords = {};

  for (const response of allTagResponses) {
    if (!response.data || !Array.isArray(response.data)) continue;

    for (const tagData of response.data) {
      const tagName = tagData.TagName;
      const columnName = TAGNAME_TO_COLUMN[tagName];

      if (!columnName) {
        logger.log(`Unknown TagName: ${tagName}`, 'warn');
        continue;
      }

      const timestamps = tagData.TimeStamp || [];
      const values = tagData.Value || [];
      const confidences = tagData.Confidence || [];

      for (let i = 0; i < timestamps.length; i++) {
        if (confidences[i] < 90) continue;

        const timestamp = parseHoneywellTimestampToISO(timestamps[i]);

        if (!mergedRecords[timestamp]) {
          mergedRecords[timestamp] = {
            timestamp,
            device_id: CONFIG.DEVICE_ID
          };
        }

        if (!isNullOrUndefined(values[i])) {
          mergedRecords[timestamp][columnName] = values[i];
          
          if (values[i] === 0) {
            stats.zeroValuesPreserved++;
          }
        }
      }
    }
  }

  return Object.values(mergedRecords);
}

async function bulkInsertRecords(records) {
  if (records.length === 0) return { inserted: 0 };

  const validRecords = records.filter(record => validateRecord(record));
  
  if (validRecords.length === 0) {
    logger.log('All records failed validation (too many NULLs)', 'warn');
    return { inserted: 0 };
  }

  // NEW: Add 'current' to columns list
  const columns = ['timestamp', 'device_id', 'pressure', 'flow_rate', 'temperature',
                   'gen_reactive_power', 'gen_output', 'gen_frequency', 'speed_detection',
                   'mcv_l', 'mcv_r', 'gen_voltage_u_v', 'gen_voltage_v_w', 'gen_voltage_w_u', 
                   'current', 'status'];

  let totalInserted = 0;

  for (let batchStart = 0; batchStart < validRecords.length; batchStart += CONFIG.BATCH_SIZE) {
    const batch = validRecords.slice(batchStart, batchStart + CONFIG.BATCH_SIZE);
    
    const values = [];
    const placeholders = [];

    for (let i = 0; i < batch.length; i++) {
      const record = batch[i];
      
      // NEW: Calculate current before inserting
      const current = calculateCurrent(record);
      
      const recordValues = [
        record.timestamp,
        record.device_id,
        getValueOrNull(record.pressure),
        getValueOrNull(record.flow_rate),
        getValueOrNull(record.temperature),
        getValueOrNull(record.gen_reactive_power),
        getValueOrNull(record.gen_output),
        getValueOrNull(record.gen_frequency),
        getValueOrNull(record.speed_detection),
        getValueOrNull(record.mcv_l),
        getValueOrNull(record.mcv_r),
        getValueOrNull(record.gen_voltage_u_v),
        getValueOrNull(record.gen_voltage_v_w),
        getValueOrNull(record.gen_voltage_w_u),
        current, // NEW: Add calculated current
        'normal'
      ];

      values.push(...recordValues);

      const offset = i * columns.length;
      const placeholder = `(${columns.map((_, j) => `$${offset + j + 1}`).join(',')})`;
      placeholders.push(placeholder);
    }

    const sql = `
      INSERT INTO sensor_data (${columns.join(', ')})
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (timestamp, device_id) DO UPDATE SET
        pressure = COALESCE(EXCLUDED.pressure, sensor_data.pressure),
        flow_rate = COALESCE(EXCLUDED.flow_rate, sensor_data.flow_rate),
        temperature = COALESCE(EXCLUDED.temperature, sensor_data.temperature),
        gen_reactive_power = COALESCE(EXCLUDED.gen_reactive_power, sensor_data.gen_reactive_power),
        gen_output = COALESCE(EXCLUDED.gen_output, sensor_data.gen_output),
        gen_frequency = COALESCE(EXCLUDED.gen_frequency, sensor_data.gen_frequency),
        speed_detection = COALESCE(EXCLUDED.speed_detection, sensor_data.speed_detection),
        mcv_l = COALESCE(EXCLUDED.mcv_l, sensor_data.mcv_l),
        mcv_r = COALESCE(EXCLUDED.mcv_r, sensor_data.mcv_r),
        gen_voltage_u_v = COALESCE(EXCLUDED.gen_voltage_u_v, sensor_data.gen_voltage_u_v),
        gen_voltage_v_w = COALESCE(EXCLUDED.gen_voltage_v_w, sensor_data.gen_voltage_v_w),
        gen_voltage_w_u = COALESCE(EXCLUDED.gen_voltage_w_u, sensor_data.gen_voltage_w_u),
        current = COALESCE(EXCLUDED.current, sensor_data.current)
    `;

    try {
      await pool.query(sql, values);
      totalInserted += batch.length;
    } catch (error) {
      logger.log(`Bulk insert error (batch ${batchStart}-${batchStart + batch.length}): ${error.message}`, 'error');
      logger.log(`Error stack: ${error.stack}`, 'debug');
      throw error;
    }
  }

  return { inserted: totalInserted };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function calculateETA() {
  if (stats.currentChunk === 0) return 'calculating...';

  const elapsed = Date.now() - stats.startTime;
  const avgTimePerChunk = elapsed / stats.currentChunk;
  const remainingChunks = stats.totalChunks - stats.currentChunk;
  const etaMs = avgTimePerChunk * remainingChunks;

  return formatDuration(etaMs);
}

function splitDateRange(startDate, endDate, chunkDays) {
  const chunks = [];
  const start = parseHoneywellTimestamp(startDate);
  const end = parseHoneywellTimestamp(endDate);

  let currentStart = new Date(start);

  while (currentStart < end) {
    const currentEnd = new Date(currentStart.getTime() + (chunkDays * 24 * 60 * 60 * 1000));

    chunks.push({
      start: formatToHoneywellTimestamp(currentStart),
      end: formatToHoneywellTimestamp(currentEnd > end ? end : currentEnd)
    });

    currentStart = currentEnd;
  }

  return chunks;
}

async function processChunk(chunk, retryCount = 0) {
  const tagNames = Object.keys(TAGNAME_TO_COLUMN);
  const allTagResponses = [];

  for (const tagName of tagNames) {
    try {
      process.stdout.write(`  Fetching ${tagName}... `);

      const response = await fetchHoneywellData({
        TagName: tagName,
        StartTime: chunk.start,
        EndTime: chunk.end
      });

      const recordCount = response.data?.[0]?.TimeStamp?.length || 0;
      console.log(`✓ ${recordCount} records`);

      allTagResponses.push(response);
      stats.totalRecordsFetched += recordCount;

      if (!stats.tagStats[tagName]) stats.tagStats[tagName] = 0;
      stats.tagStats[tagName] += recordCount;

      await sleep(CONFIG.REQUEST_DELAY);

    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      logger.log(`Failed to fetch ${tagName}: ${error.message}`, 'error');
      stats.totalErrors++;
    }
  }

  process.stdout.write(`  Merging data... `);
  const mergedRecords = transformAndMergeData(allTagResponses);
  console.log(`✓ ${mergedRecords.length} unique timestamps`);

  const nullStats = getNullStatistics(mergedRecords);
  const nullPercentage = calculateNullPercentage(mergedRecords);
  const validRecords = mergedRecords.filter(record => validateRecord(record));
  
  const quality = ((1 - nullPercentage) * 100).toFixed(1);
  console.log(`  📊 Data Quality: ${validRecords.length}/${mergedRecords.length} valid records (${quality}% quality, avg ${nullStats.avgNullFields.toFixed(1)} NULL fields/record)`);
  logger.logDataQuality(validRecords.length, mergedRecords.length, quality, nullStats.avgNullFields);
  
  if (nullPercentage > CONFIG.NULL_THRESHOLD) {
    const topNullFields = Object.entries(nullStats.fieldBreakdown)
      .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
      .slice(0, 5)
      .map(([field, pct]) => `${field}:${pct}%`)
      .join(', ');
    logger.log(`NULL breakdown (top 5): ${topNullFields}`, 'warn');
  }

  if (nullPercentage > CONFIG.NULL_THRESHOLD && retryCount < CONFIG.MAX_RETRY_FOR_NULLS) {
    console.log(`  ⚠️  High NULL percentage (${(nullPercentage * 100).toFixed(1)}%), retrying... (attempt ${retryCount + 1}/${CONFIG.MAX_RETRY_FOR_NULLS})`);
    logger.log(`High NULL percentage detected (${(nullPercentage * 100).toFixed(1)}%), retrying (attempt ${retryCount + 1}/${CONFIG.MAX_RETRY_FOR_NULLS})`, 'warn');
    stats.nullChunksRefetched++;
    await sleep(5000);
    return await processChunk(chunk, retryCount + 1);
  }

  if (mergedRecords.length > 0) {
    process.stdout.write(`  Calculating current & inserting to database... `);
    try {
      const result = await bulkInsertRecords(mergedRecords);
      console.log(`✓ ${result.inserted} records (${stats.currentCalculated} with current)`);
      
      const nullStatsStr = `avg ${nullStats.avgNullFields.toFixed(1)} NULL fields`;
      logger.logChunkComplete(result.inserted, stats.totalRecordsFetched, quality, nullStatsStr);
      stats.totalRecordsInserted += result.inserted;
      return result.inserted;
    } catch (error) {
      console.log(`✗ ${error.message}`);
      logger.log(`Database insert failed: ${error.message}`, 'error');
      stats.totalErrors++;
      return 0;
    }
  }

  return 0;
}

async function fixExistingNulls() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   Fixing Existing NULL Records (ALL Parameters)');
  console.log('═══════════════════════════════════════════════════════════\n');
  logger.log('Starting NULL fix mode (checking all parameters)', 'info');

  const nullRanges = await findNullDataRanges();
  
  if (nullRanges.length === 0) {
    console.log('✅ No NULL data ranges found!\n');
    logger.log('No NULL data ranges found', 'success');
    return;
  }

  console.log(`Found ${nullRanges.length} time ranges with NULL data:\n`);
  logger.log(`Found ${nullRanges.length} NULL data ranges`, 'info');

  for (let i = 0; i < nullRanges.length; i++) {
    const range = nullRanges[i];
    const startTime = formatToHoneywellTimestamp(new Date(range.start_time));
    const endTime = formatToHoneywellTimestamp(new Date(range.end_time));

    console.log(`\n[${i + 1}/${nullRanges.length}] Fixing: ${startTime} → ${endTime}`);
    console.log(`  NULL records: ${range.null_count}`);
    console.log('─'.repeat(80));
    logger.log(`Fixing NULL range ${i + 1}/${nullRanges.length}: ${startTime} → ${endTime} (${range.null_count} NULL records)`, 'info');

    try {
      const inserted = await processChunk({ start: startTime, end: endTime });
      stats.nullRecordsFixed += inserted;
    } catch (error) {
      console.error(`  ❌ Failed to fix range: ${error.message}`);
      logger.log(`Failed to fix range: ${error.message}`, 'error');
    }

    await sleep(2000);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   NULL Fix Complete!');
  console.log(`   Records Fixed: ${stats.nullRecordsFixed}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  logger.log(`NULL fix complete: ${stats.nullRecordsFixed} records fixed`, 'success');
}

async function importHistoricalData() {
  if (fixNulls) {
    await fixExistingNulls();
    return;
  }

  let startDate;
  let endDate;
  
  if (forceReimport) {
    console.log('🔄 Force re-import mode enabled\n');
    logger.log('Force re-import mode enabled', 'info');
    startDate = args.find(arg => !arg.startsWith('--')) || DEFAULT_START;
    endDate = args[1] || formatToHoneywellTimestamp(new Date());
  } else {
    const lastTimestamp = await getLastImportedTimestamp();
    
    if (lastTimestamp && !args[0]) {
      const resumeDate = new Date(lastTimestamp);
      resumeDate.setMinutes(resumeDate.getMinutes() + 1);
      startDate = formatToHoneywellTimestamp(resumeDate);
      console.log(`📍 Resuming from last import: ${startDate}\n`);
      logger.log(`Resuming from last import: ${startDate}`, 'info');
    } else {
      startDate = args[0] || DEFAULT_START;
    }
    
    endDate = args[1] || formatToHoneywellTimestamp(new Date());
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Honeywell Data Import + Current Calculation');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Start Date:        ${startDate}`);
  console.log(`End Date:          ${endDate}`);
  console.log(`Sample Interval:   1 minute (60s)`);
  console.log(`Chunk Size:        ${CONFIG.CHUNK_DAYS} days (~${CONFIG.CHUNK_DAYS * 1440} records/chunk)`);
  console.log(`Batch Size:        ${CONFIG.BATCH_SIZE} records/insert`);
  console.log(`NULL Threshold:    ${(CONFIG.NULL_THRESHOLD * 100).toFixed(0)}% (auto-retry if exceeded)`);
  console.log(`Min Non-NULL:      ${CONFIG.MIN_NON_NULL_FIELDS}/${ALL_SENSOR_FIELDS.length} fields`);
  console.log(`Force Re-import:   ${forceReimport ? 'Yes' : 'No'}`);
  console.log(`Log Files:         ${path.basename(logger.mainLogFile)}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔧 FEATURES:');
  console.log('   • Zero values (0) preserved as valid data');
  console.log('   • Automatic current calculation from power & voltage');
  console.log('   • Formula: I = sqrt(P² + Q²) / (sqrt(3) * V_avg)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  logger.log(`Import started: ${startDate} → ${endDate}`, 'info');

  const chunks = splitDateRange(startDate, endDate, CONFIG.CHUNK_DAYS);
  stats.totalChunks = chunks.length;

  console.log(`📊 Total chunks: ${stats.totalChunks}\n`);
  logger.log(`Total chunks: ${stats.totalChunks}`, 'info');

  for (const chunk of chunks) {
    stats.currentChunk++;

    console.log(`\n[${stats.currentChunk}/${stats.totalChunks}] Processing: ${chunk.start} → ${chunk.end}`);
    console.log('─'.repeat(80));
    logger.logChunkStart(stats.currentChunk, stats.totalChunks, chunk.start, chunk.end);

    if (!forceReimport) {
      const completeness = await isChunkDataComplete(chunk.start, chunk.end);
      
      if (completeness.isComplete) {
        console.log(`  ⏭️  Skipping chunk (${completeness.completeness}% complete, ${completeness.nullPercentage}% have NULLs, avg ${completeness.avgNullFields} NULL fields)`);
        logger.log(`Skipping chunk: ${completeness.completeness}% complete, ${completeness.nullPercentage}% have NULLs`, 'info');
        stats.skippedChunks++;
        continue;
      } else if (completeness.existingCount > 0) {
        console.log(`  📊 Partial data: ${completeness.completeness}% complete, ${completeness.nullPercentage}% have NULLs (avg ${completeness.avgNullFields} NULL fields)`);
        logger.log(`Partial data: ${completeness.completeness}% complete, avg ${completeness.avgNullFields} NULL fields`, 'info');
        if (parseFloat(completeness.nullPercentage) > CONFIG.NULL_THRESHOLD * 100) {
          console.log(`  🔄 High NULL percentage detected, will re-fetch`);
          logger.log('High NULL percentage detected, will re-fetch', 'warn');
        }
      }
    }

    await processChunk(chunk);

    const progress = (stats.currentChunk / stats.totalChunks * 100).toFixed(1);
    const elapsed = formatDuration(Date.now() - stats.startTime);
    const eta = calculateETA();

    console.log(`\n  📈 Progress: ${progress}% | Elapsed: ${elapsed} | ETA: ${eta}`);
    console.log(`  📊 Stats: ${stats.totalRecordsInserted.toLocaleString()} inserted | ${stats.currentCalculated.toLocaleString()} current calc | ${stats.zeroValuesPreserved.toLocaleString()} zeros | ${stats.skippedChunks} skipped | ${stats.totalErrors} errors`);
    
    logger.logProgress(stats.currentChunk, stats.totalChunks, elapsed, eta, stats);
  }

  const duration = formatDuration(Date.now() - stats.startTime);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✅ Import Complete!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Duration:            ${duration}`);
  console.log(`Total Chunks:              ${stats.totalChunks}`);
  console.log(`Skipped Chunks:            ${stats.skippedChunks}`);
  console.log(`NULL Chunks Refetched:     ${stats.nullChunksRefetched}`);
  console.log(`Processed Chunks:          ${stats.totalChunks - stats.skippedChunks}`);
  console.log(`Records Fetched:           ${stats.totalRecordsFetched.toLocaleString()}`);
  console.log(`Records Inserted:          ${stats.totalRecordsInserted.toLocaleString()}`);
  console.log(`Zero Values Preserved:     ${stats.zeroValuesPreserved.toLocaleString()}`);
  console.log(`Current Values Calculated: ${stats.currentCalculated.toLocaleString()}`);
  console.log(`Current Calc Errors:       ${stats.currentCalculationErrors.toLocaleString()}`);
  console.log(`Errors:                    ${stats.totalErrors}`);
  console.log(`\nPer-Tag Statistics:`);

  Object.entries(stats.tagStats).forEach(([tag, count]) => {
    console.log(`  ${tag.padEnd(25)} ${count.toLocaleString()} records`);
  });

  console.log('═══════════════════════════════════════════════════════════\n');
  
  logger.logFinalSummary(stats, duration);
  logger.log('Import completed successfully', 'success');
}

(async () => {
  try {
    await importHistoricalData();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    logger.log(`Fatal error: ${error.message}`, 'error');
    logger.log(`Stack trace: ${error.stack}`, 'debug');
    await pool.end();
    process.exit(1);
  }
})();