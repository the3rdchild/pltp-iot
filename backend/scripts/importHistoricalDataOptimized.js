#!/usr/bin/env node
/**
 * Optimized Historical Data Import from Honeywell API
 *
 * Configuration:
 * - Sample Interval: 10 minutes (600000 ms)
 * - Date Range: 13-MAY-2025 14:04:32 to now
 * - Chunk Size: 7 days per batch
 * - MaxRows: 10000 per API request
 *
 * Usage:
 *   node scripts/importHistoricalDataOptimized.js
 *   node scripts/importHistoricalDataOptimized.js "13-MAY-2025 14:04:32" "18-DEC-2025 23:59:59"
 */

require('dotenv').config();
const https = require('https');
const { Pool } = require('pg');

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
  SAMPLE_INTERVAL: 600000, // 10 minutes in milliseconds
  MAX_ROWS_PER_REQUEST: 10000,
  CHUNK_DAYS: 7, // Process 7 days at a time
  API_URL: process.env.HONEYWELL_API_URL,
  API_KEY: process.env.HONEYWELL_API_X_API_KEY,
  DEVICE_ID: null, // Honeywell data has no device_id
  REQUEST_DELAY: 1000, // 1 second delay between requests
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

// Parse command line arguments
const args = process.argv.slice(2);
const DEFAULT_START = "13-MAY-2025 14:04:32.000";
const startDate = args[0] || DEFAULT_START;
const endDate = args[1] || formatToHoneywellTimestamp(new Date());

// Statistics
const stats = {
  totalChunks: 0,
  currentChunk: 0,
  totalRecordsFetched: 0,
  totalRecordsInserted: 0,
  totalErrors: 0,
  startTime: Date.now(),
  tagStats: {}
};

console.log('═══════════════════════════════════════════════════════════');
console.log('   Honeywell Historical Data Import (OPTIMIZED)');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Start Date:        ${startDate}`);
console.log(`End Date:          ${endDate}`);
console.log(`Sample Interval:   10 minutes`);
console.log(`Chunk Size:        ${CONFIG.CHUNK_DAYS} days`);
console.log(`Max Rows/Request:  ${CONFIG.MAX_ROWS_PER_REQUEST}`);
console.log('═══════════════════════════════════════════════════════════\n');

/**
 * Format Date to Honeywell timestamp format
 */
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

/**
 * Parse Honeywell timestamp to Date
 */
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

/**
 * Parse Honeywell timestamp to ISO string for PostgreSQL
 */
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

/**
 * Fetch data from Honeywell API
 */
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

/**
 * Transform and merge data from multiple tags
 */
function transformAndMergeData(allTagResponses) {
  const mergedRecords = {};

  for (const response of allTagResponses) {
    if (!response.data || !Array.isArray(response.data)) continue;

    for (const tagData of response.data) {
      const tagName = tagData.TagName;
      const columnName = TAGNAME_TO_COLUMN[tagName];

      if (!columnName) {
        console.warn(`  ⚠️  Unknown TagName: ${tagName}`);
        continue;
      }

      const timestamps = tagData.TimeStamp || [];
      const values = tagData.Value || [];
      const confidences = tagData.Confidence || [];

      for (let i = 0; i < timestamps.length; i++) {
        if (confidences[i] < 100) continue; // Skip low confidence

        const timestamp = parseHoneywellTimestampToISO(timestamps[i]);

        if (!mergedRecords[timestamp]) {
          mergedRecords[timestamp] = {
            timestamp,
            device_id: CONFIG.DEVICE_ID
          };
        }

        mergedRecords[timestamp][columnName] = values[i];
      }
    }
  }

  return Object.values(mergedRecords);
}

/**
 * Bulk insert records using COPY or multi-value INSERT
 */
async function bulkInsertRecords(records) {
  if (records.length === 0) return { inserted: 0 };

  const columns = ['timestamp', 'device_id', 'pressure', 'flow_rate', 'temperature',
                   'gen_reactive_power', 'gen_output', 'gen_frequency', 'speed_detection',
                   'mcv_l', 'mcv_r', 'gen_voltage_v_w', 'gen_voltage_w_u', 'status'];

  const values = [];
  const placeholders = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const recordValues = [
      record.timestamp,
      record.device_id,
      record.pressure || null,
      record.flow_rate || null,
      record.temperature || null,
      record.gen_reactive_power || null,
      record.gen_output || null,
      record.gen_frequency || null,
      record.speed_detection || null,
      record.mcv_l || null,
      record.mcv_r || null,
      record.gen_voltage_v_w || null,
      record.gen_voltage_w_u || null,
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
      pressure = EXCLUDED.pressure,
      flow_rate = EXCLUDED.flow_rate,
      temperature = EXCLUDED.temperature,
      gen_reactive_power = EXCLUDED.gen_reactive_power,
      gen_output = EXCLUDED.gen_output,
      gen_frequency = EXCLUDED.gen_frequency,
      speed_detection = EXCLUDED.speed_detection,
      mcv_l = EXCLUDED.mcv_l,
      mcv_r = EXCLUDED.mcv_r,
      gen_voltage_v_w = EXCLUDED.gen_voltage_v_w,
      gen_voltage_w_u = EXCLUDED.gen_voltage_w_u
  `;

  try {
    await pool.query(sql, values);
    return { inserted: records.length };
  } catch (error) {
    console.error('  ❌ Bulk insert error:', error.message);
    throw error;
  }
}

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format duration
 */
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

/**
 * Calculate ETA
 */
function calculateETA() {
  if (stats.currentChunk === 0) return 'calculating...';

  const elapsed = Date.now() - stats.startTime;
  const avgTimePerChunk = elapsed / stats.currentChunk;
  const remainingChunks = stats.totalChunks - stats.currentChunk;
  const etaMs = avgTimePerChunk * remainingChunks;

  return formatDuration(etaMs);
}

/**
 * Split date range into chunks
 */
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

/**
 * Main import function
 */
async function importHistoricalData() {
  const chunks = splitDateRange(startDate, endDate, CONFIG.CHUNK_DAYS);
  stats.totalChunks = chunks.length;

  console.log(`📊 Total chunks: ${stats.totalChunks}\n`);

  const tagNames = Object.keys(TAGNAME_TO_COLUMN);

  for (const chunk of chunks) {
    stats.currentChunk++;

    console.log(`\n[${ stats.currentChunk}/${stats.totalChunks}] Processing: ${chunk.start} → ${chunk.end}`);
    console.log('─'.repeat(80));

    const allTagResponses = [];

    // Fetch all tags for this chunk
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
        stats.totalErrors++;
      }
    }

    // Merge and insert
    process.stdout.write(`  Merging data... `);
    const mergedRecords = transformAndMergeData(allTagResponses);
    console.log(`✓ ${mergedRecords.length} unique timestamps`);

    if (mergedRecords.length > 0) {
      process.stdout.write(`  Inserting to database... `);
      try {
        const result = await bulkInsertRecords(mergedRecords);
        console.log(`✓ ${result.inserted} records`);
        stats.totalRecordsInserted += result.inserted;
      } catch (error) {
        console.log(`✗ ${error.message}`);
        stats.totalErrors++;
      }
    }

    // Progress
    const progress = (stats.currentChunk / stats.totalChunks * 100).toFixed(1);
    const elapsed = formatDuration(Date.now() - stats.startTime);
    const eta = calculateETA();

    console.log(`\n  📈 Progress: ${progress}% | Elapsed: ${elapsed} | ETA: ${eta}`);
    console.log(`  📊 Records: ${stats.totalRecordsInserted.toLocaleString()} inserted | ${stats.totalErrors} errors`);
  }

  // Final summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✅ Import Complete!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Duration:       ${formatDuration(Date.now() - stats.startTime)}`);
  console.log(`Records Fetched:      ${stats.totalRecordsFetched.toLocaleString()}`);
  console.log(`Records Inserted:     ${stats.totalRecordsInserted.toLocaleString()}`);
  console.log(`Errors:               ${stats.totalErrors}`);
  console.log(`\nPer-Tag Statistics:`);

  Object.entries(stats.tagStats).forEach(([tag, count]) => {
    console.log(`  ${tag.padEnd(25)} ${count.toLocaleString()} records`);
  });

  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run import
(async () => {
  try {
    await importHistoricalData();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    await pool.end();
    process.exit(1);
  }
})();
