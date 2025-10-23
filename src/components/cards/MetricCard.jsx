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
    <MainCard sx={{ width: '100%', height: '100%' }} contentSX={{ p: 1.5 }}>
      <Box>
        {/* Label - Top Left */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 1.5,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {label}
        </Typography>

        {/* Value + Unit + Status - Horizontal layout */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1
        }}>
          {/* Value + Unit */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: statusColor,
                lineHeight: 1,
                fontSize: '2rem'
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {unit}
            </Typography>
          </Box>

          {/* Status Badge - Right side */}
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: 2,
              bgcolor: statusColor + '20',
              color: statusColor,
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {status}
          </Box>
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
