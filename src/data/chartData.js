// Sample data for analytics charts

// ========== STATIC AI/FIELD DATA GENERATORS ==========
// Generate AI data for yearly view (up to 60 points, 24 per year)
export const generateAIData = (startDate, endDate, dataType = 'dryness') => {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate months between dates
  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  const pointsPerMonth = 2; // 2 data points per month (24 per year)
  const totalPoints = Math.min(monthsDiff * pointsPerMonth, 60);

  const ranges = {
    dryness: { min: 98.0, max: 100.0 },
    ncg: { min: 0.5, max: 2.5 },
    tds: { min: 4.0, max: 8.0 },
    pressure: { min: 1300, max: 1600 },
    temperature: { min: 120, max: 160 },
    flow: { min: 240, max: 300 }
  };

  const range = ranges[dataType] || ranges.dryness;

  for (let i = 0; i < totalPoints; i++) {
    const monthOffset = Math.floor((i / totalPoints) * monthsDiff);
    const dayInMonth = (i % pointsPerMonth) === 0 ? 10 : 25; // Two samples per month

    const timestamp = new Date(
      start.getFullYear(),
      start.getMonth() + monthOffset,
      dayInMonth
    );

    const value = range.min + Math.random() * (range.max - range.min);
    data.push({
      timestamp: timestamp.getTime(),
      value: parseFloat(value.toFixed(2))
    });
  }

  return data.sort((a, b) => a.timestamp - b.timestamp);
};

// Generate Field data for yearly view (up to 60 points, 24 per year)
export const generateFieldData = (startDate, endDate, dataType = 'dryness') => {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate months between dates
  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  const pointsPerMonth = 2; // 2 data points per month (24 per year)
  const totalPoints = Math.min(monthsDiff * pointsPerMonth, 60);

  const ranges = {
    dryness: { min: 98.2, max: 99.8 }, // Slightly different range for realism
    ncg: { min: 0.6, max: 2.3 },
    tds: { min: 4.5, max: 7.5 },
    pressure: { min: 1320, max: 1580 },
    temperature: { min: 125, max: 155 },
    flow: { min: 250, max: 290 }
  };

  const range = ranges[dataType] || ranges.dryness;

  for (let i = 0; i < totalPoints; i++) {
    const monthOffset = Math.floor((i / totalPoints) * monthsDiff);
    const dayInMonth = (i % pointsPerMonth) === 0 ? 12 : 27; // Different days than AI

    const timestamp = new Date(
      start.getFullYear(),
      start.getMonth() + monthOffset,
      dayInMonth
    );

    const value = range.min + Math.random() * (range.max - range.min);
    data.push({
      timestamp: timestamp.getTime(),
      value: parseFloat(value.toFixed(2))
    });
  }

  return data.sort((a, b) => a.timestamp - b.timestamp);
};

// ========== DRYNESS DATA ==========
export const drynessRealTimeData = [
  97.92, 98.44, 98.97, 99.12, 98.65, 99.31, 98.88, 99.04, 99.55, 98.77,
  99.22, 98.91, 99.08, 98.53, 99.47, 98.81, 99.00, 98.69, 99.35, 99.10,
  98.62, 99.28, 98.84, 99.02, 99.61, 98.73, 99.18, 98.95, 99.07, 98.59,
  99.41, 98.86, 99.14, 98.67, 99.33, 99.06, 98.71, 99.26, 98.89, 99.03,
  99.58, 98.75, 99.20, 98.93, 99.09, 98.57, 99.39, 98.83, 99.11, 98.63,
  99.36, 98.96, 99.05, 98.72, 99.24, 98.90, 99.16, 98.61
];

export const drynessHistoryDataset1 = [
  99.32, 99.01, 98.58, 98.63, 99.36, 99.27, 99.52, 99.38, 99.13, 98.68,
  99.41, 98.95, 99.08, 98.75, 99.55, 99.48, 98.59, 98.71, 99.02, 99.21,
  98.53, 99.44, 98.82, 99.61, 99.15, 98.92, 99.35, 99.07, 99.50, 99.26
];

export const drynessHistoryDataset2 = [
  98.87, 99.15, 98.73, 98.56, 99.28, 99.42, 99.07, 99.51, 99.64, 99.21,
  99.38, 98.91, 99.73, 98.48, 99.56, 99.12, 98.68, 99.47, 99.03, 98.79,
  99.61, 99.24, 98.96, 98.59, 99.43, 99.18, 98.82, 99.35, 98.71, 99.57
];

// Dryness table data generator
export const generateDrynessTableData = () => {
  const generatedData = [];
  for (let i = 1; i <= 58; i++) {
    const minValue = (98 + Math.random() * 2).toFixed(15);
    const maxValue = (99 + Math.random() * 1).toFixed(15);
    const average = ((parseFloat(minValue) + parseFloat(maxValue)) / 2).toFixed(15);
    const stdDev = (Math.random() * 0.5).toFixed(15);

    generatedData.push({
      no: i,
      date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
      minValue: minValue + '%',
      maxValue: maxValue + '%',
      average: average + '%',
      stdDeviation: stdDev + '%'
    });
  }
  return generatedData;
};

// ========== NCG DATA ==========
// NCG data (Non-Condensable Gas)
export const ncgRealTimeData = [
  1.12, 1.45, 1.78, 1.32, 1.56, 1.89, 1.23, 1.67, 2.01, 1.43,
  1.72, 1.98, 1.54, 1.21, 1.87, 1.65, 1.34, 1.91, 1.76, 1.48,
  1.59, 1.82, 1.37, 1.68, 2.15, 1.53, 1.94, 1.71, 1.46, 1.63,
  1.85, 1.39, 1.74, 1.97, 1.61, 1.29, 1.88, 1.52, 1.79, 1.41,
  1.66, 1.93, 1.58, 1.35, 1.84, 1.69, 1.47, 1.92, 1.73, 1.51,
  1.77, 1.44, 1.86, 1.62, 1.38, 1.95, 1.70, 1.49
];

export const ncgHistoryDataset1 = [
  1.52, 1.58, 1.61, 1.55, 1.63, 1.60, 1.57, 1.62, 1.59, 1.64,
  1.56, 1.60, 1.63, 1.58, 1.61, 1.65, 1.59, 1.62, 1.60, 1.63,
  1.57, 1.61, 1.64, 1.58, 1.62, 1.66, 1.60, 1.63, 1.59, 1.62
];

export const ncgHistoryDataset2 = [
  1.64, 1.47, 1.63, 1.52, 1.66, 1.58, 1.55, 1.65, 1.61, 1.67,
  1.54, 1.62, 1.65, 1.56, 1.63, 1.68, 1.58, 1.64, 1.59, 1.66,
  1.55, 1.62, 1.67, 1.57, 1.64, 1.69, 1.61, 1.65, 1.58, 1.64
];

// NCG table data generator
export const generateNCGTableData = () => {
  const generatedData = [];
  for (let i = 1; i <= 58; i++) {
    const minValue = (0.5 + Math.random() * 1.5).toFixed(15);
    const maxValue = (1.8 + Math.random() * 0.5).toFixed(15);
    const average = ((parseFloat(minValue) + parseFloat(maxValue)) / 2).toFixed(15);
    const stdDev = (Math.random() * 0.3).toFixed(15);

    generatedData.push({
      no: i,
      date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
      minValue: minValue + 'wt%',
      maxValue: maxValue + 'wt%',
      average: average + 'wt%',
      stdDeviation: stdDev + 'wt%'
    });
  }
  return generatedData;
};

// ========== TDS DATA ==========
// TDS data (Total Dissolved Solids)
export const tdsRealTimeData = [
  5.2, 5.6, 5.9, 5.4, 5.8, 6.1, 5.5, 5.7, 6.3, 5.6,
  5.9, 6.2, 5.7, 5.4, 6.0, 5.8, 5.5, 6.1, 5.9, 5.6,
  5.8, 6.0, 5.6, 5.9, 6.4, 5.7, 6.2, 5.9, 5.6, 5.8,
  6.1, 5.6, 5.9, 6.3, 5.8, 5.5, 6.0, 5.7, 5.9, 5.6,
  5.8, 6.1, 5.8, 5.6, 6.0, 5.9, 5.7, 6.2, 5.9, 5.7,
  5.9, 5.6, 6.1, 5.8, 5.6, 6.3, 5.9, 5.7
];

export const tdsHistoryDataset1 = [
  5.7, 5.8, 5.9, 5.7, 5.9, 5.8, 5.8, 5.9, 5.8, 6.0,
  5.7, 5.8, 5.9, 5.8, 5.9, 6.0, 5.8, 5.9, 5.8, 5.9,
  5.7, 5.9, 6.0, 5.8, 5.9, 6.1, 5.8, 5.9, 5.8, 5.9
];

export const tdsHistoryDataset2 = [
  5.9, 5.7, 5.9, 5.7, 6.0, 5.8, 5.7, 5.9, 5.8, 6.0,
  5.7, 5.9, 6.0, 5.7, 5.9, 6.1, 5.8, 5.9, 5.8, 6.0,
  5.7, 5.9, 6.0, 5.7, 5.9, 6.1, 5.8, 5.9, 5.8, 5.9
];

// TDS table data generator
export const generateTDSTableData = () => {
  const generatedData = [];
  for (let i = 1; i <= 58; i++) {
    const minValue = (4.35 + Math.random() * 1.5).toFixed(15);
    const maxValue = (6.5 + Math.random() * 1.2).toFixed(15);
    const average = ((parseFloat(minValue) + parseFloat(maxValue)) / 2).toFixed(15);
    const stdDev = (Math.random() * 0.4).toFixed(15);

    generatedData.push({
      no: i,
      date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
      minValue: minValue + 'ppm',
      maxValue: maxValue + 'ppm',
      average: average + 'ppm',
      stdDeviation: stdDev + 'ppm'
    });
  }
  return generatedData;
};

// ========== PTF DATA ==========
// PTF data (Pressure, Temperature, Flow)
// Pressure data (kPa) - smoothed, range ~1422-1450
export const ptfPressureRealTimeData = [
  1422, 1432, 1428, 1435, 1436, 1437, 1445, 1435, 1447, 1436,
  1446, 1436, 1444, 1434, 1449, 1439, 1432, 1444, 1436, 1431,
  1446, 1438, 1430, 1448, 1436, 1430, 1444, 1436, 1446, 1432,
  1444, 1436, 1446, 1434, 1448, 1438, 1432, 1444, 1436, 1431,
  1446, 1438, 1434, 1446, 1436, 1430, 1446, 1436, 1444, 1432,
  1448, 1438, 1432, 1446, 1436, 1430, 1446, 1438
];

// Temperature data (°C) - smoothed, range ~139-143
export const ptfTemperatureRealTimeData = [
  139, 140, 139, 141, 141, 141, 143, 141, 143, 141,
  142, 140, 142, 140, 143, 141, 140, 142, 141, 139,
  142, 142, 139, 143, 141, 140, 142, 141, 142, 140,
  142, 141, 142, 140, 143, 141, 140, 142, 141, 139,
  142, 142, 141, 142, 141, 140, 142, 141, 142, 139,
  143, 142, 140, 142, 141, 139, 142, 142
];

// Flow data (t/h) - smoothed, range ~269-276
export const ptfFlowRealTimeData = [
  269, 271, 270, 272, 273, 273, 275, 272, 276, 272,
  275, 271, 275, 272, 276, 274, 271, 275, 273, 271,
  275, 274, 271, 276, 273, 271, 275, 273, 275, 272,
  275, 273, 276, 271, 276, 274, 271, 275, 273, 271,
  275, 274, 273, 276, 273, 271, 275, 273, 275, 271,
  276, 275, 271, 275, 273, 271, 275, 274
];

// History datasets for Pressure
export const ptfPressureHistoryDataset1 = [
  1435, 1442, 1428, 1448, 1438, 1432, 1452, 1440, 1445, 1430,
  1448, 1435, 1442, 1428, 1450, 1438, 1432, 1445, 1438, 1432,
  1448, 1442, 1428, 1450, 1438, 1432, 1445, 1440, 1448, 1435
];

export const ptfPressureHistoryDataset2 = [
  1440, 1435, 1445, 1430, 1448, 1435, 1428, 1445, 1438, 1448,
  1432, 1442, 1448, 1432, 1445, 1452, 1435, 1445, 1438, 1448,
  1432, 1442, 1450, 1432, 1445, 1452, 1438, 1445, 1435, 1445
];

// History datasets for Temperature
export const ptfTemperatureHistoryDataset1 = [
  140, 142, 138, 144, 141, 139, 145, 141, 143, 138,
  144, 140, 142, 138, 145, 142, 139, 144, 141, 139,
  144, 142, 138, 145, 141, 139, 144, 141, 144, 140
];

export const ptfTemperatureHistoryDataset2 = [
  141, 140, 143, 138, 144, 140, 138, 143, 141, 144,
  139, 142, 144, 139, 143, 145, 140, 143, 141, 144,
  139, 142, 145, 139, 143, 145, 141, 143, 140, 143
];

// History datasets for Flow
export const ptfFlowHistoryDataset1 = [
  272, 275, 268, 278, 273, 270, 280, 273, 276, 268,
  278, 272, 275, 268, 280, 274, 270, 278, 273, 270,
  278, 275, 268, 280, 273, 270, 278, 273, 278, 272
];

export const ptfFlowHistoryDataset2 = [
  273, 272, 276, 268, 278, 272, 268, 276, 273, 278,
  270, 275, 278, 270, 276, 280, 272, 276, 273, 278,
  270, 275, 280, 270, 276, 280, 273, 276, 272, 276
];

// PTF table data generator - DEPRECATED (use separate generators below)
export const generatePTFTableData = () => {
  const generatedData = [];
  for (let i = 1; i <= 58; i++) {
    const minPressure = (1353 + Math.random() * 50).toFixed(2);
    const maxPressure = (1500 + Math.random() * 56).toFixed(2);
    const avgPressure = ((parseFloat(minPressure) + parseFloat(maxPressure)) / 2).toFixed(2);
    const stdDev = (Math.random() * 20).toFixed(2);

    generatedData.push({
      no: i,
      date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
      minValue: `P:${minPressure}kPa T:${(131 + Math.random() * 10).toFixed(1)}°C F:${(251 + Math.random() * 20).toFixed(1)}t/h`,
      maxValue: `P:${maxPressure}kPa T:${(145 + Math.random() * 10).toFixed(1)}°C F:${(280 + Math.random() * 18).toFixed(1)}t/h`,
      average: `P:${avgPressure}kPa T:${(135 + Math.random() * 10).toFixed(1)}°C F:${(260 + Math.random() * 20).toFixed(1)}t/h`,
      stdDeviation: `P:${stdDev}kPa T:${(Math.random() * 5).toFixed(2)}°C F:${(Math.random() * 8).toFixed(2)}t/h`
    });
  }
  return generatedData;
};

// Pressure table data generator (separate)
export const generatePressureTableData = () => {
  const generatedData = [];
  for (let i = 1; i <= 58; i++) {
    const minValue = parseFloat((5.0 + Math.random() * 0.5).toFixed(3));
    const maxValue = parseFloat((6.5 + Math.random() * 0.5).toFixed(3));
    const avgValue = parseFloat(((minValue + maxValue) / 2).toFixed(3));
    const stdDev = parseFloat((Math.random() * 0.3).toFixed(3));

    generatedData.push({
      no: i,
      date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
      minValue: `${minValue}barg`,
      maxValue: `${maxValue}barg`,
      average: `${avgValue}barg`,
      stdDeviation: `${stdDev}barg`
    });
  }
  return generatedData;
};

// Temperature table data generator (separate)
export const generateTemperatureTableData = () => {
  const generatedData = [];
  for (let i = 1; i <= 58; i++) {
    const minValue = parseFloat((131 + Math.random() * 5).toFixed(3));
    const maxValue = parseFloat((145 + Math.random() * 5).toFixed(3));
    const avgValue = parseFloat(((minValue + maxValue) / 2).toFixed(3));
    const stdDev = parseFloat((Math.random() * 3).toFixed(3));

    generatedData.push({
      no: i,
      date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
      minValue: `${minValue}°C`,
      maxValue: `${maxValue}°C`,
      average: `${avgValue}°C`,
      stdDeviation: `${stdDev}°C`
    });
  }
  return generatedData;
};

// Flow Rate table data generator (separate)
export const generateFlowRateTableData = () => {
  const generatedData = [];
  for (let i = 1; i <= 58; i++) {
    const minValue = parseFloat((251 + Math.random() * 10).toFixed(3));
    const maxValue = parseFloat((280 + Math.random() * 10).toFixed(3));
    const avgValue = parseFloat(((minValue + maxValue) / 2).toFixed(3));
    const stdDev = parseFloat((Math.random() * 5).toFixed(3));

    generatedData.push({
      no: i,
      date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
      minValue: `${minValue}t/h`,
      maxValue: `${maxValue}t/h`,
      average: `${avgValue}t/h`,
      stdDeviation: `${stdDev}t/h`
    });
  }
  return generatedData;
};
