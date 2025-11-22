const router = require('express').Router();
const limits = require('../config/limits.json');

// Contoh data: replace with DB
const fakeSensorData = [
  { steamQuality: 90, tds: 10, ncg: 2.1, dryness: 0.92, timestamp: Date.now() },
  { steamQuality: 91, tds: 11, ncg: 2.2, dryness: 0.91, timestamp: Date.now() },
];

router.get('/', (req, res) => {
  res.json({
    success: true,
    limits
  });
});

router.get('/anomaly', (req, res) => {
  const anomalies = [];
  const latest = fakeSensorData[fakeSensorData.length - 1];
  const prev = fakeSensorData[fakeSensorData.length - 2];

  Object.keys(limits).forEach(key => {
    const { min, max, anomaly_step } = limits[key];
    const value = latest[key];
    const prevValue = prev[key];

    if (value < min || value > max) {
      anomalies.push({
        field: key,
        type: "threshold",
        value,
        limit: { min, max }
      });
    }

    if (Math.abs(value - prevValue) >= anomaly_step) {
      anomalies.push({
        field: key,
        type: "jump",
        value,
        prevValue,
        step: anomaly_step
      });
    }
  });

  res.json({
    success: true,
    latest,
    anomalies
  });
});

module.exports = router;
