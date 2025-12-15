#!/usr/bin/env node
/**
 * Script untuk import historical data dari Honeywell API
 *
 * Usage:
 *   node scripts/importHistoricalData.js [startDate] [endDate]
 *
 * Example:
 *   node scripts/importHistoricalData.js "13-MAY-2025 14:04:32" "15-DEC-2025 23:59:59"
 *   node scripts/importHistoricalData.js
 *
 * Jika tidak ada parameter, akan menggunakan default:
 *   Start: 13-MAY-2025 14:04:32
 *   End: Sekarang
 */

require('dotenv').config();
const {
  fetchHoneywellData,
  transformHoneywellData,
  insertSensorData,
  formatToHoneywellTimestamp,
  TAGNAME_TO_COLUMN
} = require('../services/honeywellService');

// Parse command line arguments
const args = process.argv.slice(2);
const DEFAULT_START_DATE = "13-MAY-2025 14:04:32.000";

let startDate = args[0] || DEFAULT_START_DATE;
let endDate = args[1] || formatToHoneywellTimestamp(new Date());

console.log('═══════════════════════════════════════════════════════════');
console.log('   Honeywell Historical Data Import Script');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Start Date: ${startDate}`);
console.log(`End Date:   ${endDate}`);
console.log('═══════════════════════════════════════════════════════════\n');

/**
 * Split date range into chunks to avoid timeout
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @param {number} chunkHours - Hours per chunk
 * @returns {Array} - Array of {start, end} chunks
 */
function splitDateRange(start, end, chunkHours = 24) {
  const chunks = [];
  let currentStart = new Date(start);
  const endDate = new Date(end);

  while (currentStart < endDate) {
    const currentEnd = new Date(currentStart.getTime() + (chunkHours * 60 * 60 * 1000));

    chunks.push({
      start: new Date(currentStart),
      end: currentEnd > endDate ? endDate : currentEnd
    });

    currentStart = currentEnd;
  }

  return chunks;
}

/**
 * Parse Honeywell timestamp to Date object
 */
function parseHoneywellDate(honeywellTimestamp) {
  const months = {
    'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3,
    'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7,
    'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
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
 * Import data for a specific tag and date range
 */
async function importTagData(tagName, startTime, endTime, maxRows = 1000) {
  try {
    console.log(`  Fetching ${tagName}...`);

    const response = await fetchHoneywellData({
      TagName: tagName,
      StartTime: startTime,
      EndTime: endTime,
      MaxRows: maxRows,
      ReductionData: 'now',
      SampleInterval: 1000
    });

    const records = transformHoneywellData(response);
    console.log(`  ✓ Fetched ${records.length} records for ${tagName}`);

    return records;
  } catch (error) {
    console.error(`  ✗ Error fetching ${tagName}:`, error.message);
    return [];
  }
}

/**
 * Import historical data for all tags
 */
async function importHistoricalData(startDate, endDate) {
  const tagNames = Object.keys(TAGNAME_TO_COLUMN);
  const startDateObj = parseHoneywellDate(startDate);
  const endDateObj = parseHoneywellDate(endDate);

  // Calculate total duration
  const durationMs = endDateObj - startDateObj;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationDays = Math.floor(durationHours / 24);

  console.log(`Duration: ${durationDays} days, ${durationHours % 24} hours\n`);

  // Split into chunks (24 hours each)
  const chunks = splitDateRange(startDateObj, endDateObj, 24);
  console.log(`Split into ${chunks.length} chunks (24 hours each)\n`);

  let totalRecords = 0;
  let totalInserted = 0;

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    const chunkStart = formatToHoneywellTimestamp(chunk.start);
    const chunkEnd = formatToHoneywellTimestamp(chunk.end);

    console.log(`\n[Chunk ${chunkIndex + 1}/${chunks.length}] ${chunkStart} - ${chunkEnd}`);
    console.log('─────────────────────────────────────────────────────────');

    const allRecords = [];

    // Fetch data for all tags in this chunk
    for (const tagName of tagNames) {
      const records = await importTagData(tagName, chunkStart, chunkEnd, 10000);
      allRecords.push(...records);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Merge records with same timestamp
    const mergedRecords = {};
    for (const record of allRecords) {
      const key = record.timestamp;
      if (!mergedRecords[key]) {
        mergedRecords[key] = { ...record };
      } else {
        Object.assign(mergedRecords[key], record);
      }
    }

    const finalRecords = Object.values(mergedRecords);
    totalRecords += finalRecords.length;

    console.log(`\n  Merged into ${finalRecords.length} unique timestamp records`);
    console.log(`  Inserting into database...`);

    // Insert into database
    const result = await insertSensorData(finalRecords);
    totalInserted += result.inserted;

    console.log(`  ✓ Inserted ${result.inserted} records`);

    if (result.errors && result.errors.length > 0) {
      console.log(`  ⚠ ${result.errors.length} errors occurred`);
    }

    // Progress
    const progress = ((chunkIndex + 1) / chunks.length * 100).toFixed(1);
    console.log(`\n  Progress: ${progress}% (${chunkIndex + 1}/${chunks.length} chunks)`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   Import Complete!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total records processed: ${totalRecords}`);
  console.log(`Total records inserted:  ${totalInserted}`);
  console.log(`Success rate:            ${(totalInserted / totalRecords * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Main execution
(async () => {
  try {
    await importHistoricalData(startDate, endDate);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
})();
