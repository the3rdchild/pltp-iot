const { query } = require('../config/database');
const { processSensorData, getMetricValue, getDbColumnForMetric } = require('../utils/calculations');
const { getMetricAnomalyStatus, getLimitForMetric } = require('../utils/limits');

/**
 * Valid metrics list
 */
const VALID_METRICS = [
  'tds', 'pressure', 'temperature', 'flow_rate', 'flow',
  'gen_output', 'active_power', 'voltage', 'gen_reactive_power', 'reactive_power',
  'speed_detection', 'speed', 'current', 'gen_power_factor', 'gen_frequency',
  'dryness', 'ncg', 'tds_predicted'
];

// AI2 metrics — stored in ai2 table, not sensor_data
const AI2_METRIC_COL = { dryness: 'dryness_predict', ncg: 'ncg_predict' };

// AI2 TDS nowcast (ai2-tds-30d) — its own table `ai2_tds`, kept separate from
// AI2_METRIC_COL/`ai2` per D19/D20 (new table is safe, an existing column
// already consumed by the dashboard is not). Migration for `ai2_tds` has not
// run yet as of this writing — see scripts/init_ai2_tds.sql in AI_Pertasmart_V3.
const AI2_TDS_METRIC_COL = { tds_predicted: 'tds_predict' };

/**
 * Points returned per chart series.
 *
 * sensor_data lands roughly once a second, so even a 1h window is ~3600 raw
 * readings — far denser than any screen. 300 keeps the response small while
 * giving about one point per 2-4 CSS pixels on a full-width chart; the 60 this
 * used to return was coarser than the display could actually resolve. Raising
 * it does not blur the sampling: buckets get 5x NARROWER, and each one still
 * carries min/avg/max so short spikes survive either way.
 *
 * Query cost is driven by the rows scanned (the window), not by the number of
 * buckets emitted, so 300 costs the database essentially the same as 60.
 */
const CHART_POINTS = 300;

// Seconds covered by each fixed range. Bucket width is derived from these so
// the two can never drift out of sync — every span here divides evenly by
// CHART_POINTS (12s / 288s / 2016s / 8640s buckets).
const RANGE_SPAN_SECONDS = {
  '1h': 60 * 60,
  '1d': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '1m': 30 * 24 * 60 * 60
};

const RANGE_CONFIG = {
  '1h': { interval: '1 hour', bucketSeconds: RANGE_SPAN_SECONDS['1h'] / CHART_POINTS, points: CHART_POINTS },
  '1d': { interval: '1 day', bucketSeconds: RANGE_SPAN_SECONDS['1d'] / CHART_POINTS, points: CHART_POINTS },
  '7d': { interval: '7 days', bucketSeconds: RANGE_SPAN_SECONDS['7d'] / CHART_POINTS, points: CHART_POINTS },
  '1m': { interval: '30 days', bucketSeconds: RANGE_SPAN_SECONDS['1m'] / CHART_POINTS, points: CHART_POINTS },
  // 'all' has no fixed span — bucket width is computed from the data itself.
  all: { interval: null, bucketSeconds: null, points: CHART_POINTS }
};

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

    // Latest AI2 TDS nowcast, if any. Isolated try/catch: ai2_tds is a new
    // table whose migration hasn't run yet (per contract with Agent 20), and
    // this endpoint feeds the whole dashboard — a missing/empty table here
    // must degrade to `tds_predicted: null`, not break every other metric.
    let tdsPredictedRow = null;
    try {
      const predResult = await query(
        `SELECT tds_predict, processed_at FROM ai2_tds ORDER BY processed_at DESC LIMIT 1`
      );
      tdsPredictedRow = predResult.rows[0] || null;
    } catch (predError) {
      console.error('ai2_tds not available yet (expected before migration):', predError.message);
    }

    // Build response with all metrics and their anomaly status
    const metrics = {
      tds: {
        value: processedData.tds,
        unit: 'ppm',
        ...getMetricAnomalyStatus('tds', processedData.tds)
      },
      tds_predicted: {
        value: tdsPredictedRow?.tds_predict != null ? parseFloat(tdsPredictedRow.tds_predict) : null,
        unit: 'ppm',
        status: 'normal',
        details: null
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

    // AI2 TDS nowcast — its own table, not sensor_data
    if (AI2_TDS_METRIC_COL[metric]) {
      const col = AI2_TDS_METRIC_COL[metric];
      const predResult = await query(
        `SELECT ${col} AS value, processed_at AS timestamp FROM ai2_tds ORDER BY processed_at DESC LIMIT 1`
      );

      if (predResult.rows.length === 0) {
        return res.json({
          success: true,
          data: null,
          message: 'No prediction data available'
        });
      }

      const row = predResult.rows[0];
      return res.json({
        success: true,
        data: {
          metric,
          value: row.value !== null ? parseFloat(row.value) : null,
          timestamp: row.timestamp,
          device_id: 'ai2_tds'
        }
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
 * Query params: range (1h, 1d, 7d, 1m, all, custom), end_time (optional ISO string),
 *               start_time (ISO string; required for range=custom, window = start_time..end_time)
 */
const getChartData = async (req, res) => {
  try {
    const { metric } = req.params;
    const { range = '1d', end_time, start_time } = req.query;

    // Validate metric
    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: `Invalid metric. Valid metrics: ${VALID_METRICS.join(', ')}`
      });
    }

    // Handle calculated metrics (current, voltage)
    const isCalculatedMetric = ['current', 'voltage'].includes(metric);

    let config = RANGE_CONFIG[range];
    if (!config && range !== 'custom') {
      return res.status(400).json({
        success: false,
        message: 'Invalid range. Valid ranges: 1h, 1d, 7d, 1m, all, custom'
      });
    }

    // Anchor the bucket grid to an explicit instant instead of each query's
    // own NOW() -- lets a caller fetch two metrics (e.g. sensor tds +
    // ai2_tds tds_predicted, overlaid on one chart) against the IDENTICAL
    // window/bucket boundaries by passing the same end_time to both calls.
    // Without this, two back-to-back requests each anchor to their own
    // NOW(), and at narrow bucket widths (12s at range=1h) that few hundred
    // ms-to-seconds of drift between requests is enough to shift a value
    // into a different bucket on each series -- this is what caused the
    // TDS prediction overlay to disappear at 'now'/'1h' while working fine
    // at wider ranges (2026-09-04, see PROJECT_NOTES.md). Defaults to NOW()
    // when omitted -- fully backward compatible for every other caller.
    let anchor = new Date();
    if (end_time) {
      anchor = new Date(end_time);
      if (Number.isNaN(anchor.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid end_time -- must be a parseable date/ISO string'
        });
      }
    }

    // Custom window (the charts' "Select Range" picker and the 1y button).
    // Same epoch bucketing as the fixed ranges, just with the span taken from
    // start_time..anchor, so a sensor series and an overlay fetched with the
    // same start_time/end_time pair still land on identical bucket grids.
    if (range === 'custom') {
      const start = new Date(start_time);
      if (!start_time || Number.isNaN(start.getTime()) || start >= anchor) {
        return res.status(400).json({
          success: false,
          message: 'range=custom needs a parseable start_time earlier than end_time'
        });
      }
      const spanSeconds = (anchor.getTime() - start.getTime()) / 1000;
      config = {
        interval: null,
        start,
        bucketSeconds: Math.max(spanSeconds / CHART_POINTS, 1),
        points: CHART_POINTS
      };
    }

    let chartData;

    if (AI2_TDS_METRIC_COL[metric]) {
      // AI2 TDS nowcast — bucketed from its own table, not sensor_data
      chartData = await getAi2TdsChartData(AI2_TDS_METRIC_COL[metric], config, anchor);
    } else if (isCalculatedMetric) {
      // For calculated metrics, fetch raw data and calculate
      chartData = await getCalculatedMetricChartData(metric, config, anchor);
    } else {
      // For direct DB columns, use SQL aggregation
      const dbColumn = getDbColumnForMetric(metric);
      chartData = await getDirectMetricChartData(dbColumn, config, anchor);
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
 *
 * @param {Date} anchor - instant the fixed-interval window ends at (see
 *        getChartData). Ignored for the "all" branch, which anchors to the
 *        data's own span instead -- not part of the bug this was added for.
 */
const getDirectMetricChartData = async (column, config, anchor) => {
  const { interval, bucketSeconds, points, start } = config;
  // A custom window binds its start as $2; fixed ranges derive it from the
  // anchor. 'all' (no interval, no start) takes no parameters at all.
  const isAll = interval === null && !start;
  const startExpr = start ? '$2::timestamptz' : `$1::timestamptz - INTERVAL '${interval}'`;

  let sql;

  if (isAll) {
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
    // Fixed interval range: use epoch-based bucketing, anchored to the
    // caller-supplied instant (not each query's own NOW()) -- see the
    // comment on `anchor` in getChartData for why. The explicit upper bound
    // (`<= $1`) is new too: previously the window was open-ended on top, so
    // two sequential requests could each catch a slightly different set of
    // just-arrived rows even before considering bucket drift.
    sql = `
      WITH range_start AS (
        SELECT EXTRACT(EPOCH FROM ${startExpr}) AS start_epoch
      )
      SELECT
        TO_TIMESTAMP(FLOOR((EXTRACT(EPOCH FROM s.timestamp) - r.start_epoch) / ${bucketSeconds}) * ${bucketSeconds} + r.start_epoch) AS bucket,
        MIN(s.${column}) AS min_value,
        AVG(s.${column}) AS avg_value,
        MAX(s.${column}) AS max_value,
        COUNT(*) AS data_points
      FROM sensor_data s, range_start r
      WHERE s.timestamp >= ${startExpr}
        AND s.timestamp <= $1::timestamptz
        AND s.${column} IS NOT NULL
      GROUP BY 1, r.start_epoch
      ORDER BY bucket ASC
      LIMIT ${points}
    `;
  }

  const result = await query(sql, isAll ? [] : start ? [anchor, start] : [anchor]);

  return result.rows.map(row => ({
    timestamp: row.bucket,
    min: row.min_value !== null ? parseFloat(parseFloat(row.min_value).toFixed(2)) : null,
    avg: row.avg_value !== null ? parseFloat(parseFloat(row.avg_value).toFixed(2)) : null,
    max: row.max_value !== null ? parseFloat(parseFloat(row.max_value).toFixed(2)) : null,
    data_points: parseInt(row.data_points)
  }));
};

/**
 * Chart data for AI2 TDS nowcast metrics (ai2_tds table).
 * Mirrors getDirectMetricChartData's epoch bucketing exactly, just sourced
 * from ai2_tds/processed_at instead of sensor_data/timestamp, so the two
 * series line up on the same bucket grid when overlaid on one chart --
 * that alignment REQUIRES both queries to share the same `anchor` (see
 * getChartData / getDirectMetricChartData); each defaulting to its own
 * NOW() independently is what broke the overlay at narrow bucket widths.
 */
const getAi2TdsChartData = async (column, config, anchor) => {
  const { interval, bucketSeconds, points, start } = config;
  // A custom window binds its start as $2; fixed ranges derive it from the
  // anchor. 'all' (no interval, no start) takes no parameters at all.
  const isAll = interval === null && !start;
  const startExpr = start ? '$2::timestamptz' : `$1::timestamptz - INTERVAL '${interval}'`;

  let sql;

  if (isAll) {
    sql = `
      WITH data_span AS (
        SELECT
          EXTRACT(EPOCH FROM MIN(processed_at)) AS min_epoch,
          EXTRACT(EPOCH FROM MAX(processed_at)) AS max_epoch
        FROM ai2_tds
        WHERE ${column} IS NOT NULL
      ),
      bucket_size AS (
        SELECT GREATEST((max_epoch - min_epoch) / ${points}, 1) AS bs, min_epoch
        FROM data_span
      )
      SELECT
        TO_TIMESTAMP(FLOOR((EXTRACT(EPOCH FROM s.processed_at) - b.min_epoch) / b.bs) * b.bs + b.min_epoch) AS bucket,
        MIN(s.${column}) AS min_value,
        AVG(s.${column}) AS avg_value,
        MAX(s.${column}) AS max_value,
        COUNT(*) AS data_points
      FROM ai2_tds s, bucket_size b
      WHERE s.${column} IS NOT NULL
      GROUP BY 1, b.bs, b.min_epoch
      ORDER BY bucket ASC
      LIMIT ${points}
    `;
  } else {
    sql = `
      WITH range_start AS (
        SELECT EXTRACT(EPOCH FROM ${startExpr}) AS start_epoch
      )
      SELECT
        TO_TIMESTAMP(FLOOR((EXTRACT(EPOCH FROM s.processed_at) - r.start_epoch) / ${bucketSeconds}) * ${bucketSeconds} + r.start_epoch) AS bucket,
        MIN(s.${column}) AS min_value,
        AVG(s.${column}) AS avg_value,
        MAX(s.${column}) AS max_value,
        COUNT(*) AS data_points
      FROM ai2_tds s, range_start r
      WHERE s.processed_at >= ${startExpr}
        AND s.processed_at <= $1::timestamptz
        AND s.${column} IS NOT NULL
      GROUP BY 1, r.start_epoch
      ORDER BY bucket ASC
      LIMIT ${points}
    `;
  }

  const result = await query(sql, isAll ? [] : start ? [anchor, start] : [anchor]);

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
const getCalculatedMetricChartData = async (metric, config, anchor) => {
  const { interval, bucketSeconds, points, start } = config;

  // For calculated metrics, we need to fetch raw data and calculate per bucket
  let whereClause = '';
  const params = [];
  if (start) {
    params.push(start, anchor);
    whereClause = 'WHERE timestamp >= $1 AND timestamp <= $2';
  } else if (interval !== null) {
    whereClause = `WHERE timestamp >= NOW() - INTERVAL '${interval}'`;
  }

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

  const result = await query(sql, params);
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

    // AI2 metrics (dryness, ncg) — query ai2 table
    if (AI2_METRIC_COL[metric]) {
      const col = AI2_METRIC_COL[metric];
      let sql = `SELECT id, processed_at AS timestamp, ${col} AS value, status FROM ai2 WHERE ${col} IS NOT NULL`;
      const params = [];

      if (start_date) { params.push(start_date); sql += ` AND processed_at >= $${params.length}`; }
      if (end_date)   { params.push(end_date);   sql += ` AND processed_at <= $${params.length}`; }

      sql += ` ORDER BY processed_at DESC`;
      params.push(parseInt(limit), parseInt(offset));
      sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

      const result = await query(sql, params);

      let countSql = `SELECT COUNT(*) AS total FROM ai2 WHERE ${col} IS NOT NULL`;
      const countParams = [];
      if (start_date) { countParams.push(start_date); countSql += ` AND processed_at >= $${countParams.length}`; }
      if (end_date)   { countParams.push(end_date);   countSql += ` AND processed_at <= $${countParams.length}`; }
      const countResult = await query(countSql, countParams);
      const totalRecords = parseInt(countResult.rows[0].total);

      const data = result.rows.map(row => {
        const value = row.value !== null ? parseFloat(row.value) : null;
        const anomaly = getMetricAnomalyStatus(metric, value);
        return { id: row.id, timestamp: row.timestamp, device_id: 'ai2', value, status: anomaly.status, details: anomaly.details };
      });

      const values = data.map(d => d.value).filter(v => v !== null);
      const summary = values.length > 0 ? {
        min: parseFloat(Math.min(...values).toFixed(3)),
        max: parseFloat(Math.max(...values).toFixed(3)),
        avg: parseFloat((values.reduce((s, v) => s + v, 0) / values.length).toFixed(3)),
        count: values.length
      } : null;

      const limit_info = getLimitForMetric(metric);
      return res.json({
        success: true,
        data: {
          metric, summary,
          limit: limit_info ? { unit: limit_info.unit, min: limit_info.min, max: limit_info.max, warningLow: limit_info.warningLow, warningHigh: limit_info.warningHigh, abnormalLow: limit_info.abnormalLow, abnormalHigh: limit_info.abnormalHigh } : null,
          records: data,
          pagination: { total: totalRecords, limit: parseInt(limit), offset: parseInt(offset), current_page: Math.floor(parseInt(offset) / parseInt(limit)) + 1, total_pages: Math.ceil(totalRecords / parseInt(limit)) }
        }
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
 * Get aggregated statistics table data (daily min/max/avg/stddev, newest 60 rows)
 * Query params: start_date, end_date (optional, YYYY-MM-DD, inclusive)
 * Used by PTF page statistics tables
 */
const getAggregatedStatsData = async (req, res) => {
  try {
    const { metric } = req.params;
    // Optional inclusive day filter (YYYY-MM-DD), from the table's date picker.
    // Without it the endpoint keeps returning the newest 60 days as before.
    const { start_date, end_date } = req.query;
    const isDay = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
    if ((start_date && !isDay(start_date)) || (end_date && !isDay(end_date))) {
      return res.status(400).json({
        success: false,
        message: 'start_date/end_date must be YYYY-MM-DD'
      });
    }
    const hasDateFilter = Boolean(start_date || end_date);
    const rowLimit = hasDateFilter ? 1000 : 60;
    // Builds "AND DATE(col) >= $n" clauses against a shared params array.
    const dayFilter = (dateExpr, params) => {
      let clause = '';
      if (start_date) { params.push(start_date); clause += ` AND ${dateExpr} >= $${params.length}::date`; }
      if (end_date) { params.push(end_date); clause += ` AND ${dateExpr} <= $${params.length}::date`; }
      return clause;
    };

    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: `Invalid metric. Valid metrics: ${VALID_METRICS.join(', ')}`
      });
    }

    // AI2 metrics (dryness, ncg) — query ai2 table
    if (AI2_METRIC_COL[metric]) {
      const col = AI2_METRIC_COL[metric];
      const params = [];
      const sql = `
        SELECT
          DATE(processed_at)::text AS date,
          MIN(${col})    AS min_value,
          MAX(${col})    AS max_value,
          AVG(${col})    AS avg_value,
          STDDEV(${col}) AS std_dev
        FROM ai2
        WHERE ${col} IS NOT NULL${dayFilter('DATE(processed_at)', params)}
        GROUP BY DATE(processed_at)
        ORDER BY date DESC
        LIMIT ${rowLimit}
      `;
      const result = await query(sql, params);
      const limit_info = getLimitForMetric(metric);
      const unit = limit_info ? limit_info.unit : '';
      const data = result.rows.map((row, index) => ({
        no: index + 1,
        date: row.date,
        minValue:     row.min_value !== null ? `${parseFloat(parseFloat(row.min_value).toFixed(3))}${unit}` : '-',
        maxValue:     row.max_value !== null ? `${parseFloat(parseFloat(row.max_value).toFixed(3))}${unit}` : '-',
        average:      row.avg_value !== null ? `${parseFloat(parseFloat(row.avg_value).toFixed(3))}${unit}` : '-',
        stdDeviation: row.std_dev  !== null ? `${parseFloat(parseFloat(row.std_dev).toFixed(3))}`          : '-'
      }));
      return res.json({ success: true, data });
    }

    const isCalculatedMetric = ['current', 'voltage'].includes(metric);
    const dbColumn = isCalculatedMetric ? null : getDbColumnForMetric(metric);

    let rows;

    if (isCalculatedMetric) {
      // For calculated metrics, fetch raw then aggregate in JS
      const params = [];
      const sql = `
        SELECT timestamp, gen_output, gen_voltage_v_w, gen_voltage_w_u,
               gen_reactive_power, gen_power_factor
        FROM sensor_data
        WHERE TRUE${dayFilter('DATE(timestamp)', params)}
        ORDER BY timestamp DESC
      `;
      const result = await query(sql, params);

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
        .slice(0, rowLimit)
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
      const params = [];
      const sql = `
        SELECT
          DATE(timestamp)::text AS date,
          MIN(${dbColumn}) AS min_value,
          MAX(${dbColumn}) AS max_value,
          AVG(${dbColumn}) AS avg_value,
          STDDEV(${dbColumn}) AS std_dev
        FROM sensor_data
        WHERE ${dbColumn} IS NOT NULL${dayFilter('DATE(timestamp)', params)}
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
        LIMIT ${rowLimit}
      `;
      const result = await query(sql, params);
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
