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

const tdsCO2 = 0.5;
const tdsArgon = 0.3;
const tdsMethane = 0.2;
const tdsMA3 = 0.1;

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
            additionalData: [
                { value: formatValueWithUnit(summaryStats.min12h, 'ppm'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(summaryStats.min24h, 'ppm'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(summaryStats.min, 'ppm'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: formatValueWithUnit(summaryStats.avg, 'ppm'),
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(summaryStats.avg12h, 'ppm'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(summaryStats.avg24h, 'ppm'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(summaryStats.avg, 'ppm'), timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: formatValueWithUnit(summaryStats.max, 'ppm'),
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
                { value: formatValueWithUnit(summaryStats.max12h, 'ppm'), timeLabel: '12 Jam terakhir' },
                { value: formatValueWithUnit(summaryStats.max24h, 'ppm'), timeLabel: '1 hari terakhir' },
                { value: formatValueWithUnit(summaryStats.max, 'ppm'), timeLabel: '1 minggu terakhir' }
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
          >
            {/* Top row: Main gauge and stat cards */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <MainCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: { md: '230px' },
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
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <MainCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: { md: '230px' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">TDS: CO₂</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={tdsCO2}
                    min={limitData.tdsCO2.min}
                    max={limitData.tdsCO2.max}
                    unit={limitData.tdsCO2.unit}
                    idealHigh={limitData.tdsCO2.idealHigh}
                    warningHigh={limitData.tdsCO2.warningHigh}
                    abnormalHigh={limitData.tdsCO2.abnormalHigh}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <MainCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: { md: '230px' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">TDS: Argon</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={tdsArgon}
                    min={limitData.tdsArgon.min}
                    max={limitData.tdsArgon.max}
                    unit={limitData.tdsArgon.unit}
                    idealHigh={limitData.tdsArgon.idealHigh}
                    warningHigh={limitData.tdsArgon.warningHigh}
                    abnormalHigh={limitData.tdsArgon.abnormalHigh}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <MainCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: { md: '230px' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">TDS: Methane (CH₄)</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={tdsMethane}
                    min={limitData.tdsMethane.min}
                    max={limitData.tdsMethane.max}
                    unit={limitData.tdsMethane.unit}
                    idealHigh={limitData.tdsMethane.idealHigh}
                    warningHigh={limitData.tdsMethane.warningHigh}
                    abnormalHigh={limitData.tdsMethane.abnormalHigh}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <MainCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: { md: '230px' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">TDS: MA3</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={tdsMA3}
                    min={limitData.tdsMA3.min}
                    max={limitData.tdsMA3.max}
                    unit={limitData.tdsMA3.unit}
                    idealHigh={limitData.tdsMA3.idealHigh}
                    warningHigh={limitData.tdsMA3.warningHigh}
                    abnormalHigh={limitData.tdsMA3.abnormalHigh}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
                <Grid container spacing={3}>
                    {cardData.map((card, index) => (
                      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
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
            
            <Grid size={{ xs: 12 }}>
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
