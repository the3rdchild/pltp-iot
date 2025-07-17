// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

//simulasi
import { useState, useEffect } from 'react';
import { generateAnalyticData } from 'data/simulasi';
import { getRiskPrediction } from 'data/riskprediction';
import simulasiVideo from 'assets/videos/10001-0090.mp4';
import { Link } from 'react-router-dom'; 


// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';

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
      return '#52c41a'; // Green
    case 'Contaminated Dry':
      return '#faad14'; // Yellow
    case 'Wet Clean':
      return '#fa541c'; // Orange
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
            <AnalyticEcommerce
              title="Steam Purity: TDS Overall"
              count={data.tdsOverall + " ppm"}
              percentage={1.2}
              extra="Ref: <100 ppm"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="CO₂ Concentration"
              count={data.co2 + " ppm"}
              percentage={0.5}
              isLoss
              color="warning"    
              extra="Max: 25 ppm"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Argon Concentration"
              count={data.argon + " ppm"}
              percentage={0.3}
              extra="Trace"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Methane (CH₄)"
              count={data.methane + " ppm"}
              percentage={0.4}
              extra="Trace"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="MA₃ Concentration"
              count={data.ma3 + " ppm"}
              percentage={0.2}
              isLoss
              color="warning" 
              extra="Trace"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Scaling Deposit"
              count={data.scalingDeposit + " ppm"}
              percentage={0.8}
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
            <AnalyticEcommerce
              title="Dryness Fraction"
              count={data.drynessFraction}
              percentage={0.9}
              extra="Ideal: >0.9"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Anomaly Score"
              count={data.anomalyScore}
              percentage={0.1}
              isLoss
              color="warning"    
              extra="Low Risk if <0.3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
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
              extra="Wet Clean - Ideal"
            />
          </Grid>
        </Grid>
      </section>

      <h3>Steam & Water System Status</h3> 
      <section>
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          {/* Steam & Water System Status Row */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Pressure Meter: Water Reservoir"
              count={data.pressureReservoir + " kPa"}
              percentage={1.3}
              extra="Normal: 10-14 kPa"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Pressure Meter: Output Steam"
              count={data.pressureSteam + " kPa"}
              percentage={1.5}
              extra="Target: 210-230 kPa"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
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
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard/>
      </Grid>
      
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
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
          <MonthlyBarChart />
        </MainCard>
      </Grid>
       
      {/* row 4 - full width image */}
      <video
  src={simulasiVideo}
  autoPlay
  muted
  loop
  playsInline
  style={{ width: '100%', borderRadius: '8px' }}
/>
    </Grid>
    </>
  );
}
