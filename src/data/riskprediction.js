export function getRiskPrediction(drynessFraction, tdsOverall) {
    // Parse ke float kalau data masih string
    const x = parseFloat(drynessFraction);
    const tds = parseFloat(tdsOverall);
  
    // Kondisi 1: Ideal
    if (x >= 0.90 && x <= 0.95 && tds <= 60) {
      return 'Ideal';
    }
  
    // Kondisi 2: Contaminated Dry
    if (x >= 0.90 && x <= 0.95 && tds > 100) {
      return 'Contaminated Dry';
    }
  
    // Kondisi 3: Wet Clean
    if (x >= 0.80 && x < 0.90 && tds <= 60) {
      return 'Wet Clean';
    }
  
    // Kondisi 4: Failure Due to Moisture
    if (x < 0.80 && tds <= 60) {
      return 'Failure Due to Moisture';
    }
  
    // Kondisi 5: Critical Contamination
    if (x < 0.90 && tds > 100) {
      return 'Critical Contamination';
    }
  
    // Default (jika tidak sesuai kondisi di atas)
    return 'Unknown';
  }
  