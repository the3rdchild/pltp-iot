import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState, useEffect } from 'react';
import MainCard from 'components/MainCard';
import { AnalyticsHeader } from '../../components/analytics';

// icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AIAnalytics = () => {
  const [ai1Data, setAi1Data] = useState([]);
  const [ai2Data, setAi2Data] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [timeRange, setTimeRange] = useState('1h'); // 'Now', '1h', '1d', '7d', '1m', '1y', '10y'

  // Simulate real-time data generation
  useEffect(() => {
    const generateAIData = () => {
      const timestamp = new Date();
      
      // AI1 predictions (Risk & Anomaly)
      const risk = Math.random() * 100;
      const anomaly = risk > 70;
      
      const ai1Point = {
        timestamp: timestamp.toLocaleTimeString(),
        risk_percentage: risk,
        risk_status: risk < 33 ? 'Low' : risk < 66 ? 'Medium' : 'High',
        anomaly_detected: anomaly,
        anomaly_score: Math.random() * 10
      };

      // AI2 predictions (Dryness & NCG)
      const ai2Point = {
        timestamp: timestamp.toLocaleTimeString(),
        dryness_fraction: 95 + Math.random() * 5, // 95-100%
        ncg: 0.5 + Math.random() * 2 // 0.5-2.5 wt%
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
  const getXAxisLabels = () => {
    switch(timeRange) {
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
      case '10y':
        return Array.from({length: 10}, (_, i) => (2015 + i).toString());
      default:
        return Array.from({length: 60}, (_, i) => (i + 1).toString());
    }
  };

  const xAxisLabels = getXAxisLabels();

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
        {/* AI1 Section Header */}
        <Grid size={12}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
            AI #1 - Risk & Anomaly Detection
          </Typography>
        </Grid>

        {/* AI1 Stats Cards - Left Side */}
        {statsData.slice(0, 2).map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '12px',
                    backgroundColor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.iconColor,
                    flexShrink: 0
                  }}
                >
                  {stat.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stat.subtitle}
                  </Typography>
                </Box>
              </Box>
            </MainCard>
          </Grid>
        ))}

        {/* Spacer for alignment */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* AI2 Section Header */}
        <Grid size={12}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2e7d32' }}>
            AI #2 - Virtual Sensor Prediction
          </Typography>
        </Grid>

        {/* AI2 Stats Cards - Right Side */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }} />
        {statsData.slice(2, 4).map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index + 2}>
            <MainCard sx={{ height: '100%', backgroundColor: '#F5F5F5' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '12px',
                    backgroundColor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.iconColor,
                    flexShrink: 0
                  }}
                >
                  {stat.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stat.subtitle}
                  </Typography>
                </Box>
              </Box>
            </MainCard>
          </Grid>
        ))}

        {/* AI1 Chart - Risk Prediction */}
        <Grid size={12}>
          <MainCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  AI1 - Risk Prediction
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Real-time turbine risk analysis with anomaly detection
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['Now', '1h', '1d', '7d', '1m', '1y', '10y'].map((range) => (
                  <Box
                    key={range}
                    onClick={() => setTimeRange(range)}
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      backgroundColor: timeRange === range ? '#1976d2' : '#f5f5f5',
                      color: timeRange === range ? '#fff' : '#666',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: timeRange === range ? '#1565c0' : '#e0e0e0'
                      }
                    }}
                  >
                    {range}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ height: 420, position: 'relative', pt: 2 }}>
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
                      x2="95%"
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
                <line x1="60" y1="135" x2="95%" y2="135" stroke="#ed6c02" strokeWidth="1" strokeDasharray="3,3" />
                <text x="70" y="131" fontSize="10" fill="#ed6c02">High Risk (66%)</text>
                
                <line x1="60" y1="228" x2="95%" y2="228" stroke="#ffa726" strokeWidth="1" strokeDasharray="3,3" />
                <text x="70" y="224" fontSize="10" fill="#ffa726">Medium Risk (33%)</text>

                {/* Risk line */}
                {ai1Data.length > 1 && (
                  <polyline
                    points={ai1Data.slice(-xAxisLabels.length).map((d, i) => {
                      const x = 60 + (i * (window.innerWidth * 0.85 - 80) / (xAxisLabels.length - 1));
                      const y = 320 - (d.risk_percentage * 2.8);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#1976d2"
                    strokeWidth="3"
                  />
                )}

                {/* Anomaly markers */}
                {ai1Data.slice(-xAxisLabels.length).map((d, i) => {
                  if (!d.anomaly_detected) return null;
                  const x = 60 + (i * (window.innerWidth * 0.85 - 80) / (xAxisLabels.length - 1));
                  const y = 320 - (d.risk_percentage * 2.8);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="7" fill="#ff4444" stroke="#fff" strokeWidth="2" />
                      <text x={x} y={y - 12} fontSize="10" fill="#ff4444" textAnchor="middle" fontWeight="600">⚠</text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                <text x="50%" y="360" fontSize="12" fill="#666" textAnchor="middle" fontWeight="600">
                  Time x{xAxisLabels.length}
                </text>

                {/* X-axis tick labels */}
                {xAxisLabels.map((label, i) => {
                  // Show label every N ticks based on length
                  const showEvery = xAxisLabels.length > 30 ? Math.ceil(xAxisLabels.length / 12) : 
                                    xAxisLabels.length > 12 ? Math.ceil(xAxisLabels.length / 8) : 1;
                  if (i % showEvery !== 0 && i !== xAxisLabels.length - 1) return null;
                  
                  const x = 60 + (i * (window.innerWidth * 0.85 - 80) / (xAxisLabels.length - 1));
                  return (
                    <text key={i} x={x} y="380" fontSize="9" fill="#666" textAnchor="middle">
                      {label}
                    </text>
                  );
                })}
              </svg>
            </Box>
          </MainCard>
        </Grid>

        {/* Barrier between AI1 and AI2 charts */}
        <Grid size={12}>
          <Box sx={{ 
            height: 2, 
            background: 'linear-gradient(90deg, transparent 0%, #2e7d32 50%, transparent 100%)',
            my: 2 
          }} />
        </Grid>

        {/* AI2 Chart - Dryness Fraction */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                AI2 - Dryness Fraction
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Steam quality prediction
              </Typography>
            </Box>
            <Box sx={{ height: 350, position: 'relative', pt: 2 }}>
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
                      x2="95%"
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

                {/* Dryness line */}
                {ai2Data.length > 1 && (
                  <polyline
                    points={ai2Data.slice(-20).map((d, i) => {
                      const x = 60 + (i * (window.innerWidth * 0.4 - 80) / 19);
                      const y = 290 - ((d.dryness_fraction - 95) * 50);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#2e7d32"
                    strokeWidth="3"
                  />
                )}

                {/* X-axis label */}
                <text x="50%" y="330" fontSize="12" fill="#666" textAnchor="middle" fontWeight="600">
                  Time ({timeRange})
                </text>
              </svg>
            </Box>
          </MainCard>
        </Grid>

        {/* AI2 Chart - NCG Content */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                AI2 - NCG Content
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Non-condensable gas prediction
              </Typography>
            </Box>
            <Box sx={{ height: 350, position: 'relative', pt: 2 }}>
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
                      x2="95%"
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

                {/* NCG line */}
                {ai2Data.length > 1 && (
                  <polyline
                    points={ai2Data.slice(-20).map((d, i) => {
                      const x = 60 + (i * (window.innerWidth * 0.4 - 80) / 19);
                      const y = 290 - (d.ncg * 85);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#ed6c02"
                    strokeWidth="3"
                  />
                )}

                {/* X-axis label */}
                <text x="50%" y="330" fontSize="12" fill="#666" textAnchor="middle" fontWeight="600">
                  Time ({timeRange})
                </text>
              </svg>
            </Box>
          </MainCard>
        </Grid>

        {/* Data Table with Frozen Prediction Columns */}
        <Grid size={12}>
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
                <Box sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
                  <Box sx={{ minWidth: 1500 }}>
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
                              minWidth: header === 'Timestamp' ? 160 : 110, 
                              flex: header === 'Timestamp' ? '0 0 160px' : '0 0 110px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
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
                        <Box sx={{ minWidth: 160, flex: '0 0 160px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.timestamp}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.temperature}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.pressure}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.flow_rate}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.gen_voltage}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.gen_reactive_power}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.gen_output}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.gen_power_factor}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.gen_frequency}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.speed_detection}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.MCV_L}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {row.MCV_R}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 110, flex: '0 0 110px', display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
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