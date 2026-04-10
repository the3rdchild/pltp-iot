const express = require('express');
const router = express.Router();
const {
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
  getAi2AggregatedStats
} = require('../controllers/externalController');

// Import API Key authentication middleware
const { validateApiKey } = require('../middleware/apiKeyAuth');
const { getLatestMLPredictions } = require('../controllers/dataController');

// POST /api/external/honeywell - Fetch and store data from Honeywell PIMS
router.post('/honeywell', validateApiKey, fetchHoneywellData);

// POST /api/external/sensor-data - Receive sensor data from Honeywell
// Protected with API Key authentication
router.post('/sensor-data', validateApiKey, receiveExternalData);

// GET /api/external/ml-prediction - Get latest ML predictions
router.get('/ml-prediction', getLatestMLPredictions);

// POST /api/external/ml-prediction - Receive ML predictions from edge computing
// No authentication required
router.post('/ml-prediction', receiveMLPrediction);

// POST /api/external/batch - Receive batch sensor data
// Protected with API Key authentication
router.post('/batch', validateApiKey, receiveBatchData);

// POST /api/external/sensor-data/ulubelu - Receive sensor data from Ulubelu
// Protected with API Key authentication
router.post('/sensor-data/ulubelu', validateApiKey, receiveUlubeluData);

// POST /api/external/batch/ulubelu - Receive batch sensor data from Ulubelu
// Protected with API Key authentication
router.post('/batch/ulubelu', validateApiKey, receiveBatchUlubeluData);

// GET /api/external/ai2 - Get latest AI2 predictions
router.get('/ai2', getAi2Data);

// GET /api/external/ai2/stats - Get daily aggregated stats for an ai2 metric
router.get('/ai2/stats', getAi2AggregatedStats);

// POST /api/external/ai2 - Receive AI2 predictions (dryness & NCG)
router.post('/ai2', receiveAi2Data);

// Testing endpoints - protected with API Key for security
router.post('/test', validateApiKey, testConnection); // Test connection and insert sample data
router.post('/test/dummy', validateApiKey, generateDummyData); // Generate multiple dummy records
router.get('/test/validate', validateSetup); // Validate database setup - public for health check

module.exports = router;
