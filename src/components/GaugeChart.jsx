import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

// GaugeChart component - simplified version based on Gauge.txt
const GaugeChart = ({
  value = 0,
  min = 0,
  max = 100,
  unit = '',
  paramName = '',
  abnormalLow = 20,
  warningLow = 40,
  warningHigh = 60,
  abnormalHigh = 80,
  size = 200
}) => {
  const canvasRef = useRef(null);

  // Helper function to get status
  const getStatus = (val) => {
    if (val >= warningLow && val <= warningHigh) {
      return { label: 'Normal', color: '#22c55e' }; // Green
    }
    if ((val >= abnormalLow && val < warningLow) || (val > warningHigh && val <= abnormalHigh)) {
      return { label: 'Warning', color: '#f59e0b' }; // Orange
    }
    return { label: 'Abnormal', color: '#ef4444' }; // Red
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2.5;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw gauge segments
    const dataTotal = max - min;
    const segments = [
      { start: min, end: abnormalLow, color: '#ef4444' }, // Abnormal Low - Red
      { start: abnormalLow, end: warningLow, color: '#f59e0b' }, // Warning Low - Orange
      { start: warningLow, end: warningHigh, color: '#22c55e' }, // Normal - Green
      { start: warningHigh, end: abnormalHigh, color: '#f59e0b' }, // Warning High - Orange
      { start: abnormalHigh, end: max, color: '#ef4444' } // Abnormal High - Red
    ];

    segments.forEach((segment) => {
      const startAngle = Math.PI + (Math.PI * (segment.start - min) / dataTotal);
      const endAngle = Math.PI + (Math.PI * (segment.end - min) / dataTotal);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineWidth = 20;
      ctx.strokeStyle = segment.color;
      ctx.stroke();
    });

    // Draw needle
    const normalizedValue = value - min;
    const angle = Math.PI + (Math.PI * normalizedValue / dataTotal);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(radius - 15, 0);
    ctx.lineTo(0, 3);
    ctx.fillStyle = '#4b5563';
    ctx.fill();
    ctx.restore();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();

  }, [value, min, max, abnormalLow, warningLow, warningHigh, abnormalHigh, size]);

  const status = getStatus(value);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <canvas ref={canvasRef} width={size} height={size} />
      <Box sx={{
        position: 'absolute',
        bottom: '20%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: status.color,
            lineHeight: 1
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {unit}
        </Typography>
        <Box
          sx={{
            mt: 1,
            px: 2,
            py: 0.5,
            borderRadius: 2,
            bgcolor: status.color + '20',
            color: status.color,
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          {status.label}
        </Box>
      </Box>
      {paramName && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {paramName}
        </Typography>
      )}
    </Box>
  );
};

GaugeChart.propTypes = {
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  unit: PropTypes.string,
  paramName: PropTypes.string,
  abnormalLow: PropTypes.number,
  warningLow: PropTypes.number,
  warningHigh: PropTypes.number,
  abnormalHigh: PropTypes.number,
  size: PropTypes.number
};

export default GaugeChart;
