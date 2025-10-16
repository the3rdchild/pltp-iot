import PropTypes from 'prop-types';
import { Grid, Stack, Typography, Box } from '@mui/material';
import MainCard from 'components/MainCard';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'normal':
      return '#22c55e'; // Green
    case 'warning':
      return '#f59e0b'; // Orange
    case 'low':
    case 'high':
      return '#ef4444'; // Red
    default:
      return '#22c55e';
  }
};

const PowerMetric = ({ label, value, unit, status }) => (
  <Box sx={{ textAlign: 'center', p: 1 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 700,
        color: getStatusColor(status),
        lineHeight: 1.2
      }}
    >
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {unit}
    </Typography>
    <Box
      sx={{
        mt: 0.5,
        px: 1.5,
        py: 0.3,
        borderRadius: 2,
        bgcolor: getStatusColor(status) + '20',
        color: getStatusColor(status),
        fontSize: '0.7rem',
        fontWeight: 600,
        display: 'inline-block'
      }}
    >
      {status}
    </Box>
  </Box>
);

PowerMetric.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  unit: PropTypes.string,
  status: PropTypes.string
};

export default function MainCardPower({ powerData }) {
  const {
    activePower = { value: 25.46, unit: 'MW', status: 'Low' },
    reactivePower = { value: 4421, unit: 'MVAR', status: 'High' },
    voltage = { value: 13.86, unit: 'kV', status: 'Normal' },
    stSpeed = { value: 3598, unit: 'rpm', status: 'High' },
    current = { value: 901.3, unit: 'A', status: 'Low' }
  } = powerData || {};

  return (
    <MainCard title="GENERATOR & TURBINE" contentSX={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 6 }}>
          <PowerMetric label="ACTIVE POWER" {...activePower} />
        </Grid>
        <Grid size={{ xs: 6, sm: 6 }}>
          <PowerMetric label="Reactive Power" {...reactivePower} />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <PowerMetric label="Voltage" {...voltage} />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <PowerMetric label="S.T Speed" {...stSpeed} />
        </Grid>
        <Grid size={{ xs: 4, sm: 4 }}>
          <PowerMetric label="Current" {...current} />
        </Grid>
      </Grid>
    </MainCard>
  );
}

MainCardPower.propTypes = {
  powerData: PropTypes.shape({
    activePower: PropTypes.object,
    reactivePower: PropTypes.object,
    voltage: PropTypes.object,
    stSpeed: PropTypes.object,
    current: PropTypes.object
  })
};
