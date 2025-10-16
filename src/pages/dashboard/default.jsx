// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

//simulasi
import { useState, useEffect } from 'react';
import { generateAnalyticData } from 'data/simulasi';
import { getRiskPrediction } from 'data/riskprediction';

// project imports - Individual Cards
import GaugeCard from 'components/cards/GaugeCard';
import MetricCard from 'components/cards/MetricCard';
import MainCard from 'components/MainCard';

// Image import
import mainImage from './image/main.png';

export default function DashboardDefault() {
  const [analyticData, setAnalyticData] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState('Ideal');

  useEffect(() => {
    // Simulate data fetching
    const interval = setInterval(() => {
      const data = generateAnalyticData();
      setAnalyticData(data);

      const risk = getRiskPrediction();
      setRiskPrediction(risk);
    }, 3000);

    // Initial data
    setAnalyticData(generateAnalyticData());
    setRiskPrediction(getRiskPrediction());

    return () => clearInterval(interval);
  }, []);

  // Default values
  const pressure = analyticData?.pressure || 1437;
  const temperature = analyticData?.temperature || 131;
  const flow = analyticData?.flow || 298;
  const tds = analyticData?.tds || 6.8;
  const dryness = analyticData?.dryness || 99.0;
  const ncg = analyticData?.ncg || 8.3;

  const activePower = analyticData?.activePower || 25.46;
  const reactivePower = analyticData?.reactivePower || 4421;
  const voltage = analyticData?.voltage || 13.86;
  const stSpeed = analyticData?.stSpeed || 3598;
  const current = analyticData?.current || 901.3;

  // Status calculations
  const getPowerStatus = (val, low, high) => {
    if (val < low) return 'Low';
    if (val > high) return 'High';
    return 'Normal';
  };

  const getPredictionConfig = (pred) => {
    switch (pred?.toLowerCase()) {
      case 'ideal':
        return { label: 'Ideal', color: '#22c55e', bgColor: '#22c55e15' };
      case 'warning':
        return { label: 'Warning', color: '#f59e0b', bgColor: '#f59e0b15' };
      case 'abnormal':
        return { label: 'Abnormal', color: '#ef4444', bgColor: '#ef444415' };
      default:
        return { label: 'Ideal', color: '#22c55e', bgColor: '#22c55e15' };
    }
  };

  const predConfig = getPredictionConfig(riskPrediction);

  // ==================== DASHBOARD CONFIGURATION ====================

  // Card Dimensions Configuration
  const CARD_CONFIG = {
    sensor: {
      width: 200,
      height: 120
    },
    power: {
      width: 250,
      height: 150
    },
    ai: {
      width: 160,
      height: 120
    }
  };

  // Gauge Size Configuration (relative to card)
  const GAUGE_CONFIG = {
    width: 140,  // Canvas width
    height: 100  // Canvas height
  };

  // Image Configuration
  const IMAGE_CONFIG = {
    width: '70%',      // Width relative to container
    top: 0,            // Top position
    left: '50%',       // Left position (centered)
    opacity: 0.95      // Image opacity
  };

  // Card Positioning Configuration
  // Desktop positions (percentage based)
  const DESKTOP_POSITIONS = {
    // Left column - Sensors
    tds: { top: '0%', left: '2%' },
    dryness: { top: '33%', left: '2%' },
    ncg: { top: '66%', left: '2%' },

    // Center-left column
    pressure: { top: '33%', left: '20%' },
    temperature: { top: '66%', left: '20%' },

    // Center
    ai: { top: '83%', left: '2%' },
    flow: { top: '66%', left: '38%' },

    // Center-right column - Power
    activePower: { top: '33%', left: '60%' },
    voltage: { top: '66%', left: '60%' },
    current: { top: '83%', left: '60%' },

    // Right column - Power
    reactivePower: { top: '33%', left: '78%' },
    stSpeed: { top: '66%', left: '78%' }
  };

  // Mobile positions (for responsive layout)
  const MOBILE_POSITIONS = {
    // Stack vertically on mobile
    tds: { top: '0%', left: '5%' },
    dryness: { top: '15%', left: '5%' },
    ncg: { top: '30%', left: '5%' },
    pressure: { top: '45%', left: '5%' },
    temperature: { top: '60%', left: '5%' },
    flow: { top: '75%', left: '5%' },
    ai: { top: '90%', left: '5%' },
    activePower: { top: '105%', left: '5%' },
    reactivePower: { top: '120%', left: '5%' },
    voltage: { top: '135%', left: '5%' },
    stSpeed: { top: '150%', left: '5%' },
    current: { top: '165%', left: '5%' }
  };

  // Use desktop positions by default (can be switched based on screen size)
  const POSITIONS = DESKTOP_POSITIONS;

  // ================================================================

  return (
    <Box sx={{ position: 'relative', width: '100%', pb: 4 }}>
      {/* Main Container with Image Background */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '1400px',
        mx: 'auto',
        minHeight: '900px'
      }}>
        {/* Background Image */}
        <Box
          component="img"
          src={mainImage}
          alt="VENTURI System Diagram"
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: 'auto',
            zIndex: 0,
            opacity: 0.95
          }}
        />

        {/* SVG Connector Lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {/* TDS to image */}
          <line x1="12%" y1="15%" x2="28%" y2="8%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* Dryness to image */}
          <line x1="12%" y1="45%" x2="25%" y2="20%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* NCG to image */}
          <line x1="12%" y1="75%" x2="23%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* Pressure to image */}
          <line x1="30%" y1="45%" x2="38%" y2="25%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* Temperature to image */}
          <line x1="30%" y1="75%" x2="40%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* Flow to image */}
          <line x1="48%" y1="75%" x2="45%" y2="40%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* AI to turbine */}
          <line x1="12%" y1="90%" x2="50%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* Active Power to generator */}
          <line x1="70%" y1="45%" x2="65%" y2="25%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* Reactive Power to generator */}
          <line x1="88%" y1="45%" x2="75%" y2="25%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* Voltage to generator */}
          <line x1="70%" y1="75%" x2="68%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* ST Speed to turbine */}
          <line x1="88%" y1="75%" x2="72%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />

          {/* Current to generator */}
          <line x1="70%" y1="90%" x2="70%" y2="40%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
        </svg>

        {/* Cards with Absolute Positioning */}

        {/* Column 1 - Left */}
        {/* TDS */}
        <Box sx={{ position: 'absolute', ...POSITIONS.tds, width: CARD_CONFIG.sensor.width, zIndex: 2 }}>
          <GaugeCard
            label="TDS: Overall"
            value={tds}
            min={0}
            max={10}
            unit="ppm"
            abnormalLow={0}
            warningLow={2}
            warningHigh={8}
            abnormalHigh={9.5}
            linkTo="/tds"
            linkText="*Link ke Page Analytics"
            gaugeWidth={GAUGE_CONFIG.width}
            gaugeHeight={GAUGE_CONFIG.height}
          />
        </Box>

        {/* Dryness */}
        <Box sx={{ position: 'absolute', ...POSITIONS.dryness, width: CARD_CONFIG.sensor.width, zIndex: 2 }}>
          <GaugeCard
            label="Dryness Fractions"
            value={dryness}
            min={80}
            max={100.1}
            unit="%"
            abnormalLow={90}
            warningLow={90}
            warningHigh={99.5}
            abnormalHigh={100}
          />
        </Box>

        {/* NCG */}
        <Box sx={{ position: 'absolute', ...POSITIONS.ncg, width: CARD_CONFIG.sensor.width, zIndex: 2 }}>
          <GaugeCard
            label="NCG"
            value={ncg}
            min={0}
            max={10}
            unit="wt%"
            abnormalLow={0}
            warningLow={2}
            warningHigh={8}
            abnormalHigh={9.5}
          />
        </Box>

        {/* Column 2 - Center Left */}
        {/* Pressure */}
        <Box sx={{ position: 'absolute', ...POSITIONS.pressure, width: CARD_CONFIG.sensor.width, zIndex: 2 }}>
          <GaugeCard
            label="Pressure"
            value={pressure}
            min={222}
            max={1778}
            unit="kPa"
            abnormalLow={222}
            warningLow={444}
            warningHigh={1556}
            abnormalHigh={1778}
          />
        </Box>

        {/* Temperature */}
        <Box sx={{ position: 'absolute', ...POSITIONS.temperature, width: CARD_CONFIG.sensor.width, zIndex: 2 }}>
          <GaugeCard
            label="Temperature"
            value={temperature}
            min={120}
            max={200}
            unit="°C"
            abnormalLow={130}
            warningLow={135}
            warningHigh={150}
            abnormalHigh={190}
          />
        </Box>

        {/* Column 3 - Center */}
        {/* AI Prediction */}
        <Box sx={{ position: 'absolute', ...POSITIONS.ai, width: CARD_CONFIG.ai.width, zIndex: 2 }}>
          <MainCard contentSX={{ p: 1.5 }}>
            <Box>
              {/* Label - Top Left */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontSize: '0.75rem'
                }}
              >
                Prediksi Resiko Turbin
              </Typography>

              {/* Value - Large centered */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60px'
              }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: predConfig.color,
                    textAlign: 'center',
                    lineHeight: 1
                  }}
                >
                  {predConfig.label}
                </Typography>
              </Box>
            </Box>
          </MainCard>
        </Box>

        {/* Flow */}
        <Box sx={{ position: 'absolute', ...POSITIONS.flow, width: CARD_CONFIG.sensor.width, zIndex: 2 }}>
          <GaugeCard
            label="Flow"
            value={flow}
            min={200}
            max={300}
            unit="t/h"
            abnormalLow={200}
            warningLow={220}
            warningHigh={270}
            abnormalHigh={285}
          />
        </Box>

        {/* Column 4 - Center Right */}
        {/* Active Power */}
        <Box sx={{ position: 'absolute', ...POSITIONS.activePower, width: CARD_CONFIG.power.width, zIndex: 2 }}>
          <MetricCard
            label="ACTIVE POWER"
            value={activePower}
            unit="MW"
            status={getPowerStatus(activePower, 30, 50)}
          />
        </Box>

        {/* Voltage */}
        <Box sx={{ position: 'absolute', ...POSITIONS.voltage, width: CARD_CONFIG.power.width, zIndex: 2 }}>
          <MetricCard
            label="Voltage"
            value={voltage}
            unit="kV"
            status="Normal"
          />
        </Box>

        {/* Current */}
        <Box sx={{ position: 'absolute', ...POSITIONS.current, width: CARD_CONFIG.power.width, zIndex: 2 }}>
          <MetricCard
            label="Current"
            value={current}
            unit="A"
            status={getPowerStatus(current, 1000, 1500)}
          />
        </Box>

        {/* Column 5 - Right */}
        {/* Reactive Power */}
        <Box sx={{ position: 'absolute', ...POSITIONS.reactivePower, width: CARD_CONFIG.power.width, zIndex: 2 }}>
          <MetricCard
            label="Reactive Power"
            value={reactivePower}
            unit="MVAR"
            status={getPowerStatus(reactivePower, 2000, 4000)}
          />
        </Box>

        {/* ST Speed */}
        <Box sx={{ position: 'absolute', ...POSITIONS.stSpeed, width: CARD_CONFIG.power.width, zIndex: 2 }}>
          <MetricCard
            label="S.T Speed"
            value={stSpeed}
            unit="rpm"
            status={getPowerStatus(stSpeed, 3000, 3500)}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 3, mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          2025 <strong>SMART</strong> (System Monitoring Analysis Real Time). All Right Reserved.
        </Typography>
      </Box>
    </Box>
  );
}
