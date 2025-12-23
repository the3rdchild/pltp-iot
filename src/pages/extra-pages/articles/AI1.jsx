import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Slider,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine
} from 'recharts';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const AI1 = () => {
  // ========== SENSOR RANGES & CONFIG ==========
  const sensorRanges = {
    temperature: { min: 150, max: 300, normal: [180, 250], unit: '°C', label: 'Temperature' },
    pressure: { min: 5, max: 30, normal: [10, 25], unit: 'bar', label: 'Pressure' },
    flow_rate: { min: 100, max: 300, normal: [140, 280], unit: 't/h', label: 'Flow Rate' },
    gen_voltage: { min: 12, max: 18, normal: [13, 17], unit: 'kV', label: 'Generator Voltage' },
    gen_reactive_power: { min: 5, max: 20, normal: [6, 18], unit: 'MVAR', label: 'Reactive Power' },
    gen_output: { min: 20, max: 60, normal: [25, 55], unit: 'MW', label: 'Generator Output' },
    gen_power_factor: { min: 0.85, max: 1.0, normal: [0.9, 0.98], unit: '', label: 'Power Factor' },
    gen_frequency: { min: 49.5, max: 50.5, normal: [49.8, 50.2], unit: 'Hz', label: 'Frequency' },
    speed_detection: { min: 2900, max: 3100, normal: [2950, 3100], unit: 'rpm', label: 'Speed' },
    MCV_L: { min: 40, max: 100, normal: [45, 95], unit: '%', label: 'MCV Left' },
    MCV_R: { min: 40, max: 100, normal: [45, 95], unit: '%', label: 'MCV Right' },
    TDS: { min: 300, max: 1200, normal: [400, 1000], unit: 'ppm', label: 'TDS' }
  };

  // ========== PRESET SCENARIOS ==========
  const presets = {
    normal: {
      temperature: 215,
      pressure: 17.5,
      flow_rate: 210,
      gen_voltage: 15,
      gen_reactive_power: 12,
      gen_output: 40,
      gen_power_factor: 0.94,
      gen_frequency: 50.0,
      speed_detection: 3025,
      MCV_L: 70,
      MCV_R: 70,
      TDS: 700
    },
    warning: {
      temperature: 265,
      pressure: 24,
      flow_rate: 275,
      gen_voltage: 16.5,
      gen_reactive_power: 17,
      gen_output: 52,
      gen_power_factor: 0.91,
      gen_frequency: 50.15,
      speed_detection: 3080,
      MCV_L: 90,
      MCV_R: 88,
      TDS: 950
    },
    critical: {
      temperature: 285,
      pressure: 27,
      flow_rate: 290,
      gen_voltage: 17.5,
      gen_reactive_power: 19,
      gen_output: 58,
      gen_power_factor: 0.88,
      gen_frequency: 50.35,
      speed_detection: 3095,
      MCV_L: 97,
      MCV_R: 96,
      TDS: 1150
    }
  };

  // ========== STATE ==========
  const [sensorValues, setSensorValues] = useState(presets.normal);
  const [predictionResult, setPredictionResult] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // ========== HELPER FUNCTIONS ==========
  const calculateDeviation = (value, normalMin, normalMax) => {
    const midPoint = (normalMin + normalMax) / 2;
    const range = normalMax - normalMin;
    
    if (value >= normalMin && value <= normalMax) {
      const distanceFromMid = Math.abs(value - midPoint);
      const normalizedDistance = distanceFromMid / (range / 2);
      return normalizedDistance * 0.3;
    }
    
    if (value < normalMin) {
      const rawDeviation = (normalMin - value) / normalMin;
      return Math.min(1, 0.3 + rawDeviation * 2);
    }
    
    const rawDeviation = (value - normalMax) / normalMax;
    return Math.min(1, 0.3 + rawDeviation * 2);
  };

  const isInNormalRange = (sensor, value) => {
    const range = sensorRanges[sensor].normal;
    return value >= range[0] && value <= range[1];
  };

  const calculateAnomalyScore = (sensors) => {
    let deviationCount = 0;
    Object.keys(sensorRanges).forEach(key => {
      const range = sensorRanges[key].normal;
      if (sensors[key] < range[0] || sensors[key] > range[1]) {
        deviationCount++;
      }
    });
    return -0.1 - (deviationCount * 0.15);
  };

  const estimateFailure = (riskScore) => {
    if (riskScore > 0.8) return Math.max(1, Math.floor((1 - riskScore) * 12));
    if (riskScore > 0.6) return Math.max(3, Math.floor((1 - riskScore) * 24));
    return Math.max(12, Math.floor((1 - riskScore) * 48));
  };

  // ========== AI #1a: CURRENT RISK PREDICTION ==========
  const predictCurrentRisk = (sensors) => {
    let riskScore = 0;

    riskScore += calculateDeviation(sensors.pressure, 10, 25) * 0.18;
    riskScore += calculateDeviation(sensors.gen_output, 25, 55) * 0.15;
    riskScore += calculateDeviation(sensors.temperature, 180, 250) * 0.14;
    riskScore += calculateDeviation(sensors.flow_rate, 140, 280) * 0.12;
    riskScore += calculateDeviation(sensors.TDS, 400, 1000) * 0.11;
    riskScore += calculateDeviation(sensors.gen_voltage, 13, 17) * 0.09;
    riskScore += calculateDeviation(sensors.MCV_L, 45, 95) * 0.08;
    riskScore += calculateDeviation(sensors.MCV_R, 45, 95) * 0.08;
    riskScore += calculateDeviation(sensors.gen_frequency, 49.8, 50.2) * 0.05;

    riskScore = Math.min(1.0, riskScore);

    let status, color, icon;
    if (riskScore < 0.05) {
      status = 'NORMAL';
      color = '#48bb78';
      icon = <CheckIcon sx={{ fontSize: 40, color: '#48bb78' }} />;
    } else if (riskScore < 0.75) {
      status = 'WARNING';
      color = '#f59e0b';
      icon = <WarningIcon sx={{ fontSize: 40, color: '#f59e0b' }} />;
    } else {
      status = 'CRITICAL';
      color = '#dc2626';
      icon = <ErrorIcon sx={{ fontSize: 40, color: '#dc2626' }} />;
    }

    const anomalyScore = calculateAnomalyScore(sensors);
    const anomalyDetected = anomalyScore < -0.5;

    return {
      riskScore,
      riskPercentage: riskScore * 100,
      status,
      color,
      icon,
      anomalyDetected,
      anomalyScore,
      estimatedFailureMonths: estimateFailure(riskScore)
    };
  };

  // ========== AI #1b: 30-DAY FORECAST ==========
  const forecastRisk = (currentRisk, sensors) => {
    const forecast = [];
    let currentScore = currentRisk.riskScore;

    for (let day = 1; day <= 30; day++) {
      const trend = currentScore > 0.3 ? 0.01 : 0.005;
      const noise = (Math.random() - 0.5) * 0.02;
      currentScore = Math.min(1.0, Math.max(0, currentScore + trend + noise));

      const uncertainty = 0.05 * (day / 30);

      forecast.push({
        day,
        riskScore: currentScore,
        lowerBound: Math.max(0, currentScore - uncertainty),
        upperBound: Math.min(1, currentScore + uncertainty),
        status: currentScore < 0.05 ? 'normal' : (currentScore < 0.75 ? 'warning' : 'critical')
      });
    }

    return forecast;
  };

  // ========== EVENT HANDLERS ==========
  const updateSensor = (sensor, value) => {
    setSensorValues(prev => ({
      ...prev,
      [sensor]: value
    }));
  };

  const loadPreset = (presetName) => {
    setSensorValues(presets[presetName]);
    setPredictionResult(null);
    setForecast([]);
  };

  const handlePredict = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const currentRisk = predictCurrentRisk(sensorValues);
      const riskForecast = forecastRisk(currentRisk, sensorValues);
      
      setPredictionResult(currentRisk);
      setForecast(riskForecast);
      setIsCalculating(false);
    }, 800);
  };

  // ========== RENDER ==========
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
          AI #1: Risk Prediction System
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Sistem prediksi risiko kerusakan turbin menggunakan <strong>Random Forest</strong> untuk analisis real-time 
          dan <strong>LSTM</strong> untuk forecasting 30 hari ke depan
        </Typography>
      </Box>

      {/* ========== INTERACTIVE SIMULATOR ========== */}
      <Paper elevation={3} sx={{ p: 4, mb: 6, bgcolor: '#f8fafc', borderRadius: 3 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            🎮 Interactive Risk Simulator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ubah parameter sensor di bawah untuk melihat prediksi risiko secara real-time
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* LEFT: Input Panel */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ minHeight: 700 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                📊 Sensor Parameters
              </Typography>
              
              {/* Preset Buttons */}
              <ButtonGroup fullWidth sx={{ mb: 3 }}>
                <Button 
                  variant={JSON.stringify(sensorValues) === JSON.stringify(presets.normal) ? 'contained' : 'outlined'}
                  onClick={() => loadPreset('normal')}
                  sx={{ bgcolor: JSON.stringify(sensorValues) === JSON.stringify(presets.normal) ? '#48bb78' : 'transparent' }}
                >
                  ✓ Normal
                </Button>
                <Button 
                  variant={JSON.stringify(sensorValues) === JSON.stringify(presets.warning) ? 'contained' : 'outlined'}
                  onClick={() => loadPreset('warning')}
                  sx={{ bgcolor: JSON.stringify(sensorValues) === JSON.stringify(presets.warning) ? '#f59e0b' : 'transparent' }}
                >
                  ⚠ Warning
                </Button>
                <Button 
                  variant={JSON.stringify(sensorValues) === JSON.stringify(presets.critical) ? 'contained' : 'outlined'}
                  onClick={() => loadPreset('critical')}
                  sx={{ bgcolor: JSON.stringify(sensorValues) === JSON.stringify(presets.critical) ? '#dc2626' : 'transparent' }}
                >
                  ⛔ Critical
                </Button>
              </ButtonGroup>
            </Box>

            {/* Sliders - 2 COLUMNS */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.keys(sensorRanges).map((sensor) => {
                const config = sensorRanges[sensor];
                const value = sensorValues[sensor];
                const inRange = isInNormalRange(sensor, value);

                return (
                  <Grid key={sensor} size={{ xs: 6 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                          {config.label}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: inRange ? '#48bb78' : '#dc2626'
                          }}
                        >
                          {value.toFixed(1)} {config.unit}
                        </Typography>
                      </Box>
                      <Slider
                        value={value}
                        onChange={(e, val) => updateSensor(sensor, val)}
                        min={config.min}
                        max={config.max}
                        step={sensor === 'gen_power_factor' ? 0.01 : 0.1}
                        marks={[
                          { value: config.normal[0], label: '' },
                          { value: config.normal[1], label: '' }
                        ]}
                        valueLabelDisplay="auto"
                        sx={{
                          color: inRange ? '#48bb78' : '#dc2626',
                          '& .MuiSlider-track': {
                            height: 5
                          },
                          '& .MuiSlider-thumb': {
                            width: 14,
                            height: 14
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Predict Button */}
            <Button 
              variant="contained" 
              size="large" 
              fullWidth
              onClick={handlePredict}
              disabled={isCalculating}
              sx={{ 
                mt: 2, 
                py: 1.5,
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1d4ed8' }
              }}
            >
              {isCalculating ? 'Calculating...' : 'Predict Risk'}
            </Button>
          </Grid>

          {/* RIGHT: Output Panel */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ minHeight: 700, display: 'flex', flexDirection: 'column' }}>
            {predictionResult ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Current Risk Display */}
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: `3px solid ${predictionResult.color}`
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    AI #1a: Current Risk Assessment
                  </Typography>
                  
                  {/* LAYOUT HORIZONTAL */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    {/* LEFT: Circular Progress */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={predictionResult.riskPercentage}
                          size={160}
                          thickness={6}
                          sx={{ color: predictionResult.color }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {predictionResult.icon}
                          <Typography variant="h4" sx={{ fontWeight: 700, color: predictionResult.color }}>
                            {predictionResult.riskPercentage.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>

                      <Chip 
                        label={predictionResult.status}
                        sx={{ 
                          fontSize: 16,
                          fontWeight: 600,
                          bgcolor: predictionResult.color,
                          color: 'white',
                          mt: 2
                        }}
                      />
                    </Box>

                    {/* RIGHT: Info */}
                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                      <Box sx={{ mb: 2 }}>
                        {predictionResult.anomalyDetected ? (
                          <Alert severity="warning" sx={{ fontSize: 12 }}>
                            ⚠️ Anomaly Detected (Score: {predictionResult.anomalyScore.toFixed(2)})
                          </Alert>
                        ) : (
                          <Alert severity="success" sx={{ fontSize: 12 }}>
                            ✓ No Anomaly Detected
                          </Alert>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        📅 Estimated time to failure: <strong>{predictionResult.estimatedFailureMonths} months</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* 30-Day Forecast Chart */}
                <Paper elevation={2} sx={{ p: 3, bgcolor: 'white', borderRadius: 2, flex: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    AI #1b: 30-Day Risk Forecast
                  </Typography>
                  
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={forecast} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="day" 
                        label={{ value: 'Days Ahead', position: 'insideBottom', offset: -5 }}
                        stroke="#64748b"
                      />
                      <YAxis 
                        label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
                        domain={[0, 1]}
                        stroke="#64748b"
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                        formatter={(value) => value.toFixed(3)}
                      />
                      
                      <Area 
                        type="monotone" 
                        dataKey="upperBound" 
                        stroke="none" 
                        fill="#93c5fd" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="lowerBound" 
                        stroke="none" 
                        fill="#93c5fd" 
                        fillOpacity={0.3}
                      />
                      
                      <Line 
                        type="monotone" 
                        dataKey="riskScore" 
                        stroke="#2563eb" 
                        strokeWidth={3}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                        animationDuration={1000}
                      />
                      
                      <ReferenceLine 
                        y={0.05} 
                        stroke="#48bb78" 
                        strokeDasharray="5 5"
                      />
                      <ReferenceLine 
                        y={0.75} 
                        stroke="#dc2626" 
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Threshold Info - ALIGNED */}
                  <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <svg width="24" height="3">
                        <line x1="0" y1="1.5" x2="24" y2="1.5" stroke="#48bb78" strokeWidth="2" strokeDasharray="3 3" />
                      </svg>
                      <Typography variant="caption" sx={{ fontSize: 10, color: '#48bb78', fontWeight: 600 }}>
                        Normal (&lt;0.05)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <svg width="24" height="3">
                        <line x1="0" y1="1.5" x2="24" y2="1.5" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 3" />
                      </svg>
                      <Typography variant="caption" sx={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>
                        Critical (&gt;0.75)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Forecast Summary */}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Day 7</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {forecast[6]?.riskScore.toFixed(2)} ({forecast[6]?.status})
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Day 15</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {forecast[14]?.riskScore.toFixed(2)} ({forecast[14]?.status})
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Day 30</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {forecast[29]?.riskScore.toFixed(2)} ({forecast[29]?.status})
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  flex: 1,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#e2e8f0',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center'
                }}
              >
                <Box>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    👈 Adjust sensors & click Predict
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hasil prediksi akan muncul di sini
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* ========== PENJELASAN AI #1a ========== */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
          🤖 AI #1a: Current Risk Assessment
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
          Sistem ini menggunakan <strong>Random Forest Classifier</strong> untuk menganalisis kondisi turbin saat ini 
          berdasarkan 12 parameter sensor. Random Forest bekerja seperti "voting system" dari ratusan decision trees 
          yang masing-masing memberikan prediksi, lalu hasilnya digabungkan untuk menghasilkan prediksi final yang lebih akurat.
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
          <strong>Output yang dihasilkan:</strong>
        </Typography>
        <Box component="ul" sx={{ color: '#475569', lineHeight: 1.8, pl: 4 }}>
          <li><strong>Risk Score (0-100%):</strong> Probabilitas terjadinya kerusakan dalam waktu dekat</li>
          <li><strong>Status:</strong> Normal (&lt;5%), Warning (5-75%), atau Critical (&gt;75%)</li>
          <li><strong>Anomaly Detection:</strong> Menggunakan Isolation Forest untuk mendeteksi pola tidak normal yang mungkin belum pernah terjadi sebelumnya</li>
          <li><strong>Estimated Failure Time:</strong> Perkiraan berapa bulan lagi turbin akan mengalami masalah serius</li>
        </Box>
        <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
          Parameter dengan pengaruh terbesar: <strong>Pressure (18%)</strong>, <strong>Generator Output (15%)</strong>, 
          dan <strong>Temperature (14%)</strong>. Artinya, perubahan pada parameter ini paling berdampak pada risk score.
        </Typography>
      </Box>

      {/* ========== PENJELASAN AI #1b ========== */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
          📈 AI #1b: 30-Day Risk Forecasting
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
          Berbeda dengan AI #1a yang hanya melihat kondisi "sekarang", AI #1b menggunakan <strong>LSTM (Long Short-Term Memory)</strong> 
          untuk memprediksi bagaimana risiko akan berubah dalam 30 hari ke depan. LSTM adalah jenis neural network yang bisa 
          "mengingat" pola historis dan memprediksi trend masa depan.
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
          <strong>Kenapa pakai LSTM, bukan Random Forest?</strong> Karena Random Forest bagus untuk snapshot (foto satu waktu), 
          tapi tidak bisa melihat "cerita" dari data time-series. LSTM bisa menangkap pola seperti "jika pressure naik terus 
          selama 3 hari, biasanya akan terjadi X dalam 2 minggu ke depan".
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
          <strong>Cara kerja forecasting:</strong> LSTM menganalisis historical risk scores 30 hari terakhir, lalu memprediksi 
          30 hari ke depan secara rekursif (hari ke-1 dipakai untuk prediksi hari ke-2, dst). Area berwarna biru di chart 
          menunjukkan "confidence interval" - semakin jauh prediksi, semakin lebar intervalnya karena uncertainty meningkat.
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
          <strong>Use case praktis:</strong> AI #1a untuk <em>immediate alert</em> ("turbine dalam bahaya sekarang!"), 
          sedangkan AI #1b untuk <em>maintenance planning</em> ("dalam 2 minggu risiko akan naik, schedule maintenance sekarang").
        </Typography>
      </Box>

      {/* ========== KESIMPULAN ========== */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
          💡 Kesimpulan
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
          Sistem AI #1 memberikan <strong>two-layer protection</strong>: deteksi real-time (AI #1a) untuk mencegah kerusakan 
          mendadak, dan forecasting (AI #1b) untuk perencanaan maintenance yang lebih efektif. Kombinasi kedua AI ini 
          membantu operator PLTP mengambil keputusan yang lebih proaktif dan data-driven.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Catatan:</strong> Simulator di atas menggunakan simplified logic untuk demo purposes. 
          Model AI real di production menggunakan training data dari ribuan jam operasional turbin dan 
          lebih kompleks dalam feature engineering-nya.
        </Alert>
      </Box>
    </Container>
  );
};

export default AI1;