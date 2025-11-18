import { Box, Typography } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';

const StatCard = ({
  title,
  value,
  unit,
  icon,
  iconBgColor = '#9271FF',
  iconColor = '#fff',
  timeLabel = '1 Jam terakhir'
}) => {
  return (
    <MainCard
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: { xs: 'auto', lg: '68%' },
        minHeight: { md: '230px' },
      }}
    >
      {/* header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">{title}</Typography>
        <Box sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: '#F6F6F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ArrowOutwardIcon sx={{ fontSize: '1rem', color: 'text.dark' }} />
        </Box>
      </Box>

      {/* content */}
      <Box sx={{ py: 2, flexGrow: 1 }}>
        <Box sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: iconBgColor,
          color: iconColor,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          textAlign: 'center'
        }}>
          {icon}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Box>
            <Typography variant="h2" component="span">{value}</Typography>
            {unit && (
              <Typography variant="body1" component="span" color="textSecondary" sx={{ ml: 0.5 }}>
                {unit}
              </Typography>
            )}
          </Box>
          <Typography variant="caption" color="textSecondary" sx={{ ml: 3 }}>
            {timeLabel}
          </Typography>
        </Box>
      </Box>
    </MainCard>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  icon: PropTypes.node.isRequired,
  iconBgColor: PropTypes.string,
  iconColor: PropTypes.string,
  timeLabel: PropTypes.string
};

export default StatCard;
