import { Grid, Box, Typography } from '@mui/material';
import { useState } from 'react';

// a. Import - test-aware (uses mock data in /test environment)
import { useAnalyticsData } from '../../hooks/useTestAwareAnalyticsData';
import { formatValueWithUnit } from '../../utils/analyticsHelpers';
import { useAnomalyCounts } from '../../hooks/useAnomalyTracker';
import { useMetricStats } from '../../hooks/useMetricStatistics';
import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';
import { getLimitData } from '../../utils/limitData';
import {
  AnalyticsHeader,
  StatCard,
  RealTimeDataChart,
  StatisticsTable
} from '../../components/analytics';

// icons
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';

const TDS = () => {
    const [timeRange] = useState('1d');
    const limitData = getLimitData();

    // Live value only. The chart below (RealTimeDataChart) fetches its own
    // series and the statistics table has its own hook, so asking for chart +
    // table here just re-ran a chart aggregation and a COUNT(*) over
    // sensor_data every 3 seconds for results nothing on this page reads.
    const { liveData, loading } = useAnalyticsData('tds', timeRange, undefined, 3000, {
        live: true,
        chart: false,
        table: false
    });

    const tdsValue = liveData?.value;
    const changePct = liveData?.change_pct;

    // No live poll for the AI2 TDS nowcast: the prediction overlay is drawn
    // only on the fetched ranges (1h/1d/7d/1m), which pull their own series
    // inside RealTimeDataChart. 'now' shows the raw sensor alone, so a 3s
    // /live/tds_predicted poll here would have no reader.

    // Real-time statistics tracking
    const tdsStats = useMetricStats('tds', tdsValue);

    // Real-time anomaly tracking
    const anomalies = useAnomalyCounts('tds', tdsValue);

    const cardData = [
        {
            title: 'Anomali Status',
            value: anomalies.last24h,
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: anomalies.last12h, unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: anomalies.last24h, unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: anomalies.last7d, unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: formatValueWithUnit(tdsStats.min24h, 'ppm'),
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(tdsStats.min12h, 'ppm'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(tdsStats.min24h, 'ppm'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(tdsStats.min7d, 'ppm'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: formatValueWithUnit(tdsStats.avg24h, 'ppm'),
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(tdsStats.avg12h, 'ppm'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(tdsStats.avg24h, 'ppm'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(tdsStats.avg7d, 'ppm'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: formatValueWithUnit(tdsStats.max24h, 'ppm'),
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(tdsStats.max12h, 'ppm'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(tdsStats.max24h, 'ppm'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(tdsStats.max7d, 'ppm'), timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    return (
        <Box>
          <AnalyticsHeader title="TDS (Total Dissolved Solids)" subtitle="Analytic" />

          <Grid
            container
            spacing={3}
            alignItems="stretch"
            sx={{
              minHeight: { lg: '640px' },
            }}
          >
            {/* Top row: Main gauge and stat cards */}
            <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex' }}>
              <MainCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: { xs: 'auto', lg: '84%' },
                  minHeight: { md: '230px' },
                  mb: { lg: 3 },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">TDS: Overall</Typography>
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
                    {loading ? '...' : (changePct == null ? '–' : (changePct > 0 ? `+${changePct}%` : `${changePct}%`))}
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={tdsValue}
                    min={limitData["TDS: Overall"].min}
                    max={limitData["TDS: Overall"].max}
                    unit={limitData["TDS: Overall"].unit}
                    lowerLimit={limitData["TDS: Overall"].lowerLimit}
                    upperLimit={limitData["TDS: Overall"].upperLimit}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 280 }}
                    loading={loading}
                  />
                </Box>
              </MainCard>
            </Grid>
            {cardData.map((card, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.25 }} key={index} sx={{ display: 'flex' }}>
                <StatCard
                  title={card.title}
                  value={loading ? '...' : card.value}
                  unit={card.unit}
                  icon={card.icon}
                  iconBgColor={card.iconBgColor}
                  iconColor={card.iconColor}
                  backgroundColor="#F5F5F5"
                  additionalData={card.additionalData}
                  loading={loading}
                />
              </Grid>
            ))}
            
            <Grid size={12} sx={{ mt: { xs: 0, lg: -5 } }}>
              <RealTimeDataChart
                title="Real Time Data"
                subtitle="TDS Overall level data chart"
                dataType="tds"
                yAxisTitle="TDS (ppm)"
                unit="ppm"
                fetchFromApi={true}
                liveValue={tdsValue}
                labMetric="tds"
                predictionDataType="tds_predicted"
                predictionName="TDS Prediction"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <StatisticsTable
                title="Tabel Data Statistik"
                subtitle="Tabel data statistik yang telah diperoleh"
                metric="tds"
              />
            </Grid>
          </Grid>
        </Box>
      );
};

export default TDS;
