const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  exportTestSensorData,
  insertTestSensorData
} = require('../controllers/dataTestController');
const { optionalAuth } = require('../middleware/auth');

// Rate limit khusus untuk data-test (lebih tinggi untuk simulasi streaming)
const dataTestLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 1000, // 1000 requests per menit
  message: {
    success: false,
    message: 'Too many requests to data-test endpoint, please slow down'
  }
});

// Apply rate limiter to all routes in this router
router.use(dataTestLimiter);

// GET /api/data-test/sensor/export - Export test sensor data (JSON or CSV)
router.get('/sensor/export', optionalAuth, exportTestSensorData);

// POST /api/data-test/sensor/export - Insert single data point (simulasi streaming)
router.post('/sensor/export', optionalAuth, insertTestSensorData);

module.exports = router;
