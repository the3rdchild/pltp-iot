import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import MainCard from 'components/MainCard';

// Gauge Card with threshold lines and labels like Gauge.txt
export default function GaugeCard({
  value = 0,
  min = 0,
  max = 100,
  unit = '',
  label = '',
  abnormalLow = 20,
  warningLow = 40,
  warningHigh = 60,
  abnormalHigh = 80,
  linkTo = null,
  linkText = null
}) {
  const canvasRef = useRef(null);

  const getStatus = (val) => {
    if (val >= warningLow && val <= warningHigh) {
      return { label: 'Normal', color: '#22c55e' };
    }
    if ((val >= abnormalLow && val < warningLow) || (val > warningHigh && val <= abnormalHigh)) {
      return { label: 'Warning', color: '#f59e0b' };
    }
    return { label: 'Abnormal', color: '#ef4444' };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const radius = Math.min(width, height) / 2.8;

    ctx.clearRect(0, 0, width, height);

    const dataTotal = max - min;

    // Draw segments (arc style)
    const segments = [
      { start: min, end: abnormalLow, color: '#ef4444' },
      { start: abnormalLow, end: warningLow, color: '#f59e0b' },
      { start: warningLow, end: warningHigh, color: '#22c55e' },
      { start: warningHigh, end: abnormalHigh, color: '#f59e0b' },
      { start: abnormalHigh, end: max, color: '#ef4444' }
    ];

    segments.forEach((segment) => {
      const startAngle = Math.PI + (Math.PI * (segment.start - min) / dataTotal);
      const endAngle = Math.PI + (Math.PI * (segment.end - min) / dataTotal);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineWidth = 14;
      ctx.strokeStyle = segment.color;
      ctx.stroke();
    });

    // Draw threshold lines with labels (abnormalLow and abnormalHigh)
    const thresholds = [
      { value: abnormalLow, label: String(abnormalLow) },
      { value: abnormalHigh, label: String(abnormalHigh) }
    ];

    thresholds.forEach(threshold => {
      const normalizedValue = threshold.value - min;
      const angle = Math.PI + (Math.PI * normalizedValue / dataTotal);

      // Draw dashed line from center
      const startR = 0;
      const endR = radius + 8;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + endR * Math.cos(angle),
        centerY + endR * Math.sin(angle)
      );
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Add text label
      const textX = centerX + (radius + 18) * Math.cos(angle);
      const textY = centerY + (radius + 18) * Math.sin(angle);
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillStyle = '#4b5563';

      // Adjust text alignment based on position
      if (threshold.value < max / 2) {
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'left';
      }
      ctx.textBaseline = 'middle';
      ctx.fillText(threshold.label, textX, textY);
    });

    // Draw needle (arrow style like in Gauge.txt)
    const normalizedValue = Math.max(min, Math.min(max, value)) - min;
    const angle = Math.PI + (Math.PI * normalizedValue / dataTotal);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(radius - 18, 0);
    ctx.lineTo(0, 4);
    ctx.fillStyle = '#4b5563';
    ctx.fill();
    ctx.restore();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();

  }, [value, min, max, abnormalLow, warningLow, warningHigh, abnormalHigh]);

  const status = getStatus(value);

  const content = (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {/* Title - Left aligned with link */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        px: 1.5,
        pt: 1,
        pb: 0.5
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
          {label}
          {linkTo && (
            <MuiLink
              component={Link}
              to={linkTo}
              sx={{
                ml: 0.5,
                fontSize: '0.65rem',
                textDecoration: 'none',
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              ↗
            </MuiLink>
          )}
        </Typography>
        {linkText && !linkTo && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            {linkText}
          </Typography>
        )}
      </Box>

      {/* Gauge - 85% of card */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        px: 1
      }}>
        <canvas ref={canvasRef} width={140} height={100} />
      </Box>

      {/* Value | Unit | Status - Horizontal layout below gauge */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap: 0.5,
        px: 1.5,
        pb: 1,
        mt: 0.5
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: status.color, lineHeight: 1, fontSize: '1.5rem' }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {unit}
        </Typography>
        <Box sx={{
          ml: 0.5,
          px: 1.5,
          py: 0.2,
          borderRadius: 1.5,
          bgcolor: status.color + '20',
          color: status.color,
          fontSize: '0.65rem',
          fontWeight: 600,
          display: 'inline-block'
        }}>
          {status.label}
        </Box>
      </Box>
    </Box>
  );

  return <MainCard contentSX={{ p: 0, height: '100%' }}>{content}</MainCard>;
}

GaugeCard.propTypes = {
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  unit: PropTypes.string,
  label: PropTypes.string,
  abnormalLow: PropTypes.number,
  warningLow: PropTypes.number,
  warningHigh: PropTypes.number,
  abnormalHigh: PropTypes.number,
  linkTo: PropTypes.string,
  linkText: PropTypes.string
};
