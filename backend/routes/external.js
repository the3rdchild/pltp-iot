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
  getAi2AggregatedStats,
  getAi1aData,
  getAi1aDirectionAnnotations,
  getAi1bData,
  getFailureForecastData,
  getFailureForecastHistory,
  getFailureForecastOverhaulEvents,
  createFailureForecastOverhaulEvent,
  undoFailureForecastOverhaulEvent,
  deleteFailureForecastOverhaulEvent
} = require('../controllers/externalController');

// Import API Key authentication middleware
const { validateApiKey } = require('../middleware/apiKeyAuth');
const { authenticateToken, requireRole } = require('../middleware/auth');
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

// GET /api/external/ai1a - Get latest AI1a anomaly detection results.
// Accepts source_table=ai1a (default, production) | ai1a_shadow (deliberate
// override -- see AI1A_SOURCE_TABLES in externalController.js).
router.get('/ai1a', getAi1aData);

// GET /api/external/ai1a/direction - Get AI1a results annotated with process
// direction (favorable/unfavorable), joined from ai1a_direction_annotation.
// Defaults to source_table=ai1a (production).
router.get('/ai1a/direction', getAi1aDirectionAnnotations);

// GET /api/external/ai1b - Get latest AI1b 30-day risk forecasts
router.get('/ai1b', getAi1bData);

// GET /api/external/failure-forecast - Get latest failure-forecast projection
// (turbine State-of-Health curve, linear + weibull_cox side by side). See
// docs/failure_forecast_contract_for_beFE.md.
router.get('/failure-forecast', getFailureForecastData);

// GET /api/external/failure-forecast/history - Get the historical
// failure-forecast curve (COD 2015-06-29 -> today), same models/columns
// shape as /failure-forecast, joins onto it at today_failure_pct. See
// docs/failure_forecast_contract_for_beFE.md.
router.get('/failure-forecast/history', getFailureForecastHistory);

// GET /api/external/failure-forecast/overhaul - Get the full overhaul-event
// log (soft-delete only). Read-only/public, same as the two routes above.
router.get('/failure-forecast/overhaul', getFailureForecastOverhaulEvents);

// POST /api/external/failure-forecast/overhaul-reset - Record a completed
// major overhaul/Turn Around (resets the SoH anchor). Admin-only: this is a
// real, permanently-logged event, not a cosmetic UI action. See
// getFailureForecastOverhaulEvents/createFailureForecastOverhaulEvent in
// externalController.js for the full contract.
router.post('/failure-forecast/overhaul-reset', authenticateToken, requireRole('admin'), createFailureForecastOverhaulEvent);

// POST /api/external/failure-forecast/overhaul-undo - Soft-delete (undo) the
// most recently recorded active overhaul event. Admin-only, same as above.
router.post('/failure-forecast/overhaul-undo', authenticateToken, requireRole('admin'), undoFailureForecastOverhaulEvent);

// DELETE /api/external/failure-forecast/overhaul/:id - Permanently remove an
// ALREADY-UNDONE overhaul event (test/mistaken-entry cleanup). Admin-only.
// Refuses (409) if the event is still active -- undo it first, then delete.
router.delete('/failure-forecast/overhaul/:id', authenticateToken, requireRole('admin'), deleteFailureForecastOverhaulEvent);

// Testing endpoints - protected with API Key for security
router.post('/test', validateApiKey, testConnection); // Test connection and insert sample data
router.post('/test/dummy', validateApiKey, generateDummyData); // Generate multiple dummy records
router.get('/test/validate', validateSetup); // Validate database setup - public for health check

module.exports = router;
