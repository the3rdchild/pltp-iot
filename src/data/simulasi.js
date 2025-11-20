// Generate real-time chart data for time-based ranges (now, 1h, 1d, 7d, 1m)
export function generateRealTimeChartData(dataType = 'dryness', timeRange = 'now', previousData = []) {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const ranges = {
    dryness: { min: 98.0, max: 100.0, variance: 0.5 },
    ncg: { min: 0.5, max: 2.5, variance: 0.3 },
    tds: { min: 4.0, max: 8.0, variance: 0.4 },
    pressure: { min: 1335, max: 1345, variance: 2 },
    temperature: { min: 164, max: 166, variance: 0.3 },
    flow: { min: 245, max: 247, variance: 0.3 }
  };

  const range = ranges[dataType] || ranges.dryness;
  const maxPoints = 60;

  // For 'now' mode - update with one new point
  if (timeRange === 'now' && previousData.length > 0) {
    const lastValue = previousData[previousData.length - 1];
    const newValue = clamp(
      lastValue + (Math.random() - 0.5) * range.variance,
      range.min,
      range.max
    );
    const newData = [...previousData.slice(-(maxPoints - 1)), newValue];
    return newData.map(v => parseFloat(v.toFixed(2)));
  }

  // Generate initial data or static historical data
  const pointsMap = {
    'now': maxPoints,
    '1h': maxPoints,
    '1d': maxPoints,
    '7d': maxPoints,
    '1m': maxPoints
  };

  const points = pointsMap[timeRange] || maxPoints;
  const data = [];

  for (let i = 0; i < points; i++) {
    const value = range.min + Math.random() * (range.max - range.min);
    data.push(parseFloat(value.toFixed(2)));
  }

  return data;
}

// Store previous values for smooth transitions
let previousValues = {
  dryness: 99.0,
  ncg: 1.5,
  tds: 6.0,
  pressure: 1400,
  temperature: 140,
  flow: 246,
  activePower: 32.5,
  reactivePower: 6.2,
  voltage: 13.5,
  current: 1350,
  stSpeed: 3000
};

export function generateAnalyticData() {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Generate smooth transitions for gauges
  const smoothUpdate = (prevValue, min, max, variance) => {
    const newValue = prevValue + (Math.random() - 0.5) * variance;
    return clamp(newValue, min, max);
  };

  // Update previous values with smooth transitions
  previousValues.dryness = smoothUpdate(previousValues.dryness, 98.0, 100.0, 0.3);
  previousValues.ncg = smoothUpdate(previousValues.ncg, 0.5, 2.5, 0.2);
  previousValues.tds = smoothUpdate(previousValues.tds, 5.0, 10.0, 0.3);
  previousValues.pressure = smoothUpdate(previousValues.pressure, 1335, 1345, 2);
  previousValues.temperature = smoothUpdate(previousValues.temperature, 164, 166, 0.3);
  previousValues.flow = smoothUpdate(previousValues.flow, 245, 247, 0.3);
  previousValues.activePower = smoothUpdate(previousValues.activePower, 32.0, 33.0, 0.05);
  previousValues.reactivePower = smoothUpdate(previousValues.reactivePower, 6.0, 6.5, 0.03);
  previousValues.voltage = smoothUpdate(previousValues.voltage, 13.0, 14.0, 0.05);
  previousValues.current = smoothUpdate(previousValues.current, 1300, 1400, 5);
  previousValues.stSpeed = smoothUpdate(previousValues.stSpeed, 2900, 3100, 10);

  // Steam Purity: TDS & Deposit Index
  const co2 = clamp(Math.random() * 2 + 4, 1, 5);
  const argon = clamp(Math.random() * 5 + 2, 1, 8);
  const methane = clamp(Math.random() * 3 + 1, 1, 5);
  const ma3 = clamp(Math.random() * 2 + 1, 1, 3);
  const scalingDeposit = clamp(Math.random() * 1.5 + 0.5, 0.5, 2);

  // Steam Quality: AI
  const anomalyScore = clamp(Math.random() * 0.1 + 0.05, 0, 1);
  const riskLevels = ['Low', 'Medium', 'High'];
  const riskIndex = previousValues.dryness < 98.5 || anomalyScore > 0.3 ? 2 : (anomalyScore > 0.15 ? 1 : 0);
  const riskPrediction = riskLevels[riskIndex];

  return {
    // Steam Purity (gauges - live update)
    tdsOverall: previousValues.tds.toFixed(1),
    dryness: previousValues.dryness.toFixed(2),
    ncg: previousValues.ncg.toFixed(2),

    // Other TDS components
    co2: co2.toFixed(1),
    argon: argon.toFixed(1),
    methane: methane.toFixed(1),
    ma3: ma3.toFixed(1),
    scalingDeposit: scalingDeposit.toFixed(2),

    // Steam Quality
    drynessFraction: (previousValues.dryness / 100).toFixed(2),
    anomalyScore: anomalyScore.toFixed(2),
    riskPrediction: riskPrediction,

    // PTF Data (gauges - live update)
    pressure: previousValues.pressure.toFixed(0),
    temperature: previousValues.temperature.toFixed(0),
    flow: previousValues.flow.toFixed(0),

    // Power Data (live update)
    activePower: previousValues.activePower.toFixed(2),
    reactivePower: previousValues.reactivePower.toFixed(2),
    voltage: previousValues.voltage.toFixed(2),
    current: previousValues.current.toFixed(2),
    stSpeed: previousValues.stSpeed.toFixed(0)
  };
}
