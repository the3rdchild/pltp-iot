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

// Receive AI2 predictions (dryness & NCG)
const receiveAi2Data = async (req, res) => {
  try {
    const data = req.body;

    console.log('📥 Received AI2 prediction:', JSON.stringify(data, null, 2));

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    const {
      model_name = 'ai2_model',
      dryness_predict,
      dryness_confidence,
      dryness_mae,
      ncg_predict,
      ncg_confidence,
      ncg_mae,
      status = 'normal',
      processed_at = new Date().toISOString()
    } = data;

    const result = await query(
      `INSERT INTO ai2
       (model_name, dryness_predict, dryness_confidence, dryness_mae,
        ncg_predict, ncg_confidence, ncg_mae, status, processed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        model_name,
        dryness_predict,
        dryness_confidence,
        dryness_mae,
        ncg_predict,
        ncg_confidence,
        ncg_mae,
        status,
        processed_at
      ]
    );

    console.log('✅ AI2 prediction saved:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'AI2 prediction received successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error receiving AI2 prediction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save AI2 prediction',
      error: error.message
    });
  }
};

// ---------------------------------------------------------------------------
// Server-side downsampling for the chart endpoints
// ---------------------------------------------------------------------------
// ai1a and ai2 both write about one row per minute, so a "1 month" window is
// ~43k rows and "all" is unbounded -- every one of them shipped to the browser
// and then thrown away to draw a chart a few hundred pixels wide. Callers that
// want a chart now pass ?points=N alongside start_date/end_date and get N
// time-buckets back instead of raw rows.
//
// Opt-in on purpose: without ?points= the response shape is byte-for-byte what
// it was, so the live gauges (?limit=1), the AI workers and the Postman
// collection are unaffected.
//
// Each bucket carries min/avg/max rather than just avg: these pages exist to
// spot anomalies, and a one-minute spike inside a 12-hour bucket disappears
// entirely if you only keep the mean.
const MAX_BUCKET_POINTS = 2000;

const resolveBucketing = (points, startDate, endDate) => {
  if (points === undefined || points === null || points === '') return null;

  const requested = parseInt(points, 10);
  if (!Number.isFinite(requested) || requested < 1) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const spanSeconds = (end.getTime() - start.getTime()) / 1000;
  if (spanSeconds <= 0) return null;

  const capped = Math.min(requested, MAX_BUCKET_POINTS);

  return {
    points: capped,
    startEpoch: Math.floor(start.getTime() / 1000),
    // Floor of 1s: a window narrower than the requested point count would
    // otherwise generate sub-second buckets, i.e. more rows out than in.
    bucketSeconds: Math.max(Math.ceil(spanSeconds / capped), 1)
  };
};

// Bucket boundaries are anchored to start_date, not to the epoch, so a
// relative window ("last 24h") keeps its newest bucket flush with `end`
// instead of ending on a partial bucket that dips as it fills.
//
// startEpoch/bucketSeconds are interpolated rather than bound: both are
// integers produced by Math.floor/Math.ceil over validated finite numbers, and
// inlining them keeps the expression readable -- same approach as
// getDirectMetricChartData in liveDataController.
const bucketExpr = (column, { startEpoch, bucketSeconds }) =>
  `TO_TIMESTAMP(FLOOR((EXTRACT(EPOCH FROM ${column}) - ${startEpoch}) / ${bucketSeconds}) * ${bucketSeconds} + ${startEpoch})`;

// Get latest AI2 predictions
const getAi2Data = async (req, res) => {
  try {
    const { limit = 50, status, start_date, end_date, points } = req.query;

    // Bucketed (chart) path -- see resolveBucketing above.
    const bucketing = (start_date && end_date)
      ? resolveBucketing(points, start_date, end_date)
      : null;

    if (bucketing) {
      const bucket = bucketExpr('processed_at', bucketing);
      const bucketParams = [start_date, end_date];
      let statusFilter = '';

      if (status) {
        bucketParams.push(status);
        statusFilter = ` AND status = $${bucketParams.length}`;
      }

      // Column names match the raw shape (dryness_predict, ncg_predict) so the
      // chart can read either response without branching; the _min/_max pairs
      // are additive.
      const bucketSql = `
        SELECT
          ${bucket}                                AS processed_at,
          AVG(dryness_predict)                     AS dryness_predict,
          MIN(dryness_predict)                     AS dryness_predict_min,
          MAX(dryness_predict)                     AS dryness_predict_max,
          AVG(ncg_predict)                         AS ncg_predict,
          MIN(ncg_predict)                         AS ncg_predict_min,
          MAX(ncg_predict)                         AS ncg_predict_max,
          AVG(dryness_confidence)                  AS dryness_confidence,
          AVG(ncg_confidence)                      AS ncg_confidence,
          MODE() WITHIN GROUP (ORDER BY status)    AS status,
          BOOL_OR(status IS DISTINCT FROM 'normal') AS has_anomaly,
          MAX(model_name)                          AS model_name,
          MAX(processed_at)                        AS bucket_last_at,
          MAX(created_at)                          AS created_at,
          COUNT(*)::int                            AS data_points
        FROM ai2
        WHERE processed_at >= $1 AND processed_at <= $2${statusFilter}
        GROUP BY 1
        ORDER BY 1 DESC
      `;

      const bucketResult = await query(bucketSql, bucketParams);

      return res.json({
        success: true,
        data: bucketResult.rows,
        count: bucketResult.rows.length,
        sampled: true,
        bucket_seconds: bucketing.bucketSeconds
      });
    }

    let sql = `SELECT * FROM ai2 WHERE 1=1`;
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (start_date && end_date) {
      params.push(start_date);
      sql += ` AND processed_at >= $${params.length}`;
      params.push(end_date);
      sql += ` AND processed_at <= $${params.length}`;
      sql += ` ORDER BY processed_at DESC`;
    } else {
      params.push(parseInt(limit));
      sql += ` ORDER BY processed_at DESC LIMIT $${params.length}`;
    }

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching AI2 data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI2 data',
      error: error.message
    });
  }
};

// Get aggregated daily stats for an ai2 metric (ncg_predict | dryness_predict)
const getAi2AggregatedStats = async (req, res) => {
  const VALID_AI2_METRICS = ['ncg_predict', 'dryness_predict', 'ncg_confidence', 'dryness_confidence'];
  const { metric = 'ncg_predict' } = req.query;

  if (!VALID_AI2_METRICS.includes(metric)) {
    return res.status(400).json({
      success: false,
      message: `Invalid metric. Valid: ${VALID_AI2_METRICS.join(', ')}`
    });
  }

  try {
    const sql = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY DATE(processed_at) DESC) AS no,
        DATE(processed_at)::text                              AS date,
        MIN(${metric})                                        AS min_value,
        MAX(${metric})                                        AS max_value,
        AVG(${metric})                                        AS avg_value,
        COALESCE(STDDEV(${metric}), 0)                        AS std_dev
      FROM ai2
      WHERE ${metric} IS NOT NULL AND processed_at IS NOT NULL
      GROUP BY DATE(processed_at)
      ORDER BY DATE(processed_at) DESC
      LIMIT 60
    `;

    const result = await query(sql);

    const data = result.rows.map(row => ({
      no:           parseInt(row.no),
      date:         row.date,
      minValue:     parseFloat(parseFloat(row.min_value).toFixed(4)),
      maxValue:     parseFloat(parseFloat(row.max_value).toFixed(4)),
      average:      parseFloat(parseFloat(row.avg_value).toFixed(4)),
      stdDeviation: parseFloat(parseFloat(row.std_dev).toFixed(4))
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching ai2 aggregated stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ai2 aggregated stats',
      error: error.message
    });
  }
};

// Get latest AI1a anomaly detection results
//
// FOLLOW-UP (not yet implemented): risk_percentage has no context for
// consumers without the model's own percentile thresholds -- p90/p99 already
// exist in AI_Pertasmart_V3/models/ai1a/metadata.json under
// `full_history_risk_baseline` (currently p90=34.19, p99=55.27; these shift
// on retrain, D16/D17/D20 -- never hardcode them here or on the frontend).
// Read that file server-side and include the two values in this response
// (e.g. `risk_thresholds: { p90, p99 }`) so the frontend can show risk% in
// context instead of an unqualified number.
const getAi1aData = async (req, res) => {
  try {
    const { limit = 50, start_date, end_date, points } = req.query;

    // Bucketed (chart) path -- see resolveBucketing above.
    const bucketing = (start_date && end_date)
      ? resolveBucketing(points, start_date, end_date)
      : null;

    if (bucketing) {
      const bucket = bucketExpr('timestamp', bucketing);

      // is_anomaly is cast rather than used bare so the aggregate works
      // whether the column is a real boolean or the 't'/'f' text the frontend
      // also guards against (see prediction.jsx).
      const bucketSql = `
        SELECT
          ${bucket}                                     AS timestamp,
          AVG(risk_percentage)                          AS risk_percentage,
          MIN(risk_percentage)                          AS risk_percentage_min,
          MAX(risk_percentage)                          AS risk_percentage_max,
          AVG(anomaly_score)                            AS anomaly_score,
          MIN(anomaly_score)                            AS anomaly_score_min,
          MAX(anomaly_score)                            AS anomaly_score_max,
          BOOL_OR(is_anomaly::boolean)                  AS is_anomaly,
          COUNT(*) FILTER (WHERE is_anomaly::boolean)::int AS anomaly_count,
          MODE() WITHIN GROUP (ORDER BY risk_label)     AS risk_label,
          MODE() WITHIN GROUP (ORDER BY severity)       AS severity,
          MAX(model_version)                            AS model_version,
          MAX(timestamp)                                AS bucket_last_at,
          MAX(created_at)                               AS created_at,
          COUNT(*)::int                                 AS data_points
        FROM ai1a
        WHERE timestamp >= $1 AND timestamp <= $2
        GROUP BY 1
        ORDER BY 1 DESC
      `;

      const bucketResult = await query(bucketSql, [start_date, end_date]);

      return res.json({
        success: true,
        data: bucketResult.rows,
        count: bucketResult.rows.length,
        sampled: true,
        bucket_seconds: bucketing.bucketSeconds
      });
    }

    let sql = `
      SELECT timestamp, model_version, anomaly_score, is_anomaly,
             risk_percentage, risk_label, severity, created_at
      FROM ai1a
      WHERE 1=1
    `;
    const params = [];

    if (start_date && end_date) {
      params.push(start_date);
      sql += ` AND timestamp >= $${params.length}`;
      params.push(end_date);
      sql += ` AND timestamp <= $${params.length}`;
      sql += ` ORDER BY timestamp DESC`;
    } else {
      params.push(parseInt(limit));
      sql += ` ORDER BY timestamp DESC LIMIT $${params.length}`;
    }

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching AI1a data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI1a data',
      error: error.message
    });
  }
};

// Get AI1a anomaly detection results annotated with process direction
// (kemungkinan_menguntungkan / kemungkinan_merugikan / campuran / ...) from
// ai1a_direction_annotation, a layer built separately on the AI side that
// flags whether an anomaly is likely GOOD or BAD for the process -- AI1a
// itself (Isolation Forest) is a pure statistical detector with no notion
// of which direction is favorable (e.g. falling TDS gets flagged "anomaly"
// even though it's process-favorable).
//
// Purely additive: does not read from or alter ai1a/ai1a_shadow rows, only
// joins alongside them via (source_table, source_id).
//
// Defaults to source_table='ai1a' (production) because AI1a-70 has not been
// cut over yet -- production is still on the 65-feature model. 'ai1a_shadow'
// is internal shadow/testing data (includes both 65- and 70-feature runs),
// not what's shown to users today; pass it explicitly to inspect it.
const AI1A_DIRECTION_SOURCE_TABLES = ['ai1a', 'ai1a_shadow'];

const getAi1aDirectionAnnotations = async (req, res) => {
  try {
    const {
      limit = 50,
      start_date,
      end_date,
      direction_flag,
      source_table = 'ai1a'
    } = req.query;

    if (!AI1A_DIRECTION_SOURCE_TABLES.includes(source_table)) {
      return res.status(400).json({
        success: false,
        message: `Invalid source_table. Valid: ${AI1A_DIRECTION_SOURCE_TABLES.join(', ')}`
      });
    }

    // source_table is whitelisted above -- Postgres can't parameterize an
    // identifier, so it's safe to interpolate directly into FROM here.
    let sql = `
      SELECT
        a.id, a.timestamp, a.model_version AS ai1a_model_version,
        a.anomaly_score, a.is_anomaly, a.risk_percentage, a.risk_label,
        a.severity,
        d.direction_flag, d.drivers_json,
        d.model_version AS annotation_model_version,
        d.config_version, d.created_at AS annotation_created_at
      FROM ${source_table} a
      JOIN ai1a_direction_annotation d
        ON d.source_table = $1 AND d.source_id = a.id
      WHERE 1=1
    `;
    const params = [source_table];

    if (direction_flag) {
      params.push(direction_flag);
      sql += ` AND d.direction_flag = $${params.length}`;
    }

    if (start_date && end_date) {
      params.push(start_date);
      sql += ` AND a.timestamp >= $${params.length}`;
      params.push(end_date);
      sql += ` AND a.timestamp <= $${params.length}`;
      sql += ` ORDER BY a.timestamp DESC`;
    } else {
      params.push(parseInt(limit));
      sql += ` ORDER BY a.timestamp DESC LIMIT $${params.length}`;
    }

    const result = await query(sql, params);

    res.json({
      success: true,
      source_table,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching AI1a direction annotations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI1a direction annotations',
      error: error.message
    });
  }
};

// Get latest AI1b 30-day risk forecasts
const getAi1bData = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const sql = `
      SELECT generated_at, model_version,
             day_1_risk, day_2_risk, day_3_risk, day_4_risk, day_5_risk,
             day_6_risk, day_7_risk, day_8_risk, day_9_risk, day_10_risk,
             day_11_risk, day_12_risk, day_13_risk, day_14_risk, day_15_risk,
             day_16_risk, day_17_risk, day_18_risk, day_19_risk, day_20_risk,
             day_21_risk, day_22_risk, day_23_risk, day_24_risk, day_25_risk,
             day_26_risk, day_27_risk, day_28_risk, day_29_risk, day_30_risk,
             created_at
      FROM ai1b
      ORDER BY generated_at DESC
      LIMIT $1
    `;

    const result = await query(sql, [parseInt(limit)]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Error fetching AI1b data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI1b data',
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
  validateSetup,
  receiveAi2Data,
  getAi2Data,
  getAi2AggregatedStats,
  getAi1aData,
  getAi1aDirectionAnnotations,
  getAi1bData
};