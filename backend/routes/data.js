const express = require('express');
const router = express.Router();
const {
  getLiveData,
  getLatestSensorData,
  getSensorDataByDateRange,
  getLatestMLPredictions,
  getFieldData,
  createFieldData,
  getDashboardStats,
  exportSensorData
} = require('../controllers/dataController');
const {
  getLiveMetric,
  getChartData,
  getStatsData
} = require('../controllers/liveDataController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// GET /api/data/sensor/latest - Get latest sensor data
router.get('/sensor/latest', optionalAuth, getLatestSensorData);

// GET /api/data/sensor/range - Get sensor data by date range
router.get('/sensor/range', optionalAuth, getSensorDataByDateRange);

// GET /api/data/sensor/export - Export sensor data with filters (JSON or CSV)
router.get('/sensor/export', optionalAuth, exportSensorData);

// GET /api/data/ml/latest - Get latest ML predictions
router.get('/ml/latest', optionalAuth, getLatestMLPredictions);

// GET /api/data/field - Get field data
router.get('/field', optionalAuth, getFieldData);

// POST /api/data/field - Create field data (requires authentication)
router.post('/field', authenticateToken, createFieldData);

// GET /api/data/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', optionalAuth, getDashboardStats);

// ==================== LIVE DATA ROUTES ====================

// GET /api/data/live - Get all live metrics for dashboard
router.get('/live', optionalAuth, getLiveData);

// GET /api/data/live/:metric - Get single live metric (tds, pressure, temperature, etc.)
router.get('/live/:metric', optionalAuth, getLiveMetric);

// GET /api/data/chart/:metric - Get chart data with time range (1h, 1d, 7d, 1m, 10y)
router.get('/chart/:metric', optionalAuth, getChartData);

// GET /api/data/stats/:metric - Get statistics table data
router.get('/stats/:metric', optionalAuth, getStatsData);

module.exports = router;
