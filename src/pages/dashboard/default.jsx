// material-ui
import { Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';

// react-icons
import { FaBolt } from "react-icons/fa6";
import { RiSpeedUpFill } from "react-icons/ri";
import { TbCircuitResistor } from "react-icons/tb";

import { useState, useEffect } from 'react';

// Real data API hook - test-aware (uses mock data in /test environment)
import { useLiveData } from '../../hooks/useTestAwareLiveData';
import { useAi2Data } from '../../hooks/useAi2Data';
import { useAi1aData } from '../../hooks/useAi1Data';
import { useLocation } from 'react-router-dom';

// project imports - Individual Cards
import GaugeChart from '../../components/GaugeChart';
import MetricCard from 'components/cards/MetricCard';
import MainCard from 'components/MainCard';
import { getLimitData } from '../../utils/limitData';
import { getLimitStatus } from '../../utils/limitZones';

// Image import
import mainImage from './image/main.png';

// ==============================|| MOBILE LAYOUT COMPONENT ||============================== //
function MobileLayout({
  limitData,
  liveData,
  ai2Data,
  parseValue,
  getPowerStatus,
  predConfig,
  riskPercentage,
  usingAi1a,
  TITLE_CONFIG
}) {
  // Extract values from live API data
  const pressure = parseValue(liveData?.metrics?.pressure?.value, null);
  const temperature = parseValue(liveData?.metrics?.temperature?.value, null);
  const flow = parseValue(liveData?.metrics?.flow_rate?.value, null);
  const tds = parseValue(liveData?.metrics?.tds?.value, null);
  // Use AI2 predictions for dryness and NCG
  const dryness = ai2Data?.dryness_predict != null ? parseFloat(ai2Data.dryness_predict) : parseValue(liveData?.metrics?.dryness?.value, null);
  const ncg = ai2Data?.ncg_predict != null ? parseFloat(ai2Data.ncg_predict) : parseValue(liveData?.metrics?.ncg?.value, null);
  const activePower = parseValue(liveData?.metrics?.active_power?.value, null);
  const reactivePower = parseValue(liveData?.metrics?.reactive_power?.value, null);
  const voltage = parseValue(liveData?.metrics?.voltage?.value, null);
  const stSpeed = parseValue(liveData?.metrics?.speed?.value, null);
  const current = parseValue(liveData?.metrics?.current?.value, null);

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
          lowerLimit={limitData["TDS: Overall"].lowerLimit}
          upperLimit={limitData["TDS: Overall"].upperLimit}
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
          lowerLimit={limitData.dryness.lowerLimit}
          upperLimit={limitData.dryness.upperLimit}
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
          lowerLimit={limitData.ncg.lowerLimit}
          upperLimit={limitData.ncg.upperLimit}
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
          lowerLimit={limitData.pressure.lowerLimit}
          upperLimit={limitData.pressure.upperLimit}
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
          lowerLimit={limitData.temperature.lowerLimit}
          upperLimit={limitData.temperature.upperLimit}
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
          lowerLimit={limitData.flow.lowerLimit}
          upperLimit={limitData.flow.upperLimit}
          linkTo='/ptf'
          titleConfig={TITLE_CONFIG}
        />
      </Box>

      {/* AI Prediction */}
      <Box sx={{ width: '100%' }}>
        <MainCard sx={{ width: '100%', minHeight: '110px' }} contentSX={{ p: 1.5 }}>
          <Box>
            <Typography sx={TITLE_CONFIG}>Prediksi Resiko</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60px' }}>
              <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 700, color: predConfig.color, textAlign: 'center', lineHeight: 1 }}>
                {predConfig.label}
              </Typography>
              {riskPercentage != null && (
                <Typography variant="body2" sx={{ color: predConfig.color, fontWeight: 600, mt: 0.5 }}>
                  {riskPercentage.toFixed(1)}%
                </Typography>
              )}
              {!usingAi1a && (
                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 0.5 }}>
                  Data Overall Risk History belum tersedia - estimasi dari ambang sensor
                </Typography>
              )}
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
            unit={limitData.gen_output?.unit || 'MW'}
            status={getPowerStatus(activePower, 'gen_output')}
            linkTo="/power"
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
            unit={limitData.reactive_power?.unit || 'MVAR'}
            status={getPowerStatus(reactivePower, 'reactive_power')}
            linkTo="/power"
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
            unit={limitData.voltage?.unit || 'kV'}
            status={getPowerStatus(voltage, 'voltage')}
            linkTo="/power"
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
            unit={limitData.speed_detection?.unit || 'RPM'}
            status={getPowerStatus(stSpeed, 'speed_detection')}
            linkTo="/power"
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
          unit={limitData.current?.unit || 'A'}
          status={getPowerStatus(current, 'current')}
          linkTo="/power"
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
  ai2Data,
  parseValue,
  getPowerStatus,
  predConfig,
  riskPercentage,
  usingAi1a,
  TITLE_CONFIG,
  scale,
  DASHBOARD_CONFIG
}) {
  // Extract values from live API data
  const pressure = parseValue(liveData?.metrics?.pressure?.value, null);
  const temperature = parseValue(liveData?.metrics?.temperature?.value, null);
  const flow = parseValue(liveData?.metrics?.flow_rate?.value, null);
  const tds = parseValue(liveData?.metrics?.tds?.value, null);
  // Use AI2 predictions for dryness and NCG
  const dryness = ai2Data?.dryness_predict != null ? parseFloat(ai2Data.dryness_predict) : parseValue(liveData?.metrics?.dryness?.value, null);
  const ncg = ai2Data?.ncg_predict != null ? parseFloat(ai2Data.ncg_predict) : parseValue(liveData?.metrics?.ncg?.value, null);
  const activePower = parseValue(liveData?.metrics?.active_power?.value, null);
  const reactivePower = parseValue(liveData?.metrics?.reactive_power?.value, null);
  const voltage = parseValue(liveData?.metrics?.voltage?.value, null);
  const stSpeed = parseValue(liveData?.metrics?.speed?.value, null);
  const current = parseValue(liveData?.metrics?.current?.value, null);

  const CARD_CONFIG = {
    sensor: { width: 247, height: 190 },
    power: { width: 250, height: 135 },
    // A minimum, not a fixed height: the AI card grows when the fallback
    // caption appears. See the Positioned block below for the ceiling.
    // ai: { width: 250, height: 135 }
  };

  const POSITIONS = {
    tds: { top: '12%', left: '4%' },
    dryness: { top: '35%', left: '4%' },
    ncg: { top: '58%', left: '4%' },
    // ai: { top: '78%', left: '4%' },
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
          sx={{
            position: 'absolute',
            top: IMAGE_CONFIG.top,
            left: IMAGE_CONFIG.left,
            transform: IMAGE_CONFIG.left === '50%' ? 'translateX(-50%)' : undefined,
            width: IMAGE_CONFIG.width,
            height: `${DASHBOARD_CONFIG.baseHeight}px`,
            backgroundImage: `url(${mainImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top center',
            zIndex: 0,
            opacity: IMAGE_CONFIG.opacity,
            userSelect: 'none',
            pointerEvents: 'none',
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

          <line x1="15%" y1="6.8%" x2="15%" y2="58%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />

          <line x1="15%" y1="12%" x2="5%" y2="12%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="15%" y1="35%" x2="5%" y2="35%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="15%" y1="58%" x2="5%" y2="58%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" />

          {/* <line x1="15%" y1="78%" x2="5%" y2="78%" stroke="#94a3b8" strokeWidth="3" strokeDasharray="5,5" /> */}

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
              lowerLimit={limitData["TDS: Overall"].lowerLimit}
              upperLimit={limitData["TDS: Overall"].upperLimit}
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
              lowerLimit={limitData.dryness.lowerLimit}
              upperLimit={limitData.dryness.upperLimit}
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
              lowerLimit={limitData.ncg.lowerLimit}
              upperLimit={limitData.ncg.upperLimit}
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
              lowerLimit={limitData.pressure.lowerLimit}
              upperLimit={limitData.pressure.upperLimit}
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
              lowerLimit={limitData.temperature.lowerLimit}
              upperLimit={limitData.temperature.upperLimit}
              linkTo='/ptf'
              titleConfig={TITLE_CONFIG}
            />
          </Box>
        </Positioned>

        {/* <Positioned pos={POSITIONS.ai}> */}
          {/* Height is a floor, not a fixed size. At 120px fixed the card clipped
              its own last line whenever `usingAi1a` was false, because the
              fallback caption wraps to two lines on a 250px card. Growth is
              symmetric (Positioned centres on its point), and the NCG gauge
              above ends at 617px against this card's 693px centre, so the
              card has room up to 152px before the two touch. */}
          {/* <Box sx={{ width: `${CARD_CONFIG.ai.width}px`, minHeight: `${CARD_CONFIG.ai.height}px` }}>
            <MainCard sx={{ width: '100%', minHeight: `${CARD_CONFIG.ai.height}px` }} contentSX={{ p: 1.5 }}>
              <Box>
                <Typography sx={TITLE_CONFIG}>Prediksi Resiko</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60px' }}>
                  <Typography variant="h1" sx={{ fontSize: '2.5rem', fontWeight: 700, color: predConfig.color, textAlign: 'center', lineHeight: 1 }}>
                    {predConfig.label}
                  </Typography>
                  {riskPercentage != null && (
                    <Typography variant="body2" sx={{ color: predConfig.color, fontWeight: 600, mt: 0.5 }}>
                      {riskPercentage.toFixed(1)}%
                    </Typography>
                  )}
                  {!usingAi1a && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 0.5, fontSize: '0.65rem', lineHeight: 1.2 }}>
                      Data Overall Risk History belum tersedia - estimasi dari ambang sensor
                    </Typography>
                  )}
                </Box>
              </Box>
            </MainCard>
          </Box> */}
        {/* </Positioned> */}

        <Positioned pos={POSITIONS.flow}>
          <Box sx={{ width: `${CARD_CONFIG.sensor.width}px`, height: `${CARD_CONFIG.sensor.height}px` }}>
            <GaugeChart
              label="Flow"
              value={flow}
              min={limitData.flow.min}
              max={limitData.flow.max}
              unit={limitData.flow.unit}
              lowerLimit={limitData.flow.lowerLimit}
              upperLimit={limitData.flow.upperLimit}
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
              unit={limitData.gen_output?.unit || 'MW'}
              status={getPowerStatus(activePower, 'gen_output')}
              linkTo="/power"
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
              unit={limitData.voltage?.unit || 'kV'}
              status={getPowerStatus(voltage, 'voltage')}
              linkTo="/power"
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
              unit={limitData.current?.unit || 'A'}
              status={getPowerStatus(current, 'current')}
              linkTo="/power"
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
              unit={limitData.reactive_power?.unit || 'MVAR'}
              status={getPowerStatus(reactivePower, 'reactive_power')}
              linkTo="/power"
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
              unit={limitData.speed_detection?.unit || 'RPM'}
              status={getPowerStatus(stSpeed, 'speed_detection')}
              linkTo="/power"
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

  // AI2 predictions for dryness and NCG
  const { liveData: ai2LiveData } = useAi2Data();

  // AI1a current risk status.
  const { liveData: ai1aLiveData } = useAi1aData();

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

  // A failed fetch no longer replaces the dashboard. It used to render a
  // message promising "Using fallback values" while showing no cards at all,
  // which meant the page could only ever be looked at against a live API.
  // The cards now render and report every missing reading as N/A, so the
  // layout is visible locally and, in production, an outage reads as an
  // outage rather than as a blank screen.
  if (error) {
    console.error('Error loading live data:', error);
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
    // No metrics at all: the sensor-threshold estimate has nothing to work
    // from, so it must say so. Returning 'Ideal' here put a green, confident
    // "Ideal" on the risk card whenever the fetch failed.
    if (!liveData?.metrics) return null;

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

    // Same zones as the gauges (utils/limitZones).
    const tally = (val, limit) => {
      const { status } = getLimitStatus(val, limit);
      if (status === 'abnormal') criticalCount++;
      else if (status === 'warning') warningCount++;
    };

    tally(parseValue(metrics.tds?.value, 0), limitData["TDS: Overall"]);
    // Dryness and NCG come from ai2 predictions, not sensor_data. A missing
    // prediction is NaN, which getLimitStatus leaves uncounted.
    tally(ai2LiveData?.dryness_predict != null ? parseFloat(ai2LiveData.dryness_predict) : NaN, limitData.dryness);
    tally(ai2LiveData?.ncg_predict != null ? parseFloat(ai2LiveData.ncg_predict) : NaN, limitData.ncg);
    tally(parseValue(metrics.pressure?.value, 0), limitData.pressure);
    tally(parseValue(metrics.temperature?.value, 0), limitData.temperature);
    tally(parseValue(metrics.flow_rate?.value, 0), limitData.flow);

    // Determine overall risk: if 2+ critical or 3+ warning → Critical
    if (criticalCount >= 2) return 'Abnormal';
    if (criticalCount >= 1 || warningCount >= 3) return 'Warning';
    return 'Ideal';
  };

  const getPowerStatus = (val, limitKey) => {
    // Without a reading there is no status to report. Falling through to
    // 'Normal' here would paint a green badge over missing data.
    if (val === null || val === undefined || Number.isNaN(val)) return 'N/A';
    const limit = limitData[limitKey];
    if (!limit) return 'Normal';
    const { status } = getLimitStatus(val, limit);
    if (status === 'abnormal') return 'Abnormal';
    if (status === 'warning') return 'Warning';
    return 'Normal';
  };

  const getPredictionConfig = (pred) => {
    switch (pred?.toLowerCase()) {
      case 'normal':
      case 'ideal':
        return { label: pred.toLowerCase() === 'normal' ? 'Normal' : 'Ideal', color: '#22c55e', bgColor: '#22c55e15' };
      case 'warning':
        return { label: 'Warning', color: '#f59e0b', bgColor: '#f59e0b15' };
      case 'high':
        return { label: 'High', color: '#f97316', bgColor: '#f9731615' };
      case 'critical':
      case 'abnormal':
        return { label: pred.toLowerCase() === 'critical' ? 'Critical' : 'Abnormal', color: '#ef4444', bgColor: '#ef444415' };
      default:
        // Unknown/missing input (a retired field gone NULL, a value this
        // switch doesn't recognize yet, or no data at all) must NEVER fall
        // through to a reassuring green "Ideal" -- that's exactly the
        // false-safe bug found 2026-09-17 when `ai1a.severity` started
        // going NULL (worker retirement) while this still read `severity`:
        // the card kept showing "Ideal" in green with a possibly-high
        // risk_percentage sitting right underneath it. An honest "unknown"
        // state is the only safe default for a risk indicator.
        return { label: 'N/A', color: '#94a3b8', bgColor: '#94a3b815' };
    }
  };

  // Prefer real AI1a output (risk_label + risk_percentage); when AI1a data
  // is missing or stale (see useAi1aData's 10-min freshness check on
  // created_at), fall back to the sensor-threshold estimate below rather
  // than showing a frozen/last-known AI value as if it were current.
  //
  // Reads `risk_label`, NOT `severity` -- `severity` was retired 17 Sep
  // 2026 (goes NULL for every new row; AI_Pertasmart_V3 workers/jobs_ai1.py
  // computed it from an AI1b forecast that was itself 8 days stale, and
  // AI1b was retired alongside it). `risk_label` is a SEPARATE, unchanged
  // column (4 tiers: normal/warning/high/critical, lowercase, same as
  // before the AI1b retirement -- confirmed against AI_Pertasmart_V3's own
  // README.md §6.2/6.3, which explicitly recommends this exact switch so
  // neither side has to wait on the other's deploy).
  const usingAi1a = !!ai1aLiveData;
  const riskPrediction = usingAi1a ? ai1aLiveData.risk_label : getOverallRiskPrediction();
  const riskPercentage = usingAi1a && ai1aLiveData.risk_percentage != null ? parseFloat(ai1aLiveData.risk_percentage) : null;

  const predConfig = getPredictionConfig(riskPrediction);

  const TITLE_CONFIG = {
    fontSize: '1.35rem',
    fontWeight: 600,
    color: '#334155',
    justifyContent: 'left'
  };

  return (
    <>
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
            ai2Data={ai2LiveData}
            parseValue={parseValue}
            getPowerStatus={getPowerStatus}
            predConfig={predConfig}
            riskPercentage={riskPercentage}
            usingAi1a={usingAi1a}
            TITLE_CONFIG={TITLE_CONFIG}
          />
        ) : (
          <DesktopLayout
            limitData={limitData}
            liveData={liveData}
            ai2Data={ai2LiveData}
            parseValue={parseValue}
            getPowerStatus={getPowerStatus}
            predConfig={predConfig}
            riskPercentage={riskPercentage}
            usingAi1a={usingAi1a}
            TITLE_CONFIG={TITLE_CONFIG}
            scale={scale}
            DASHBOARD_CONFIG={DASHBOARD_CONFIG}
          />
        )}
      </Box>
    </>
  );
}