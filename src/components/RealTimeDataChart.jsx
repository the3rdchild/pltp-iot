
import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography, Select, MenuItem, FormControl } from '@mui/material';
import MainCard from './MainCard';

const RealTimeDataChart = () => {
    const chartRef = useRef(null);
    const [timeRange, setTimeRange] = useState('daily');

    useEffect(() => {
        // Sample data - 60 points of dryness level (%)
        const drynessData = [
            101.5, 100.2, 99.8, 97.3, 100.8, 99.5, 100.3, 99.7, 100.5, 99.2,
            99.8, 100.1, 100.7, 99.4, 101.2, 102.1, 98.7, 99.1, 98.5, 97.1,
            98.9, 100.4, 97.8, 96.8, 99.6, 99.3, 100.0, 98.3, 101.4, 100.6,
            99.0, 101.7, 99.4, 98.6, 99.9, 100.2, 101.0, 99.5, 100.8, 101.3,
            100.5, 101.8, 101.6, 100.9, 101.1, 100.4, 99.7, 97.2, 96.9, 100.3,
            101.9, 102.0, 101.4, 100.7, 99.8, 101.5, 100.1, 99.3, 100.6, 99.9
        ];

        const maxValue = Math.max(...drynessData);
        const minValue = Math.min(...drynessData);
        const avgValue = drynessData.reduce((a, b) => a + b, 0) / drynessData.length;
        const categories = Array.from({length: 60}, (_, i) => `Point ${i + 1}`);

        const options = {
            chart: {
                type: 'area',
                height: 400,
                toolbar: { show: false },
                zoom: { enabled: false },
                animations: { enabled: true, easing: 'easeinout', speed: 800 }
            },
            series: [{ name: 'Dryness Level', data: drynessData }],
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
                title: { text: 'Time x60', style: { color: '#86868b', fontSize: '12px', fontWeight: 400 } }
            },
            yaxis: {
                labels: {
                    style: { colors: '#86868b', fontSize: '11px' },
                    formatter: function(value) { return value.toFixed(1) + '%'; }
                },
                title: { text: 'Dryness (%)', style: { color: '#86868b', fontSize: '12px', fontWeight: 400 } },
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
                    formatter: function(value) { return value.toFixed(2) + '%'; },
                    title: { formatter: () => 'Dryness' }
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
    }, []);

    const legendItems = [
        { name: 'Trend', color: '#8b5cf6' },
        { name: 'Max', color: '#ef4444' },
        { name: 'Average', color: '#d1d5db' },
        { name: 'Min', color: '#10b981' }
    ];

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
        // Add your logic here to fetch different data based on time range
        console.log('Time range changed to:', event.target.value);
    };

    return (
        <MainCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: -4 }}>
                <Box>
                    <Typography variant="h5">Real Time Data</Typography>
                    <Typography variant="body2" color="textSecondary">Dryness level data chart</Typography>
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

export default RealTimeDataChart;
