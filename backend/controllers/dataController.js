const { query } = require('../config/database');
const { fetchLiveDataForDashboard } = require('../services/honeywellService');

const getLiveData = async (req, res) => {
  try {
    // Check data source from query parameter (default: database)
    const dataSource = req.query.source || 'database';

    // Fetch from Honeywell API directly
    if (dataSource === 'api' || dataSource === 'honeywell') {
      const honeywellData = await fetchLiveDataForDashboard();

      if (!honeywellData.success) {
        throw new Error('Failed to fetch data from Honeywell API');
      }

      // Transform to match expected format
      const formattedMetrics = {};

      // Map Honeywell metrics to dashboard format
      if (honeywellData.metrics.pressure) {
        formattedMetrics.pressure = {
          value: honeywellData.metrics.pressure.value,
          timestamp: honeywellData.metrics.pressure.timestamp
        };
      }

      if (honeywellData.metrics.temperature) {
        formattedMetrics.temperature = {
          value: honeywellData.metrics.temperature.value,
          timestamp: honeywellData.metrics.temperature.timestamp
        };
      }

      if (honeywellData.metrics.flow_rate) {
        formattedMetrics.flow_rate = {
          value: honeywellData.metrics.flow_rate.value,
          timestamp: honeywellData.metrics.flow_rate.timestamp
        };
      }

      if (honeywellData.metrics.gen_output) {
        formattedMetrics.active_power = {
          value: honeywellData.metrics.gen_output.value,
          timestamp: honeywellData.metrics.gen_output.timestamp
        };
      }

      if (honeywellData.metrics.voltage) {
        formattedMetrics.voltage = {
          value: honeywellData.metrics.voltage.value,
          timestamp: honeywellData.metrics.voltage.timestamp,
          calculated: true
        };
      }

      if (honeywellData.metrics.current) {
        formattedMetrics.current = {
          value: honeywellData.metrics.current.value,
          timestamp: honeywellData.metrics.current.timestamp,
          calculated: true
        };
      }

      if (honeywellData.metrics.gen_reactive_power) {
        formattedMetrics.reactive_power = {
          value: honeywellData.metrics.gen_reactive_power.value,
          timestamp: honeywellData.metrics.gen_reactive_power.timestamp
        };
      }

      if (honeywellData.metrics.speed_detection) {
        formattedMetrics.speed = {
          value: honeywellData.metrics.speed_detection.value,
          timestamp: honeywellData.metrics.speed_detection.timestamp
        };
      }

      return res.json({
        success: true,
        data: {
          metrics: formattedMetrics,
          timestamp: honeywellData.timestamp,
          source: 'honeywell_api'
        }
      });
    }

    // Fetch from database (default behavior)
    const metricToColumnMap = {
      'main_steam_pressure': 'pressure',
      'main_steam_flow': 'flow_rate',
      'main_steam_temp': 'temperature',
      'gen_reactive_power_net': 'gen_reactive_power',
      'gen_output_mw': 'gen_output',
      'gen_freq': 'gen_frequency',
      'turbine_speed': 'speed_detection',
      'mcv_l_position': 'mcv_l',
      'mcv_r_position': 'mcv_r',
      'voltage_u_v': 'gen_voltage_u_v',
      'voltage_v_w': 'gen_voltage_v_w',
      'voltage_w_u': 'gen_voltage_w_u',
      'tds': 'tds',
      'pressure': 'pressure',
      'temperature': 'temperature',
      'flow_rate': 'flow_rate',
      'current': 'current'
    };

    const metrics = Object.keys(metricToColumnMap);
    const results = {};

    for (const metric of metrics) {
      const columnName = metricToColumnMap[metric];

      const result = await query(
        `SELECT
           ${columnName} as value,
           timestamp,
           device_id
         FROM sensor_data
         WHERE ${columnName} IS NOT NULL
         ORDER BY timestamp DESC
         LIMIT 1`
      );

      if (result.rows.length > 0) {
        results[metric] = {
          value: result.rows[0].value,
          timestamp: result.rows[0].timestamp,
          device_id: result.rows[0].device_id
        };
      } else {
        results[metric] = { value: null, timestamp: null, device_id: null };
      }
    }

    res.json({
      success: true,
      data: {
        metrics: results,
        timestamp: new Date().toISOString(),
        source: 'database'
      }
    });

  } catch (error) {
    console.error('Error fetching live data:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get latest sensor data
const getLatestSensorData = async (req, res) => {
  try {
    const { limit = 50, device_id } = req.query;

    let sql = `
      SELECT * FROM sensor_data 
      WHERE 1=1
    `;
    const params = [];

    if (device_id) {
      params.push(device_id);
      sql += ` AND device_id = $${params.length}`;
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor data'
    });
  }
};

// Get sensor data by date range
const getSensorDataByDateRange = async (req, res) => {
  try {
    const { start_date, end_date, device_id } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'start_date and end_date are required'
      });
    }

    let sql = `
      SELECT * FROM sensor_data 
      WHERE timestamp BETWEEN $1 AND $2
    `;
    const params = [start_date, end_date];

    if (device_id) {
      params.push(device_id);
      sql += ` AND device_id = $${params.length}`;
    }

    sql += ` ORDER BY timestamp DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching sensor data by date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sensor data'
    });
  }
};

// Get latest ML predictions
const getLatestMLPredictions = async (req, res) => {
  try {
    const { limit = 50, anomaly_only = false } = req.query;

    let sql = `
      SELECT p.*, s.device_id, s.timestamp as sensor_timestamp
      FROM ml_predictions p
      LEFT JOIN sensor_data s ON p.sensor_data_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (anomaly_only === 'true') {
      sql += ` AND p.anomaly_detected = true`;
    }

    sql += ` ORDER BY p.processed_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching ML predictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ML predictions'
    });
  }
};

// Get field data (manual input)
const getFieldData = async (req, res) => {
  try {
    const { limit = 50, location } = req.query;

    let sql = `
      SELECT f.*, u.name as creator_name 
      FROM field_data f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (location) {
      params.push(`%${location}%`);
      sql += ` AND f.location ILIKE $${params.length}`;
    }

    sql += ` ORDER BY f.recorded_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching field data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch field data'
    });
  }
};

// Create field data (dari frontend)
const createFieldData = async (req, res) => {
  try {
    const {
      location,
      operator_name,
      field_type,
      measurement_value,
      unit,
      notes,
      latitude,
      longitude,
      photo_url,
      recorded_at = new Date().toISOString()
    } = req.body;

    // Validation
    if (!location || !field_type) {
      return res.status(400).json({
        success: false,
        message: 'location and field_type are required'
      });
    }

    const userId = req.user ? req.user.userId : null;

    const result = await query(
      `INSERT INTO field_data 
       (location, operator_name, field_type, measurement_value, unit, notes, 
        latitude, longitude, photo_url, recorded_at, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        location,
        operator_name,
        field_type,
        measurement_value,
        unit,
        notes,
        latitude,
        longitude,
        photo_url,
        recorded_at,
        userId
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Field data created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating field data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create field data',
      error: error.message
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Total sensor data today
    const sensorToday = await query(
      `SELECT COUNT(*) as count FROM sensor_data 
       WHERE DATE(timestamp) = CURRENT_DATE`
    );

    // Total anomalies detected
    const anomalies = await query(
      `SELECT COUNT(*) as count FROM ml_predictions 
       WHERE anomaly_detected = true`
    );

    // Latest data timestamp
    const latestData = await query(
      `SELECT MAX(timestamp) as latest FROM sensor_data`
    );

    // Total field data records
    const fieldDataCount = await query(
      `SELECT COUNT(*) as count FROM field_data`
    );

    // Active devices
    const activeDevices = await query(
      `SELECT COUNT(DISTINCT device_id) as count FROM sensor_data 
       WHERE timestamp >= NOW() - INTERVAL '24 hours'`
    );

    res.json({
      success: true,
      data: {
        sensor_data_today: parseInt(sensorToday.rows[0].count),
        total_anomalies: parseInt(anomalies.rows[0].count),
        latest_data_timestamp: latestData.rows[0].latest,
        total_field_records: parseInt(fieldDataCount.rows[0].count),
        active_devices_24h: parseInt(activeDevices.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// Export sensor data with advanced filters
const exportSensorData = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      device_id,
      status,
      format = 'json',
      limit = 1000,
      offset = 0
    } = req.query;

    // Build dynamic query
    let sql = 'SELECT * FROM sensor_data WHERE 1=1';
    const params = [];

    // Filter by date range
    if (start_date && end_date) {
      params.push(start_date, end_date);
      sql += ` AND timestamp BETWEEN $${params.length - 1} AND $${params.length}`;
    } else if (start_date) {
      params.push(start_date);
      sql += ` AND timestamp >= $${params.length}`;
    } else if (end_date) {
      params.push(end_date);
      sql += ` AND timestamp <= $${params.length}`;
    }

    // Filter by device_id
    if (device_id) {
      params.push(device_id);
      sql += ` AND device_id = $${params.length}`;
    }

    // Filter by status
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    // Order and pagination
    sql += ` ORDER BY timestamp DESC`;
    params.push(parseInt(limit), parseInt(offset));
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM sensor_data WHERE 1=1';
    const countParams = [];

    if (start_date && end_date) {
      countParams.push(start_date, end_date);
      countSql += ` AND timestamp BETWEEN $${countParams.length - 1} AND $${countParams.length}`;
    } else if (start_date) {
      countParams.push(start_date);
      countSql += ` AND timestamp >= $${countParams.length}`;
    } else if (end_date) {
      countParams.push(end_date);
      countSql += ` AND timestamp <= $${countParams.length}`;
    }

    if (device_id) {
      countParams.push(device_id);
      countSql += ` AND device_id = $${countParams.length}`;
    }

    if (status) {
      countParams.push(status);
      countSql += ` AND status = $${countParams.length}`;
    }

    const countResult = await query(countSql, countParams);
    const totalRecords = parseInt(countResult.rows[0].total);

    // Format response based on requested format
    if (format === 'csv') {
      // Generate CSV
      const fields = [
        'id', 'device_id', 'timestamp', 'temperature', 'pressure', 'flow_rate',
        'gen_voltage_v_w', 'gen_voltage_w_u', 'gen_reactive_power', 'gen_output',
        'gen_power_factor', 'gen_frequency', 'speed_detection', 'mcv_l', 'mcv_r',
        'tds', 'status', 'created_at'
      ];

      let csv = fields.join(',') + '\n';

      result.rows.forEach(row => {
        const values = fields.map(field => {
          const value = row[field];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        });
        csv += values.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sensor_data_export_${new Date().toISOString()}.csv`);
      return res.send(csv);

    } else if (format === 'json') {
      // Return JSON
      res.json({
        success: true,
        data: result.rows,
        pagination: {
          total: totalRecords,
          limit: parseInt(limit),
          offset: parseInt(offset),
          current_page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
          total_pages: Math.ceil(totalRecords / parseInt(limit))
        },
        filters: {
          start_date,
          end_date,
          device_id,
          status
        }
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Supported formats: json, csv'
      });
    }

  } catch (error) {
    console.error('Error exporting sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export sensor data',
      error: error.message
    });
  }
};

module.exports = {
  getLiveData,
  getLatestSensorData,
  getSensorDataByDateRange,
  getLatestMLPredictions,
  getFieldData,
  createFieldData,
  getDashboardStats,
  exportSensorData
};
