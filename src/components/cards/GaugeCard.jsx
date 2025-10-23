import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Link } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import MainCard from 'components/MainCard';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// register datalabels plugin
Chart.register(ChartDataLabels);

export default function GaugeCard({
  label = '',
  value = 0,
  min = 0,
  max = 100,
  unit = '',
  abnormalLow = 20,
  warningLow = 40,
  warningHigh = 60,
  abnormalHigh = 80,
  size = 150, // controls canvas container height (px)
  linkTo,
  titleConfig = {}
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const getStatus = (val) => {
    if (val >= warningLow && val <= warningHigh) return { label: 'Normal', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' };
    if ((val >= abnormalLow && val < warningLow) || (val > warningHigh && val <= abnormalHigh)) return { label: 'Warning', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' };
    return { label: 'Abnormal', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' };
  };

  const gaugeNeedle = {
    id: 'gaugeNeedle',
    afterDatasetsDraw(chart) {
      const { ctx, data, chartArea: { width } } = chart;
      if (!chart.getDatasetMeta) return;
      ctx.save();
      const needleValue = data.datasets[0].data[0] ?? value;
      const dataTotal = max - min || 1;
      const normalizedValue = needleValue - min;
      const angle = Math.PI + (normalizedValue / dataTotal) * Math.PI;

      const meta = chart.getDatasetMeta(1);
      if (!meta || !meta.data || !meta.data[0]) return;
      const cx = width / 2;
      const cy = meta.data[0].y;
      const radius = meta.data[0].outerRadius;

      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      //Arrow Edit
      ctx.moveTo(0, -6);
      ctx.lineTo(radius - 3, 0);
      ctx.lineTo(0, 5);

      ctx.fillStyle = '#374151';
      ctx.fill();
      ctx.beginPath();

      //Bola pangkal arrow
      ctx.arc(0, 0, 7, 0, Math.PI * 2, false);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.translate(-cx, -cy);
      ctx.restore();
    }
  };

  const gaugeThresholdLines = {
    id: 'gaugeThresholdLines',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: { width } } = chart;
      ctx.save();
      const thresholds = [abnormalLow, abnormalHigh];
      const dataTotal = max - min || 1;
      const meta = chart.getDatasetMeta(1);
      if (!meta || !meta.data || !meta.data[0]) return;
      const radius = meta.data[0].outerRadius;
      const cx = width / 2;
      const cy = meta.data[0].y;

      thresholds.forEach(val => {
        const normalized = val - min;
        const angle = Math.PI + (normalized / dataTotal) * Math.PI;
        const endX = cx + (radius + 6) * Math.cos(angle);
        const endY = cy + (radius + 6) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        const textX = cx + (radius + 18) * Math.cos(angle);
        const textY = cy + (radius + 18) * Math.sin(angle);
        ctx.font = 'bold 11px Inter, Roboto, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textBaseline = 'middle';
        ctx.textAlign = val < (min + max) / 2 ? 'right' : 'left';
        ctx.fillText(String(val), textX, textY);
      });

      ctx.restore();
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const segData = [
      Math.max(0, abnormalLow - min),
      Math.max(0, warningLow - abnormalLow),
      Math.max(0, warningHigh - warningLow),
      Math.max(0, abnormalHigh - warningHigh),
      Math.max(0, max - abnormalHigh)
    ];

    const segColors = ['#ef4444', '#f59e0b', '#22c55e', '#f59e0b', '#ef4444'];

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['ab-low', 'warn-low', 'normal', 'warn-high', 'ab-high'],
        datasets: [
          { data: [value, max - value], backgroundColor: ['transparent', 'transparent'], borderWidth: 0 },
          { data: segData, backgroundColor: segColors, borderWidth: 0, circumference: 180, rotation: 270 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } }
      },
      plugins: [gaugeNeedle, gaugeThresholdLines]
    });

    return () => chartRef.current?.destroy();
  }, [min, max, abnormalLow, warningLow, warningHigh, abnormalHigh, size]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.datasets[0].data = [value, Math.max(0, max - value)];
    chartRef.current.update('none');
  }, [value, max]);

  const status = getStatus(value);

  const defaultTitleStyles = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'text.secondary',
    justifyContent: 'flex-start'
  };

  const titleStyles = { ...defaultTitleStyles, ...titleConfig };

  return (
    <MainCard sx={{ width: '100%', height: '100%' }} contentSX={{ p: 0, height: '100%' }}>
      <Box sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: titleStyles.justifyContent, mb: 0.5 }}>
          <Link href={linkTo} target="_blank" rel="noopener noreferrer" underline={linkTo ? 'hover' : 'none'} color="inherit">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={titleStyles}>{label}</Typography>
              {linkTo && <LaunchIcon sx={{ fontSize: '0.8rem', color: 'text.secondary' }} />}
            </Box>
          </Link>
        </Box>

        <Box sx={{ position: 'relative', width: '100%', height: `${size}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', px: 1 }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: -6, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, color: status.color }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{unit}</Typography>
          </Box>
          <Box sx={{ px: 1.25, py: 0.4, borderRadius: 2, bgcolor: status.bg, color: status.color, fontWeight: 600 }}>
            {status.label}
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
}

GaugeCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  unit: PropTypes.string,
  abnormalLow: PropTypes.number,
  warningLow: PropTypes.number,
  warningHigh: PropTypes.number,
  abnormalHigh: PropTypes.number,
  size: PropTypes.number,
  linkTo: PropTypes.string,
  titleConfig: PropTypes.object
};
