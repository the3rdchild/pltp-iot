// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

//simulasi
import { useState, useEffect } from 'react';
import { generateAnalyticData } from 'data/simulasi';
import { getRiskPrediction } from 'data/riskprediction';
import simulasiVideo from 'assets/videos/10001-0090.mp4';
import { Link } from 'react-router-dom'; 


// project imports
import MainCard from 'components/MainCard';
import CensorBox from 'components/cards/statistics/CensorBox';
import TDSChart from 'sections/dashboard/default/TDSChart';
import TempGraph from 'sections/dashboard/default/TemperatureGraph';
import DFraction from 'sections/dashboard/default/DFraction';

// Pertanima Color Pick
// Red: #fa061d rgba(255,1,27,255)
// Green: #9cea09 rgb(156,234,9)
// Blue: #1a74fe rgba(26,116,254,255)

// CensorBOX Color Pick: Original Location: /themes/overrides/Chip.js. Change there if you want custom name!
// 'primary', Blue
// 'secondary' Gray
// 'error', Red
// 'info', Green
// 'success', More Green
// 'warning', Orange-yelow

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

function getRiskColor(riskPrediction) {
  switch (riskPrediction) {
    case 'Ideal':
      return '#9cea09'; // Green
    case 'Contaminated Dry':
      return '#faad14'; // Yellow
    case 'Wet Clean':
      return '#fa061d'; // Orange
    case 'Failure Due to Moisture':
      return '#f5222d'; // Red
    case 'Critical Contamination':
      return '#a8071a'; // Dark Red
    default:
      return '#8c8c8c'; // Grey (Unknown)
  }
}

// ==============================|| DASHBOARD - DEFAULT ||============================== //
export default function DashboardDefault() {
  const [data, setData] = useState({
    pressureReservoir: '0',
    pressureSteam: '0',
    boilerTemp: '0',
    tankLevel: '0',
    avgTankLevel: '$0',
    avgPressure: '0',
    tdsOverall: '0',
    co2: '0',
    argon: '0',
    methane: '0',
    ma3: '0',
    scalingDeposit: '0',
    drynessFraction: '0',
    anomalyScore: '0',
    riskPrediction: '0'
  });

  // misalnya update setiap interval
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateAnalyticData();

      // Hitung risk prediction
      const prediction = getRiskPrediction(newData.drynessFraction, newData.tdsOverall);

      // Update data + prediction
      setData({
        ...newData,
        riskPrediction: prediction
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section>
        <h3>Steam Purity: TDS & Deposit Index</h3>      
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          {/* Steam Purity Row */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Steam Purity: TDS Overall"
              count={data.tdsOverall + " ppm"}
              percentage={1.2}
              color="error"
              extra="Ref: <100 ppm"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="CO₂ Concentration"
              count={data.co2 + " ppm"}
              percentage={0.5}
              isLoss
              color="success"    
              extra="Max: 15 ppm"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Argon Concentration"
              count={data.argon + " ppm"}
              percentage={0.3}
              color="warning"    
              extra="3 ppm"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Methane (CH₄)"
              count={data.methane + " ppm"}
              isLoss
              color="primary"
              percentage={1.4}
              extra="2.2 ppm"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="MA₃ Concentration"
              count={data.ma3 + " ppm"}
              percentage={0.2}
              isLoss
              color="success" 
              extra="1.5 ppm"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Scaling Deposit"
              count={data.scalingDeposit + " ppm"}
              percentage={0.8}
              color="error"
              extra="Max: 2 ppm"
            />
          </Grid>
        </Grid>
      </section>

      <h3>Steam Quality: Dryness & AI</h3>    
      <section>
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          {/* Steam Quality Row */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Dryness Fraction"
              count={data.drynessFraction}
              percentage={0.9}
              color="success"
              extra="Ideal: >0.9"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Anomaly Score"
              count={data.anomalyScore}
              percentage={0.1}
              isLoss
              color="primary"    
              extra="Low Risk if <0.3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title={
                <Link
                  to="/documentation"
                  style={{ textDecoration: 'none', color: '#1890FF', fontWeight: 500 }}>
                  Prediksi Risiko Turbin
                </Link>
              }
              count={
                <span style={{ color: getRiskColor(data.riskPrediction), fontWeight: 600 }}>
                  {data.riskPrediction}
                </span>
              }
              color="warning"
              extra="Wet Clean - Ideal"
            />
          </Grid>
        </Grid>
      </section>

      <h3>Steam & Water System Status</h3> 
      <section>
        <Grid container rowSpacing={2.5} columnSpacing={2.75} >
          {/* Steam & Water System Status Row */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Pressure Meter: Water Reservoir"
              count={data.pressureReservoir + " kPa"}
              percentage={1.3}
              color="success"
              extra="Normal: 10-14 kPa"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Pressure Meter: Output Steam"
              count={data.pressureSteam + " kPa"}
              percentage={1.5}
              color="error"
              extra="Target: 210-230 kPa"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <CensorBox
              title="Steam Pipe: Temp Monitor"
              count={data.boilerTemp + " °C"}
              percentage={0.8}
              isLoss
              color="warning"   
              extra="Range: 180–190 °C"
            />
          </Grid>
          </Grid>
      </section> 

      {/* row 2 */}

      <Grid container rowSpacing={2.5} columnSpacing={2.75} sx={{ mt: 2 }}>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
      <Grid>
            <Typography variant="h5">Dryness Fraction Monthly Chart</Typography>
          </Grid>
      <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
            <ListItemButton divider>
              <ListItemText primary="Average Dryness Fraction Value" />
              <Typography variant="h5">97.0%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Minimum Dryness Fraction Value" />
              <Typography variant="h5">90.0%</Typography>
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary="Maximum Dryness Fraction Value" />
              <Typography variant="h5">100.0%</Typography>
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary="Ideal Dryness Fraction Value" />
              <Typography variant="h5">99.0% - 100.0%</Typography>
            </ListItemButton>
          </List>
          <DFraction />
        </MainCard>
      </Grid>
      
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between" >
          <Grid>
            <Typography variant="h5">TDS Overall (ppm)</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Average
              </Typography>
              <Typography variant="h3">50 PPM</Typography>
            </Stack>
          </Box>
          <TDSChart />
        </MainCard>
      </Grid>
       
    </Grid>

    <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ mt: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid />
        </Grid>
        <TempGraph/>
      </Grid>

      
    </>
  );
}
