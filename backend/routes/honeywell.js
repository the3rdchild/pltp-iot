const express = require('express');
const router = express.Router();
const {
  syncLiveData,
  receiveHoneywellData,
  testHoneywellConnection,
  fetchCustomData,
  getHoneywellStatus
} = require('../controllers/honeywellController');
const { validateApiKey } = require('../middleware/apiKeyAuth');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

// GET /api/honeywell/status - Get Honeywell integration status
router.get('/status', optionalAuth, getHoneywellStatus);

// The three routes below all reach out to the production PIMS. They were on
// optionalAuth, which accepts a missing token -- so anyone who could reach the
// API could spend PIMS capacity at will, and sync-live could write to
// sensor_data on top of that. A signed-in session is now required; sync-live is
// additionally throttled in the controller.

// GET /api/honeywell/test-connection - Test connection to Honeywell API
router.get('/test-connection', authenticateToken, testHoneywellConnection);

// POST /api/honeywell/sync-live - Manually trigger sync of live data
router.post('/sync-live', authenticateToken, syncLiveData);

// POST /api/honeywell/receive - Receive data pushed from Honeywell server (requires API key)
router.post('/receive', validateApiKey, receiveHoneywellData);

// POST /api/honeywell/fetch-custom - Fetch custom data with parameters
router.post('/fetch-custom', authenticateToken, fetchCustomData);

module.exports = router;
