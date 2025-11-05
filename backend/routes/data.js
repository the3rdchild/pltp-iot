const express = require('express');
const router = express.Router();
const {
  getLatestSensorData,
  getSensorDataByDateRange,
  getLatestMLPredictions,
  getFieldData,
  createFieldData,
  getDashboardStats
} = require('../controllers/dataController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// GET /api/data/sensor/latest - Get latest sensor data
router.get('/sensor/latest', optionalAuth, getLatestSensorData);

// GET /api/data/sensor/range - Get sensor data by date range
router.get('/sensor/range', optionalAuth, getSensorDataByDateRange);

// GET /api/data/ml/latest - Get latest ML predictions
router.get('/ml/latest', optionalAuth, getLatestMLPredictions);

// GET /api/data/field - Get field data
router.get('/field', optionalAuth, getFieldData);

// POST /api/data/field - Create field data (requires authentication)
router.post('/field', authenticateToken, createFieldData);

// GET /api/data/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', optionalAuth, getDashboardStats);

module.exports = router;
