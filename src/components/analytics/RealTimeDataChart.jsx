import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';

const RealTimeDataChart = ({
  title = 'Real Time Data',
  subtitle = 'Data chart',
  data = [],
  unit = '%',
  yAxisTitle = 'Value',
  xAxisTitle = 'Time x60',
  legendItems = [
    { name: 'Trend', color: '#8b5cf6' },
    { name: 'Max', color: '#ef4444' },
    { name: 'Average', color: '#d1d5db' },
    { name: 'Min', color: '#10b981' }
  ],
  onTimeRangeChange
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [timeRange, setTimeRange] = useState('daily');

  // Initialize chart only once
  useEffect(() => {
    if (!chartRef.current) return;

    // Use provided data or sample data
    const chartData = data.length > 0 ? data : [
      97.92, 98.44, 98.97, 99.12, 98.65, 99.31, 98.88, 99.04, 99.55, 98.77,
      99.22, 98.91, 99.08, 98.53, 99.47, 98.81, 99.00, 98.69, 99.35, 99.10,
      98.62, 99.28, 98.84, 99.02, 99.61, 98.73, 99.18, 98.95, 99.07, 98.59,
      99.41, 98.86, 99.14, 98.67, 99.33, 99.06, 98.71, 99.26, 98.89, 99.03,
      99.58, 98.75, 99.20, 98.93, 99.09, 98.57, 99.39, 98.83, 99.11, 98.63,
      99.36, 98.96, 99.05, 98.72, 99.24, 98.90, 99.16, 98.61
    ];

    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    const avgValue = chartData.reduce((a, b) => a + b, 0) / chartData.length;
    const categories = Array.from({length: chartData.length}, (_, i) => `Point ${i + 1}`);

    const options = {
      chart: {
        type: 'area',
        height: 400,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false }
      },
      series: [{ name: yAxisTitle, data: chartData }],
      stroke: { curve: 'smooth', width: 2, colors: ['#53A1FF'] },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
        colors: ['#53A1FF']
      },
      dataLabels: { enabled: false },
      markers: { size: 0, hover: { size: 5 } },
      xaxis: {
        categories: categories,
        labels: {
          show: true,
          rotate: 0,
          style: { colors: '#86868b', fontSize: '11px' },
          formatter: function(value, timestamp, index) {
            if (index % 6 === 0) return value;
            return '';
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: { text: xAxisTitle, style: { color: '#86868b', fontSize: '12px', fontWeight: 400 } }
      },
      yaxis: {
        labels: {
          style: { colors: '#86868b', fontSize: '11px' },
          formatter: function(value) { return value.toFixed(1) + unit; }
        },
        title: { text: yAxisTitle, style: { color: '#86868b', fontSize: '12px', fontWeight: 400 } },
        min: Math.floor(minValue - 1),
        max: Math.ceil(maxValue + 1)
      },
      grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 0,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 20, bottom: 0, left: 10 }
      },
      annotations: {
        yaxis: [
          { y: maxValue, borderColor: '#EF4444', strokeDashArray: 20, borderWidth: 1, label: { text: '' } },
          { y: avgValue, borderColor: '#d1d5db', strokeDashArray: 20, borderWidth: 1, label: { text: '' } },
          { y: minValue, borderColor: '#58E58C', strokeDashArray: 20, borderWidth: 1, label: { text: '' } }
        ]
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        x: { show: true },
        y: {
          formatter: function(value) { return value.toFixed(2) + unit; },
          title: { formatter: () => yAxisTitle }
        },
        marker: { show: true }
      },
      legend: { show: false }
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
    chartInstanceRef.current = chart;

    // Cleanup
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array - only initialize once

  // Update chart data when props change
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const chartData = data.length > 0 ? data : [
      97.92, 98.44, 98.97, 99.12, 98.65, 99.31, 98.88, 99.04, 99.55, 98.77,
      99.22, 98.91, 99.08, 98.53, 99.47, 98.81, 99.00, 98.69, 99.35, 99.10,
      98.62, 99.28, 98.84, 99.02, 99.61, 98.73, 99.18, 98.95, 99.07, 98.59,
      99.41, 98.86, 99.14, 98.67, 99.33, 99.06, 98.71, 99.26, 98.89, 99.03,
      99.58, 98.75, 99.20, 98.93, 99.09, 98.57, 99.39, 98.83, 99.11, 98.63,
      99.36, 98.96, 99.05, 98.72, 99.24, 98.90, 99.16, 98.61
    ];

    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    const avgValue = chartData.reduce((a, b) => a + b, 0) / chartData.length;

    chartInstanceRef.current.updateOptions({
      series: [{ name: yAxisTitle, data: chartData }],
      yaxis: {
        labels: {
          style: { colors: '#86868b', fontSize: '11px' },
          formatter: function(value) { return value.toFixed(1) + unit; }
        },
        title: { text: yAxisTitle, style: { color: '#86868b', fontSize: '12px', fontWeight: 400 } },
        min: Math.floor(minValue - 1),
        max: Math.ceil(maxValue + 1)
      },
      annotations: {
        yaxis: [
          { y: maxValue, borderColor: '#EF4444', strokeDashArray: 20, borderWidth: 1, label: { text: '' } },
          { y: avgValue, borderColor: '#d1d5db', strokeDashArray: 20, borderWidth: 1, label: { text: '' } },
          { y: minValue, borderColor: '#58E58C', strokeDashArray: 20, borderWidth: 1, label: { text: '' } }
        ]
      }
    }, false, false); // No redraw, no animation
  }, [data, unit, yAxisTitle]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    if (onTimeRangeChange) {
      onTimeRangeChange(event.target.value);
    }
  };

  return (
    <MainCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: -4 }}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="textSecondary">{subtitle}</Typography>
        </Box>
        <FormControl>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            sx={{
              borderRadius: '20px',
              fontSize: '0.875rem',
              '.MuiSelect-select': {
                padding: '8px 24px 8px 12px'
              },
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: '#d2d2d7',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#86868b',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
              },
            }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
        {legendItems.map(item => (
          <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: item.color }} />
            <Typography variant="caption" color="textSecondary">{item.name}</Typography>
          </Box>
        ))}
      </Box>
      <div id="chart" ref={chartRef}></div>
    </MainCard>
  );
};

RealTimeDataChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.number),
  unit: PropTypes.string,
  yAxisTitle: PropTypes.string,
  xAxisTitle: PropTypes.string,
  legendItems: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })),
  onTimeRangeChange: PropTypes.func
};

export default RealTimeDataChart;
