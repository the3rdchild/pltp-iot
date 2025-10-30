// material-ui
import { Typography, Box, Link } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

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

// ==============================|| DASHBOARD CONFIG ||============================== //
// Dashboard scales automatically to fit any screen size (like zoom to fit)
const DASHBOARD_CONFIG = {
  // Base dimensions - dashboard designed for these dimensions
  baseWidth: 1400,          // Design width (1080p reference)
  baseHeight: 900,          // Design height (fits viewport with header/footer)

  // Footer spacing (appears below scaled dashboard)
  footer: {
    marginTop: 'auto',      // Pushes footer to bottom
    paddingTop: 0           // Padding above footer (in theme spacing units: 1 = 8px)
  }
};

function Positioned({ pos, children, center = true }) {
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
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      const data = generateAnalyticData();
      setAnalyticData(data);
      const risk = getRiskPrediction();
      setRiskPrediction(risk);
    }, 3000);

    setAnalyticData(generateAnalyticData());
    setRiskPrediction(getRiskPrediction());

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Calculate scale to fit viewport
  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      // More accurate header/footer spacing calculation
      // Header (Toolbar) ~64px + Footer (py:3 + mt:4 + content) ~80px + buffer ~20px = ~164px
      const viewportHeight = window.innerHeight - 164;

      // Detect orientation
      const isPortrait = viewportHeight > viewportWidth;

      // Adjust base dimensions for mobile portrait mode
      // In portrait, prioritize width scaling to prevent horizontal overflow
      let effectiveBaseWidth = DASHBOARD_CONFIG.baseWidth;
      let effectiveBaseHeight = DASHBOARD_CONFIG.baseHeight;

      if (isPortrait && viewportWidth < 768) {
        // For mobile portrait: use width-based scaling primarily
        // This ensures no horizontal scroll and elements don't overlap horizontally
        effectiveBaseWidth = DASHBOARD_CONFIG.baseWidth;
        effectiveBaseHeight = DASHBOARD_CONFIG.baseHeight * 1; // Allow more vertical space
      }

      // Calculate scale factors
      const scaleX = viewportWidth / effectiveBaseWidth;
      const scaleY = viewportHeight / effectiveBaseHeight;

      // Use the smaller scale to ensure everything fits
      const newScale = Math.min(scaleX, scaleY, 1); // Max scale is 1 (no zoom in)

      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);

    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

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

  const CARD_CONFIG = {
    sensor: { width: 247, height: 190 },
    power: { width: 250, height: 100 },
    ai: { width: 250, height: 110 }
  };

  const TITLE_CONFIG = {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#334155',
    justifyContent: 'left'
  };

  const DESKTOP_POSITIONS = {
    tds: { top: '12%', left: '4%' },
    dryness: { top: '35%', left: '4%' },
    ncg: { top: '58%', left: '4%' },
    ai: { top: '77%', left: '4%' },
    pressure: { top: '30%', left: '37%' },
    temperature: { top: '53.5%', left: '37%' },
    flow: { top: '77%', left: '37%' },
    activePower: { top: '50%', left: '64%' },
    voltage: { top: '64%', left: '64%' },
    current: { top: '78%', left: '64%' },
    reactivePower: { top: '50%', left: '85%' },
    stSpeed: { top: '64%', left: '85%' }
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

  // Fixed layout - always use desktop positions regardless of screen size
  const POSITIONS = DESKTOP_POSITIONS;

  const IMAGE_CONFIG = {
    width: '980px',  // Fixed width - no responsive scaling
    top: '0%',
    left: '50%',
    opacity: 0.95
  };

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      overflow: 'auto',
      p: 0,
      m: 0
    }}>
      {/* Scaled dashboard content */}
      <Box sx={{
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        overflow: 'hidden',
        p: 0,
        m: 0,
        // Container height should match the scaled content height
        height: `${DASHBOARD_CONFIG.baseHeight * scale}px`,
        transition: 'height 0.3s ease-out'
      }}>
        <Box sx={{
          position: 'relative',
          width: `${DASHBOARD_CONFIG.baseWidth}px`,
          height: `${DASHBOARD_CONFIG.baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.3s ease-out'
        }}>
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
          <line x1="15%" y1="6.8%" x2="22%" y2="6.8%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="15%" y1="6.8%" x2="15%" y2="78%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="15%" y1="12%" x2="5%" y2="12%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="15%" y1="35%" x2="5%" y2="35%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="15%" y1="58%" x2="5%" y2="58%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="15%" y1="78%" x2="5%" y2="78%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="49%" y1="7%" x2="49%" y2="78%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="49%" y1="31%" x2="45%" y2="31%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="49%" y1="55%" x2="45%" y2="55%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="49%" y1="78%" x2="45%" y2="78%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="60%" y1="31%" x2="60%" y2="38%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="60%" y1="38%" x2="74.5%" y2="38%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="74.5%" y1="38%" x2="74.5%" y2="78%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="70%" y1="50%" x2="78%" y2="50%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="70%" y1="64%" x2="78%" y2="64%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="74.4%" y1="78%" x2="70%" y2="78%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />

        </svg>

        <Positioned pos={POSITIONS.tds}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
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
              linkTo="/tds-analytics"
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.dryness}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
            <GaugeCard
              label="Dryness Fractions"
              value={dryness}
              min={94}
              max={100.5}
              unit="%"
              abnormalLow={95}
              warningLow={97}
              warningHigh={99.9}
              abnormalHigh={100}
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.ncg}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
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
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.pressure}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
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
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.temperature}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
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
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.ai}>
          <Box sx={{ width: `${CARD_CONFIG.ai.width}px`, height: `${CARD_CONFIG.ai.height}px` }}>
            <MainCard sx={{ width: '100%', height: '100%' }} contentSX={{ p: 1.5 }}>
              <Box>
                <Link href="#" target="_blank" rel="noopener noreferrer" underline="hover" color="inherit">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={TITLE_CONFIG}>Prediksi Resiko Turbin</Typography>
                    <LaunchIcon sx={{ fontSize: '0.8rem', color: 'text.secondary' }} />
                  </Box>
                </Link>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60px' }}>
                  <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 700, color: predConfig.color, textAlign: 'center', lineHeight: 1 }}>
                    {predConfig.label}
                  </Typography>
                </Box>
              </Box>
            </MainCard>
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.flow}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
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
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.activePower}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="Active Power" value={activePower} unit="MW" status={getPowerStatus(activePower, 30, 50)} linkTo="#" titleConfig={TITLE_CONFIG} />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.voltage}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="Voltage" value={voltage} unit="kV" status="Normal" linkTo="#" titleConfig={TITLE_CONFIG} />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.current}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="Current" value={current} unit="A" status={getPowerStatus(current, 1000, 1500)} linkTo="#" titleConfig={TITLE_CONFIG} />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.reactivePower}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="Reactive Power" value={reactivePower} unit="MVAR" status={getPowerStatus(reactivePower, 2000, 4000)} linkTo="#" titleConfig={TITLE_CONFIG} />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.stSpeed}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard label="S.T Speed" value={stSpeed} unit="rpm" status={getPowerStatus(stSpeed, 3000, 3500)} linkTo="#" titleConfig={TITLE_CONFIG} />
          </Box>
        </Positioned>
        </Box>
      </Box>
    </Box>
  );
}
