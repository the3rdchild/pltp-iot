import { Box, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState, useEffect, useRef } from 'react';
import MainCard from 'components/MainCard';
import { AnalyticsHeader } from '../../components/analytics';

// icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const AIAnalytics = () => {
  const [ai1Data, setAi1Data] = useState([]);
  const [ai2Data, setAi2Data] = useState([]);
  const [tableData, setTableData] = useState([]);
  
  // Separate time range states for each chart
  const [timeRangeAI1, setTimeRangeAI1] = useState('1d');
  const [timeRangeAI2Dryness, setTimeRangeAI2Dryness] = useState('1d');
  const [timeRangeAI2NCG, setTimeRangeAI2NCG] = useState('1d');
  
  // Date range states
  const [showDatePickerAI1, setShowDatePickerAI1] = useState(false);
  const [showDatePickerDryness, setShowDatePickerDryness] = useState(false);
  const [showDatePickerNCG, setShowDatePickerNCG] = useState(false);
  const [dateFromAI1, setDateFromAI1] = useState('');
  const [dateToAI1, setDateToAI1] = useState('');
  const [dateFromDryness, setDateFromDryness] = useState('');
  const [dateToDryness, setDateToDryness] = useState('');
  const [dateFromNCG, setDateFromNCG] = useState('');
  const [dateToNCG, setDateToNCG] = useState('');
  
  const [chartWidthAI1, setChartWidthAI1] = useState(1200);
  const [chartWidthDryness, setChartWidthDryness] = useState(600);
  const [chartWidthNCG, setChartWidthNCG] = useState(600);
  
  const chartRefAI1 = useRef(null);
  const chartRefDryness = useRef(null);
  const chartRefNCG = useRef(null);
  const leftTableRef = useRef(null);
  const rightTableRef = useRef(null);

  // Handle window resize for dynamic chart width
  useEffect(() => {
    const updateWidth = () => {
      if (chartRefAI1.current) {
        setChartWidthAI1(chartRefAI1.current.offsetWidth);
      }
      if (chartRefDryness.current) {
        setChartWidthDryness(chartRefDryness.current.offsetWidth);
      }
      if (chartRefNCG.current) {
        setChartWidthNCG(chartRefNCG.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    // Delay untuk ensure DOM ready
    setTimeout(updateWidth, 100);
    
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Sync table scroll
  useEffect(() => {
    const leftTable = leftTableRef.current;
    const rightTable = rightTableRef.current;

    if (!leftTable || !rightTable) return;

    const syncScroll = (source, target) => {
      return () => {
        target.scrollTop = source.scrollTop;
      };
    };

    const leftScrollHandler = syncScroll(leftTable, rightTable);
    const rightScrollHandler = syncScroll(rightTable, leftTable);

    leftTable.addEventListener('scroll', leftScrollHandler);
    rightTable.addEventListener('scroll', rightScrollHandler);

    return () => {
      leftTable.removeEventListener('scroll', leftScrollHandler);
      rightTable.removeEventListener('scroll', rightScrollHandler);
    };
  }, []);

  // Simulate real-time data generation
  // Simulate real-time data generation with regression patterns
  useEffect(() => {
    let trendValueRisk = 0; // Starting trend for risk
    let trendValueDryness = 97.5; // Starting trend for dryness
    let trendValueNCG = 1.5; // Starting trend for NCG
    let trendDirection = 1; // 1 for up, -1 for down
    
    const generateAIData = () => {
      const timestamp = new Date();
      
      // Risk trend: slowly moves up and down with small noise
      trendValueRisk += (Math.random() - 0.3) * trendDirection * 2;
      if (trendValueRisk > 85) trendDirection = -1;
      if (trendValueRisk < 15) trendDirection = 1;
      const risk = Math.max(0, Math.min(100, trendValueRisk + (Math.random() - 0.5) * 5));
      const anomaly = risk > 70;
      
      const ai1Point = {
        timestamp: timestamp.toLocaleTimeString(),
        risk_percentage: risk,
        risk_status: risk < 33 ? 'Low' : risk < 66 ? 'Medium' : 'High',
        anomaly_detected: anomaly,
        anomaly_score: Math.random() * 10
      };

      // Dryness trend: stays high with small fluctuations
      trendValueDryness += (Math.random() - 0.5) * 0.15;
      trendValueDryness = Math.max(95, Math.min(100, trendValueDryness));
      const dryness = trendValueDryness + (Math.random() - 0.5) * 0.3;
      
      // NCG trend: slowly drifts up and down
      trendValueNCG += (Math.random() - 0.5) * 0.08;
      trendValueNCG = Math.max(0.5, Math.min(2.5, trendValueNCG));
      const ncg = trendValueNCG + (Math.random() - 0.5) * 0.15;

      const ai2Point = {
        timestamp: timestamp.toLocaleTimeString(),
        dryness_fraction: dryness,
        ncg: ncg
      };

      // Input features for table
      const inputData = {
        id: Date.now(),
        timestamp: timestamp.toLocaleString(),
        temperature: (180 + Math.random() * 20).toFixed(2),
        pressure: (25 + Math.random() * 5).toFixed(2),
        flow_rate: (500 + Math.random() * 100).toFixed(2),
        gen_voltage: (13.5 + Math.random() * 1).toFixed(2),
        gen_reactive_power: (20 + Math.random() * 10).toFixed(2),
        gen_output: (110 + Math.random() * 10).toFixed(2),
        gen_power_factor: (0.85 + Math.random() * 0.1).toFixed(2),
        gen_frequency: (49.5 + Math.random()).toFixed(2),
        speed_detection: (3000 + Math.random() * 100).toFixed(2),
        MCV_L: (50 + Math.random() * 30).toFixed(2),
        MCV_R: (50 + Math.random() * 30).toFixed(2),
        TDS: (150 + Math.random() * 50).toFixed(2),
        ...ai1Point,
        ...ai2Point
      };

      setAi1Data(prev => [...prev.slice(-59), ai1Point]);
      setAi2Data(prev => [...prev.slice(-59), ai2Point]);
      setTableData(prev => [inputData, ...prev.slice(0, 49)]);
    };

    generateAIData();
    const interval = setInterval(generateAIData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get X-axis labels based on time range
  const getXAxisLabels = (range) => {
    switch(range) {
      case 'Now':
        return Array.from({length: 60}, (_, i) => (i + 1).toString());
      case '1h':
        return Array.from({length: 60}, (_, i) => (i + 1).toString());
      case '1d':
        return Array.from({length: 24}, (_, i) => (i + 1).toString());
      case '7d':
        return Array.from({length: 7}, (_, i) => `D${i + 1}`);
      case '1m':
        return Array.from({length: 30}, (_, i) => (i + 1).toString());
      case '1y':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      case 'all':
        return Array.from({length: 10}, (_, i) => (2015 + i).toString());
      default:
        return Array.from({length: 60}, (_, i) => (i + 1).toString());
    }
  };

  // Get time label for X-axis
  const getTimeLabel = (range) => {
    switch(range) {
      case 'Now':
      case '1h':
        return 'Minute';
      case '1d':
        return 'Hour';
      case '7d':
        return 'Day';
      case '1m':
        return 'Date';
      case '1y':
        return 'Month';
      case 'all':
        return 'Year';
      default:
        return 'Time';
    }
  };

  // Smooth curve helper - Catmull-Rom spline
  const getCurvePoints = (points) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      
      // Catmull-Rom to Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    return path;
  };

  const xAxisLabelsAI1 = getXAxisLabels(timeRangeAI1);
  const xAxisLabelsDryness = getXAxisLabels(timeRangeAI2Dryness);
  const xAxisLabelsNCG = getXAxisLabels(timeRangeAI2NCG);

  // Linear regression helper
  const getLinearRegression = (data, getValue) => {
    if (data.length < 2) return null;
    
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    data.forEach((point, i) => {
      const x = i;
      const y = getValue(point);
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  };
  // Stats cards data
  const statsData = [
    {
      title: 'AI1 Status',
      value: ai1Data.length > 0 ? ai1Data[ai1Data.length - 1].risk_status : 'Low',
      subtitle: ai1Data.length > 0 ? `${ai1Data[ai1Data.length - 1].risk_percentage.toFixed(1)}% Risk` : '0% Risk',
      icon: <PsychologyIcon sx={{ fontSize: '2.5rem' }} />,
      bgColor: ai1Data.length > 0 && ai1Data[ai1Data.length - 1].risk_percentage > 66 ? '#FF7E7E' : '#58E58C',
      iconColor: '#fff'
    },
    {
      title: 'Anomaly Detection',
      value: ai1Data.length > 0 && ai1Data[ai1Data.length - 1].anomaly_detected ? 'Detected' : 'Normal',
      subtitle: ai1Data.length > 0 ? `Score: ${ai1Data[ai1Data.length - 1].anomaly_score.toFixed(2)}` : 'Score: 0',
      icon: ai1Data.length > 0 && ai1Data[ai1Data.length - 1].anomaly_detected ? 
        <WarningAmberIcon sx={{ fontSize: '2.5rem' }} /> : 
        <CheckCircleIcon sx={{ fontSize: '2.5rem' }} />,
      bgColor: ai1Data.length > 0 && ai1Data[ai1Data.length - 1].anomaly_detected ? '#9271FF' : '#53A1FF',
      iconColor: '#fff'
    },
    {
      title: 'AI2 Dryness',
      value: ai2Data.length > 0 ? `${ai2Data[ai2Data.length - 1].dryness_fraction.toFixed(2)}%` : '0%',
      subtitle: 'Steam Quality',
      icon: <TimelineIcon sx={{ fontSize: '2.5rem' }} />,
      bgColor: '#53A1FF',
      iconColor: '#fff'
    },
    {
      title: 'AI2 NCG',
      value: ai2Data.length > 0 ? `${ai2Data[ai2Data.length - 1].ncg.toFixed(2)} wt%` : '0 wt%',
      subtitle: 'Gas Content',
      icon: <TimelineIcon sx={{ fontSize: '2.5rem' }} />,
      bgColor: '#58E58C',
      iconColor: '#fff'
    }
  ];

  return (
    <Box>
      <AnalyticsHeader title="AI Analytics" subtitle="Real-time AI Predictions Monitoring" />

      <Grid container spacing={3}>
        {/* 1. AI1 Stats Cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  backgroundColor: statsData[0].bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: statsData[0].iconColor,
                  flexShrink: 0
                }}
              >
                {statsData[0].icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  {statsData[0].title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {statsData[0].value}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {statsData[0].subtitle}
                </Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  backgroundColor: statsData[1].bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: statsData[1].iconColor,
                  flexShrink: 0
                }}
              >
                {statsData[1].icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  {statsData[1].title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {statsData[1].value}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {statsData[1].subtitle}
                </Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        {/* 2. AI1 Chart - Risk Prediction */}
        <Grid size={{ xs: 12 }}>
          <MainCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  AI1 - Risk Prediction
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Real-time turbine risk analysis with anomaly detection
                </Typography>
              </Box>
              <Box>
                <Button
                  size="small"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => setShowDatePickerAI1(!showDatePickerAI1)}
                  sx={{
                    textTransform: 'none',
                    color: '#666',
                    fontSize: '0.75rem',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  Custom Date Range
                </Button>
                {showDatePickerAI1 && (
                  <Box sx={{ display: 'flex', gap: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mt: 1 }}>
                    <input
                      type="date"
                      value={dateFromAI1}
                      onChange={(e) => setDateFromAI1(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#666' }}>to</Typography>
                    <input
                      type="date"
                      value={dateToAI1}
                      onChange={(e) => setDateToAI1(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ minWidth: 'auto', px: 2, textTransform: 'none' }}
                      onClick={() => setShowDatePickerAI1(false)}
                    >
                      Apply
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
            
            <Box ref={chartRefAI1} sx={{ height: 420, position: 'relative', pt: 2, width: '100%' }}>
              <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                {/* Y-axis label */}
                <text
                  x="15"
                  y="200"
                  fontSize="12"
                  fill="#666"
                  textAnchor="middle"
                  transform="rotate(-90, 15, 200)"
                  fontWeight="600"
                >
                  Risk Percentage (%)
                </text>

                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((val, i) => (
                  <g key={i}>
                    <line
                      x1="60"
                      y1={320 - (val * 2.8)}
                      x2={chartWidthAI1 - 40}
                      y2={320 - (val * 2.8)}
                      stroke="#e0e0e0"
                      strokeWidth="1"
                    />
                    <text
                      x="45"
                      y={325 - (val * 2.8)}
                      fontSize="11"
                      fill="#666"
                      textAnchor="end"
                    >
                      {val}%
                    </text>
                  </g>
                ))}

                {/* Risk threshold lines */}
                <line x1="60" y1={320 - (66 * 2.8)} x2={chartWidthAI1 - 40} y2={320 - (66 * 2.8)} stroke="#ed6c02" strokeWidth="1" strokeDasharray="3,3" />
                <text x="70" y={320 - (66 * 2.8) - 4} fontSize="10" fill="#ed6c02">High Risk (66%)</text>
                
                <line x1="60" y1={320 - (33 * 2.8)} x2={chartWidthAI1 - 40} y2={320 - (33 * 2.8)} stroke="#ffa726" strokeWidth="1" strokeDasharray="3,3" />
                <text x="70" y={320 - (33 * 2.8) - 4} fontSize="10" fill="#ffa726">Medium Risk (33%)</text>

                {/* Smooth risk line */}
                {ai1Data.length > 1 && (
                  <path
                    d={getCurvePoints(ai1Data.slice(-xAxisLabelsAI1.length).map((d, i) => ({
                      x: 60 + (i * (chartWidthAI1 - 100) / Math.max(1, xAxisLabelsAI1.length - 1)),
                      y: 320 - (d.risk_percentage * 2.8)
                    })))}
                    fill="none"
                    stroke="#1976d2"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {/* Regression line - AI1 */}
                {ai1Data.length > 1 && (() => {
                  const slicedData = ai1Data.slice(-xAxisLabelsAI1.length);
                  const regression = getLinearRegression(slicedData, d => d.risk_percentage);
                  if (!regression) return null;
                  
                  const startY = regression.intercept;
                  const endY = regression.intercept + regression.slope * (slicedData.length - 1);
                  const endX = 60 + ((slicedData.length - 1) * (chartWidthAI1 - 100) / Math.max(1, xAxisLabelsAI1.length - 1));
                  
                  return (
                    <line
                      x1="60"
                      y1={320 - (startY * 2.8)}
                      x2={endX}
                      y2={320 - (endY * 2.8)}
                      stroke="#ff4444"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })()}
                {/* Anomaly markers */}
                {ai1Data.slice(-xAxisLabelsAI1.length).map((d, i) => {
                  if (!d.anomaly_detected) return null;
                  const x = 60 + (i * (chartWidthAI1 - 100) / Math.max(1, xAxisLabelsAI1.length - 1));
                  const y = 320 - (d.risk_percentage * 2.8);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="7" fill="#ff4444" stroke="#fff" strokeWidth="2" />
                      <text x={x} y={y - 12} fontSize="10" fill="#ff4444" textAnchor="middle" fontWeight="600">⚠</text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                <text x={chartWidthAI1 / 2} y="360" fontSize="12" fill="#666" textAnchor="middle" fontWeight="600">
                  {getTimeLabel(timeRangeAI1)} (x{xAxisLabelsAI1.length})
                </text>

                {/* X-axis tick labels */}
                {xAxisLabelsAI1.map((label, i) => {
                  const showEvery = xAxisLabelsAI1.length > 30 ? Math.ceil(xAxisLabelsAI1.length / 12) : 
                                    xAxisLabelsAI1.length > 12 ? Math.ceil(xAxisLabelsAI1.length / 8) : 1;
                  if (i % showEvery !== 0 && i !== xAxisLabelsAI1.length - 1) return null;
                  
                  const x = 60 + (i * (chartWidthAI1 - 100) / Math.max(1, xAxisLabelsAI1.length - 1));
                  return (
                    <text key={i} x={x} y="380" fontSize="9" fill="#666" textAnchor="middle">
                      {label}
                    </text>
                  );
                })}
              </svg>
            </Box>

            {/* Time range buttons - Bottom Right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1, flexWrap: 'wrap' }}>
              {['Now', '1h', '1d', '7d', '1m', '1y', 'all'].map((range) => (
                <Box
                  key={range}
                  onClick={() => setTimeRangeAI1(range)}
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: timeRangeAI1 === range ? '#1976d2' : '#f5f5f5',
                    color: timeRangeAI1 === range ? '#fff' : '#666',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: timeRangeAI1 === range ? '#1565c0' : '#e0e0e0'
                    }
                  }}
                >
                  {range === 'all' ? 'All' : range}
                </Box>
              ))}
            </Box>
          </MainCard>
        </Grid>

        {/* 3. Horizontal Barrier */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ 
            height: 2, 
            background: 'linear-gradient(90deg, transparent 0%, #2e7d32 50%, transparent 100%)',
            my: 2 
          }} />
        </Grid>

        {/* 4. AI2 Stats Cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  backgroundColor: statsData[2].bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: statsData[2].iconColor,
                  flexShrink: 0
                }}
              >
                {statsData[2].icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  {statsData[2].title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {statsData[2].value}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {statsData[2].subtitle}
                </Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  backgroundColor: statsData[3].bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: statsData[3].iconColor,
                  flexShrink: 0
                }}
              >
                {statsData[3].icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  {statsData[3].title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {statsData[3].value}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {statsData[3].subtitle}
                </Typography>
              </Box>
            </Box>
          </MainCard>
        </Grid>

        {/* 5. AI2 Charts */}
        {/* AI2 Chart - Dryness Fraction */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  AI2 - Dryness Fraction
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Steam quality prediction
                </Typography>
              </Box>
              <Box>
                <Button
                  size="small"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => setShowDatePickerDryness(!showDatePickerDryness)}
                  sx={{
                    textTransform: 'none',
                    color: '#666',
                    fontSize: '0.75rem',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  Custom Date Range
                </Button>
                {showDatePickerDryness && (
                  <Box sx={{ display: 'flex', gap: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mt: 1 }}>
                    <input
                      type="date"
                      value={dateFromDryness}
                      onChange={(e) => setDateFromDryness(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#666' }}>to</Typography>
                    <input
                      type="date"
                      value={dateToDryness}
                      onChange={(e) => setDateToDryness(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ minWidth: 'auto', px: 2, textTransform: 'none' }}
                      onClick={() => setShowDatePickerDryness(false)}
                    >
                      Apply
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
            
            <Box ref={chartRefDryness} sx={{ height: 350, position: 'relative', pt: 2, width: '100%' }}>
              <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                {/* Y-axis label */}
                <text
                  x="15"
                  y="170"
                  fontSize="12"
                  fill="#666"
                  textAnchor="middle"
                  transform="rotate(-90, 15, 170)"
                  fontWeight="600"
                >
                  Dryness Fraction (%)
                </text>

                {/* Grid lines (95-100%) */}
                {[95, 96, 97, 98, 99, 100].map((val, i) => (
                  <g key={`dry-${i}`}>
                    <line
                      x1="60"
                      y1={290 - ((val - 95) * 50)}
                      x2={chartWidthDryness - 40}
                      y2={290 - ((val - 95) * 50)}
                      stroke="#e0e0e0"
                      strokeWidth="1"
                    />
                    <text
                      x="45"
                      y={295 - ((val - 95) * 50)}
                      fontSize="11"
                      fill="#666"
                      textAnchor="end"
                    >
                      {val}%
                    </text>
                  </g>
                ))}

                {/* Smooth dryness line */}
                {ai2Data.length > 1 && (
                  <path
                    d={getCurvePoints(ai2Data.slice(-xAxisLabelsDryness.length).map((d, i) => ({
                      x: 60 + (i * (chartWidthDryness - 100) / Math.max(1, xAxisLabelsDryness.length - 1)),
                      y: 290 - ((d.dryness_fraction - 95) * 50)
                    })))}
                    fill="none"
                    stroke="#2e7d32"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {/* Regression line - Dryness */}
                {ai2Data.length > 1 && (() => {
                  const slicedData = ai2Data.slice(-xAxisLabelsDryness.length);
                  const regression = getLinearRegression(slicedData, d => d.dryness_fraction);
                  if (!regression) return null;
                  
                  const startY = regression.intercept;
                  const endY = regression.intercept + regression.slope * (slicedData.length - 1);
                  const endX = 60 + ((slicedData.length - 1) * (chartWidthDryness - 100) / Math.max(1, xAxisLabelsDryness.length - 1));
                  
                  return (
                    <line
                      x1="60"
                      y1={290 - ((startY - 95) * 50)}
                      x2={endX}
                      y2={290 - ((endY - 95) * 50)}
                      stroke="#ff4444"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })()}

                {/* X-axis label */}
                <text x={chartWidthDryness / 2} y="330" fontSize="12" fill="#666" textAnchor="middle" fontWeight="600">
                  {getTimeLabel(timeRangeAI2Dryness)} (x{xAxisLabelsDryness.length})
                </text>

                {/* X-axis tick labels */}
                {xAxisLabelsDryness.map((label, i) => {
                  const showEvery = xAxisLabelsDryness.length > 30 ? Math.ceil(xAxisLabelsDryness.length / 12) : 
                                    xAxisLabelsDryness.length > 12 ? Math.ceil(xAxisLabelsDryness.length / 8) : 1;
                  if (i % showEvery !== 0 && i !== xAxisLabelsDryness.length - 1) return null;
                  
                  const x = 60 + (i * (chartWidthDryness - 100) / Math.max(1, xAxisLabelsDryness.length - 1));
                  return (
                    <text key={i} x={x} y="350" fontSize="9" fill="#666" textAnchor="middle">
                      {label}
                    </text>
                  );
                })}
              </svg>
            </Box>

            {/* Time range buttons - Bottom Right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 0.5, flexWrap: 'wrap' }}>
              {['Now', '1h', '1d', '7d', '1m', '1y', 'all'].map((range) => (
                <Box
                  key={range}
                  onClick={() => setTimeRangeAI2Dryness(range)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: timeRangeAI2Dryness === range ? '#2e7d32' : '#f5f5f5',
                    color: timeRangeAI2Dryness === range ? '#fff' : '#666',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: timeRangeAI2Dryness === range ? '#1b5e20' : '#e0e0e0'
                    }
                  }}
                >
                  {range === 'all' ? 'All' : range}
                </Box>
              ))}
            </Box>
          </MainCard>
        </Grid>

        {/* AI2 Chart - NCG Content */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  AI2 - NCG Content
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Non-condensable gas prediction
                </Typography>
              </Box>
              <Box>
                <Button
                  size="small"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => setShowDatePickerNCG(!showDatePickerNCG)}
                  sx={{
                    textTransform: 'none',
                    color: '#666',
                    fontSize: '0.75rem',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  Custom Date Range
                </Button>
                {showDatePickerNCG && (
                  <Box sx={{ display: 'flex', gap: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mt: 1 }}>
                    <input
                      type="date"
                      value={dateFromNCG}
                      onChange={(e) => setDateFromNCG(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#666' }}>to</Typography>
                    <input
                      type="date"
                      value={dateToNCG}
                      onChange={(e) => setDateToNCG(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ minWidth: 'auto', px: 2, textTransform: 'none' }}
                      onClick={() => setShowDatePickerNCG(false)}
                    >
                      Apply
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
            
            <Box ref={chartRefNCG} sx={{ height: 350, position: 'relative', pt: 2, width: '100%' }}>
              <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                {/* Y-axis label */}
                <text
                  x="15"
                  y="170"
                  fontSize="12"
                  fill="#666"
                  textAnchor="middle"
                  transform="rotate(-90, 15, 170)"
                  fontWeight="600"
                >
                  NCG Content (wt%)
                </text>

                {/* Grid lines (0-3 wt%) */}
                {[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((val, i) => (
                  <g key={`ncg-${i}`}>
                    <line
                      x1="60"
                      y1={290 - (val * 85)}
                      x2={chartWidthNCG - 40}
                      y2={290 - (val * 85)}
                      stroke="#e0e0e0"
                      strokeWidth="1"
                    />
                    <text
                      x="45"
                      y={295 - (val * 85)}
                      fontSize="11"
                      fill="#666"
                      textAnchor="end"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                ))}

                {/* Smooth NCG line */}
                {ai2Data.length > 1 && (
                  <path
                    d={getCurvePoints(ai2Data.slice(-xAxisLabelsNCG.length).map((d, i) => ({
                      x: 60 + (i * (chartWidthNCG - 100) / Math.max(1, xAxisLabelsNCG.length - 1)),
                      y: 290 - (d.ncg * 85)
                    })))}
                    fill="none"
                    stroke="#ed6c02"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {/* Regression line - NCG */}
                {ai2Data.length > 1 && (() => {
                  const slicedData = ai2Data.slice(-xAxisLabelsNCG.length);
                  const regression = getLinearRegression(slicedData, d => d.ncg);
                  if (!regression) return null;
                  
                  const startY = regression.intercept;
                  const endY = regression.intercept + regression.slope * (slicedData.length - 1);
                  const endX = 60 + ((slicedData.length - 1) * (chartWidthNCG - 100) / Math.max(1, xAxisLabelsNCG.length - 1));
                  
                  return (
                    <line
                      x1="60"
                      y1={290 - (startY * 85)}
                      x2={endX}
                      y2={290 - (endY * 85)}
                      stroke="#ff4444"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })()}
                {/* X-axis label */}
                <text x={chartWidthNCG / 2} y="330" fontSize="12" fill="#666" textAnchor="middle" fontWeight="600">
                  {getTimeLabel(timeRangeAI2NCG)} (x{xAxisLabelsNCG.length})
                </text>

                {/* X-axis tick labels */}
                {xAxisLabelsNCG.map((label, i) => {
                  const showEvery = xAxisLabelsNCG.length > 30 ? Math.ceil(xAxisLabelsNCG.length / 12) : 
                                    xAxisLabelsNCG.length > 12 ? Math.ceil(xAxisLabelsNCG.length / 8) : 1;
                  if (i % showEvery !== 0 && i !== xAxisLabelsNCG.length - 1) return null;
                  
                  const x = 60 + (i * (chartWidthNCG - 100) / Math.max(1, xAxisLabelsNCG.length - 1));
                  return (
                    <text key={i} x={x} y="350" fontSize="9" fill="#666" textAnchor="middle">
                      {label}
                    </text>
                  );
                })}
              </svg>
            </Box>

            {/* Time range buttons - Bottom Right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 0.5, flexWrap: 'wrap' }}>
              {['Now', '1h', '1d', '7d', '1m', '1y', 'all'].map((range) => (
                <Box
                  key={range}
                  onClick={() => setTimeRangeAI2NCG(range)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: timeRangeAI2NCG === range ? '#2e7d32' : '#f5f5f5',
                    color: timeRangeAI2NCG === range ? '#fff' : '#666',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: timeRangeAI2NCG === range ? '#1b5e20' : '#e0e0e0'
                    }
                  }}
                >
                  {range === 'all' ? 'All' : range}
                </Box>
              ))}
            </Box>
          </MainCard>
        </Grid>

        {/* 6. Data Table with Frozen Prediction Columns */}
        <Grid size={{ xs: 12 }}>
          <MainCard>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Prediction Data Table
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Real-time sensor inputs and AI prediction results
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative', height: 500 }}>
              {/* Scrollable container */}
              <Box
                sx={{
                  display: 'flex',
                  height: '100%',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                {/* Frozen prediction columns (left) */}
                <Box
                  ref={leftTableRef}
                  sx={{
                    width: 350,
                    flexShrink: 0,
                    borderRight: '3px solid #1976d2',
                    backgroundColor: '#f8f9fa',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#1976d2',
                      color: 'white',
                      zIndex: 2,
                      borderBottom: '2px solid #1565c0'
                    }}
                  >
                    <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        AI Predictions
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0.5, p: 1, minHeight: 48 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        Risk %
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        Anomaly
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        Dryness %
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
                        NCG wt%
                      </Typography>
                    </Box>
                  </Box>

                  {/* Data rows */}
                  {tableData.map((row, idx) => (
                    <Box
                      key={row.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gap: 0.5,
                        p: 1,
                        minHeight: 40,
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                        '&:hover': { backgroundColor: '#e3f2fd' }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        {row.risk_percentage?.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        {row.anomaly_detected ? '⚠️ Yes' : '✓ No'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        {row.dryness_fraction?.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                        {row.ncg?.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Scrollable input columns (right) */}
                <Box 
                  ref={rightTableRef}
                  sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}
                >
                  <Box sx={{ minWidth: 'fit-content', width: 'max-content' }}>
                    {/* Header */}
                    <Box
                      sx={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#37474f',
                        color: 'white',
                        zIndex: 1
                      }}
                    >
                      <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Sensor Inputs
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, p: 1, minHeight: 48 }}>
                        {['Timestamp', 'Temp °C', 'Press bar', 'Flow kg/h', 'Volt kV', 'React MW', 'Output MW', 
                          'PF', 'Freq Hz', 'Speed RPM', 'MCV_L %', 'MCV_R %', 'TDS ppm'].map(header => (
                          <Box 
                            key={header} 
                            sx={{ 
                              minWidth: header === 'Timestamp' ? 160 : 120,
                              width: header === 'Timestamp' ? 160 : 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              px: 1
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                              {header}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Data rows */}
                    {tableData.map((row, idx) => (
                      <Box
                        key={row.id}
                        sx={{
                          display: 'flex',
                          gap: 1,
                          p: 1,
                          minHeight: 40,
                          borderBottom: '1px solid #e0e0e0',
                          backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                          '&:hover': { backgroundColor: '#e3f2fd' }
                        }}
                      >
                        <Box sx={{ minWidth: 160, width: 160, display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.timestamp}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.temperature}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.pressure}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.flow_rate}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.gen_voltage}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.gen_reactive_power}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.gen_output}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.gen_power_factor}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.gen_frequency}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.speed_detection}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.MCV_L}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.MCV_R}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 120, width: 'auto', display: 'flex', alignItems: 'center', px: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {row.TDS}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAnalytics;