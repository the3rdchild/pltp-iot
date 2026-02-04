const https = require('https');
const { query } = require('../config/database');

// TagName mapping dari Honeywell ke column database
const TAGNAME_TO_COLUMN = {
  '5LBB31FP002PVI.PV': 'pressure',           // Main Steam Pressure
  '5LBB31FF001PVI.PV': 'flow_rate',          // Main Steam Flow
  '5LBB31FT001PVI.PV': 'temperature',        // Main Steam Temp
  '5BAT01AQ1-B02PVI.PV': 'gen_reactive_power', // Gen Reactive Power Net
  '5MKA01FE008PVI.PV': 'gen_output',         // Gen Output MW
  '5MKA01FE010PVI.PV': 'gen_frequency',      // Gen Frequency
  '5MAD02FS011PVI.PV': 'speed_detection',    // Turbine Speed
  '5CGA01FG001PVI.PV': 'mcv_l',              // MCV L Position
  '5CGA01FG002PVI.PV': 'mcv_r',              // MCV R Position
  '5MKA01FE004PVI.PV': 'gen_voltage_v_w',    // Voltage U-V
  '5MKA01FE005PVI.PV': 'gen_voltage_v_w',    // Voltage V-W (same column)
  '5MKA01FE006PVI.PV': 'gen_voltage_w_u'     // Voltage U-W
};

/**
 * Fetch data from Honeywell API
 * @param {Object} params - Request parameters
 * @param {string} params.TagName - Tag name to fetch
 * @param {string} params.StartTime - Start time (format: "DD-MMM-YYYY HH:mm:ss.SSS")
 * @param {string} params.EndTime - End time
 * @param {number} params.MaxRows - Maximum rows to fetch
 * @param {string} params.ReductionData - Data reduction type (now, min, avg, max)
 * @returns {Promise<Object>} - Honeywell API response
 */
async function fetchHoneywellData(params) {
  return new Promise((resolve, reject) => {
    const apiUrl = process.env.HONEYWELL_API_URL;
    const apiKey = process.env.HONEYWELL_API_X_API_KEY;

    const requestBody = {
      SampleInterval: params.SampleInterval || parseInt(process.env.HONEYWELL_API_SAMPLE_INTERVAL) || 1000,
      ResampleMethod: params.ResampleMethod || "Around",
      MinimumConfidence: params.MinimumConfidence || 100,
      MaxRows: params.MaxRows || parseInt(process.env.HONEYWELL_API_MAX_ROWS) || 10,
      TimeFormat: params.TimeFormat || 1,
      ReductionData: params.ReductionData || "now",
      TagName: params.TagName,
      StartTime: params.StartTime,
      EndTime: params.EndTime,
      OutputTimeFormat: params.OutputTimeFormat || 1
    };

    const url = new URL(apiUrl);
    const postData = JSON.stringify(requestBody);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
            reject(new Error(jsonData.message || 'Honeywell API returned error'));
            return;
          }

          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse Honeywell API response: ' + error.message));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error('Honeywell API request failed: ' + error.message));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Parse timestamp from Honeywell format to PostgreSQL format
 * @param {string} honeywellTimestamp - Format: "DD-MMM-YYYY HH:mm:ss"
 * @returns {string} - ISO 8601 format
 */
function parseHoneywellTimestamp(honeywellTimestamp) {
  // Example: "11-DEC-2025 13:51:00" -> "2025-12-11T13:51:00Z"
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
 * Format timestamp to Honeywell format
 * @param {Date} date - JavaScript Date object
 * @returns {string} - Format: "DD-MMM-YYYY HH:mm:ss.SSS"
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
 * Transform Honeywell API response to database format
 * @param {Object} honeywellResponse - Response from Honeywell API
 * @param {string} deviceId - Device ID to associate with data
 * @returns {Array} - Array of records ready to insert into database
 */
function transformHoneywellData(honeywellResponse, deviceId = null) {
  if (!honeywellResponse.data || !Array.isArray(honeywellResponse.data)) {
    throw new Error('Invalid Honeywell response format');
  }

  const records = [];

  for (const tagData of honeywellResponse.data) {
    const tagName = tagData.TagName;
    const columnName = TAGNAME_TO_COLUMN[tagName];

    if (!columnName) {
      console.warn(`Unknown TagName: ${tagName}, skipping...`);
      continue;
    }

    const timestamps = tagData.TimeStamp || [];
    const values = tagData.Value || [];
    const confidences = tagData.Confidence || [];

    // Process each timestamp-value pair
    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = parseHoneywellTimestamp(timestamps[i]);
      const value = values[i];
      const confidence = confidences[i];

      // Only process data with confidence >= 100 (or as configured)
      if (confidence < 100) {
        continue;
      }

      // Find existing record for this timestamp or create new one
      let record = records.find(r => r.timestamp === timestamp);

      if (!record) {
        record = {
          timestamp,
          device_id: deviceId || process.env.HONEYWELL_DEVICE_ID || null,
          status: 'normal'
        };
        records.push(record);
      }

      // Set the value for the appropriate column
      record[columnName] = value;
    }
  }

  return records;
}

/**
 * Insert sensor data into database
 * @param {Array} records - Array of sensor data records
 * @returns {Promise<Object>} - Insert result
 */
async function insertSensorData(records) {
  if (!records || records.length === 0) {
    return { inserted: 0, message: 'No records to insert' };
  }

  let inserted = 0;
  const errors = [];

  for (const record of records) {
    try {
      // Build column names and values dynamically
      const columns = ['timestamp', 'device_id', 'status'];
      const values = [record.timestamp, record.device_id, record.status];
      const placeholders = ['$1', '$2', '$3'];
      let paramIndex = 4;

      // Add all metric columns that have values
      const metricColumns = [
        'pressure', 'flow_rate', 'temperature', 'gen_reactive_power',
        'gen_output', 'gen_frequency', 'speed_detection', 'mcv_l', 'mcv_r',
        'gen_voltage_v_w', 'gen_voltage_w_u', 'voltage',
        'current', 'gen_power_factor', 'tds'
      ];

      for (const col of metricColumns) {
        if (record[col] !== undefined && record[col] !== null) {
          columns.push(col);
          values.push(record[col]);
          placeholders.push(`$${paramIndex}`);
          paramIndex++;
        }
      }

      // Insert or update on conflict (upsert)
      const sql = `
        INSERT INTO sensor_data (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT (timestamp, device_id)
        DO UPDATE SET
          ${metricColumns.map(col =>
            columns.includes(col) ? `${col} = EXCLUDED.${col}` : null
          ).filter(Boolean).join(', ')}
      `;

      await query(sql, values);
      inserted++;
    } catch (error) {
      console.error('Error inserting record:', error);
      errors.push({
        record,
        error: error.message
      });
    }
  }

  return {
    inserted,
    total: records.length,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Fetch and store live data from Honeywell for all tags
 * @returns {Promise<Object>} - Result summary
 */
async function fetchAndStoreLiveData() {
  const tagNames = Object.keys(TAGNAME_TO_COLUMN);
  const allRecords = [];

  // Current time
  const now = new Date();
  const startTime = formatToHoneywellTimestamp(new Date(now.getTime() - 10000)); // 10 seconds ago
  const endTime = formatToHoneywellTimestamp(now);

  console.log(`Fetching live data for ${tagNames.length} tags from Honeywell...`);

  for (const tagName of tagNames) {
    try {
      const response = await fetchHoneywellData({
        TagName: tagName,
        StartTime: startTime,
        EndTime: endTime,
        MaxRows: 10,
        ReductionData: 'now'
      });

      const records = transformHoneywellData(response);
      allRecords.push(...records);

      console.log(`✓ Fetched ${records.length} records for ${tagName}`);
    } catch (error) {
      console.error(`✗ Error fetching ${tagName}:`, error.message);
    }
  }

  // Merge records with same timestamp
  const mergedRecords = {};
  for (const record of allRecords) {
    const key = record.timestamp;
    if (!mergedRecords[key]) {
      mergedRecords[key] = { ...record };
    } else {
      // Merge values
      Object.assign(mergedRecords[key], record);
    }
  }

  const finalRecords = Object.values(mergedRecords);

  console.log(`Inserting ${finalRecords.length} merged records into database...`);
  const result = await insertSensorData(finalRecords);

  return {
    success: true,
    fetched: allRecords.length,
    merged: finalRecords.length,
    ...result
  };
}

/**
 * Test connection to Honeywell API
 * @param {string} tagName - Optional tag name to test (default: first tag)
 * @returns {Promise<Object>} - Connection test result
 */
async function testConnection(tagName = null) {
  const testTag = tagName || Object.keys(TAGNAME_TO_COLUMN)[0];
  const now = new Date();
  const startTime = formatToHoneywellTimestamp(new Date(now.getTime() - 60000)); // 1 minute ago
  const endTime = formatToHoneywellTimestamp(now);

  try {
    const response = await fetchHoneywellData({
      TagName: testTag,
      StartTime: startTime,
      EndTime: endTime,
      MaxRows: 1,
      ReductionData: 'now'
    });

    return {
      success: true,
      message: 'Connection to Honeywell API successful',
      data: response.data,
      tagTested: testTag
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection to Honeywell API failed',
      error: error.message,
      tagTested: testTag
    };
  }
}

module.exports = {
  fetchHoneywellData,
  transformHoneywellData,
  insertSensorData,
  fetchAndStoreLiveData,
  testConnection,
  parseHoneywellTimestamp,
  formatToHoneywellTimestamp,
  TAGNAME_TO_COLUMN
};
