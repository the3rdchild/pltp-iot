export function generateAnalyticData() {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const pressureSeparator = clamp(Math.random() * 111 + 1000, 1000, 1300);
  const pressureSteam = clamp(Math.random() * 20 + 910, 900, 1133); // 210–230
  const boilerTemp = clamp(Math.random() * 10 + 180, 180, 190);      // 85–95
  const tankLevel = clamp(Math.random() * 20 + 46, 0, 100);        // 46–66

  // Steam Purity: TDS & Deposit Index
  const tdsOverall = clamp(Math.random() * 5 + 5, 5, 10); // 5–10 ppm
  const co2 = clamp(Math.random() * 1 + 2, 2, 3);         // 10–20 ppm
  const argon = clamp(Math.random() * 1 + 1, 0.1, 2);          // 2–7 ppm
  const methane = clamp(Math.random() * 0.5 + 1, 0.1, 2);        // 1–4 ppm
  const ma3 = clamp(Math.random() * 0.3 + 0.2, 0, 1);            // 1–3 ppm
  const scalingDeposit = clamp(Math.random() * 1.5 + 0.5, 0.5, 2); // 0.5–2 ppm

  // Steam Quality: Dryness & AI
  const drynessFraction = clamp(Math.random() * 0.1 + 0.94, 0.85, 1); // 0.85–0.95
  const anomalyScore = clamp(Math.random() * 0.1 + 0.05, 0, 1);       // 0.05–0.15
  const riskLevels = ['Low', 'Medium', 'High'];
  const riskIndex = drynessFraction < 0.9 || anomalyScore > 0.3 ? 2 : (anomalyScore > 0.15 ? 1 : 0);
  const riskPrediction = riskLevels[riskIndex];

  return {
    pressureSeparator: pressureSeparator.toFixed(0),
    pressureSteam: pressureSteam.toFixed(0),
    boilerTemp: boilerTemp.toFixed(0),
    tankLevel: tankLevel.toFixed(0),
    avgTankLevel: '56%',
    avgPressure: '220',

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
    riskPrediction: riskPrediction
  };
}
