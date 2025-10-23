import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
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
  size = 150 // controls canvas container height (px)
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const getStatus = (val) => {
    if (val >= warningLow && val <= warningHigh) return { label: 'Normal', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' };
    if ((val >= abnormalLow && val < warningLow) || (val > warningHigh && val <= abnormalHigh)) return { label: 'Warning', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' };
    return { label: 'Abnormal', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' };
  };

  // Needle plugin (adapted from your verified gauge.html)
  const gaugeNeedle = {
    id: 'gaugeNeedle',
    afterDatasetsDraw(chart) {
      const { ctx, data, chartArea: { width } } = chart;
      if (!chart.getDatasetMeta) return;
      ctx.save();
      const needleValue = data.datasets[0].data[0] ?? value;
      const dataTotal = max - min || 1;
      const normalizedValue = needleValue - min;
      // angle mapping: start at PI (left) + pct * PI -> semicircle top left->right
      const angle = Math.PI + (normalizedValue / dataTotal) * Math.PI;

      // center and radius taken from dataset meta (dataset index 1 is the segments)
      const meta = chart.getDatasetMeta(1);
      if (!meta || !meta.data || !meta.data[0]) return;
      const cx = width / 2;
      const cy = meta.data[0].y;
      const radius = meta.data[0].outerRadius;

      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(radius - 15, 0);
      ctx.lineTo(0, 6);
      ctx.fillStyle = '#374151';
      ctx.fill();
      // needle dot
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2, false);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.translate(-cx, -cy);
      ctx.restore();
    }
  };

  // Threshold lines plugin
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

        // label
        const textX = cx + (radius + 18) * Math.cos(angle);
        const textY = cy + (radius + 18) * Math.sin(angle);
        ctx.font = 'bold 11px Inter, Roboto, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textBaseline = 'middle';
        if (val < (min + max) / 2) ctx.textAlign = 'center';
        else ctx.textAlign = 'center';
        ctx.fillText(String(val), textX, textY);
      });

      ctx.restore();
    }
  };

  useEffect(() => {
    // create chart (or recreate if exists)
    const ctx = canvasRef.current.getContext('2d');

    // destroy previous
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const segData = [
      Math.max(0, abnormalLow - min),
      Math.max(0, warningLow - abnormalLow),
      Math.max(0, warningHigh - warningLow),
      Math.max(0, abnormalHigh - warningHigh),
      Math.max(0, max - abnormalHigh)
    ];

    const segColors = [
      '#ef4444', // abnormal low
      '#f59e0b', // warning low
      '#22c55e', // normal
      '#f59e0b', // warning high
      '#ef4444'  // abnormal high
    ];

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['ab-low', 'warn-low', 'normal', 'warn-high', 'ab-high'],
        datasets: [
          {
            // invisible dataset used only for needle mapping
            data: [value, max - value],
            backgroundColor: ['transparent', 'transparent'],
            borderWidth: 0
          },
          {
            data: segData,
            backgroundColor: segColors,
            borderWidth: 0,
            circumference: 180,
            rotation: 270
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: { display: false }
        }
      },
      plugins: [gaugeNeedle, gaugeThresholdLines]
    });

    // initial update
    chartRef.current.update();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // recreate chart whenever core config changes (thresholds/min/max)
  }, [min, max, abnormalLow, warningLow, warningHigh, abnormalHigh, size]);

  // update needle/value on prop change
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.datasets[0].data = [value, Math.max(0, max - value)];
    chartRef.current.update('none');
  }, [value, max]);

  const status = getStatus(value);

  return (
    <MainCard sx={{ width: '100%', height: '100%' }} contentSX={{ p: 0, height: '100%' }}>
      <Box sx={{ p: 1 }}>
        {/* top label row */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Box>

        {/* canvas area */}
        <Box sx={{ position: 'relative', width: '100%', height: `${size}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', px: 1 }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </Box>

        {/* digital readout */}
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
  size: PropTypes.number
};
