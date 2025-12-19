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
const { optionalAuth } = require('../middleware/auth');

// GET /api/honeywell/status - Get Honeywell integration status
router.get('/status', optionalAuth, getHoneywellStatus);

// GET /api/honeywell/test-connection - Test connection to Honeywell API
router.get('/test-connection', optionalAuth, testHoneywellConnection);

// POST /api/honeywell/sync-live - Manually trigger sync of live data
router.post('/sync-live', optionalAuth, syncLiveData);

// POST /api/honeywell/receive - Receive data pushed from Honeywell server (requires API key)
router.post('/receive', validateApiKey, receiveHoneywellData);

// POST /api/honeywell/fetch-custom - Fetch custom data with parameters
router.post('/fetch-custom', optionalAuth, fetchCustomData);

module.exports = router;
