import { Grid, Box, Typography } from '@mui/material';
import { useState } from 'react';

import { useMultiMetricData } from '../../hooks/useAnalyticsData';
import { transformPTFChartData, formatValueWithUnit } from '../../utils/analyticsHelpers';
import { PTFChart, AnalyticsHeader, StatisticsTable } from '../../components/analytics';
import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';
import { getLimitData } from '../../utils/limitData';

const PTF = () => {
    const [timeRange, setTimeRange] = useState('1d');
    const limitData = getLimitData();

    const { metricsData, loading } = useMultiMetricData(
        ['pressure', 'temperature', 'flow_rate'],
        timeRange
    );

    const pressure = metricsData.pressure?.live?.value;
    const temperature = metricsData.temperature?.live?.value;
    const flow = metricsData.flow_rate?.live?.value;

    const pressureChangePct = metricsData.pressure?.live?.change_pct;
    const temperatureChangePct = metricsData.temperature?.live?.change_pct;
    const flowChangePct = metricsData.flow_rate?.live?.change_pct;

    const chartData = transformPTFChartData(metricsData);

    const renderMetric = (metricName, value, changePct, limit) => (
        <Grid item xs={12} key={metricName}>
            <MainCard sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" color="textSecondary" textTransform="capitalize">
                        {metricName.replace('_', ' ')}
                    </Typography>
                    <Box
                        sx={{
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: (changePct > 0 ? 'success.dark' : changePct < 0 ? 'error.dark' : 'text.secondary'),
                            backgroundColor: (changePct > 0 ? 'success.light' : changePct < 0 ? 'error.light' : 'grey.100'),
                        }}
                    >
                        {loading ? '...' : (changePct > 0 ? `+${changePct}%` : `${changePct}%`)}
                    </Box>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                    <GaugeChart
                        value={value}
                        min={limit.min}
                        max={limit.max}
                        unit={limit.unit}
                        abnormalLow={limit.abnormalLow}
                        warningLow={limit.warningLow}
                        idealLow={limit.idealLow}
                        idealHigh={limit.idealHigh}
                        warningHigh={limit.warningHigh}
                        abnormalHigh={limit.abnormalHigh}
                        withCard={false}
                        sx={{ width: '100%', maxWidth: 360 }}
                        loading={loading}
                    />
                </Box>
            </MainCard>
        </Grid>
    );

    return (
        <Box>
            <AnalyticsHeader title="Pressure, Temperature and Flow" subtitle="Analytic" />

            <Grid container spacing={3} alignItems="stretch">
                {/* Gauges */}
                <Grid item xs={12} md={4}>
                    <Grid container spacing={3}>
                        {renderMetric('pressure', pressure, pressureChangePct, limitData.pressure)}
                        {renderMetric('temperature', temperature, temperatureChangePct, limitData.temperature)}
                        {renderMetric('flow_rate', flow, flowChangePct, limitData.flow)}
                    </Grid>
                </Grid>

                {/* Chart */}
                <Grid item xs={12} md={8}>
                    <PTFChart
                        title="PTF Real Time Data"
                        subtitle="Pressure, Temperature, Flow data chart"
                        data={chartData}
                        timeRange={timeRange}
                        onTimeRangeChange={setTimeRange}
                        loading={loading}
                    />
                </Grid>

                {/* Tables */}
                <Grid item xs={12}>
                    <StatisticsTable
                        title="Tabel Data Statistik Pressure"
                        subtitle="Tabel data statistik yang telah diperoleh untuk pressure"
                        metric="pressure"
                    />
                </Grid>
                <Grid item xs={12}>
                    <StatisticsTable
                        title="Tabel Data Statistik Temperature"
                        subtitle="Tabel data statistik yang telah diperoleh untuk temperature"
                        metric="temperature"
                    />
                </Grid>
                <Grid item xs={12}>
                    <StatisticsTable
                        title="Tabel Data Statistik Flow Rate"
                        subtitle="Tabel data statistik yang telah diperoleh untuk flow rate"
                        metric="flow_rate"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PTF;
