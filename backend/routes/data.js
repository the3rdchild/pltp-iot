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
  exportSensorData,
  getMetricStats,
  getAnomalyCounts,
  getMetricLimits,
  saveMetricLimits
} = require('../controllers/dataController');
const {
  getLiveMetric,
  getChartData,
  getStatsData,
  getAggregatedStatsData
} = require('../controllers/liveDataController');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

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

// POST /api/data/field - Create field data (admin only)
router.post('/field', authenticateToken, requireRole('admin'), createFieldData);

// GET /api/data/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', optionalAuth, getDashboardStats);

// ==================== LIVE DATA ROUTES ====================

// GET /api/data/live - Get all live metrics for dashboard
router.get('/live', optionalAuth, getLiveData);

// GET /api/data/live/:metric - Get single live metric (tds, pressure, temperature, etc.)
router.get('/live/:metric', optionalAuth, getLiveMetric);

// GET /api/data/chart/:metric - Get chart data with time range (1h, 1d, 7d, 1m, all)
router.get('/chart/:metric', optionalAuth, getChartData);

// GET /api/data/stats/:metric - Get statistics table data
router.get('/stats/:metric', optionalAuth, getStatsData);

// GET /api/data/stats/:metric/aggregated - Get aggregated daily stats (60 rows, min/max/avg/stddev)
router.get('/stats/:metric/aggregated', optionalAuth, getAggregatedStatsData);

// ==================== METRIC STATS & ANOMALY ROUTES ====================

// GET /api/data/metric-stats/:metric - Get min/max/avg for 12h, 24h, 7d
router.get('/metric-stats/:metric', optionalAuth, getMetricStats);

// GET /api/data/anomaly-counts/:metric - Get anomaly counts for 12h, 24h, 7d
router.get('/anomaly-counts/:metric', optionalAuth, getAnomalyCounts);

// GET /api/data/metric-limits - Get all metric limits
router.get('/metric-limits', optionalAuth, getMetricLimits);

// POST /api/data/metric-limits - Save/sync metric limits from frontend (admin only)
//
// Was optionalAuth, which accepts an absent token -- i.e. anyone who could
// reach the API could rewrite every alarm threshold in the database with a
// single curl. The <ProtectedRoute> around /configuration only ever hid the
// form; it never guarded this endpoint.
router.post('/metric-limits', authenticateToken, requireRole('admin'), saveMetricLimits);

module.exports = router;
