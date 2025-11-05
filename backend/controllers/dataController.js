const { query } = require('../config/database');

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

module.exports = {
  getLatestSensorData,
  getSensorDataByDateRange,
  getLatestMLPredictions,
  getFieldData,
  createFieldData,
  getDashboardStats
};
