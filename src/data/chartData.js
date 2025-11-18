// Sample data for analytics charts

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
