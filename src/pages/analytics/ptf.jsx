import { Grid, Box, Typography } from '@mui/material';

import { useMultiMetricData } from '../../hooks/useTestAwareAnalyticsData';
import { formatValueWithUnit } from '../../utils/analyticsHelpers';
import { useAnomalyCounts } from '../../hooks/useAnomalyTracker';
import { useMetricStats } from '../../hooks/useMetricStatistics';
import { PTFChart, AnalyticsHeader, StatisticsTable, StatCard } from '../../components/analytics';
import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';
import { getLimitData } from '../../utils/limitData';

// icons
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';

const PTF = () => {
    const limitData = getLimitData();

    const { metricsData, loading } = useMultiMetricData(
        ['pressure', 'temperature', 'flow_rate'],
        '1d'
    );

    const pressure = metricsData.pressure?.live?.value;
    const temperature = metricsData.temperature?.live?.value;
    const flow = metricsData.flow_rate?.live?.value;

    const pressureChangePct = metricsData.pressure?.live?.change_pct;
    const temperatureChangePct = metricsData.temperature?.live?.change_pct;
    const flowChangePct = metricsData.flow_rate?.live?.change_pct;

    // Real-time statistics tracking (works for both test and production)
    const pressureStats = useMetricStats('pressure', pressure);
    const temperatureStats = useMetricStats('temperature', temperature);
    const flowStats = useMetricStats('flow', flow);

    // Real-time anomaly tracking (works for both test and production)
    const pressureAnomalies = useAnomalyCounts('pressure', pressure);
    const temperatureAnomalies = useAnomalyCounts('temperature', temperature);
    const flowAnomalies = useAnomalyCounts('flow', flow);

    // Pressure cards data
    const pressureCardData = [
        {
            title: 'Anomali Status',
            value: pressureAnomalies.last24h,
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: pressureAnomalies.last12h, unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: pressureAnomalies.last24h, unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: pressureAnomalies.last7d, unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: formatValueWithUnit(pressureStats.min24h, 'barg'),
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(pressureStats.min12h, 'barg'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(pressureStats.min24h, 'barg'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(pressureStats.min7d, 'barg'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: formatValueWithUnit(pressureStats.avg24h, 'barg'),
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(pressureStats.avg12h, 'barg'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(pressureStats.avg24h, 'barg'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(pressureStats.avg7d, 'barg'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: formatValueWithUnit(pressureStats.max24h, 'barg'),
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(pressureStats.max12h, 'barg'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(pressureStats.max24h, 'barg'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(pressureStats.max7d, 'barg'), timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    // Temperature cards data
    const temperatureCardData = [
        {
            title: 'Anomali Status',
            value: temperatureAnomalies.last24h,
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: temperatureAnomalies.last12h, unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: temperatureAnomalies.last24h, unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: temperatureAnomalies.last7d, unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: formatValueWithUnit(temperatureStats.min24h, '°C'),
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(temperatureStats.min12h, '°C'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(temperatureStats.min24h, '°C'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(temperatureStats.min7d, '°C'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: formatValueWithUnit(temperatureStats.avg24h, '°C'),
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(temperatureStats.avg12h, '°C'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(temperatureStats.avg24h, '°C'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(temperatureStats.avg7d, '°C'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: formatValueWithUnit(temperatureStats.max24h, '°C'),
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(temperatureStats.max12h, '°C'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(temperatureStats.max24h, '°C'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(temperatureStats.max7d, '°C'), timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    // Flow cards data
    const flowCardData = [
        {
            title: 'Anomali Status',
            value: flowAnomalies.last24h,
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: flowAnomalies.last12h, unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: flowAnomalies.last24h, unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: flowAnomalies.last7d, unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: formatValueWithUnit(flowStats.min24h, 't/h'),
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(flowStats.min12h, 't/h'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(flowStats.min24h, 't/h'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(flowStats.min7d, 't/h'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: formatValueWithUnit(flowStats.avg24h, 't/h'),
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(flowStats.avg12h, 't/h'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(flowStats.avg24h, 't/h'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(flowStats.avg7d, 't/h'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: formatValueWithUnit(flowStats.max24h, 't/h'),
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(flowStats.max12h, 't/h'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(flowStats.max24h, 't/h'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(flowStats.max7d, 't/h'), timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    return (
        <Box>
            <AnalyticsHeader title="Pressure, Temperature and Flow" subtitle="Analytic" />

            <Grid container spacing={3} alignItems="stretch">

                {/* --- PRESSURE ROW --- */}
                {/* 1. Pressure Gauge MainCard (Takes up 2.5 columns) */}
                <Grid size={{ xs: 12, lg: 2.5 }}>
                    <MainCard
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" color="textSecondary">Pressure</Typography>
                            <Box
                                sx={{
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: (pressureChangePct > 0 ? 'success.dark' : pressureChangePct < 0 ? 'error.dark' : 'text.secondary'),
                                    backgroundColor: (pressureChangePct > 0 ? 'success.light' : pressureChangePct < 0 ? 'error.light' : 'grey.100'),
                                }}
                            >
                                {loading ? '...' : (pressureChangePct > 0 ? `+${pressureChangePct}%` : `${pressureChangePct}%`)}
                            </Box>
                        </Box>

                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                            <GaugeChart
                                value={pressure}
                                min={limitData.pressure.min}
                                max={limitData.pressure.max}
                                unit={limitData.pressure.unit}
                                abnormalLow={limitData.pressure.abnormalLow}
                                warningLow={limitData.pressure.warningLow}
                                idealLow={limitData.pressure.idealLow}
                                idealHigh={limitData.pressure.idealHigh}
                                warningHigh={limitData.pressure.warningHigh}
                                abnormalHigh={limitData.pressure.abnormalHigh}
                                withCard={false}
                                sx={{ width: '100%', maxWidth: 360 }}
                                loading={loading}
                            />
                        </Box>
                    </MainCard>
                </Grid>

                {/* 2. Pressure Stats (Each takes 2.37 columns = 9.5 columns total) */}
                {pressureCardData.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 2.37 }} key={`pressure-${index}`}>
                        <StatCard
                            title={card.title}
                            value={card.value}
                            unit={card.unit}
                            icon={card.icon}
                            iconBgColor={card.iconBgColor}
                            iconColor={card.iconColor}
                            backgroundColor="#F5F5F5"
                            additionalData={card.additionalData}
                        />
                    </Grid>
                ))}


                {/* --- TEMPERATURE ROW --- */}
                {/* 1. Temperature Gauge MainCard */}
                <Grid size={{ xs: 12, lg: 2.5 }}>
                    <MainCard
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" color="textSecondary">Temperature</Typography>
                            <Box
                                sx={{
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: (temperatureChangePct > 0 ? 'success.dark' : temperatureChangePct < 0 ? 'error.dark' : 'text.secondary'),
                                    backgroundColor: (temperatureChangePct > 0 ? 'success.light' : temperatureChangePct < 0 ? 'error.light' : 'grey.100'),
                                }}
                            >
                                {loading ? '...' : (temperatureChangePct > 0 ? `+${temperatureChangePct}%` : `${temperatureChangePct}%`)}
                            </Box>
                        </Box>

                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                            <GaugeChart
                                value={temperature}
                                min={limitData.temperature.min}
                                max={limitData.temperature.max}
                                unit={limitData.temperature.unit}
                                abnormalLow={limitData.temperature.abnormalLow}
                                warningLow={limitData.temperature.warningLow}
                                idealLow={limitData.temperature.idealLow}
                                idealHigh={limitData.temperature.idealHigh}
                                warningHigh={limitData.temperature.warningHigh}
                                abnormalHigh={limitData.temperature.abnormalHigh}
                                withCard={false}
                                sx={{ width: '100%', maxWidth: 360 }}
                                loading={loading}
                            />
                        </Box>
                    </MainCard>
                </Grid>

                {/* 2. Temperature Stats */}
                {temperatureCardData.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 2.37 }} key={`temperature-${index}`}>
                        <StatCard
                            title={card.title}
                            value={card.value}
                            unit={card.unit}
                            icon={card.icon}
                            iconBgColor={card.iconBgColor}
                            iconColor={card.iconColor}
                            backgroundColor="#F5F5F5"
                            additionalData={card.additionalData}
                        />
                    </Grid>
                ))}


                {/* --- FLOW ROW --- */}
                {/* 1. Flow Gauge MainCard */}
                <Grid size={{ xs: 12, lg: 2.5 }}>
                    <MainCard
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" color="textSecondary">Flow</Typography>
                            <Box
                                sx={{
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: (flowChangePct > 0 ? 'success.dark' : flowChangePct < 0 ? 'error.dark' : 'text.secondary'),
                                    backgroundColor: (flowChangePct > 0 ? 'success.light' : flowChangePct < 0 ? 'error.light' : 'grey.100'),
                                }}
                            >
                                {loading ? '...' : (flowChangePct > 0 ? `+${flowChangePct}%` : `${flowChangePct}%`)}
                            </Box>
                        </Box>

                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                            <GaugeChart
                                value={flow}
                                min={limitData.flow.min}
                                max={limitData.flow.max}
                                unit={limitData.flow.unit}
                                abnormalLow={limitData.flow.abnormalLow}
                                warningLow={limitData.flow.warningLow}
                                idealLow={limitData.flow.idealLow}
                                idealHigh={limitData.flow.idealHigh}
                                warningHigh={limitData.flow.warningHigh}
                                abnormalHigh={limitData.flow.abnormalHigh}
                                withCard={false}
                                sx={{ width: '100%', maxWidth: 360 }}
                                loading={loading}
                            />
                        </Box>
                    </MainCard>
                </Grid>

                {/* 2. Flow Stats */}
                {flowCardData.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 2.37 }} key={`flow-${index}`}>
                        <StatCard
                            title={card.title}
                            value={card.value}
                            unit={card.unit}
                            icon={card.icon}
                            iconBgColor={card.iconBgColor}
                            iconColor={card.iconColor}
                            backgroundColor="#F5F5F5"
                            additionalData={card.additionalData}
                        />
                    </Grid>
                ))}

                {/* --- CHARTS & TABLES --- */}
                <Grid size={12}>
                    <PTFChart
                        title="PTF Real Time Data"
                        subtitle="Pressure, Temperature, Flow data chart"
                        liveValues={{ pressure, temperature, flow_rate: flow }}
                    />
                </Grid>

                {/* Tables */}
                <Grid size={12}>
                    <StatisticsTable
                        title="Tabel Data Statistik Pressure"
                        subtitle="Tabel data statistik yang telah diperoleh untuk pressure"
                        metric="pressure"
                    />
                </Grid>
                <Grid size={12}>
                    <StatisticsTable
                        title="Tabel Data Statistik Temperature"
                        subtitle="Tabel data statistik yang telah diperoleh untuk temperature"
                        metric="temperature"
                    />
                </Grid>
                <Grid size={12}>
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
