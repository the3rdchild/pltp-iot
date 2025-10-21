// components/cards/GaugeCard.jsx
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import MainCard from 'components/MainCard';

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
  linkText = null,
  // canvas/layout props
  gaugeWidth = 140,      // canvas width in px (DOM attr)
  gaugeHeight = 100,     // canvas height in px (DOM attr)
  // drawing/layout hints (parent should compute these)
  drawSize = null,       // effective drawing diameter (px). if null, computed from inner box * barScale
  outerPadding = 6,      // px padding left/right
  topPadding = 4,        // px padding top
  bottomPadding = 6,     // px padding bottom
  barScale = 0.92        // fraction of inner box to use for drawSize
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

    // device pixel ratio handling for crisp canvas
    const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.round(gaugeWidth * DPR);
    canvas.height = Math.round(gaugeHeight * DPR);
    canvas.style.width = `${gaugeWidth}px`;
    canvas.style.height = `${gaugeHeight}px`;

    const ctx = canvas.getContext('2d');
    // scale context to device pixel ratio
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, gaugeWidth, gaugeHeight);

    // inner drawing box (respect paddings)
    const innerW = Math.max(0, gaugeWidth - outerPadding * 2);
    const innerH = Math.max(0, gaugeHeight - (topPadding + bottomPadding));

    // compute drawSize: either from prop or from inner box multiplied by barScale
    const computedDrawSize = drawSize || Math.round(Math.min(innerW, innerH) * barScale);
    const radius = Math.max(10, Math.round(computedDrawSize / 2));

    // center coordinates: horizontally centered; vertically positioned to leave space below for value/unit
    const centerX = gaugeWidth / 2;
    // using 0.55 of innerH works well; tweak if you want arc higher/lower
    const centerY = topPadding + Math.round(innerH * 0.55);

    // EXACT semicircle angles: 180° from PI to 0
    const startAngle = Math.PI;   // 180°
    const endAngle = 0;           // 0°

    const dataTotal = Math.max(1, max - min);

    // arc thickness relative to radius
    const arcThickness = Math.max(6, Math.round(radius * 0.22));

    ctx.lineCap = 'round';

    // Draw background arc (full semicircle)
    ctx.beginPath();
    ctx.lineWidth = arcThickness;
    ctx.strokeStyle = '#e6eef6';
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.stroke();

    // Draw colored segments proportional to ranges
    const segments = [
      { start: min, end: abnormalLow, color: '#ef4444' },
      { start: abnormalLow, end: warningLow, color: '#f59e0b' },
      { start: warningLow, end: warningHigh, color: '#22c55e' },
      { start: warningHigh, end: abnormalHigh, color: '#f59e0b' },
      { start: abnormalHigh, end: max, color: '#ef4444' }
    ];

    segments.forEach(segment => {
      // clamp segment
      const segStart = Math.max(min, Math.min(max, segment.start));
      const segEnd = Math.max(min, Math.min(max, segment.end));
      if (segEnd <= segStart) return;

      const startPct = (segStart - min) / dataTotal;
      const endPct = (segEnd - min) / dataTotal;
      const segStartAngle = startAngle + (endAngle - startAngle) * startPct;
      const segEndAngle = startAngle + (endAngle - startAngle) * endPct;

      ctx.beginPath();
      ctx.lineWidth = arcThickness;
      ctx.strokeStyle = segment.color;
      ctx.arc(centerX, centerY, radius, segStartAngle, segEndAngle, false);
      ctx.stroke();
    });

    // Threshold dashed lines (abnormalLow & abnormalHigh)
    const thresholds = [
      { value: abnormalLow, label: String(abnormalLow) },
      { value: abnormalHigh, label: String(abnormalHigh) }
    ];

    thresholds.forEach(threshold => {
      const clamped = Math.max(min, Math.min(max, threshold.value));
      const pct = (clamped - min) / dataTotal;
      const angle = startAngle + (endAngle - startAngle) * pct;

      const lineOut = radius + Math.round(arcThickness * 0.9) + 6;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + lineOut * Math.cos(angle), centerY + lineOut * Math.sin(angle));
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // label
      const labelRadius = radius + 16;
      const textX = centerX + labelRadius * Math.cos(angle);
      const textY = centerY + labelRadius * Math.sin(angle);
      ctx.font = 'bold 10px Inter, Roboto, sans-serif';
      ctx.fillStyle = '#374151';
      ctx.textBaseline = 'middle';
      // alignment heuristic
      if (pct < 0.45) ctx.textAlign = 'right';
      else if (pct > 0.55) ctx.textAlign = 'left';
      else ctx.textAlign = 'center';
      ctx.fillText(threshold.label, textX, textY);
    });

    // Draw needle
    const normalizedValue = Math.max(min, Math.min(max, value)) - min;
    const pctValue = normalizedValue / dataTotal;
    const needleAngle = startAngle + (endAngle - startAngle) * pctValue;

    // needle as filled triangle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(needleAngle);
    ctx.beginPath();
    ctx.moveTo(0, -Math.max(4, Math.round(arcThickness * 0.3)));
    ctx.lineTo(radius - Math.round(arcThickness * 0.8), 0);
    ctx.lineTo(0, Math.max(4, Math.round(arcThickness * 0.3)));
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.restore();

    // center cap
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.max(4, Math.round(arcThickness * 0.6)), 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // numeric value and unit below the gauge
    const valueFontSize = Math.max(12, Math.round(gaugeHeight * 0.16));
    const unitFontSize = Math.max(10, Math.round(gaugeHeight * 0.08));
    ctx.font = `bold ${valueFontSize}px Inter, Roboto, sans-serif`;
    ctx.fillStyle = getStatus(value).color;
    ctx.textAlign = 'center';
    ctx.fillText(String(value), centerX, centerY + radius * 0.9);

    ctx.font = `${unitFontSize}px Inter, Roboto, sans-serif`;
    ctx.fillStyle = '#6b7280';
    ctx.fillText(unit || '', centerX, centerY + radius * 1.15);

  }, [
    value, min, max, abnormalLow, warningLow, warningHigh, abnormalHigh,
    gaugeWidth, gaugeHeight, drawSize, outerPadding, topPadding, bottomPadding, barScale
  ]);

  const status = getStatus(value);

  const content = (
    <Box sx={{ position: 'relative', height: '100%' }}>
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

      <Box sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        px: 1
      }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </Box>

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
  linkText: PropTypes.string,
  gaugeWidth: PropTypes.number,
  gaugeHeight: PropTypes.number,
  drawSize: PropTypes.number,
  outerPadding: PropTypes.number,
  topPadding: PropTypes.number,
  bottomPadding: PropTypes.number,
  barScale: PropTypes.number
};
