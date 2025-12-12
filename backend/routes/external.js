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
  validateSetup
} = require('../controllers/externalController');

// Import API Key authentication middleware
const { validateApiKey } = require('../middleware/apiKeyAuth');

// POST /api/external/honeywell - Fetch and store data from Honeywell PIMS
router.post('/honeywell', validateApiKey, fetchHoneywellData);

// POST /api/external/sensor-data - Receive sensor data from Honeywell
// Protected with API Key authentication
router.post('/sensor-data', validateApiKey, receiveExternalData);

// POST /api/external/ml-prediction - Receive ML predictions from edge computing
// Protected with API Key authentication
router.post('/ml-prediction', validateApiKey, receiveMLPrediction);

// POST /api/external/batch - Receive batch sensor data
// Protected with API Key authentication
router.post('/batch', validateApiKey, receiveBatchData);

// POST /api/external/sensor-data/ulubelu - Receive sensor data from Ulubelu
// Protected with API Key authentication
router.post('/sensor-data/ulubelu', validateApiKey, receiveUlubeluData);

// POST /api/external/batch/ulubelu - Receive batch sensor data from Ulubelu
// Protected with API Key authentication
router.post('/batch/ulubelu', validateApiKey, receiveBatchUlubeluData);

// Testing endpoints - protected with API Key for security
router.post('/test', validateApiKey, testConnection); // Test connection and insert sample data
router.post('/test/dummy', validateApiKey, generateDummyData); // Generate multiple dummy records
router.get('/test/validate', validateSetup); // Validate database setup - public for health check

module.exports = router;
