export function generateAnalyticData() {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Steam Purity: TDS & Deposit Index
  const tdsOverall = clamp(Math.random() * 5 + 5, 5, 10); // 5–10 ppm
  const co2 = clamp(Math.random() * 2 + 4, 1, 5);
  const argon = clamp(Math.random() * 5 + 2, 1, 8);
  const methane = clamp(Math.random() * 3 + 1, 1, 5);
  const ma3 = clamp(Math.random() * 2 + 1, 1, 3);          
  const scalingDeposit = clamp(Math.random() * 1.5 + 0.5, 0.5, 2); // 
  // Steam Quality: Dryness & AI
  const drynessFraction = clamp(Math.random() * 0.1 + 0.94, 0.85, 1); // 0.85–0.95
  const anomalyScore = clamp(Math.random() * 0.1 + 0.05, 0, 1);       // 0.05–0.15
  const riskLevels = ['Low', 'Medium', 'High'];
  const riskIndex = drynessFraction < 0.9 || anomalyScore > 0.3 ? 2 : (anomalyScore > 0.15 ? 1 : 0);
  const riskPrediction = riskLevels[riskIndex];

  return {
    // Steam Purity
    tdsOverall: tdsOverall.toFixed(1),
    co2: co2.toFixed(1),
    argon: argon.toFixed(1),
    methane: methane.toFixed(1),
    ma3: ma3.toFixed(1),
    scalingDeposit: scalingDeposit.toFixed(2),

    // Steam Quality
    drynessFraction: drynessFraction.toFixed(2),
    anomalyScore: anomalyScore.toFixed(2),
    riskPrediction: riskPrediction,

    // PTF Data (Pressure, Temperature, Flow)
    pressure: clamp(Math.random() * 203 + 1353, 1353, 1556).toFixed(0),
    temperature: clamp(Math.random() * 24 + 131, 131, 155).toFixed(0),
    flow: clamp(Math.random() * 47 + 251, 251, 298).toFixed(0)
  };
}
