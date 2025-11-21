const express = require('express');
const router = express.Router();
const {
  exportTestSensorData,
  insertTestSensorData
} = require('../controllers/dataTestController');
const { optionalAuth } = require('../middleware/auth');

// GET /api/data-test/sensor/export - Export test sensor data (JSON or CSV)
router.get('/sensor/export', optionalAuth, exportTestSensorData);

// POST /api/data-test/sensor/export - Insert single data point (simulasi streaming)
router.post('/sensor/export', optionalAuth, insertTestSensorData);

module.exports = router;
