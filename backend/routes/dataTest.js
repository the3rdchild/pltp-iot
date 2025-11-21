const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  exportTestSensorData,
  insertTestSensorData
} = require('../controllers/dataTestController');
const { optionalAuth } = require('../middleware/auth');
const { skipIfWhitelisted } = require('../middleware/ipWhitelist');

// Rate limit untuk data-test - whitelisted IPs bypass limit
const dataTestLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 1000, // 100 requests per menit untuk non-whitelisted
  skip: skipIfWhitelisted, // Whitelisted IPs = unlimited
  message: {
    success: false,
    message: 'Too many requests. Contact admin to whitelist your IP.'
  }
});

// Apply rate limiter to all routes in this router
router.use(dataTestLimiter);

// GET /api/data-test/sensor/export - Export test sensor data (JSON or CSV)
router.get('/sensor/export', optionalAuth, exportTestSensorData);

// POST /api/data-test/sensor/export - Insert single data point (simulasi streaming)
router.post('/sensor/export', optionalAuth, insertTestSensorData);

module.exports = router;
