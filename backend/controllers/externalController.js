const { query } = require('../config/database');

// Receive data from external source (Honeywell)
const receiveExternalData = async (req, res) => {
  try {
    const data = req.body;

    // Log incoming data
    console.log('📥 Received external data:', JSON.stringify(data, null, 2));

    // Validation
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    // Extract data with defaults
    const {
      device_id = 'unknown',
      timestamp = new Date().toISOString(),
      temperature,
      pressure,
      flow_rate,
      humidity,
      voltage,
      current,
      status = 'received'
    } = data;

    // Insert ke database
    const result = await query(
      `INSERT INTO sensor_data 
       (device_id, timestamp, temperature, pressure, flow_rate, humidity, voltage, current, status, raw_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        device_id,
        timestamp,
        temperature,
        pressure,
        flow_rate,
        humidity,
        voltage,
        current,
        status,
        JSON.stringify(data)
      ]
    );

    console.log('✅ Data saved to database:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Data received successfully',
      data: {
        id: result.rows[0].id,
        device_id: result.rows[0].device_id,
        timestamp: result.rows[0].timestamp
      }
    });

  } catch (error) {
    console.error('❌ Error receiving external data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save data',
      error: error.message
    });
  }
};

// Receive ML predictions from edge computing
const receiveMLPrediction = async (req, res) => {
  try {
    const data = req.body;

    console.log('📥 Received ML prediction:', JSON.stringify(data, null, 2));

    // Validation
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    const {
      sensor_data_id,
      model_name = 'edge_ml_model',
      prediction_type,
      predicted_value,
      confidence_score,
      anomaly_detected = false,
      anomaly_severity = 'normal',
      features = {},
      processed_at = new Date().toISOString()
    } = data;

    // Insert ML prediction
    const result = await query(
      `INSERT INTO ml_predictions 
       (sensor_data_id, model_name, prediction_type, predicted_value, confidence_score, 
        anomaly_detected, anomaly_severity, features, result_data, processed_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        sensor_data_id,
        model_name,
        prediction_type,
        predicted_value,
        confidence_score,
        anomaly_detected,
        anomaly_severity,
        JSON.stringify(features),
        JSON.stringify(data),
        processed_at
      ]
    );

    console.log('✅ ML prediction saved:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'ML prediction received successfully',
      data: {
        id: result.rows[0].id,
        prediction_type: result.rows[0].prediction_type,
        anomaly_detected: result.rows[0].anomaly_detected
      }
    });

  } catch (error) {
    console.error('❌ Error receiving ML prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save ML prediction',
      error: error.message
    });
  }
};

// Batch insert for multiple sensor readings
const receiveBatchData = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data must be a non-empty array'
      });
    }

    console.log(`📥 Received batch data: ${data.length} records`);

    const insertedIds = [];

    // Insert each record
    for (const record of data) {
      const {
        device_id = 'unknown',
        timestamp = new Date().toISOString(),
        temperature,
        pressure,
        flow_rate,
        humidity,
        voltage,
        current,
        status = 'received'
      } = record;

      const result = await query(
        `INSERT INTO sensor_data 
         (device_id, timestamp, temperature, pressure, flow_rate, humidity, voltage, current, status, raw_data) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id`,
        [
          device_id,
          timestamp,
          temperature,
          pressure,
          flow_rate,
          humidity,
          voltage,
          current,
          status,
          JSON.stringify(record)
        ]
      );

      insertedIds.push(result.rows[0].id);
    }

    console.log(`✅ Batch data saved: ${insertedIds.length} records`);

    res.status(201).json({
      success: true,
      message: 'Batch data received successfully',
      data: {
        count: insertedIds.length,
        ids: insertedIds
      }
    });

  } catch (error) {
    console.error('❌ Error receiving batch data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save batch data',
      error: error.message
    });
  }
};

module.exports = {
  receiveExternalData,
  receiveMLPrediction,
  receiveBatchData
};
