import { Grid, Box, Typography } from '@mui/material';
import { useState } from 'react';

// a. Import
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { transformChartData, getSummaryStats, formatValueWithUnit, getAnomalyCount } from '../../utils/analyticsHelpers';
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
    const [timeRange, setTimeRange] = useState('1d');
    const limitData = getLimitData();

    // b. Replace simulation
    const { liveData, chartData, tableData, loading } = useAnalyticsData('tds', timeRange);

    // c. Use real data
    const tdsValue = liveData?.value;
    const chartPoints = transformChartData(chartData?.chart);
    const summaryStats = getSummaryStats(tableData);
    const anomalies = getAnomalyCount(tableData?.records);
    const changePct = liveData?.change_pct;

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
            value: formatValueWithUnit(summaryStats.min, 'ppm'),
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            // additionalData can be populated if API provides historical min/max/avg
        },
        {
            title: 'Average',
            value: formatValueWithUnit(summaryStats.avg, 'ppm'),
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
        },
        {
            title: 'Maximum',
            value: formatValueWithUnit(summaryStats.max, 'ppm'),
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
        }
    ];

    return (
        <Box>
          <AnalyticsHeader title="TDS (Total Dissolved Solids)" subtitle="Analytic" />

          <Grid
            container
            spacing={3}
            alignItems="stretch"
          >
            {/* Top row: Main gauge and stat cards */}\
            <Grid item xs={12} md={4}>
              <MainCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: '230px',
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
                    {loading ? '...' : (changePct > 0 ? `+${changePct}%` : `${changePct}%`)}
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={tdsValue}
                    min={limitData["TDS: Overall"].min}
                    max={limitData["TDS: Overall"].max}
                    unit={limitData["TDS: Overall"].unit}
                    idealHigh={limitData["TDS: Overall"].idealHigh}
                    warningHigh={limitData["TDS: Overall"].warningHigh}
                    abnormalHigh={limitData["TDS: Overall"].abnormalHigh}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 280 }}
                    loading={loading}
                  />
                </Box>
              </MainCard>
            </Grid>

            {/* Stat cards */}\
            <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                    {cardData.map((card, index) => (
                      <Grid item xs={12} sm={6} key={index}>
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
                </Grid>
            </Grid>


            <Grid item xs={12}>
              <RealTimeDataChart
                title="Real Time Data"
                subtitle="TDS Overall level data chart"
                data={chartPoints}
                yAxisTitle="TDS (ppm)"
                unit="ppm"
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                loading={loading}
              />
            </Grid>

            <Grid item xs={12}>
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
