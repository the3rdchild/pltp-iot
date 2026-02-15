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
 * Query params: range (1h, 1d, 7d, 1m, all)
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

    // Define range configurations (all target 60 data points)
    const rangeConfig = {
      '1h': { interval: '1 hour', bucketSeconds: 60, points: 60 },         // 1-min buckets
      '1d': { interval: '1 day', bucketSeconds: 1440, points: 60 },        // 24-min buckets
      '7d': { interval: '7 days', bucketSeconds: 10080, points: 60 },      // 2.8h buckets
      '1m': { interval: '30 days', bucketSeconds: 43200, points: 60 },     // 12h buckets
      'all': { interval: null, bucketSeconds: null, points: 60 }           // dynamic
    };

    const config = rangeConfig[range];
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Invalid range. Valid ranges: 1h, 1d, 7d, 1m, all'
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
 * Uses epoch-based bucketing for consistent 60-point output
 */
const getDirectMetricChartData = async (column, config) => {
  const { interval, bucketSeconds, points } = config;

  let sql;

  if (interval === null) {
    // "all" range: dynamically calculate bucket size from data span
    sql = `
      WITH data_span AS (
        SELECT
          EXTRACT(EPOCH FROM MIN(timestamp)) AS min_epoch,
          EXTRACT(EPOCH FROM MAX(timestamp)) AS max_epoch
        FROM sensor_data
        WHERE ${column} IS NOT NULL
      ),
      bucket_size AS (
        SELECT GREATEST((max_epoch - min_epoch) / ${points}, 1) AS bs, min_epoch
        FROM data_span
      )
      SELECT
        TO_TIMESTAMP(FLOOR((EXTRACT(EPOCH FROM s.timestamp) - b.min_epoch) / b.bs) * b.bs + b.min_epoch) AS bucket,
        MIN(s.${column}) AS min_value,
        AVG(s.${column}) AS avg_value,
        MAX(s.${column}) AS max_value,
        COUNT(*) AS data_points
      FROM sensor_data s, bucket_size b
      WHERE s.${column} IS NOT NULL
      GROUP BY 1, b.bs, b.min_epoch
      ORDER BY bucket ASC
      LIMIT ${points}
    `;
  } else {
    // Fixed interval range: use epoch-based bucketing
    sql = `
      WITH range_start AS (
        SELECT EXTRACT(EPOCH FROM NOW() - INTERVAL '${interval}') AS start_epoch
      )
      SELECT
        TO_TIMESTAMP(FLOOR((EXTRACT(EPOCH FROM s.timestamp) - r.start_epoch) / ${bucketSeconds}) * ${bucketSeconds} + r.start_epoch) AS bucket,
        MIN(s.${column}) AS min_value,
        AVG(s.${column}) AS avg_value,
        MAX(s.${column}) AS max_value,
        COUNT(*) AS data_points
      FROM sensor_data s, range_start r
      WHERE s.timestamp >= NOW() - INTERVAL '${interval}'
        AND s.${column} IS NOT NULL
      GROUP BY 1, r.start_epoch
      ORDER BY bucket ASC
      LIMIT ${points}
    `;
  }

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
 * Uses epoch-based bucketing for consistent 60-point output
 */
const getCalculatedMetricChartData = async (metric, config) => {
  const { interval, bucketSeconds, points } = config;

  // For calculated metrics, we need to fetch raw data and calculate per bucket
  const whereClause = interval === null ? '' : `WHERE timestamp >= NOW() - INTERVAL '${interval}'`;

  const sql = `
    SELECT
      timestamp,
      gen_output,
      gen_voltage_v_w,
      gen_voltage_w_u,
      gen_reactive_power,
      gen_power_factor
    FROM sensor_data
    ${whereClause}
    ORDER BY timestamp ASC
  `;

  const result = await query(sql);
  if (result.rows.length === 0) return [];

  // Determine bucket size
  const firstTs = new Date(result.rows[0].timestamp).getTime() / 1000;
  const lastTs = new Date(result.rows[result.rows.length - 1].timestamp).getTime() / 1000;
  const effectiveBucket = bucketSeconds || Math.max((lastTs - firstTs) / points, 1);

  // Group by bucket and calculate
  const buckets = {};

  result.rows.forEach(row => {
    const ts = new Date(row.timestamp).getTime() / 1000;
    const bucketIndex = Math.floor((ts - firstTs) / effectiveBucket);
    const bucketTs = new Date((bucketIndex * effectiveBucket + firstTs) * 1000);
    const bucketKey = bucketTs.toISOString();

    if (!buckets[bucketKey]) {
      buckets[bucketKey] = { timestamp: bucketTs, values: [] };
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
        return { timestamp: bucket.timestamp, min: null, avg: null, max: null, data_points: 0 };
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

/**
 * GET /api/data/stats/:metric/aggregated
 * Get aggregated statistics table data (daily min/max/avg/stddev, max 60 rows)
 * Used by PTF page statistics tables
 */
const getAggregatedStatsData = async (req, res) => {
  try {
    const { metric } = req.params;

    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: `Invalid metric. Valid metrics: ${VALID_METRICS.join(', ')}`
      });
    }

    const isCalculatedMetric = ['current', 'voltage'].includes(metric);
    const dbColumn = isCalculatedMetric ? null : getDbColumnForMetric(metric);

    let rows;

    if (isCalculatedMetric) {
      // For calculated metrics, fetch raw then aggregate in JS
      const sql = `
        SELECT timestamp, gen_output, gen_voltage_v_w, gen_voltage_w_u,
               gen_reactive_power, gen_power_factor
        FROM sensor_data
        ORDER BY timestamp DESC
      `;
      const result = await query(sql);

      // Group by date and calculate metric values
      const dayBuckets = {};
      result.rows.forEach(row => {
        const dateKey = new Date(row.timestamp).toISOString().split('T')[0];
        if (!dayBuckets[dateKey]) dayBuckets[dateKey] = [];

        let value;
        if (metric === 'voltage') {
          const v1 = row.gen_voltage_v_w;
          const v2 = row.gen_voltage_w_u;
          const voltages = [v1, v2].filter(v => typeof v === 'number');
          value = voltages.length > 0 ? voltages.reduce((s, v) => s + v, 0) / voltages.length : null;
        } else if (metric === 'current') {
          const processed = processSensorData(row);
          value = processed.current;
        }
        if (value !== null) dayBuckets[dateKey].push(value);
      });

      rows = Object.entries(dayBuckets)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 60)
        .map(([date, values]) => {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((s, v) => s + v, 0) / values.length;
          const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length;
          return {
            date,
            min_value: parseFloat(min.toFixed(3)),
            max_value: parseFloat(max.toFixed(3)),
            avg_value: parseFloat(avg.toFixed(3)),
            std_dev: parseFloat(Math.sqrt(variance).toFixed(3))
          };
        });
    } else {
      const sql = `
        SELECT
          DATE(timestamp) AS date,
          MIN(${dbColumn}) AS min_value,
          MAX(${dbColumn}) AS max_value,
          AVG(${dbColumn}) AS avg_value,
          STDDEV(${dbColumn}) AS std_dev
        FROM sensor_data
        WHERE ${dbColumn} IS NOT NULL
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        LIMIT 60
      `;
      const result = await query(sql);
      rows = result.rows;
    }

    const limit = getLimitForMetric(metric);
    const unit = limit ? limit.unit : '';

    const data = rows.map((row, index) => ({
      no: index + 1,
      date: row.date,
      minValue: row.min_value !== null ? `${parseFloat(parseFloat(row.min_value).toFixed(3))}${unit}` : '-',
      maxValue: row.max_value !== null ? `${parseFloat(parseFloat(row.max_value).toFixed(3))}${unit}` : '-',
      average: row.avg_value !== null ? `${parseFloat(parseFloat(row.avg_value).toFixed(3))}${unit}` : '-',
      stdDeviation: row.std_dev !== null ? `${parseFloat(parseFloat(row.std_dev).toFixed(3))}` : '-'
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching aggregated stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aggregated statistics',
      error: error.message
    });
  }
};

module.exports = {
  getLiveData,
  getLiveMetric,
  getChartData,
  getStatsData,
  getAggregatedStatsData,
  VALID_METRICS
};
