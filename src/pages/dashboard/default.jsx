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

function Positioned({ pos, children, center = true }) {
  // pos: { top: '33%', left: '20%' } (strings allowed)
  // center: if true, interpret pos as center anchor (apply translate -50%)
  return (
    <Box
      sx={{
        position: 'absolute',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        zIndex: 2,
        pointerEvents: 'auto',
        transform: center ? 'translate(-50%, -50%)' : undefined
      }}
    >
      {children}
    </Box>
  );
}

export default function DashboardDefault() {
  const [analyticData, setAnalyticData] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState('Ideal');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

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

    // resize listener for responsiveness
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Default values (fallback)
  const pressure = analyticData?.pressure ?? 1437;
  const temperature = analyticData?.temperature ?? 131;
  const flow = analyticData?.flow ?? 298;
  const tds = analyticData?.tds ?? 6.8;
  const dryness = analyticData?.dryness ?? 99.0;
  const ncg = analyticData?.ncg ?? 8.3;

  const activePower = analyticData?.activePower ?? 25.46;
  const reactivePower = analyticData?.reactivePower ?? 4421;
  const voltage = analyticData?.voltage ?? 13.86;
  const stSpeed = analyticData?.stSpeed ?? 3598;
  const current = analyticData?.current ?? 901.3;

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

  // ================================================================
  // Dashboard configuration
  // CARD_CONFIG: widths/heights are explicit px values for inner card sizing
  const CARD_CONFIG = {
    sensor: { width: 220, height: 120 },
    power: { width: 220, height: 120 },
    ai: { width: 180, height: 110 }
  };

  // GAUGE_CONFIG: fraction of card to allocate to gauge rendering
  const GAUGE_CONFIG = {
    outerPadding: 0,
    topPadding: 20,
    bottomPadding: -50,
    barScale: 1,
    baseMaxWidth: 220,
    baseMaxHeight: 120
  };
  
  const IMAGE_CONFIG = {
    width: '70%',
    top: '0%',
    left: '50%',
    opacity: 0.95
  };

  const DESKTOP_POSITIONS = {
    tds: { top: '6%', left: '8%' },
    dryness: { top: '36%', left: '8%' },
    ncg: { top: '66%', left: '8%' },
    pressure: { top: '36%', left: '28%' },
    temperature: { top: '66%', left: '28%' },
    ai: { top: '86%', left: '8%' },
    flow: { top: '66%', left: '48%' },
    activePower: { top: '36%', left: '68%' },
    voltage: { top: '66%', left: '68%' },
    current: { top: '86%', left: '68%' },
    reactivePower: { top: '36%', left: '88%' },
    stSpeed: { top: '66%', left: '88%' }
  };

  const MOBILE_POSITIONS = {
    tds: { top: '4%', left: '10%' },
    dryness: { top: '18%', left: '10%' },
    ncg: { top: '32%', left: '10%' },
    pressure: { top: '46%', left: '10%' },
    temperature: { top: '60%', left: '10%' },
    flow: { top: '74%', left: '10%' },
    ai: { top: '88%', left: '10%' },
    activePower: { top: '102%', left: '10%' },
    reactivePower: { top: '116%', left: '10%' },
    voltage: { top: '130%', left: '10%' },
    stSpeed: { top: '144%', left: '10%' },
    current: { top: '158%', left: '10%' }
  };

  const isMobile = windowWidth < 900;
  const POSITIONS = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;

  const getGaugeSizeForCard = (cardType = 'sensor') => {
    const c = CARD_CONFIG[cardType] || CARD_CONFIG.sensor;
  
    // canvas should fill the card area (minus any card chrome); use full card width
    // ensure px numbers
    const canvasW = Math.min(c.width, GAUGE_CONFIG.baseMaxWidth);
    const canvasH = Math.min(c.height, GAUGE_CONFIG.baseMaxHeight);
  
    // compute inner drawing box (where the arc and bar are centered)
    const innerW = Math.max(0, canvasW - (GAUGE_CONFIG.outerPadding * 2));
    const innerH = Math.max(0, canvasH - (GAUGE_CONFIG.topPadding + GAUGE_CONFIG.bottomPadding));
  
    // effective drawing radius/sizing uses barScale relative to inner box min dimension
    const effectiveSize = Math.round(Math.min(innerW, innerH) * GAUGE_CONFIG.barScale);
  
    // return canvas size (DOM attrs) and drawing layout hints
    return {
      gaugeWidth: canvasW,
      gaugeHeight: canvasH,
      innerWidth: innerW,
      innerHeight: innerH,
      drawSize: effectiveSize,
      outerPadding: GAUGE_CONFIG.outerPadding,
      topPadding: GAUGE_CONFIG.topPadding,
      bottomPadding: GAUGE_CONFIG.bottomPadding,
      barScale: GAUGE_CONFIG.barScale
    };
  };

  const sensorGauge = getGaugeSizeForCard('sensor');
  const powerGauge = getGaugeSizeForCard('power');
  const aiGauge = getGaugeSizeForCard('ai');

  // ================================================================

  return (
    <Box sx={{ position: 'relative', width: '100%', pb: 4 }}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: '1400px', mx: 'auto', minHeight: '900px' }}>
        {/* Background Image */}
        <Box
          component="img"
          src={mainImage}
          alt="VENTURI System Diagram"
          sx={{
            position: 'absolute',
            top: IMAGE_CONFIG.top,
            left: IMAGE_CONFIG.left,
            transform: IMAGE_CONFIG.left === '50%' ? 'translateX(-50%)' : undefined,
            width: IMAGE_CONFIG.width,
            height: 'auto',
            zIndex: 0,
            opacity: IMAGE_CONFIG.opacity
          }}
        />

        {/* SVG connector lines */}
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
          <line x1="12%" y1="15%" x2="28%" y2="8%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="12%" y1="45%" x2="25%" y2="20%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="12%" y1="75%" x2="23%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="30%" y1="45%" x2="38%" y2="25%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="30%" y1="75%" x2="40%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="48%" y1="75%" x2="45%" y2="40%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="12%" y1="90%" x2="50%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="70%" y1="45%" x2="65%" y2="25%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="88%" y1="45%" x2="75%" y2="25%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="70%" y1="75%" x2="68%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="88%" y1="75%" x2="72%" y2="35%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="70%" y1="90%" x2="70%" y2="40%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
        </svg>

        {/* Cards using Positioned + inner size-box */}

        {/* TDS */}
        <Positioned pos={POSITIONS.tds}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              gaugeWidth={sensorGauge.gaugeWidth}
              gaugeHeight={sensorGauge.gaugeHeight}
              drawSize={sensorGauge.drawSize}
              outerPadding={sensorGauge.outerPadding}
              topPadding={sensorGauge.topPadding}
              bottomPadding={sensorGauge.bottomPadding}
              barScale={sensorGauge.barScale}
            />
          </Box>
        </Positioned>

        {/* Dryness */}
        <Positioned pos={POSITIONS.dryness}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              gaugeWidth={sensorGauge.gaugeWidth}
              gaugeHeight={sensorGauge.gaugeHeight}
              drawSize={sensorGauge.drawSize}
              outerPadding={sensorGauge.outerPadding}
              topPadding={sensorGauge.topPadding}
              bottomPadding={sensorGauge.bottomPadding}
              barScale={sensorGauge.barScale}
            />
          </Box>
        </Positioned>

        {/* NCG */}
        <Positioned pos={POSITIONS.ncg}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              gaugeWidth={sensorGauge.gaugeWidth}
              gaugeHeight={sensorGauge.gaugeHeight}
              drawSize={sensorGauge.drawSize}
              outerPadding={sensorGauge.outerPadding}
              topPadding={sensorGauge.topPadding}
              bottomPadding={sensorGauge.bottomPadding}
              barScale={sensorGauge.barScale}
            />
          </Box>
        </Positioned>

        {/* Pressure */}
        <Positioned pos={POSITIONS.pressure}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              gaugeWidth={sensorGauge.gaugeWidth}
              gaugeHeight={sensorGauge.gaugeHeight}
              drawSize={sensorGauge.drawSize}
              outerPadding={sensorGauge.outerPadding}
              topPadding={sensorGauge.topPadding}
              bottomPadding={sensorGauge.bottomPadding}
              barScale={sensorGauge.barScale}
            />
          </Box>
        </Positioned>

        {/* Temperature */}
        <Positioned pos={POSITIONS.temperature}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              gaugeWidth={sensorGauge.gaugeWidth}
              gaugeHeight={sensorGauge.gaugeHeight}
              drawSize={sensorGauge.drawSize}
              outerPadding={sensorGauge.outerPadding}
              topPadding={sensorGauge.topPadding}
              bottomPadding={sensorGauge.bottomPadding}
              barScale={sensorGauge.barScale}
            />
          </Box>
        </Positioned>

        {/* AI Prediction */}
        <Positioned pos={POSITIONS.ai}>
          <Box sx={{ width: `${CARD_CONFIG.ai.width}px`, height: `${CARD_CONFIG.ai.height}px` }}>
            <MainCard contentSX={{ p: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: '0.75rem' }}>
                  Prediksi Resiko Turbin
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60px' }}>
                  <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 700, color: predConfig.color, textAlign: 'center', lineHeight: 1 }}>
                    {predConfig.label}
                  </Typography>
                </Box>
              </Box>
            </MainCard>
          </Box>
        </Positioned>

        {/* Flow */}
        <Positioned pos={POSITIONS.flow}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              gaugeWidth={sensorGauge.gaugeWidth}
              gaugeHeight={sensorGauge.gaugeHeight}
              drawSize={sensorGauge.drawSize}
              outerPadding={sensorGauge.outerPadding}
              topPadding={sensorGauge.topPadding}
              bottomPadding={sensorGauge.bottomPadding}
              barScale={sensorGauge.barScale}
            />
          </Box>
        </Positioned>

        {/* Active Power */}
        <Positioned pos={POSITIONS.activePower}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="ACTIVE POWER" value={activePower} unit="MW" status={getPowerStatus(activePower, 30, 50)} />
          </Box>
        </Positioned>

        {/* Voltage */}
        <Positioned pos={POSITIONS.voltage}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="Voltage" value={voltage} unit="kV" status="Normal" />
          </Box>
        </Positioned>

        {/* Current */}
        <Positioned pos={POSITIONS.current}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="Current" value={current} unit="A" status={getPowerStatus(current, 1000, 1500)} />
          </Box>
        </Positioned>

        {/* Reactive Power */}
        <Positioned pos={POSITIONS.reactivePower}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="Reactive Power" value={reactivePower} unit="MVAR" status={getPowerStatus(reactivePower, 2000, 4000)} />
          </Box>
        </Positioned>

        {/* ST Speed */}
        <Positioned pos={POSITIONS.stSpeed}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="S.T Speed" value={stSpeed} unit="rpm" status={getPowerStatus(stSpeed, 3000, 3500)} />
          </Box>
        </Positioned>
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
