const { query } = require('../config/database');
const { processSensorData, getMetricValue, getDbColumnForMetric } = require('../utils/calculations');
const { getMetricAnomalyStatus, getLimitForMetric } = require('../utils/limits');

/**
 * Valid metrics list
 */
const VALID_METRICS = [
  'tds', 'pressure', 'temperature', 'flow_rate', 'flow',
  'gen_output', 'active_power', 'voltage', 'gen_reactive_power', 'reactive_power',
  'speed_detection', 'speed', 'current', 'gen_power_factor', 'gen_frequency'
];

/**
 * GET /api/data/live
 * Get all live metrics for dashboard
 */
const getLiveData = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No sensor data available'
      });
    }

    const rawData = result.rows[0];
    const processedData = processSensorData(rawData);

    // Build response with all metrics and their anomaly status
    const metrics = {
      tds: {
        value: processedData.tds,
        unit: 'ppm',
        ...getMetricAnomalyStatus('tds', processedData.tds)
      },
      pressure: {
        value: processedData.pressure,
        unit: 'kPa',
        ...getMetricAnomalyStatus('pressure', processedData.pressure)
      },
      temperature: {
        value: processedData.temperature,
        unit: '°C',
        ...getMetricAnomalyStatus('temperature', processedData.temperature)
      },
      flow_rate: {
        value: processedData.flow_rate,
        unit: 't/h',
        ...getMetricAnomalyStatus('flow_rate', processedData.flow_rate)
      },
      active_power: {
        value: processedData.gen_output,
        unit: 'W',
        ...getMetricAnomalyStatus('gen_output', processedData.gen_output)
      },
      voltage: {
        value: processedData.voltage,
        unit: 'V',
        ...getMetricAnomalyStatus('voltage', processedData.voltage)
      },
      reactive_power: {
        value: processedData.gen_reactive_power,
        unit: 'VAR',
        ...getMetricAnomalyStatus('reactive_power', processedData.gen_reactive_power)
      },
      speed: {
        value: processedData.speed_detection,
        unit: 'RPM',
        ...getMetricAnomalyStatus('speed_detection', processedData.speed_detection)
      },
      current: {
        value: processedData.current,
        unit: 'A',
        ...getMetricAnomalyStatus('current', processedData.current)
      },
      power_factor: {
        value: processedData.gen_power_factor,
        unit: '',
        status: 'normal',
        details: null
      },
      frequency: {
        value: processedData.gen_frequency,
        unit: 'Hz',
        status: 'normal',
        details: null
      }
    };

    res.json({
      success: true,
      data: {
        timestamp: processedData.timestamp,
        device_id: processedData.device_id,
        metrics,
        raw: processedData
      }
    });

  } catch (error) {
    console.error('Error fetching live data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live data',
      error: error.message
    });
  }
};

/**
 * GET /api/data/live/:metric
 * Get single live metric with anomaly status
 */
const getLiveMetric = async (req, res) => {
  try {
    const { metric } = req.params;

    // Validate metric
    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: `Invalid metric. Valid metrics: ${VALID_METRICS.join(', ')}`
      });
    }

    const result = await query(
      `SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No sensor data available'
      });
    }

    const rawData = result.rows[0];
    const processedData = processSensorData(rawData);
    const value = getMetricValue(processedData, metric);
    const anomalyStatus = getMetricAnomalyStatus(metric, value);

    res.json({
      success: true,
      data: {
        metric,
        value,
        timestamp: processedData.timestamp,
        device_id: processedData.device_id,
        ...anomalyStatus
      }
    });

  } catch (error) {
    console.error('Error fetching live metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live metric',
      error: error.message
    });
  }
};

/**
 * GET /api/data/chart/:metric
 * Get chart data with time range aggregation
 * Query params: range (1h, 1d, 7d, 1m, 10y)
 */
const getChartData = async (req, res) => {
  try {
    const { metric } = req.params;
    const { range = '1d' } = req.query;

    // Validate metric
    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: `Invalid metric. Valid metrics: ${VALID_METRICS.join(', ')}`
      });
    }

    // Handle calculated metrics (current, voltage)
    const isCalculatedMetric = ['current', 'voltage'].includes(metric);

    // Define range configurations
    const rangeConfig = {
      '1h': { interval: '1 hour', truncate: 'minute', points: 60 },
      '1d': { interval: '1 day', truncate: 'hour', points: 24 },
      '7d': { interval: '7 days', truncate: 'hour', points: 42 }, // ~4 hour intervals
      '1m': { interval: '30 days', truncate: 'day', points: 30 },
      '10y': { interval: '3650 days', truncate: 'month', points: 120 }
    };

    const config = rangeConfig[range];
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Invalid range. Valid ranges: 1h, 1d, 7d, 1m, 10y'
      });
    }

    let chartData;

    if (isCalculatedMetric) {
      // For calculated metrics, fetch raw data and calculate
      chartData = await getCalculatedMetricChartData(metric, config);
    } else {
      // For direct DB columns, use SQL aggregation
      const dbColumn = getDbColumnForMetric(metric);
      chartData = await getDirectMetricChartData(dbColumn, config);
    }

    // Get limit info for the metric
    const limit = getLimitForMetric(metric);

    res.json({
      success: true,
      data: {
        metric,
        range,
        points: chartData.length,
        limit: limit ? {
          min: limit.min,
          max: limit.max,
          warningLow: limit.warningLow,
          warningHigh: limit.warningHigh,
          abnormalLow: limit.abnormalLow,
          abnormalHigh: limit.abnormalHigh
        } : null,
        chart: chartData
      }
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
      error: error.message
    });
  }
};

/**
 * Get chart data for direct database column metrics
 */
const getDirectMetricChartData = async (column, config) => {
  const { interval, truncate, points } = config;

  // Calculate the bucket size based on interval and desired points
  let bucketInterval;
  switch (truncate) {
    case 'minute':
      bucketInterval = '1 minute';
      break;
    case 'hour':
      if (interval === '7 days') {
        bucketInterval = '4 hours';
      } else {
        bucketInterval = '1 hour';
      }
      break;
    case 'day':
      bucketInterval = '1 day';
      break;
    case 'month':
      bucketInterval = '1 month';
      break;
    default:
      bucketInterval = '1 hour';
  }

  const sql = `
    WITH time_buckets AS (
      SELECT
        DATE_TRUNC('${truncate}', timestamp) ${truncate === 'hour' && interval === '7 days' ?
          `- (EXTRACT(HOUR FROM timestamp)::int % 4) * INTERVAL '1 hour'` : ''
        } AS bucket,
        MIN(${column}) AS min_value,
        AVG(${column}) AS avg_value,
        MAX(${column}) AS max_value,
        COUNT(*) AS data_points
      FROM sensor_data
      WHERE timestamp >= NOW() - INTERVAL '${interval}'
        AND ${column} IS NOT NULL
      GROUP BY 1
      ORDER BY bucket ASC
    )
    SELECT * FROM time_buckets
    LIMIT ${points}
  `;

  const result = await query(sql);

  return result.rows.map(row => ({
    timestamp: row.bucket,
    min: row.min_value !== null ? parseFloat(parseFloat(row.min_value).toFixed(2)) : null,
    avg: row.avg_value !== null ? parseFloat(parseFloat(row.avg_value).toFixed(2)) : null,
    max: row.max_value !== null ? parseFloat(parseFloat(row.max_value).toFixed(2)) : null,
    data_points: parseInt(row.data_points)
  }));
};

/**
 * Get chart data for calculated metrics (current, voltage)
 */
const getCalculatedMetricChartData = async (metric, config) => {
  const { interval, truncate, points } = config;

  // For calculated metrics, we need to fetch raw data and calculate per bucket
  const sql = `
    SELECT
      DATE_TRUNC('${truncate}', timestamp) AS bucket,
      gen_output,
      gen_voltage_v_w,
      gen_voltage_w_u,
      gen_reactive_power,
      gen_power_factor
    FROM sensor_data
    WHERE timestamp >= NOW() - INTERVAL '${interval}'
    ORDER BY timestamp ASC
  `;

  const result = await query(sql);

  // Group by bucket and calculate
  const buckets = {};

  result.rows.forEach(row => {
    const bucketKey = row.bucket.toISOString();
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = {
        timestamp: row.bucket,
        values: []
      };
    }

    let value;
    if (metric === 'voltage') {
      const v1 = row.gen_voltage_v_w;
      const v2 = row.gen_voltage_w_u;
      const voltages = [v1, v2].filter(v => typeof v === 'number');
      value = voltages.length > 0
        ? voltages.reduce((s, v) => s + v, 0) / voltages.length
        : null;
    } else if (metric === 'current') {
      const { processSensorData } = require('../utils/calculations');
      const processed = processSensorData(row);
      value = processed.current;
    }

    if (value !== null) {
      buckets[bucketKey].values.push(value);
    }
  });

  // Calculate min/avg/max for each bucket
  return Object.values(buckets)
    .map(bucket => {
      if (bucket.values.length === 0) {
        return {
          timestamp: bucket.timestamp,
          min: null,
          avg: null,
          max: null,
          data_points: 0
        };
      }

      const min = Math.min(...bucket.values);
      const max = Math.max(...bucket.values);
      const avg = bucket.values.reduce((s, v) => s + v, 0) / bucket.values.length;

      return {
        timestamp: bucket.timestamp,
        min: parseFloat(min.toFixed(2)),
        avg: parseFloat(avg.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        data_points: bucket.values.length
      };
    })
    .slice(0, points);
};

/**
 * GET /api/data/stats/:metric
 * Get statistics table data for a metric
 * Query params: limit, offset, start_date, end_date
 */
const getStatsData = async (req, res) => {
  try {
    const { metric } = req.params;
    const {
      limit = 50,
      offset = 0,
      start_date,
      end_date
    } = req.query;

    // Validate metric
    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: `Invalid metric. Valid metrics: ${VALID_METRICS.join(', ')}`
      });
    }

    const isCalculatedMetric = ['current', 'voltage'].includes(metric);
    const dbColumn = isCalculatedMetric ? null : getDbColumnForMetric(metric);

    // Build query for raw data
    let sql = `SELECT * FROM sensor_data WHERE 1=1`;
    const params = [];

    if (start_date) {
      params.push(start_date);
      sql += ` AND timestamp >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      sql += ` AND timestamp <= $${params.length}`;
    }

    sql += ` ORDER BY timestamp DESC`;
    params.push(parseInt(limit), parseInt(offset));
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(sql, params);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM sensor_data WHERE 1=1`;
    const countParams = [];

    if (start_date) {
      countParams.push(start_date);
      countSql += ` AND timestamp >= $${countParams.length}`;
    }

    if (end_date) {
      countParams.push(end_date);
      countSql += ` AND timestamp <= $${countParams.length}`;
    }

    const countResult = await query(countSql, countParams);
    const totalRecords = parseInt(countResult.rows[0].total);

    // Process data and extract metric values with anomaly status
    const data = result.rows.map(row => {
      const processed = processSensorData(row);
      const value = getMetricValue(processed, metric);
      const anomaly = getMetricAnomalyStatus(metric, value);

      return {
        id: row.id,
        timestamp: row.timestamp,
        device_id: row.device_id,
        value,
        status: anomaly.status,
        details: anomaly.details
      };
    });

    // Calculate summary stats
    const values = data.map(d => d.value).filter(v => v !== null);
    const summary = values.length > 0 ? {
      min: parseFloat(Math.min(...values).toFixed(2)),
      max: parseFloat(Math.max(...values).toFixed(2)),
      avg: parseFloat((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2)),
      count: values.length
    } : null;

    // Get limit info
    const limit_info = getLimitForMetric(metric);

    res.json({
      success: true,
      data: {
        metric,
        summary,
        limit: limit_info ? {
          unit: limit_info.unit,
          min: limit_info.min,
          max: limit_info.max,
          warningLow: limit_info.warningLow,
          warningHigh: limit_info.warningHigh,
          abnormalLow: limit_info.abnormalLow,
          abnormalHigh: limit_info.abnormalHigh
        } : null,
        records: data,
        pagination: {
          total: totalRecords,
          limit: parseInt(limit),
          offset: parseInt(offset),
          current_page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
          total_pages: Math.ceil(totalRecords / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching stats data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics data',
      error: error.message
    });
  }
};

module.exports = {
  getLiveData,
  getLiveMetric,
  getChartData,
  getStatsData,
  VALID_METRICS
};
