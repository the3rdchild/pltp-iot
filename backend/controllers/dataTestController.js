const { query } = require('../config/database');

// GET /api/data-test/sensor/export - Export test sensor data
const exportTestSensorData = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      status,
      format = 'json',
      limit = 1000,
      offset = 0
    } = req.query;

    // Build dynamic query
    let sql = 'SELECT * FROM sensor_data_test WHERE 1=1';
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
    let countSql = 'SELECT COUNT(*) as total FROM sensor_data_test WHERE 1=1';
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

    if (status) {
      countParams.push(status);
      countSql += ` AND status = $${countParams.length}`;
    }

    const countResult = await query(countSql, countParams);
    const totalRecords = parseInt(countResult.rows[0].total);

    // Format response based on requested format
    if (format === 'csv') {
      const fields = [
        'id', 'timestamp', 'temperature', 'pressure', 'flow_rate',
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
      res.setHeader('Content-Disposition', `attachment; filename=sensor_data_test_export_${new Date().toISOString()}.csv`);
      return res.send(csv);

    } else {
      // Return JSON (default)
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
          status
        }
      });
    }

  } catch (error) {
    console.error('Error exporting test sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export test sensor data',
      error: error.message
    });
  }
};

// POST /api/data-test/sensor/export - Insert single data point (simulasi streaming)
const insertTestSensorData = async (req, res) => {
  try {
    const {
      timestamp = new Date().toISOString(),
      temperature,
      pressure,
      flow_rate,
      gen_voltage_v_w,
      gen_voltage_w_u,
      gen_reactive_power,
      gen_output,
      gen_power_factor,
      gen_frequency,
      speed_detection,
      mcv_l,
      mcv_r,
      tds,
      status = 'normal'
    } = req.body;

    const result = await query(
      `INSERT INTO sensor_data_test
       (timestamp, temperature, pressure, flow_rate, gen_voltage_v_w, gen_voltage_w_u,
        gen_reactive_power, gen_output, gen_power_factor, gen_frequency,
        speed_detection, mcv_l, mcv_r, tds, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        timestamp,
        temperature,
        pressure,
        flow_rate,
        gen_voltage_v_w,
        gen_voltage_w_u,
        gen_reactive_power,
        gen_output,
        gen_power_factor,
        gen_frequency,
        speed_detection,
        mcv_l,
        mcv_r,
        tds,
        status
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Test sensor data inserted successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error inserting test sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to insert test sensor data',
      error: error.message
    });
  }
};

module.exports = {
  exportTestSensorData,
  insertTestSensorData
};
