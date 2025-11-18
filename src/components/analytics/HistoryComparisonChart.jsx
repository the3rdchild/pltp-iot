import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography, Grid } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';

const HistoryComparisonChart = ({
  title = 'History Data & Perbandingan',
  subtitle = 'Grafik history data dan perbandingan',
  dataset1 = [],
  dataset2 = [],
  dataset1Label = 'Real-Data',
  dataset2Label = 'AI-Data',
  unit = '%',
  yAxisTitle = 'Value',
  xAxisTitle = 'Time x30',
  statsLabels = {
    field1Range: 'Field Range',
    field1Avg: 'Field Average',
    field2Range: 'AI Range',
    field2Avg: 'AI Average'
  },
  legendItems = [
    { name: 'Real-Data', color: '#53A1FF' },
    { name: 'Ai-Data', color: '#8b5cf6' },
    { name: 'Max', color: '#ef4444' },
    { name: 'Average', color: '#d1d5db' },
    { name: 'Min', color: '#10b981' }
  ],
  onPickDate,
  onAddNew
}) => {
  const chartRef = useRef(null);
  const [statsData, setStatsData] = useState([
    { title: statsLabels.field1Range, value: '98.4% - 99.9%' },
    { title: statsLabels.field1Avg, value: '99.01%' },
    { title: statsLabels.field2Range, value: '98.4 - 99.9%' },
    { title: statsLabels.field2Avg, value: '99.01%' }
  ]);

  useEffect(() => {
    // Sample data for datasets
    const data1 = dataset1.length > 0 ? dataset1 : [
      99.32, 99.01, 98.58, 98.63, 99.36, 99.27, 99.52, 99.38, 99.13, 98.68,
      99.41, 98.95, 99.08, 98.75, 99.55, 99.48, 98.59, 98.71, 99.02, 99.21,
      98.53, 99.44, 98.82, 99.61, 99.15, 98.92, 99.35, 99.07, 99.50, 99.26
    ];

    const data2 = dataset2.length > 0 ? dataset2 : [
      98.87, 99.15, 98.73, 98.56, 99.28, 99.42, 99.07, 99.51, 99.64, 99.21,
      99.38, 98.91, 99.73, 98.48, 99.56, 99.12, 98.68, 99.47, 99.03, 98.79,
      99.61, 99.24, 98.96, 98.59, 99.43, 99.18, 98.82, 99.35, 98.71, 99.57
    ];

    const allData = [...data1, ...data2];
    const maxValue = Math.max(...allData);
    const minValue = Math.min(...allData);
    const categories = Array.from({length: data1.length}, (_, i) => `Point ${i + 1}`);

    // Calculate statistics for both datasets
    const dataset1Max = Math.max(...data1);
    const dataset1Min = Math.min(...data1);
    const dataset1Avg = data1.reduce((a, b) => a + b, 0) / data1.length;

    const dataset2Max = Math.max(...data2);
    const dataset2Min = Math.min(...data2);
    const dataset2Avg = data2.reduce((a, b) => a + b, 0) / data2.length;

    // Update stats
    setStatsData([
      { title: statsLabels.field1Range, value: `${dataset1Min.toFixed(1)}${unit} - ${dataset1Max.toFixed(1)}${unit}` },
      { title: statsLabels.field1Avg, value: `${dataset1Avg.toFixed(2)}${unit}` },
      { title: statsLabels.field2Range, value: `${dataset2Min.toFixed(1)}${unit} - ${dataset2Max.toFixed(1)}${unit}` },
      { title: statsLabels.field2Avg, value: `${dataset2Avg.toFixed(2)}${unit}` }
    ]);

    const options = {
      chart: {
        type: 'area',
        height: 400,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
      },
      series: [
        { name: dataset1Label, data: data1 },
        { name: dataset2Label, data: data2 }
      ],
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#53A1FF', '#8b5cf6']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        },
        colors: ['#53A1FF', '#8b5cf6']
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
          formatter: function(value) { return value.toFixed(2) + unit; }
        },
        title: { text: yAxisTitle, style: { color: '#86868b', fontSize: '12px', fontWeight: 400 } },
        min: minValue - 0.2,
        max: maxValue + 0.2
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
          { y: maxValue, borderColor: '#ef4444', strokeDashArray: 20, borderWidth: 1, label: { text: '' } },
          { y: (dataset1Avg + dataset2Avg) / 2, borderColor: '#d1d5db', strokeDashArray: 20, borderWidth: 1, label: { text: '' } },
          { y: minValue, borderColor: '#10b981', strokeDashArray: 20, borderWidth: 1, label: { text: '' } }
        ]
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        x: { show: true },
        y: {
          formatter: function(value) { return value.toFixed(2) + unit; }
        },
        marker: { show: true }
      },
      legend: { show: false }
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();

    // Cleanup
    return () => {
      chart.destroy();
    };
  }, [dataset1, dataset2, dataset1Label, dataset2Label, unit, yAxisTitle, xAxisTitle, statsLabels]);

  return (
    <MainCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: -4 }}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="textSecondary">{subtitle}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box
            onClick={onPickDate}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: '20px',
              border: '1px solid #d2d2d7',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#86868b'
              }
            }}
          >
            <Typography variant="body2">Pick a date</Typography>
            <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
          </Box>
          <Box
            onClick={onAddNew}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: '20px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Add New</Typography>
            <AddIcon sx={{ fontSize: '1rem' }} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
        {legendItems.map(item => (
          <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: item.color }} />
            <Typography variant="caption" color="textSecondary">{item.name}</Typography>
          </Box>
        ))}
      </Box>

      <div id="history-chart" ref={chartRef}></div>

      {/* Bottom Stats Cards */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box
              sx={{
                p: 2,
                border: '1px solid #f1f1f1',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                {stat.title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {stat.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </MainCard>
  );
};

HistoryComparisonChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  dataset1: PropTypes.arrayOf(PropTypes.number),
  dataset2: PropTypes.arrayOf(PropTypes.number),
  dataset1Label: PropTypes.string,
  dataset2Label: PropTypes.string,
  unit: PropTypes.string,
  yAxisTitle: PropTypes.string,
  xAxisTitle: PropTypes.string,
  statsLabels: PropTypes.shape({
    field1Range: PropTypes.string,
    field1Avg: PropTypes.string,
    field2Range: PropTypes.string,
    field2Avg: PropTypes.string
  }),
  legendItems: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })),
  onPickDate: PropTypes.func,
  onAddNew: PropTypes.func
};

export default HistoryComparisonChart;
