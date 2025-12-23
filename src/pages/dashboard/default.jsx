// material-ui
import { Typography, Box, Link, useMediaQuery, useTheme } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import BoltIcon from '@mui/icons-material/Bolt';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';

// react-icons
import { FaBolt } from "react-icons/fa6";
import { RiSpeedUpFill } from "react-icons/ri";
import { TbCircuitResistor } from "react-icons/tb";

import { useState, useEffect } from 'react';

// Real data API hook - test-aware (uses mock data in /test environment)
import { useLiveData } from '../../hooks/useTestAwareLiveData';
import { useLocation } from 'react-router-dom';

// project imports - Individual Cards
import GaugeChart from '../../components/GaugeChart';
import MetricCard from 'components/cards/MetricCard';
import MainCard from 'components/MainCard';
import { getLimitData } from '../../utils/limitData';

// Image import
import mainImage from './image/main.png';

// ==============================|| MOBILE LAYOUT COMPONENT ||============================== //
function MobileLayout({ 
  limitData, 
  liveData, 
  parseValue, 
  getPowerStatus, 
  predConfig,
  TITLE_CONFIG 
}) {
  // Extract values from live API data
  const pressure = parseValue(liveData?.metrics?.pressure?.value, 5.87);
  const temperature = parseValue(liveData?.metrics?.temperature?.value, 165.2);
  const flow = parseValue(liveData?.metrics?.flow_rate?.value, 245.71);
  const tds = parseValue(liveData?.metrics?.tds?.value, 1.0012);
  // Convert dryness to percentage (0.95 -> 95%)
  const dryness = parseValue(liveData?.metrics?.dryness?.value, 95);
  const ncg = parseValue(liveData?.metrics?.ncg?.value, 0.45);
  const activePower = parseValue(liveData?.metrics?.active_power?.value, 32.5);
  const reactivePower = parseValue(liveData?.metrics?.reactive_power?.value, 6.22);
  const voltage = parseValue(liveData?.metrics?.voltage?.value, 13.86);
  const stSpeed = parseValue(liveData?.metrics?.speed?.value, 2998);
  const current = parseValue(liveData?.metrics?.current?.value, 1377.45);

  return (
    <Box sx={{ 
      width: '100%', 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      pb: 4
    }}>
      {/* TDS */}
      <Box sx={{ width: '100%' }}>
        <GaugeChart
          label="TDS: Overall"
          value={tds}
          min={limitData["TDS: Overall"].min}
          max={limitData["TDS: Overall"].max}
          unit={limitData["TDS: Overall"].unit}
          idealHigh={limitData["TDS: Overall"].idealHigh}
          warningHigh={limitData["TDS: Overall"].warningHigh}
          abnormalHigh={limitData["TDS: Overall"].abnormalHigh}
          linkTo="/tds"
          titleConfig={TITLE_CONFIG}
        />
      </Box>

      {/* Dryness */}
      <Box sx={{ width: '100%' }}>
        <GaugeChart
          label="Dryness Fractions"
          value={dryness}
          min={limitData.dryness.min}
          max={limitData.dryness.max}
          unit={limitData.dryness.unit}
          abnormalLow={limitData.dryness.abnormalLow}
          warningLow={limitData.dryness.warningLow}
          idealLow={limitData.dryness.idealLow}
          idealHigh={limitData.dryness.idealHigh}
          warningHigh={limitData.dryness.warningHigh}
          abnormalHigh={limitData.dryness.abnormalHigh}
          linkTo="/dryness"
          titleConfig={TITLE_CONFIG}
        />
      </Box>

      {/* NCG */}
      <Box sx={{ width: '100%' }}>
        <GaugeChart
          label="NCG"
          value={ncg}
          min={limitData.ncg.min}
          max={limitData.ncg.max}
          unit={limitData.ncg.unit}
          idealHigh={limitData.ncg.idealHigh}
          warningHigh={limitData.ncg.warningHigh}
          abnormalHigh={limitData.ncg.abnormalHigh}
          linkTo='/ncg'
          titleConfig={TITLE_CONFIG}
        />
      </Box>

      {/* Pressure */}
      <Box sx={{ width: '100%' }}>
        <GaugeChart
          label="Pressure"
          value={pressure}
          min={limitData.pressure.min}
          max={limitData.pressure.max}
          unit={limitData.pressure.unit}
          abnormalLow={limitData.pressure.abnormalLow}
          warningLow={limitData.pressure.warningLow}
          idealLow={limitData.pressure.idealLow}
          idealHigh={limitData.pressure.idealHigh}
          warningHigh={limitData.pressure.warningHigh}
          abnormalHigh={limitData.pressure.abnormalHigh}
          linkTo='/ptf'
          titleConfig={TITLE_CONFIG}
        />
      </Box>

      {/* Temperature */}
      <Box sx={{ width: '100%' }}>
        <GaugeChart
          label="Temperature"
          value={temperature}
          min={limitData.temperature.min}
          max={limitData.temperature.max}
          unit={limitData.temperature.unit}
          abnormalLow={limitData.temperature.abnormalLow}
          warningLow={limitData.temperature.warningLow}
          idealLow={limitData.temperature.idealLow}
          idealHigh={limitData.temperature.idealHigh}
          warningHigh={limitData.temperature.warningHigh}
          abnormalHigh={limitData.temperature.abnormalHigh}
          linkTo='/ptf'
          titleConfig={TITLE_CONFIG}
        />
      </Box>

      {/* Flow */}
      <Box sx={{ width: '100%' }}>
        <GaugeChart
          label="Flow"
          value={flow}
          min={limitData.flow.min}
          max={limitData.flow.max}
          unit={limitData.flow.unit}
          abnormalLow={limitData.flow.abnormalLow}
          warningLow={limitData.flow.warningLow}
          idealLow={limitData.flow.idealLow}
          idealHigh={limitData.flow.idealHigh}
          warningHigh={limitData.flow.warningHigh}
          abnormalHigh={limitData.flow.abnormalHigh}
          linkTo='/ptf'
          titleConfig={TITLE_CONFIG}
        />
      </Box>

      {/* AI Prediction */}
      <Box sx={{ width: '100%' }}>
        <MainCard sx={{ width: '100%', minHeight: '110px' }} contentSX={{ p: 1.5 }}>
          <Box>
            <Link href="/prediction" target="" rel="noopener noreferrer" underline="hover" color="inherit">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={TITLE_CONFIG}>Prediksi Resiko</Typography>
                <ArrowOutwardIcon sx={{ fontSize: '0.8rem', color: 'text.secondary' }} />
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

      {/* Power Metrics Grid - 2 columns */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 2,
        width: '100%'
      }}>
        {/* Active Power */}
        <Box>
          <MetricCard
            label="Active Power"
            value={activePower}
            unit="MW"
            status={getPowerStatus(activePower, 32, 33)}
            linkTo="#"
            titleConfig={{ ...TITLE_CONFIG, fontSize: '0.875rem' }}
            icon={BoltIcon}
            iconConfig={{ size: 32, color: '#ef4444' }}
          />
        </Box>

        {/* Reactive Power */}
        <Box>
          <MetricCard
            label="Reactive Power"
            value={reactivePower}
            unit="MVAR"
            status={getPowerStatus(reactivePower, 6.0, 6.5)}
            linkTo="#"
            titleConfig={{ ...TITLE_CONFIG, fontSize: '0.875rem' }}
            icon={FaBolt}
            iconConfig={{ size: 20, color: '#8b5cf6' }}
          />
        </Box>

        {/* Voltage */}
        <Box>
          <MetricCard
            label="Voltage"
            value={voltage}
            unit="kV"
            status={getPowerStatus(voltage, 13, 14)}
            linkTo="#"
            titleConfig={{ ...TITLE_CONFIG, fontSize: '0.875rem' }}
            icon={OfflineBoltIcon}
            iconConfig={{ size: 28, color: '#f59e0b' }}
          />
        </Box>

        {/* S.T Speed */}
        <Box>
          <MetricCard
            label="S.T Speed"
            value={stSpeed}
            unit="rpm"
            status={getPowerStatus(stSpeed, 2900, 3100)}
            linkTo="#"
            titleConfig={{ ...TITLE_CONFIG, fontSize: '0.875rem' }}
            icon={RiSpeedUpFill}
            iconConfig={{ size: 28, color: '#22c55e' }}
          />
        </Box>
      </Box>

      {/* Current - Full Width */}
      <Box sx={{ width: '100%' }}>
        <MetricCard
          label="Current"
          value={current}
          unit="A"
          status={getPowerStatus(current, 1300, 1400)}
          linkTo="#"
          titleConfig={TITLE_CONFIG}
          icon={TbCircuitResistor}
          iconConfig={{ size: 32, color: '#3b82f6' }}
        />
      </Box>
    </Box>
  );
}

// ==============================|| DESKTOP LAYOUT COMPONENT ||============================== //
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

function DesktopLayout({ 
  limitData, 
  liveData, 
  parseValue, 
  getPowerStatus, 
  predConfig,
  TITLE_CONFIG,
  scale,
  DASHBOARD_CONFIG 
}) {
  // Extract values from live API data
  const pressure = parseValue(liveData?.metrics?.pressure?.value, 5.87);
  const temperature = parseValue(liveData?.metrics?.temperature?.value, 165.2);
  const flow = parseValue(liveData?.metrics?.flow_rate?.value, 245.71);
  const tds = parseValue(liveData?.metrics?.tds?.value, 1.0012);
  // Convert dryness to percentage (0.95 -> 95%)
  const dryness = parseValue(liveData?.metrics?.dryness?.value, 95);
  const ncg = parseValue(liveData?.metrics?.ncg?.value, 0.45);
  const activePower = parseValue(liveData?.metrics?.active_power?.value, 32.5);
  const reactivePower = parseValue(liveData?.metrics?.reactive_power?.value, 6.22);
  const voltage = parseValue(liveData?.metrics?.voltage?.value, 13.86);
  const stSpeed = parseValue(liveData?.metrics?.speed?.value, 2998);
  const current = parseValue(liveData?.metrics?.current?.value, 1377.45);

  const CARD_CONFIG = {
    sensor: { width: 247, height: 190 },
    power: { width: 250, height: 135 },
    ai: { width: 250, height: 110 }
  };

  const POSITIONS = {
    tds: { top: '12%', left: '4%' },
    dryness: { top: '35%', left: '4%' },
    ncg: { top: '58%', left: '4%' },
    ai: { top: '77%', left: '4%' },
    pressure: { top: '30%', left: '37%' },
    temperature: { top: '53.5%', left: '37%' },
    flow: { top: '77%', left: '37%' },
    activePower: { top: '50%', left: '64%' },
    voltage: { top: '66%', left: '64%' },
    current: { top: '82%', left: '64%' },
    reactivePower: { top: '50%', left: '85%' },
    stSpeed: { top: '66%', left: '85%' }
  };

  const IMAGE_CONFIG = {
    width: '980px',
    top: '0%',
    left: '50%',
    opacity: 1
  };

  return (
    <Box sx={{
      display: 'flex',
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      width: '100%',
      overflow: 'hidden',
      p: 0,
      m: 0,
      position: 'relative',
      height: `${DASHBOARD_CONFIG.baseHeight * scale}px`,
      transition: 'height 0.3s ease-out'
    }}>
      <Box sx={{
        position: 'absolute',
        left: `calc(50% - ${((DASHBOARD_CONFIG.baseWidth / 2) - 40) * scale}px)`,
        width: `${DASHBOARD_CONFIG.baseWidth}px`,
        height: `${DASHBOARD_CONFIG.baseHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        transition: 'transform 0.3s ease-out, left 0.3s ease-out'
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
          <line x1="74.5%" y1="38%" x2="74.5%" y2="83%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="70%" y1="50%" x2="78%" y2="50%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="70%" y1="66%" x2="78%" y2="66%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="74.4%" y1="83%" x2="70%" y2="83%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
        </svg>

        <Positioned pos={POSITIONS.tds}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
            <GaugeChart
              label="TDS: Overall"
              value={tds}
              min={limitData["TDS: Overall"].min}
              max={limitData["TDS: Overall"].max}
              unit={limitData["TDS: Overall"].unit}
              idealHigh={limitData["TDS: Overall"].idealHigh}
              warningHigh={limitData["TDS: Overall"].warningHigh}
              abnormalHigh={limitData["TDS: Overall"].abnormalHigh}
              linkTo="/tds"
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.dryness}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
            <GaugeChart
              label="Dryness Fractions"
              value={dryness}
              min={limitData.dryness.min}
              max={limitData.dryness.max}
              unit={limitData.dryness.unit}
              abnormalLow={limitData.dryness.abnormalLow}
              warningLow={limitData.dryness.warningLow}
              idealLow={limitData.dryness.idealLow}
              idealHigh={limitData.dryness.idealHigh}
              warningHigh={limitData.dryness.warningHigh}
              abnormalHigh={limitData.dryness.abnormalHigh}
              linkTo="/dryness"
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.ncg}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
            <GaugeChart
              label="NCG"
              value={ncg}
              min={limitData.ncg.min}
              max={limitData.ncg.max}
              unit={limitData.ncg.unit}
              idealHigh={limitData.ncg.idealHigh}
              warningHigh={limitData.ncg.warningHigh}
              abnormalHigh={limitData.ncg.abnormalHigh}
              linkTo='/ncg'
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.pressure}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
            <GaugeChart
              label="Pressure"
              value={pressure}
              min={limitData.pressure.min}
              max={limitData.pressure.max}
              unit={limitData.pressure.unit}
              abnormalLow={limitData.pressure.abnormalLow}
              warningLow={limitData.pressure.warningLow}
              idealLow={limitData.pressure.idealLow}
              idealHigh={limitData.pressure.idealHigh}
              warningHigh={limitData.pressure.warningHigh}
              abnormalHigh={limitData.pressure.abnormalHigh}
              linkTo='/ptf'
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.temperature}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
            <GaugeChart
              label="Temperature"
              value={temperature}
              min={limitData.temperature.min}
              max={limitData.temperature.max}
              unit={limitData.temperature.unit}
              abnormalLow={limitData.temperature.abnormalLow}
              warningLow={limitData.temperature.warningLow}
              idealLow={limitData.temperature.idealLow}
              idealHigh={limitData.temperature.idealHigh}
              warningHigh={limitData.temperature.warningHigh}
              abnormalHigh={limitData.temperature.abnormalHigh}
              linkTo='/ptf'
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.ai}>
          <Box sx={{ width: `${CARD_CONFIG.ai.width}px`, height: `${CARD_CONFIG.ai.height}px` }}>
            <MainCard sx={{ width: '100%', height: '100%' }} contentSX={{ p: 1.5 }}>
              <Box>
                <Link href="/prediction" target="" rel="noopener noreferrer" underline="hover" color="inherit">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={TITLE_CONFIG}>Prediksi Resiko</Typography>
                    <ArrowOutwardIcon sx={{ fontSize: '0.8rem', color: 'text.secondary' }} />
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
            <GaugeChart
              label="Flow"
              value={flow}
              min={limitData.flow.min}
              max={limitData.flow.max}
              unit={limitData.flow.unit}
              abnormalLow={limitData.flow.abnormalLow}
              warningLow={limitData.flow.warningLow}
              idealLow={limitData.flow.idealLow}
              idealHigh={limitData.flow.idealHigh}
              warningHigh={limitData.flow.warningHigh}
              abnormalHigh={limitData.flow.abnormalHigh}
              linkTo='/ptf'
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.activePower}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard
              label="Active Power"
              value={activePower}
              unit="MW"
              status={getPowerStatus(activePower, 32, 33)}
              linkTo="#"
              titleConfig={TITLE_CONFIG}
              icon={BoltIcon}
              iconConfig={{ size: 39, color: '#ef4444' }}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.voltage}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard
              label="Voltage"
              value={voltage}
              unit="kV"
              status={getPowerStatus(voltage, 13, 14)}
              linkTo="#"
              titleConfig={TITLE_CONFIG}
              icon={OfflineBoltIcon}
              iconConfig={{ size: 32, color: '#f59e0b' }}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.current}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard
              label="Current"
              value={current}
              unit="A"
              status={getPowerStatus(current, 1300, 1400)}
              linkTo="#"
              titleConfig={TITLE_CONFIG}
              icon={TbCircuitResistor}
              iconConfig={{ size: 32, color: '#3b82f6' }}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.reactivePower}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard
              label="Reactive Power"
              value={reactivePower}
              unit="MVAR"
              status={getPowerStatus(reactivePower, 6.0, 6.5)}
              linkTo="#"
              titleConfig={TITLE_CONFIG}
              icon={FaBolt}
              iconConfig={{ size: 25, color: '#8b5cf6' }}
            />
          </Box>
        </Positioned>

        <Positioned pos={POSITIONS.stSpeed}>
          <Box sx={{ width: `${CARD_CONFIG.power.width}px`, height: `${CARD_CONFIG.power.height}px` }}>
            <MetricCard
              label="S.T Speed"
              value={stSpeed}
              unit="rpm"
              status={getPowerStatus(stSpeed, 2900, 3100)}
              linkTo="#"
              titleConfig={TITLE_CONFIG}
              icon={RiSpeedUpFill}
              iconConfig={{ size: 32, color: '#22c55e' }}
            />
          </Box>
        </Positioned>
      </Box>
    </Box>
  );
}

// ==============================|| MAIN DASHBOARD - RESPONSIVE ||============================== //
const DASHBOARD_CONFIG = {
  baseWidth: 1400,
  baseHeight: 900,
  footer: {
    marginTop: 'auto',
    paddingTop: 0
  }
};

export default function DashboardDefault() {
  const theme = useTheme();
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Detect mobile: screens < 900px
  const [scale, setScale] = useState(1);
  const limitData = getLimitData();

  // Real data from API
  const { data: liveData, loading, error } = useLiveData();

  // Calculate scale for desktop layout only
  useEffect(() => {
    if (isMobile) return; // Skip scale calculation for mobile

    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight - 164;

      const scaleX = viewportWidth / DASHBOARD_CONFIG.baseWidth;
      const scaleY = viewportHeight / DASHBOARD_CONFIG.baseHeight;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale((prevScale) => {
        if (Math.abs(prevScale - newScale) > 0.001) {
          return newScale;
        }
        return prevScale;
      });
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);

    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, [isMobile]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    console.error('Error loading live data:', error);
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography color="error">Error loading dashboard data</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>Using fallback values</Typography>
      </Box>
    );
  }

  // Helper function to safely parse numeric values with max 2 decimals
  const parseValue = (value, fallback) => {
    if (value === null || value === undefined || value === 'null') return fallback;
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(parsed)) return fallback;
    // Round to max 2 decimal places
    return Math.round(parsed * 100) / 100;
  };

  // Get risk prediction based on metric values (for test environment)
  const getOverallRiskPrediction = () => {
    if (!liveData?.metrics) return 'Ideal';

    // For production: use status from API
    if (!isTestEnvironment) {
      const statuses = Object.values(liveData.metrics).map(m => m.status);
      if (statuses.includes('abnormal')) return 'Abnormal';
      if (statuses.includes('warning')) return 'Warning';
      return 'Ideal';
    }

    // For test environment: calculate based on metric values vs limits
    const metrics = liveData.metrics;
    let criticalCount = 0;
    let warningCount = 0;

    // Check TDS
    const tdsVal = parseValue(metrics.tds?.value, 0);
    if (tdsVal > limitData["TDS: Overall"].abnormalHigh) criticalCount++;
    else if (tdsVal > limitData["TDS: Overall"].warningHigh) warningCount++;

    // Check Dryness (already in percentage)
    const drynessVal = parseValue(metrics.dryness?.value, 95);
    if (drynessVal < limitData.dryness.abnormalLow || drynessVal > limitData.dryness.abnormalHigh) criticalCount++;
    else if (drynessVal < limitData.dryness.warningLow || drynessVal > limitData.dryness.warningHigh) warningCount++;

    // Check NCG
    const ncgVal = parseValue(metrics.ncg?.value, 0);
    if (ncgVal > limitData.ncg.abnormalHigh) criticalCount++;
    else if (ncgVal > limitData.ncg.warningHigh) warningCount++;

    // Check Pressure
    const pressureVal = parseValue(metrics.pressure?.value, 0);
    if (pressureVal < limitData.pressure.abnormalLow || pressureVal > limitData.pressure.abnormalHigh) criticalCount++;
    else if (pressureVal < limitData.pressure.warningLow || pressureVal > limitData.pressure.warningHigh) warningCount++;

    // Check Temperature
    const tempVal = parseValue(metrics.temperature?.value, 0);
    if (tempVal < limitData.temperature.abnormalLow || tempVal > limitData.temperature.abnormalHigh) criticalCount++;
    else if (tempVal < limitData.temperature.warningLow || tempVal > limitData.temperature.warningHigh) warningCount++;

    // Check Flow
    const flowVal = parseValue(metrics.flow_rate?.value, 0);
    if (flowVal < limitData.flow.abnormalLow || flowVal > limitData.flow.abnormalHigh) criticalCount++;
    else if (flowVal < limitData.flow.warningLow || flowVal > limitData.flow.warningHigh) warningCount++;

    // Determine overall risk: if 2+ critical or 3+ warning → Critical
    if (criticalCount >= 2) return 'Abnormal';
    if (criticalCount >= 1 || warningCount >= 3) return 'Warning';
    return 'Ideal';
  };

  const riskPrediction = getOverallRiskPrediction();

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

  const TITLE_CONFIG = {
    fontSize: '1.35rem',
    fontWeight: 600,
    color: '#334155',
    justifyContent: 'left'
  };

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      overflow: isMobile ? 'auto' : 'hidden',
      p: 0,
      pt: isMobile ? 2 : 5,
      m: 0
    }}>
      {isMobile ? (
        <MobileLayout
          limitData={limitData}
          liveData={liveData}
          parseValue={parseValue}
          getPowerStatus={getPowerStatus}
          predConfig={predConfig}
          TITLE_CONFIG={TITLE_CONFIG}
        />
      ) : (
        <DesktopLayout
          limitData={limitData}
          liveData={liveData}
          parseValue={parseValue}
          getPowerStatus={getPowerStatus}
          predConfig={predConfig}
          TITLE_CONFIG={TITLE_CONFIG}
          scale={scale}
          DASHBOARD_CONFIG={DASHBOARD_CONFIG}
        />
      )}
    </Box>
  );
}