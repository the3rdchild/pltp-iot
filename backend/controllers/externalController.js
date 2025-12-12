require('dotenv').config();
const { query } = require('../config/database');
const axios = require('axios');

// Load and parse the tag name mapping from environment variables
const HONEYWELL_TAGNAME_MAPPING = JSON.parse(process.env.HONEYWELL_TAGNAME_MAPPING || '{}');

// Fetch data from Honeywell PIMS Gateaway and store it
const fetchHoneywellData = async (req, res) => {
  try {
    const {
      SampleInterval = process.env.HONEYWELL_API_SAMPLE_INTERVAL || 1000,
      ResampleMethod = "Around",
      MinimumConfidence = 100,
      MaxRows = 10,
      TimeFormat = 1,
      ReductionData = "now",
      TagName,
      StartTime,
      EndTime,
      OutputTimeFormat = 1
    } = req.body;

    if (!TagName || !StartTime || !EndTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: TagName, StartTime, EndTime'
      });
    }

    const honeywellResponse = await axios.post(
      process.env.HONEYWELL_API_URL, {
        SampleInterval,
        ResampleMethod,
        MinimumConfidence,
        MaxRows,
        TimeFormat,
        ReductionData,
        TagName,
        StartTime,
        EndTime,
        OutputTimeFormat
      }, {
        headers: JSON.parse(process.env.HONEYWELL_API_HEADERS)
      }
    );

    const data = honeywellResponse.data.data;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No new data from Honeywell API',
        data: []
      });
    }

    const recordsToInsert = [];
    for (const item of data) {
      const columnName = HONEYWELL_TAGNAME_MAPPING[item.TagName];
      if (columnName) {
        for (let i = 0; i < item.TimeStamp.length; i++) {
          const record = {
            timestamp: item.TimeStamp[i],
            [columnName]: item.Value[i],
            raw_data: JSON.stringify(item)
          };
          recordsToInsert.push(record);
        }
      }
    }

    const insertedIds = [];
    for (const record of recordsToInsert) {
      const columns = Object.keys(record).join(', ');
      const values = Object.values(record);
      const valuePlaceholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const result = await query(
        `INSERT INTO sensor_data (${columns})
                VALUES (${valuePlaceholders})
                RETURNING id`,
        values
      );
      insertedIds.push(result.rows[0].id);
    }

    res.status(201).json({
      success: true,
      message: `Successfully fetched and stored data for ${TagName}`,
      data: {
        count: insertedIds.length,
        ids: insertedIds
      }
    });

  } catch (error) {
    console.error('❌ Error fetching Honeywell data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch or store Honeywell data',
      error: error.message
    });
  }
};


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
      gen_voltage_V_W,
      gen_voltage_W_U,
      gen_reactive_power,
      gen_output,
      gen_power_factor,
      gen_frequency,
      speed_detection,
      MCV_L,
      MCV_R,
      TDS,
      status = 'received'
    } = data;

    // Insert ke database
    const result = await query(
      `INSERT INTO sensor_data
       (device_id, timestamp, temperature, pressure, flow_rate,
        gen_voltage_v_w, gen_voltage_w_u, gen_reactive_power, gen_output,
        gen_power_factor, gen_frequency, speed_detection, mcv_l, mcv_r, tds,
        status, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        device_id,
        timestamp,
        temperature,
        pressure,
        flow_rate,
        gen_voltage_V_W,
        gen_voltage_W_U,
        gen_reactive_power,
        gen_output,
        gen_power_factor,
        gen_frequency,
        speed_detection,
        MCV_L,
        MCV_R,
        TDS,
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
        gen_voltage_V_W,
        gen_voltage_W_U,
        gen_reactive_power,
        gen_output,
        gen_power_factor,
        gen_frequency,
        speed_detection,
        MCV_L,
        MCV_R,
        TDS,
        status = 'received'
      } = record;

      const result = await query(
        `INSERT INTO sensor_data
         (device_id, timestamp, temperature, pressure, flow_rate,
          gen_voltage_v_w, gen_voltage_w_u, gen_reactive_power, gen_output,
          gen_power_factor, gen_frequency, speed_detection, mcv_l, mcv_r, tds,
          status, raw_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING id`,
        [
          device_id,
          timestamp,
          temperature,
          pressure,
          flow_rate,
          gen_voltage_V_W,
          gen_voltage_W_U,
          gen_reactive_power,
          gen_output,
          gen_power_factor,
          gen_frequency,
          speed_detection,
          MCV_L,
          MCV_R,
          TDS,
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

// Test endpoint - untuk testing koneksi dan insert data
const testConnection = async (req, res) => {
  try {
    // Test database connection
    const dbTest = await query('SELECT NOW() as current_time, version() as pg_version');

    // Get table info
    const tableInfo = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'sensor_data'
      ORDER BY ordinal_position
    `);

    // Test insert dummy data
    const dummyData = {
      device_id: 'TEST_DEVICE_001',
      timestamp: new Date().toISOString(),
      temperature: 25.5,
      pressure: 101.3,
      flow_rate: 150.0,
      gen_voltage_V_W: 220.5,
      gen_voltage_W_U: 221.0,
      gen_reactive_power: 15.2,
      gen_output: 500.0,
      gen_power_factor: 0.95,
      gen_frequency: 50.0,
      speed_detection: 1500.0,
      MCV_L: 75.5,
      MCV_R: 76.0,
      TDS: 450.0,
      status: 'test'
    };

    const insertResult = await query(
      `INSERT INTO sensor_data
       (device_id, timestamp, temperature, pressure, flow_rate,
        gen_voltage_v_w, gen_voltage_w_u, gen_reactive_power, gen_output,
        gen_power_factor, gen_frequency, speed_detection, mcv_l, mcv_r, tds,
        status, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        dummyData.device_id,
        dummyData.timestamp,
        dummyData.temperature,
        dummyData.pressure,
        dummyData.flow_rate,
        dummyData.gen_voltage_V_W,
        dummyData.gen_voltage_W_U,
        dummyData.gen_reactive_power,
        dummyData.gen_output,
        dummyData.gen_power_factor,
        dummyData.gen_frequency,
        dummyData.speed_detection,
        dummyData.MCV_L,
        dummyData.MCV_R,
        dummyData.TDS,
        dummyData.status,
        JSON.stringify(dummyData)
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Test connection successful',
      data: {
        database: {
          connected: true,
          current_time: dbTest.rows[0].current_time,
          version: dbTest.rows[0].pg_version
        },
        table_structure: {
          table_name: 'sensor_data',
          columns: tableInfo.rows
        },
        test_insert: {
          success: true,
          inserted_id: insertResult.rows[0].id,
          data: insertResult.rows[0]
        }
      }
    });

  } catch (error) {
    console.error('❌ Test connection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test connection failed',
      error: error.message,
      details: error.stack
    });
  }
};

// Generate dummy sensor data untuk testing
const generateDummyData = async (req, res) => {
  try {
    const { count = 10 } = req.body;

    if (count > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 records per request'
      });
    }

    const insertedRecords = [];

    for (let i = 0; i < count; i++) {
      const dummyData = {
        device_id: `TEST_DEVICE_${String(i + 1).padStart(3, '0')}`,
        timestamp: new Date(Date.now() - (i * 60000)).toISOString(), // setiap menit
        temperature: (20 + Math.random() * 10).toFixed(2),
        pressure: (95 + Math.random() * 10).toFixed(2),
        flow_rate: (100 + Math.random() * 100).toFixed(2),
        gen_voltage_V_W: (215 + Math.random() * 10).toFixed(2),
        gen_voltage_W_U: (216 + Math.random() * 10).toFixed(2),
        gen_reactive_power: (10 + Math.random() * 20).toFixed(2),
        gen_output: (400 + Math.random() * 200).toFixed(2),
        gen_power_factor: (0.85 + Math.random() * 0.15).toFixed(4),
        gen_frequency: (49.5 + Math.random() * 1).toFixed(2),
        speed_detection: (1400 + Math.random() * 200).toFixed(2),
        MCV_L: (70 + Math.random() * 20).toFixed(2),
        MCV_R: (70 + Math.random() * 20).toFixed(2),
        TDS: (400 + Math.random() * 100).toFixed(2),
        status: 'test_dummy'
      };

      const result = await query(
        `INSERT INTO sensor_data
         (device_id, timestamp, temperature, pressure, flow_rate,
          gen_voltage_v_w, gen_voltage_w_u, gen_reactive_power, gen_output,
          gen_power_factor, gen_frequency, speed_detection, mcv_l, mcv_r, tds,
          status, raw_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING id, device_id, timestamp`,
        [
          dummyData.device_id,
          dummyData.timestamp,
          parseFloat(dummyData.temperature),
          parseFloat(dummyData.pressure),
          parseFloat(dummyData.flow_rate),
          parseFloat(dummyData.gen_voltage_V_W),
          parseFloat(dummyData.gen_voltage_W_U),
          parseFloat(dummyData.gen_reactive_power),
          parseFloat(dummyData.gen_output),
          parseFloat(dummyData.gen_power_factor),
          parseFloat(dummyData.gen_frequency),
          parseFloat(dummyData.speed_detection),
          parseFloat(dummyData.MCV_L),
          parseFloat(dummyData.MCV_R),
          parseFloat(dummyData.TDS),
          dummyData.status,
          JSON.stringify(dummyData)
        ]
      );

      insertedRecords.push(result.rows[0]);
    }

    console.log(`✅ Generated ${count} dummy records`);

    res.status(201).json({
      success: true,
      message: `Generated ${count} dummy sensor data records`,
      data: {
        count: insertedRecords.length,
        records: insertedRecords
      }
    });

  } catch (error) {
    console.error('❌ Error generating dummy data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dummy data',
      error: error.message
    });
  }
};

// Validate API setup
const validateSetup = async (req, res) => {
  try {
    const checks = {
      database_connection: false,
      sensor_table_exists: false,
      required_columns_exist: false,
      can_insert: false,
      can_query: false
    };

    const errors = [];

    // Check 1: Database connection
    try {
      await query('SELECT 1');
      checks.database_connection = true;
    } catch (error) {
      errors.push('Database connection failed: ' + error.message);
    }

    // Check 2: Table exists
    try {
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'sensor_data'
        ) as exists
      `);
      checks.sensor_table_exists = tableCheck.rows[0].exists;
      if (!checks.sensor_table_exists) {
        errors.push('Table sensor_data does not exist');
      }
    } catch (error) {
      errors.push('Table check failed: ' + error.message);
    }

    // Check 3: Required columns
    try {
      const requiredColumns = [
        'device_id', 'timestamp', 'temperature', 'pressure', 'flow_rate',
        'gen_voltage_v_w', 'gen_voltage_w_u', 'gen_reactive_power',
        'gen_output', 'gen_power_factor', 'gen_frequency',
        'speed_detection', 'mcv_l', 'mcv_r', 'tds', 'status', 'raw_data'
      ];

      const columnCheck = await query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'sensor_data'
      `);

      const existingColumns = columnCheck.rows.map(row => row.column_name);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

      if (missingColumns.length === 0) {
        checks.required_columns_exist = true;
      } else {
        errors.push('Missing columns: ' + missingColumns.join(', '));
      }
    } catch (error) {
      errors.push('Column check failed: ' + error.message);
    }

    // Check 4: Can query
    try {
      await query('SELECT * FROM sensor_data LIMIT 1');
      checks.can_query = true;
    } catch (error) {
      errors.push('Query test failed: ' + error.message);
    }

    // Check 5: Can insert (will rollback)
    try {
      await query('BEGIN');
      await query(
        `INSERT INTO sensor_data
         (device_id, timestamp, status)
         VALUES ($1, $2, $3)`,
        ['VALIDATION_TEST', new Date().toISOString(), 'validation']
      );
      await query('ROLLBACK');
      checks.can_insert = true;
    } catch (error) {
      await query('ROLLBACK');
      errors.push('Insert test failed: ' + error.message);
    }

    const allChecksPassed = Object.values(checks).every(check => check === true);

    res.status(allChecksPassed ? 200 : 500).json({
      success: allChecksPassed,
      message: allChecksPassed ? 'All validation checks passed' : 'Some validation checks failed',
      checks,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Validation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Validation process failed',
      error: error.message
    });
  }
};

// Receive data from Ulubelu
const receiveUlubeluData = async (req, res) => {
  try {
    const data = req.body;

    // Log incoming data
    console.log('📥 Received Ulubelu data:', JSON.stringify(data, null, 2));

    // Validation
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    // Extract data with defaults - mark as from Ulubelu
    const {
      device_id = 'ULUBELU_UNKNOWN',
      timestamp = new Date().toISOString(),
      temperature,
      pressure,
      flow_rate,
      gen_voltage_V_W,
      gen_voltage_W_U,
      gen_reactive_power,
      gen_output,
      gen_power_factor,
      gen_frequency,
      speed_detection,
      MCV_L,
      MCV_R,
      TDS,
      status = 'ulubelu_received'
    } = data;

    // Insert ke database
    const result = await query(
      `INSERT INTO sensor_data
       (device_id, timestamp, temperature, pressure, flow_rate,
        gen_voltage_v_w, gen_voltage_w_u, gen_reactive_power, gen_output,
        gen_power_factor, gen_frequency, speed_detection, mcv_l, mcv_r, tds,
        status, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        device_id,
        timestamp,
        temperature,
        pressure,
        flow_rate,
        gen_voltage_V_W,
        gen_voltage_W_U,
        gen_reactive_power,
        gen_output,
        gen_power_factor,
        gen_frequency,
        speed_detection,
        MCV_L,
        MCV_R,
        TDS,
        status,
        JSON.stringify(data)
      ]
    );

    console.log('✅ Ulubelu data saved to database:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Ulubelu data received successfully',
      source: 'ulubelu',
      data: {
        id: result.rows[0].id,
        device_id: result.rows[0].device_id,
        timestamp: result.rows[0].timestamp
      }
    });

  } catch (error) {
    console.error('❌ Error receiving Ulubelu data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save Ulubelu data',
      error: error.message
    });
  }
};

// Batch insert for Ulubelu sensor readings
const receiveBatchUlubeluData = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data must be a non-empty array'
      });
    }

    console.log(`📥 Received Ulubelu batch data: ${data.length} records`);

    const insertedIds = [];
    const errors = [];

    // Insert each record
    for (let i = 0; i < data.length; i++) {
      const record = data[i];

      try {
        const {
          device_id = 'ULUBELU_UNKNOWN',
          timestamp = new Date().toISOString(),
          temperature,
          pressure,
          flow_rate,
          gen_voltage_V_W,
          gen_voltage_W_U,
          gen_reactive_power,
          gen_output,
          gen_power_factor,
          gen_frequency,
          speed_detection,
          MCV_L,
          MCV_R,
          TDS,
          status = 'ulubelu_batch'
        } = record;

        const result = await query(
          `INSERT INTO sensor_data
           (device_id, timestamp, temperature, pressure, flow_rate,
            gen_voltage_v_w, gen_voltage_w_u, gen_reactive_power, gen_output,
            gen_power_factor, gen_frequency, speed_detection, mcv_l, mcv_r, tds,
            status, raw_data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           RETURNING id`,
          [
            device_id,
            timestamp,
            temperature,
            pressure,
            flow_rate,
            gen_voltage_V_W,
            gen_voltage_W_U,
            gen_reactive_power,
            gen_output,
            gen_power_factor,
            gen_frequency,
            speed_detection,
            MCV_L,
            MCV_R,
            TDS,
            status,
            JSON.stringify(record)
          ]
        );

        insertedIds.push(result.rows[0].id);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
          record: record
        });
        console.error(`❌ Error inserting Ulubelu record ${i}:`, error.message);
      }
    }

    console.log(`✅ Ulubelu batch data saved: ${insertedIds.length} records, ${errors.length} errors`);

    res.status(201).json({
      success: true,
      message: 'Ulubelu batch data processed',
      source: 'ulubelu',
      data: {
        total_received: data.length,
        successfully_inserted: insertedIds.length,
        failed: errors.length,
        ids: insertedIds,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('❌ Error receiving Ulubelu batch data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Ulubelu batch data',
      error: error.message
    });
  }
};

module.exports = {
  fetchHoneywellData,
  receiveExternalData,
  receiveMLPrediction,
  receiveBatchData,
  receiveUlubeluData,
  receiveBatchUlubeluData,
  testConnection,
  generateDummyData,
  validateSetup
};