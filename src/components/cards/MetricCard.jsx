import PropTypes from 'prop-types';
import { Box, Typography, Link } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import MainCard from 'components/MainCard';

const NO_VALUE_LABEL = 'N/A';
const NO_VALUE_COLOR = '#94a3b8';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'normal':
      return '#22c55e';
    case 'warning':
      return '#f59e0b';
    case 'abnormal':
    case 'critical':
    case 'low':
    case 'high':
      return '#ef4444';
    default:
      // Anything unrecognized, N/A included, reads grey. It used to return
      // green, which meant a missing or unknown status looked like a
      // confirmed healthy one -- the same false-safe shape as the
      // `ai1a.severity` bug fixed in 3eb76de.
      return NO_VALUE_COLOR;
  }
};

const hasReading = (value) => value !== null && value !== undefined && !Number.isNaN(value);

export default function MetricCard({ label, value, unit, status, linkTo, titleConfig = {}, icon: Icon, iconConfig = {} }) {
  // No reading means no number and no unit: "N/A MW" would still read as a
  // measurement. The status badge goes with it, since a status derived from
  // a value that does not exist is not a status.
  const available = hasReading(value);
  const statusColor = getStatusColor(available ? status : NO_VALUE_LABEL);

  const defaultTitleStyles = {
    fontSize: '0.75rem',
    textTransform: 'capitalize',
    letterSpacing: '0.5px',
    color: 'text.secondary',
    justifyContent: 'flex-start'
  };

  const titleStyles = { ...defaultTitleStyles, ...titleConfig };

  // Default icon configuration
  const defaultIconConfig = {
    size: 32,
    color: '#ef4444',
    circleSize: 60,
    circleBgColor: '#FBFBFB',
    circleBorderColor: 'divider',
    circleBorderWidth: '1px'
  };

  const iconStyles = { ...defaultIconConfig, ...iconConfig };

  return (
    <MainCard sx={{ width: '100%', height: '100%' }} contentSX={{ p: 1.5 }}>
      <Box>
        {/* Label - Top */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: titleStyles.justifyContent, mb: 1 }}>
          {linkTo ? (
            <Link href={linkTo} underline="hover" color="inherit">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ ...titleStyles, fontSize: '1.35rem' }}>{label}</Typography>
                <ArrowOutwardIcon sx={{ fontSize: '.8rem', color: 'text.secondary' }} />
              </Box>
            </Link>
          ) : (
            <Typography sx={{ ...titleStyles, fontSize: '1.35rem' }}>{label}</Typography>
          )}
        </Box>

        {/* Value + Icon Layout */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left side: Value + Unit + Status */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1,
                  fontSize: '1.75rem'
                }}
              >
                {available ? value : NO_VALUE_LABEL}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '1rem',
                  fontWeight: 400
                }}
              >
                {available ? unit : ''}
              </Typography>
            </Box>

            {/* Status Badge */}
            <Box
              sx={{
                px: 1.5,
                py: 0.4,
                borderRadius: 2,
                bgcolor: statusColor + '15',
                color: statusColor,
                fontSize: '0.905rem',
                fontWeight: 700,
                display: 'inline-block'
              }}
            >
              {available ? status : NO_VALUE_LABEL}
            </Box>
          </Box>

          {/* Right side: Icon Circle */}
          <Box
            sx={{
              width: iconStyles.circleSize,
              height: iconStyles.circleSize,
              borderRadius: '50%',
              border: iconStyles.circleBorderWidth + ' solid',
              borderColor: iconStyles.circleBorderColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: iconStyles.circleBgColor,
              flexShrink: 0
            }}
          >
            {Icon ? (
              <Box
                component={Icon}
                sx={{
                  fontSize: `${iconStyles.size}px !important`,
                  color: iconStyles.color,
                  width: `${iconStyles.size}px`,
                  height: `${iconStyles.size}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                style={{
                  fontSize: `${iconStyles.size}px`,
                  color: iconStyles.color,
                  width: `${iconStyles.size}px`,
                  height: `${iconStyles.size}px`
                }}
              />
            ) : (
              <BoltIcon
                sx={{
                  fontSize: `${iconStyles.size}px`,
                  color: iconStyles.color
                }}
              />
            )}
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
  status: PropTypes.string,
  linkTo: PropTypes.string,
  titleConfig: PropTypes.object,
  icon: PropTypes.elementType,
  iconConfig: PropTypes.shape({
    size: PropTypes.number,
    color: PropTypes.string,
    circleSize: PropTypes.number,
    circleBgColor: PropTypes.string,
    circleBorderColor: PropTypes.string,
    circleBorderWidth: PropTypes.string
  })
};
