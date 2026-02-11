const https = require('https');

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
  '5MKA01FE004PVI.PV': 'gen_voltage_u_v',    // Voltage U-V
  '5MKA01FE005PVI.PV': 'gen_voltage_v_w',    // Voltage V-W
  '5MKA01FE006PVI.PV': 'gen_voltage_w_u'     // Voltage W-U
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
 * Fetch live data from Honeywell API for dashboard display
 * Returns processed data with calculated current
 * @returns {Promise<Object>} - Live data metrics
 */
async function fetchLiveDataForDashboard() {
  const now = new Date();
  const startTime = formatToHoneywellTimestamp(new Date(now.getTime() - 10000)); // 10 seconds ago
  const endTime = formatToHoneywellTimestamp(now);

  const metrics = {};
  const errors = [];

  // Define which tags to fetch for dashboard
  const dashboardTags = {
    'pressure': '5LBB31FP002PVI.PV',
    'temperature': '5LBB31FT001PVI.PV',
    'flow_rate': '5LBB31FF001PVI.PV',
    'gen_output': '5MKA01FE008PVI.PV',
    'gen_reactive_power': '5BAT01AQ1-B02PVI.PV',
    'speed_detection': '5MAD02FS011PVI.PV',
    'gen_voltage_u_v': '5MKA01FE004PVI.PV',
    'gen_voltage_v_w': '5MKA01FE005PVI.PV',
    'gen_voltage_w_u': '5MKA01FE006PVI.PV'
  };

  // Fetch data for each tag
  for (const [metricName, tagName] of Object.entries(dashboardTags)) {
    try {
      const response = await fetchHoneywellData({
        TagName: tagName,
        StartTime: startTime,
        EndTime: endTime,
        MaxRows: 1,
        ReductionData: 'now'
      });

      if (response.data && response.data.length > 0) {
        const tagData = response.data[0];
        const values = tagData.Value || [];
        const timestamps = tagData.TimeStamp || [];
        const confidences = tagData.Confidence || [];

        if (values.length > 0 && confidences[0] >= 100) {
          metrics[metricName] = {
            value: values[0],
            timestamp: timestamps[0] ? parseHoneywellTimestamp(timestamps[0]) : new Date().toISOString(),
            confidence: confidences[0]
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching ${metricName}:`, error.message);
      errors.push({ metric: metricName, error: error.message });
    }
  }

  // Calculate voltage average
  if (metrics.gen_voltage_u_v && metrics.gen_voltage_v_w && metrics.gen_voltage_w_u) {
    const avgVoltage = (
      parseFloat(metrics.gen_voltage_u_v.value) +
      parseFloat(metrics.gen_voltage_v_w.value) +
      parseFloat(metrics.gen_voltage_w_u.value)
    ) / 3;

    metrics.voltage = {
      value: Math.round(avgVoltage * 100) / 100,
      timestamp: metrics.gen_voltage_u_v.timestamp,
      calculated: true
    };
  }

  // Calculate current from power and voltage
  if (metrics.gen_output && metrics.voltage) {
    try {
      const current = computeLineCurrent({
        P_MW: parseFloat(metrics.gen_output.value),
        Q_MVar: metrics.gen_reactive_power ? parseFloat(metrics.gen_reactive_power.value) : null,
        Vab: parseFloat(metrics.gen_voltage_u_v.value),
        Vbc: parseFloat(metrics.gen_voltage_v_w.value),
        Vca: parseFloat(metrics.gen_voltage_w_u.value)
      }, { voltageUnit: 'kV' });

      metrics.current = {
        value: Math.round(current.I_line_A * 100) / 100,
        timestamp: metrics.gen_output.timestamp,
        calculated: true
      };
    } catch (error) {
      console.error('Error calculating current:', error.message);
      errors.push({ metric: 'current', error: error.message });
    }
  }

  return {
    success: true,
    metrics,
    timestamp: new Date().toISOString(),
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Calculate line current from power and voltage values
 * @param {Object} params - Power and voltage parameters
 * @param {Object} opts - Options including voltage unit
 * @returns {Object} - Calculated current values
 */
function computeLineCurrent(params, opts = {}) {
  const { P_MW, Q_MVar, Vab, Vbc, Vca } = params;
  const voltageUnit = opts.voltageUnit || 'kV';
  const assume_pf = (typeof opts.assume_pf === 'number') ? opts.assume_pf : null;

  if (P_MW == null) throw new Error('P_MW required');

  // Handle Q missing
  let Q = Q_MVar;
  if (Q == null) {
    if (assume_pf == null) {
      Q = 0; // Assume purely real power
    } else {
      const pf = Math.max(0, Math.min(1, assume_pf));
      Q = P_MW * Math.tan(Math.acos(pf));
    }
  }

  // Apparent power (MVA) and convert to VA
  const S_MVA = Math.sqrt(P_MW * P_MW + Q * Q);
  const S_VA = S_MVA * 1e6;

  // Voltage unit conversion
  const conv = (voltageUnit === 'kV') ? 1000 : 1;
  const Vab_V = Vab * conv;
  const Vbc_V = Vbc * conv;
  const Vca_V = Vca * conv;

  // Balanced line current using average V_LL
  const V_LL_avg = (Vab_V + Vbc_V + Vca_V) / 3;
  if (V_LL_avg <= 0) throw new Error('Invalid voltage inputs');

  const I_line_A = S_VA / (Math.sqrt(3) * V_LL_avg);

  // Per-phase currents
  const S_phase = S_VA / 3;
  const V_phase_a = Vab_V / Math.sqrt(3);
  const V_phase_b = Vbc_V / Math.sqrt(3);
  const V_phase_c = Vca_V / Math.sqrt(3);

  const I_phase = {
    A: S_phase / V_phase_a,
    B: S_phase / V_phase_b,
    C: S_phase / V_phase_c
  };

  return { S_MVA, I_line_A, I_phase };
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
  fetchLiveDataForDashboard,
  testConnection,
  parseHoneywellTimestamp,
  formatToHoneywellTimestamp,
  computeLineCurrent,
  TAGNAME_TO_COLUMN
};
