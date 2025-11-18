import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { Box, Typography, Select, MenuItem, FormControl, Grid } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import MainCard from './MainCard';

const HistoryComparisonChart = () => {
    const chartRef = useRef(null);
    const [timeRange, setTimeRange] = useState('daily');

    useEffect(() => {
        // Sample data - 60 points for two datasets
        const dataset1 = [
            99.32, 99.01, 98.58, 98.63, 99.36, 99.27, 99.52, 99.38, 99.13, 98.68,
            99.41, 98.95, 99.08, 98.75, 99.55, 99.48, 98.59, 98.71, 99.02, 99.21,
            98.53, 99.44, 98.82, 99.61, 99.15, 98.92, 99.35, 99.07, 99.50, 99.26
        ];

        const dataset2 = [
            98.87, 99.15, 98.73, 98.56, 99.28, 99.42, 99.07, 99.51, 99.64, 99.21,
            99.38, 98.91, 99.73, 98.48, 99.56, 99.12, 98.68, 99.47, 99.03, 98.79,
            99.61, 99.24, 98.96, 98.59, 99.43, 99.18, 98.82, 99.35, 98.71, 99.57
        ];

        const allData = [...dataset1, ...dataset2];
        const maxValue = Math.max(...allData);
        const minValue = Math.min(...allData);
        const categories = Array.from({length: 58}, (_, i) => `Point ${i + 1}`);

        // Calculate statistics for both datasets
        const dataset1Max = Math.max(...dataset1);
        const dataset1Min = Math.min(...dataset1);
        const dataset1Avg = dataset1.reduce((a, b) => a + b, 0) / dataset1.length;

        const dataset2Max = Math.max(...dataset2);
        const dataset2Min = Math.min(...dataset2);
        const dataset2Avg = dataset2.reduce((a, b) => a + b, 0) / dataset2.length;

        const options = {
            chart: {
                type: 'area',
                height: 400,
                toolbar: { show: false },
                zoom: { enabled: false },
                animations: { enabled: true, easing: 'easeinout', speed: 800 }
            },
            series: [
                { name: 'Trend', data: dataset1 },
                { name: 'Average', data: dataset2 }
            ],
            stroke: {
                curve: 'smooth',
                width: 2,
                colors: ['#8b5cf6', '#53A1FF']
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.05,
                    stops: [0, 90, 100]
                },
                colors: ['#8b5cf6', '#53A1FF']
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
                title: { text: 'Time x30', style: { color: '#86868b', fontSize: '12px', fontWeight: 400 } }
            },
            yaxis: {
                labels: {
                    style: { colors: '#86868b', fontSize: '11px' },
                    formatter: function(value) { return value.toFixed(2) + '%'; }
                },
                title: { text: 'Dryness (%)', style: { color: '#86868b', fontSize: '12px', fontWeight: 400 } },
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
                    { y: maxValue, borderColor: '#ef4444', strokeDashArray: 5, borderWidth: 1, label: { text: '' } },
                    { y: (dataset1Avg + dataset2Avg) / 2, borderColor: '#d1d5db', strokeDashArray: 5, borderWidth: 1, label: { text: '' } },
                    { y: minValue, borderColor: '#10b981', strokeDashArray: 5, borderWidth: 1, label: { text: '' } }
                ]
            },
            tooltip: {
                enabled: true,
                theme: 'light',
                x: { show: true },
                y: {
                    formatter: function(value) { return value.toFixed(2) + '%'; }
                },
                marker: { show: true }
            },
            legend: { show: false }
        };

        const chart = new ApexCharts(chartRef.current, options);
        chart.render();

        // Store stats for bottom cards
        chartRef.current.dataset.fieldRange = `${dataset1Min.toFixed(1)}% - ${dataset1Max.toFixed(1)}%`;
        chartRef.current.dataset.fieldAvg = `${dataset1Avg.toFixed(2)}%`;
        chartRef.current.dataset.aiRange = `${dataset2Min.toFixed(1)}% - ${dataset2Max.toFixed(1)}%`;
        chartRef.current.dataset.aiAvg = `${dataset2Avg.toFixed(2)}%`;

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
        console.log('Time range changed to:', event.target.value);
    };

    const statsData = [
        { title: 'Field Range', value: '98.4% - 99.9%' },
        { title: 'Field Average', value: '99.01%' },
        { title: 'AI Range', value: '98.4 - 99.9%' },
        { title: 'AI Average', value: '99.01%' }
    ];

    return (
        <MainCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: -4 }}>
                <Box>
                    <Typography variant="h5">History Data & Perbandingan</Typography>
                    <Typography variant="body2" color="textSecondary">Grafik dryness history data dan perbandingan</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
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

export default HistoryComparisonChart;
