// StatCardShadowFix.jsx
import { Box, Typography, Paper } from '@mui/material';
import { useState, useRef, useCallback } from 'react';
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
  additionalData = []
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef(null);
  const hasAdditionalData = additionalData.length > 0;

  const onEnter = useCallback(() => setIsHovered(true), []);
  const onLeave = useCallback(() => setIsHovered(false), []);

  const CardBody = (showAdditional = false) => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, pt: 0 }}>
        <Typography variant="h6" color="textSecondary">{title}</Typography>
        <Box sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ArrowOutwardIcon sx={{ fontSize: '1rem', color: 'text.dark' }} />
        </Box>
      </Box>

      <Box sx={{ py: 2, px: 0, flexGrow: 1 }}>
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
            <Typography
              variant={showAdditional && hasAdditionalData ? "h5" : "h2"}
              component="span"
              sx={{ transition: 'font-size 0.18s ease-in-out' }}
            >
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

        {showAdditional && hasAdditionalData && (
          <Box sx={{
            mt: 1,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider'
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
    </>
  );

  return (
    <Box
      ref={wrapperRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      sx={{
        position: 'relative',
        overflow: 'visible',
        width: '100%',
        // ensure overlay renders above everything in this area
        zIndex: (theme) => isHovered ? theme.zIndex.modal + 20 : 'auto',
        ...sx
      }}
    >
      {/* Base card (remains in flow) */}
      <MainCard
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: { xs: 'auto', lg: '68%' },
          minHeight: { md: '230px' },
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          transform: isHovered ? 'translateY(-6px) scale(1.005)' : 'none',
          // base shadow only when no additionalData (collapsed state)
          boxShadow: isHovered && !hasAdditionalData ? '0 12px 30px rgba(0, 0, 0, 0.15)' : 'none',
          backgroundColor: backgroundColor || undefined,
          pointerEvents: 'auto'
        }}
        aria-hidden={isHovered}
      >
        {CardBody(false)}
      </MainCard>

      {hasAdditionalData && (
        /* Paper wrapper ensures the shadow/elevation is painted correctly and not overridden */
        <Paper
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          elevation={16} // use MUI elevation to ensure shadow is present
          square={false}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            zIndex: (theme) => theme.zIndex.modal + 30,
            pointerEvents: isHovered ? 'auto' : 'none',
            transition: 'opacity 180ms ease, transform 180ms ease, box-shadow 180ms ease',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(-6px) scale(1.008)' : 'translateY(0) scale(0.997)',
            borderRadius: 5,
            // prefer boxShadow + filter for robust appearance
            boxShadow: isHovered ? '0 18px 48px rgba(0, 0, 0, 0.07)' : 'none',
            // GPU hint
            willChange: 'transform, opacity, box-shadow',
            // backface to avoid weird blur in some browsers
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            // debug border: uncomment to visually verify overlay bounds
            // border: '1px solid rgba(255,0,0,0.25)',
            overflow: 'visible',
          }}
        >
          {/* inside Paper put full MainCard to match visuals */}
          <MainCard
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              height: 'auto',
              minHeight: { md: '230px' },
              backgroundColor: backgroundColor || undefined,
              // make sure MainCard doesn't override Paper's boxShadow visually
              boxShadow: 'none'
            }}
          >
            {CardBody(true)}
          </MainCard>
        </Paper>
      )}
    </Box>
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
