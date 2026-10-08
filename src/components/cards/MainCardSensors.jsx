import PropTypes from 'prop-types';
import { Grid, Stack, Typography, Box, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import MainCard from 'components/MainCard';
import GaugeChart from 'components/GaugeChart';

export default function MainCardSensors({ sensorData }) {
  const {
    pressure = { value: 1437, min: 222, max: 1778, unit: 'kPa', lowerLimit: 444, upperLimit: 1556 },
    temperature = { value: 131, min: 120, max: 200, unit: '°C', lowerLimit: 125, upperLimit: 150 },
    flow = { value: 298, min: 200, max: 288, unit: 't/h', lowerLimit: 220, upperLimit: 270 },
    tds = { value: 6.8, min: 0, max: 10, unit: 'ppm', lowerLimit: 2, upperLimit: 8 },
    dryness = { value: 99.0, min: 80, max: 100.1, unit: '%', lowerLimit: 90, upperLimit: 99.5 }
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
            lowerLimit={pressure.lowerLimit}
            upperLimit={pressure.upperLimit}
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
            lowerLimit={temperature.lowerLimit}
            upperLimit={temperature.upperLimit}
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
            lowerLimit={flow.lowerLimit}
            upperLimit={flow.upperLimit}
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
              lowerLimit={tds.lowerLimit}
              upperLimit={tds.upperLimit}
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
            lowerLimit={dryness.lowerLimit}
            upperLimit={dryness.upperLimit}
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
