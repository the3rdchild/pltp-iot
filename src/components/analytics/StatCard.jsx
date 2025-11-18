import { Box, Typography } from '@mui/material';
import { useState } from 'react';
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
  timeLabel = '1 Jam terakhir',
  backgroundColor,
  sx = {},
  additionalData = [] // Array of { value, unit, timeLabel }
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasAdditionalData = additionalData.length > 0;

  return (
    <MainCard
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: { xs: 'auto', lg: isHovered && hasAdditionalData ? 'auto' : '68%' },
        minHeight: { md: '230px' },
        transition: 'all 0.3s ease-in-out',
        ...(backgroundColor && { backgroundColor }),
        ...sx
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

        {/* Main value */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: isHovered && hasAdditionalData ? 1 : 0 }}>
          <Box>
            <Typography variant={isHovered && hasAdditionalData ? "h5" : "h2"} component="span" sx={{ transition: 'font-size 0.3s ease-in-out' }}>
              {value}
            </Typography>
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

        {/* Additional data shown on hover */}
        {isHovered && hasAdditionalData && (
          <Box sx={{
            mt: 1,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            animation: 'fadeIn 0.3s ease-in-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            {additionalData.map((data, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: index < additionalData.length - 1 ? 1 : 0 }}>
                <Box>
                  <Typography variant="h5" component="span">
                    {data.value}
                  </Typography>
                  {data.unit && (
                    <Typography variant="body1" component="span" color="textSecondary" sx={{ ml: 0.5 }}>
                      {data.unit}
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 3 }}>
                  {data.timeLabel}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
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
  timeLabel: PropTypes.string,
  backgroundColor: PropTypes.string,
  sx: PropTypes.object,
  additionalData: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    unit: PropTypes.string,
    timeLabel: PropTypes.string.isRequired
  }))
};

export default StatCard;
