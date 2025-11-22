import React, { useEffect, useRef, useState, useMemo } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography, Button, ButtonGroup, Popover, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from 'dayjs';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';
import { generateRealTimeChartData } from '../../data/simulasi';
import { generateAIData, generateFieldData } from '../../data/chartData';

const RealTimeDataChart = ({
  title = 'Real Time Data',
  subtitle = 'Dryness level data chart monthly',
  dataType = 'dryness',
  unit = '%',
  yAxisTitle = 'Dryness (%)',
  xAxisTitle = 'Time x60',
  legendItems = [
    { name: 'Trend', color: '#3b82f6' },
    { name: 'Max', color: '#ef4444' },
    { name: 'Average', color: '#9ca3af' },
    { name: 'Min', color: '#22c55e' }
  ],
  thresholds = {
    showMax: true,
    showMin: true,
    showAverage: true
  },
  showComparison = false // Show AI vs Field comparison (only for dryness/ncg on 1y+ ranges)
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const updateIntervalRef = useRef(null);

  const [timeRange, setTimeRange] = useState('now');
  const [chartData, setChartData] = useState([]);
  const [fieldData, setFieldData] = useState([]);
  const [aiData, setAiData] = useState([]);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'year'));
  const [endDate, setEndDate] = useState(dayjs());
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [showComparisonData, setShowComparisonData] = useState(false);

  // Time range buttons configuration
  const timeRanges = [
    { value: 'now', label: 'Now' },
    { value: '1h', label: '1h' },
    { value: '1d', label: '1d' },
    { value: '7d', label: '7d' },
    { value: '1m', label: '1m' },
    { value: '1y', label: '1y' },
    { value: '10y', label: '10y' }
  ];

  // Determine if we should show comparison (AI vs Field)
  const shouldShowComparison = useMemo(() => {
    const isYearlyRange = ['1y', '10y'].includes(timeRange) || isCustomRange;
    const isComparisonType = ['dryness', 'ncg'].includes(dataType);
    return showComparison && isYearlyRange && isComparisonType;
  }, [timeRange, isCustomRange, dataType, showComparison]);

  // Initialize chart data
  useEffect(() => {
    if (shouldShowComparison) {
      // Generate AI vs Field data for comparison
      const start = isCustomRange ? startDate.toDate() : dayjs().subtract(timeRange === '10y' ? 10 : 1, 'year').toDate();
      const end = isCustomRange ? endDate.toDate() : dayjs().toDate();

      const aiDataPoints = generateAIData(start, end, dataType);
      const fieldDataPoints = generateFieldData(start, end, dataType);

      setAiData(aiDataPoints.map(d => d.value));
      setFieldData(fieldDataPoints.map(d => d.value));
      setShowComparisonData(true);
    } else {
      // Use real-time data for shorter ranges
      const initialData = generateRealTimeChartData(dataType, timeRange);
      setChartData(initialData);
      setShowComparisonData(false);
    }
  }, [timeRange, dataType, isCustomRange, startDate, endDate, shouldShowComparison]);

  // Real-time updates for 'Now' mode only
  useEffect(() => {
    if (timeRange === 'now' && !showComparisonData) {
      updateIntervalRef.current = setInterval(() => {
        setChartData(prevData => generateRealTimeChartData(dataType, 'now', prevData));
      }, 1000); // Update every 1 second
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [timeRange, dataType, showComparisonData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (showComparisonData && aiData.length > 0 && fieldData.length > 0) {
      const aiMax = Math.max(...aiData);
      const aiMin = Math.min(...aiData);
      const aiAvg = aiData.reduce((a, b) => a + b, 0) / aiData.length;

      const fieldMax = Math.max(...fieldData);
      const fieldMin = Math.min(...fieldData);
      const fieldAvg = fieldData.reduce((a, b) => a + b, 0) / fieldData.length;

      return {
        aiMax,
        aiMin,
        aiAvg,
        fieldMax,
        fieldMin,
        fieldAvg,
        maxValue: Math.max(aiMax, fieldMax),
        minValue: Math.min(aiMin, fieldMin),
        avgValue: (aiAvg + fieldAvg) / 2
      };
    } else if (chartData.length > 0) {
      const maxValue = Math.max(...chartData);
      const minValue = Math.min(...chartData);
      const avgValue = chartData.reduce((a, b) => a + b, 0) / chartData.length;

      return { maxValue, minValue, avgValue };
    }

    return {};
  }, [chartData, aiData, fieldData, showComparisonData]);

  // Stats for display cards (only show when comparison is active)
  const statsData = useMemo(() => {
    if (!showComparisonData) return [];

    return [
      {
        title: 'Field Range',
        value: `${stats.fieldMin?.toFixed(1)}${unit} - ${stats.fieldMax?.toFixed(1)}${unit}`
      },
      {
        title: 'Field Average',
        value: `${stats.fieldAvg?.toFixed(2)}${unit}`
      },
      {
        title: 'AI Range',
        value: `${stats.aiMin?.toFixed(1)}${unit} - ${stats.aiMax?.toFixed(1)}${unit}`
      },
      {
        title: 'AI Average',
        value: `${stats.aiAvg?.toFixed(2)}${unit}`
      }
    ];
  }, [stats, unit, showComparisonData]);

  // Initialize ApexCharts (only once or when major config changes)
  useEffect(() => {
    if (!chartRef.current) return;

    const maxValue = stats.maxValue || 100;
    const minValue = stats.minValue || 0;
    const avgValue = stats.avgValue || 50;

    const initialData = showComparisonData
      ? (fieldData.length > 0 ? fieldData : Array(60).fill(0))
      : (chartData.length > 0 ? chartData : Array(60).fill(0));

    const categories = Array.from({ length: initialData.length }, (_, i) => `${i + 1}`);

    const annotations = [];
    if (thresholds.showMax && maxValue) {
      annotations.push({
        y: maxValue,
        borderColor: '#ef4444',
        strokeDashArray: 5,
        borderWidth: 2,
        label: { text: '' }
      });
    }
    if (thresholds.showAverage && avgValue) {
      annotations.push({
        y: avgValue,
        borderColor: '#9ca3af',
        strokeDashArray: 5,
        borderWidth: 2,
        label: { text: '' }
      });
    }
    if (thresholds.showMin && minValue) {
      annotations.push({
        y: minValue,
        borderColor: '#22c55e',
        strokeDashArray: 5,
        borderWidth: 2,
        label: { text: '' }
      });
    }

    const series = showComparisonData
      ? [
          { name: 'Field Data', data: fieldData.length > 0 ? fieldData : Array(60).fill(0) },
          { name: 'AI Data', data: aiData.length > 0 ? aiData : Array(60).fill(0) }
        ]
      : [{ name: yAxisTitle, data: chartData.length > 0 ? chartData : Array(60).fill(0) }];

    const colors = showComparisonData ? ['#53A1FF', '#8b5cf6'] : ['#3b82f6'];

    const options = {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: timeRange === 'now' && !showComparisonData,
          easing: 'linear',
          dynamicAnimation: {
            enabled: true,
            speed: 1000
          }
        }
      },
      series: series,
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: colors
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        },
        colors: colors
      },
      dataLabels: { enabled: false },
      markers: {
        size: 0,
        hover: { size: 5 }
      },
      xaxis: {
        categories: categories,
        labels: {
          show: true,
          rotate: 0,
          style: {
            colors: '#86868b',
            fontSize: '11px'
          },
          formatter: function (value, timestamp, index) {
            const totalPoints = categories.length;
            if (totalPoints <= 20 || index % Math.ceil(totalPoints / 10) === 0) {
              return value;
            }
            return '';
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: {
          text: xAxisTitle,
          style: {
            color: '#86868b',
            fontSize: '12px',
            fontWeight: 400
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#86868b',
            fontSize: '11px'
          },
          formatter: function (value) {
            return value ? value.toFixed(1) + unit : '';
          }
        },
        title: {
          text: yAxisTitle,
          style: {
            color: '#86868b',
            fontSize: '12px',
            fontWeight: 400
          }
        },
        min: minValue ? Math.floor(minValue * 0.99) : undefined,
        max: maxValue ? Math.ceil(maxValue * 1.01) : undefined
      },
      grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 0,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        padding: {
          top: 0,
          right: 20,
          bottom: 0,
          left: 10
        }
      },
      annotations: {
        yaxis: annotations
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        x: { show: true },
        y: {
          formatter: function (value) {
            return value ? value.toFixed(2) + unit : '';
          },
          title: {
            formatter: (seriesName) => seriesName
          }
        },
        marker: { show: true }
      },
      legend: { show: false }
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
    chartInstanceRef.current = chart;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [timeRange, showComparisonData, unit, yAxisTitle, xAxisTitle, thresholds]);

  // Update chart data without re-rendering (for smooth updates)
  useEffect(() => {
    if (!chartInstanceRef.current) return;
    if (showComparisonData && (aiData.length === 0 || fieldData.length === 0)) return;
    if (!showComparisonData && chartData.length === 0) return;

    const maxValue = stats.maxValue;
    const minValue = stats.minValue;
    const avgValue = stats.avgValue;

    const annotations = [];
    if (thresholds.showMax && maxValue) {
      annotations.push({
        y: maxValue,
        borderColor: '#ef4444',
        strokeDashArray: 20,
        borderWidth: 1,
        label: { text: '' }
      });
    }
    if (thresholds.showAverage && avgValue) {
      annotations.push({
        y: avgValue,
        borderColor: '#d1d5db',
        strokeDashArray: 20,
        borderWidth: 1,
        label: { text: '' }
      });
    }
    if (thresholds.showMin && minValue) {
      annotations.push({
        y: minValue,
        borderColor: '#10b981',
        strokeDashArray: 20,
        borderWidth: 1,
        label: { text: '' }
      });
    }

    const series = showComparisonData
      ? [
          { name: 'Field Data', data: fieldData },
          { name: 'AI Data', data: aiData }
        ]
      : [{ name: yAxisTitle, data: chartData }];

    chartInstanceRef.current.updateOptions({
      series: series,
      yaxis: {
        min: minValue ? Math.floor(minValue * 0.99) : undefined,
        max: maxValue ? Math.ceil(maxValue * 1.01) : undefined
      },
      annotations: {
        yaxis: annotations
      }
    }, false, timeRange === 'now' && !showComparisonData);
  }, [chartData, aiData, fieldData, stats, showComparisonData, timeRange, yAxisTitle, thresholds]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    setIsCustomRange(false);
  };

  const handleDatePickerOpen = (event) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const handleDatePickerClose = () => {
    setDatePickerAnchor(null);
  };

  const handleApplyCustomRange = () => {
    setIsCustomRange(true);
    setTimeRange('custom');
    handleDatePickerClose();
  };

  const openDatePicker = Boolean(datePickerAnchor);

  return (
    <MainCard>
      {/* Header with Title and Date Picker */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: -4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<CalendarMonthIcon />}
          onClick={handleDatePickerOpen}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            borderColor: '#d2d2d7',
            color: '#86868b',
            '&:hover': {
              borderColor: '#86868b',
              backgroundColor: '#f5f5f7'
            }
          }}
        >
          {isCustomRange
            ? `${startDate.format('MMM DD, YYYY')} - ${endDate.format('MMM DD, YYYY')}`
            : 'Select Range'}
        </Button>

        <Popover
          open={openDatePicker}
          anchorEl={datePickerAnchor}
          onClose={handleDatePickerClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
            <Button
              variant="contained"
              size="small"
              onClick={handleApplyCustomRange}
              sx={{ textTransform: 'none' }}
            >
              Apply
            </Button>
          </Box>
        </Popover>
      </Box>

      {/* Legend Box - centered, similar to HistoryComparisonChart */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1 }}>
        {showComparisonData ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: '#53A1FF' }} />
              <Typography variant="caption" color="textSecondary">
                Field Data
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: '#8b5cf6' }} />
              <Typography variant="caption" color="textSecondary">
                AI Data
              </Typography>
            </Box>
          </>
        ) : (
          legendItems.map((item) => (
            <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 15, height: 15, borderRadius: '10%', backgroundColor: item.color }} />
              <Typography variant="caption" color="textSecondary">
                {item.name}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Stats Cards - Only show when comparison is active */}
      {showComparisonData && statsData.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {statsData.map((stat, index) => (
            <Grid size={{ mt: 2, xs: 6, sm:3 }} key={index}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {stat.title}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Chart */}
      <div ref={chartRef}></div>

      {/* Time Range Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'right', mt: -2 }}>
        <ButtonGroup variant="outlined" size="small">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              onClick={() => handleTimeRangeChange(range.value)}
              sx={{
                px: 2,
                textTransform: 'none',
                borderColor: '#d2d2d7',
                color: timeRange === range.value ? '#fff' : '#86868b',
                backgroundColor: timeRange === range.value ? '#3b82f6' : 'transparent',
                '&:hover': {
                  borderColor: '#3b82f6',
                  backgroundColor: timeRange === range.value ? '#2563eb' : '#eff6ff'
                }
              }}
            >
              {range.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </MainCard>
  );
};

RealTimeDataChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  dataType: PropTypes.oneOf(['dryness', 'ncg', 'tds', 'pressure', 'temperature', 'flow']),
  unit: PropTypes.string,
  yAxisTitle: PropTypes.string,
  xAxisTitle: PropTypes.string,
  legendItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    })
  ),
  thresholds: PropTypes.shape({
    showMax: PropTypes.bool,
    showMin: PropTypes.bool,
    showAverage: PropTypes.bool
  }),
  showComparison: PropTypes.bool
};

export default RealTimeDataChart;
