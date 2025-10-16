import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'normal':
      return '#22c55e';
    case 'warning':
      return '#f59e0b';
    case 'low':
    case 'high':
      return '#ef4444';
    default:
      return '#22c55e';
  }
};

export default function MetricCard({ label, value, unit, status }) {
  const statusColor = getStatusColor(status);

  return (
    <MainCard contentSX={{ p: 1.5 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
          {label}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: statusColor,
            lineHeight: 1.2,
            mb: 0.3,
            fontSize: '1.75rem'
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
          {unit}
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 0.3,
            borderRadius: 1.5,
            bgcolor: statusColor + '20',
            color: statusColor,
            fontSize: '0.65rem',
            fontWeight: 600,
            display: 'inline-block'
          }}
        >
          {status}
        </Box>
      </Box>
    </MainCard>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  unit: PropTypes.string,
  status: PropTypes.string
};
