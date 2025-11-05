const express = require('express');
const router = express.Router();
const {
  receiveExternalData,
  receiveMLPrediction,
  receiveBatchData
} = require('../controllers/externalController');

// POST /api/external/sensor-data - Receive sensor data from Honeywell
router.post('/sensor-data', receiveExternalData);

// POST /api/external/ml-prediction - Receive ML predictions from edge computing
router.post('/ml-prediction', receiveMLPrediction);

// POST /api/external/batch - Receive batch sensor data
router.post('/batch', receiveBatchData);

module.exports = router;
