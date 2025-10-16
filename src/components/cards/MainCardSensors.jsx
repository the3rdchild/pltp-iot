import PropTypes from 'prop-types';
import { Grid, Stack, Typography, Box, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import MainCard from 'components/MainCard';
import GaugeChart from 'components/GaugeChart';

export default function MainCardSensors({ sensorData }) {
  const {
    pressure = { value: 1437, min: 222, max: 1778, unit: 'kPa', abnormalLow: 222, warningLow: 444, warningHigh: 1556, abnormalHigh: 1778 },
    temperature = { value: 131, min: 120, max: 200, unit: '°C', abnormalLow: 120, warningLow: 125, warningHigh: 150, abnormalHigh: 190 },
    flow = { value: 298, min: 200, max: 288, unit: 't/h', abnormalLow: 200, warningLow: 220, warningHigh: 270, abnormalHigh: 285 },
    tds = { value: 6.8, min: 0, max: 10, unit: 'ppm', abnormalLow: 0, warningLow: 2, warningHigh: 8, abnormalHigh: 9.5 },
    dryness = { value: 99.0, min: 80, max: 100.1, unit: '%', abnormalLow: 80, warningLow: 90, warningHigh: 99.5, abnormalHigh: 100 }
  } = sensorData || {};

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1">STEAM SCRUBBER</Typography>
          <MuiLink
            component={Link}
            to="/analytics"
            sx={{
              fontSize: '0.75rem',
              textDecoration: 'none',
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            *Link ke Page Analytics
          </MuiLink>
        </Box>
      }
      contentSX={{ p: 2 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <GaugeChart
            value={pressure.value}
            min={pressure.min}
            max={pressure.max}
            unit={pressure.unit}
            paramName="Pressure"
            abnormalLow={pressure.abnormalLow}
            warningLow={pressure.warningLow}
            warningHigh={pressure.warningHigh}
            abnormalHigh={pressure.abnormalHigh}
            size={150}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <GaugeChart
            value={temperature.value}
            min={temperature.min}
            max={temperature.max}
            unit={temperature.unit}
            paramName="Temperature"
            abnormalLow={temperature.abnormalLow}
            warningLow={temperature.warningLow}
            warningHigh={temperature.warningHigh}
            abnormalHigh={temperature.abnormalHigh}
            size={150}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <GaugeChart
            value={flow.value}
            min={flow.min}
            max={flow.max}
            unit={flow.unit}
            paramName="Flow"
            abnormalLow={flow.abnormalLow}
            warningLow={flow.warningLow}
            warningHigh={flow.warningHigh}
            abnormalHigh={flow.abnormalHigh}
            size={150}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6 }}>
          <MuiLink
            component={Link}
            to="/tds"
            sx={{ textDecoration: 'none', display: 'block' }}
          >
            <GaugeChart
              value={tds.value}
              min={tds.min}
              max={tds.max}
              unit={tds.unit}
              paramName="TDS: Overall"
              abnormalLow={tds.abnormalLow}
              warningLow={tds.warningLow}
              warningHigh={tds.warningHigh}
              abnormalHigh={tds.abnormalHigh}
              size={150}
            />
          </MuiLink>
        </Grid>
        <Grid size={{ xs: 6, sm: 6 }}>
          <GaugeChart
            value={dryness.value}
            min={dryness.min}
            max={dryness.max}
            unit={dryness.unit}
            paramName="Dryness Fractions"
            abnormalLow={dryness.abnormalLow}
            warningLow={dryness.warningLow}
            warningHigh={dryness.warningHigh}
            abnormalHigh={dryness.abnormalHigh}
            size={150}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <MuiLink
          component={Link}
          to="/ncg"
          sx={{
            fontSize: '0.875rem',
            textDecoration: 'none',
            color: 'primary.main',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          NCG
        </MuiLink>
      </Box>
    </MainCard>
  );
}

MainCardSensors.propTypes = {
  sensorData: PropTypes.shape({
    pressure: PropTypes.object,
    temperature: PropTypes.object,
    flow: PropTypes.object,
    tds: PropTypes.object,
    dryness: PropTypes.object
  })
};
