import { Grid, Box, Typography, useTheme } from '@mui/material';

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateAnalyticData } from 'data/simulasi';
import { useTestData } from '../../contexts/TestDataContext';
import { useAnomalyCounts } from '../../hooks/useAnomalyTracker';
import { useMetricStats } from '../../hooks/useMetricStatistics';

import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';
import { getLimitData } from '../../utils/limitData';
import {
  AnalyticsHeader,
  StatCard,
  RealTimeDataChart,
  HistoryComparisonChart,
  StatisticsTable
} from '../../components/analytics';
import { ncgRealTimeData, ncgHistoryDataset1, ncgHistoryDataset2, generateNCGTableData } from '../../data/chartData';

// icons
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';


const NCG = () => {
    const theme = useTheme();
    const location = useLocation();
    const isTestEnvironment = location.pathname.startsWith('/test');
    const testDataContext = isTestEnvironment ? useTestData() : null;

    const [analyticData, setAnalyticData] = useState(null);
    const [changePct, setChangePct] = useState(null);
    const limitData = getLimitData();


    useEffect(() => {
      const prevNCGRef = { current: null };

      const updateData = () => {
        let data;
        if (isTestEnvironment && testDataContext) {
          // Use test data from TestDataContext
          const ncgValue = testDataContext.mockData.metrics.ncg?.value ?? 0.45;
          data = {
            ncg: parseFloat(ncgValue.toFixed(3))
          };
        } else {
          // Use production data
          data = generateAnalyticData();
        }

        setAnalyticData((prev) => {
          const prevVal = prev?.ncg ?? prevNCGRef.current;
          if (prevVal === undefined || prevVal === null) {
            setChangePct(0);
          } else {
            const cur = data.ncg;
            const pct = prevVal === 0 ? 0 : ((cur - prevVal) / Math.abs(prevVal)) * 100;
            setChangePct(Math.round(pct));
          }
          prevNCGRef.current = data.ncg;
          return data;
        });
      };

      updateData();

      const interval = setInterval(updateData, 3000);

      return () => clearInterval(interval);
    }, [isTestEnvironment, testDataContext]);

    const ncg = analyticData?.ncg ?? 0.45;

    // Real-time statistics tracking
    const ncgStats = useMetricStats('ncg', ncg);

    // Real-time anomaly tracking
    const anomalies = useAnomalyCounts('ncg', ncg);

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
            value: `${ncgStats.min24h}%`,
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: `${ncgStats.min12h}%`, timeLabel: '12 Jam terakhir' },
                { value: `${ncgStats.min24h}%`, timeLabel: '1 hari terakhir' },
                { value: `${ncgStats.min7d}%`, timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: `${ncgStats.avg24h}%`,
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
              { value: `${ncgStats.avg12h}%`, timeLabel: '12 Jam terakhir' },
              { value: `${ncgStats.avg24h}%`, timeLabel: '1 hari terakhir' },
              { value: `${ncgStats.avg7d}%`, timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: `${ncgStats.max24h}%`,
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
              { value: `${ncgStats.max12h}%`, timeLabel: '12 Jam terakhir' },
              { value: `${ncgStats.max24h}%`, timeLabel: '1 hari terakhir' },
              { value: `${ncgStats.max7d}%`, timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    return (
        <Box>
          <AnalyticsHeader title="NCG (Non-Condensable Gas)" subtitle="Analytic" />

          <Grid
            container
            spacing={3}
            alignItems="stretch"
            sx={{
              minHeight: { lg: '640px' },
            }}
          >
            {/* Left big gauge card */}
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
                {/* header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">NCG Level</Typography>
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
                    {changePct === null ? '–' : (changePct > 0 ? `+${changePct}%` : `${changePct}%`)}
                  </Box>
                </Box>

                {/* content: allow gauge to take available area but not force card height on small screens */}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={ncg}
                    min={limitData.ncg.min}
                    max={limitData.ncg.max}
                    unit={limitData.ncg.unit}
                    idealHigh={limitData.ncg.idealHigh}
                    warningHigh={limitData.ncg.warningHigh}
                    abnormalHigh={limitData.ncg.abnormalHigh}
                    changePct={changePct}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 360 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            {/* small cards */}
            {cardData.map((card, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.25 }} key={index} sx={{ display: 'flex' }}>
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

            <Grid size={12} sx={{ mt: { xs: 0, lg: -5 } }}>
              <RealTimeDataChart
                title="Real Time Data"
                subtitle="NCG level data chart"
                dataType="ncg"
                data={ncgRealTimeData}
                yAxisTitle="NCG (wt%)"
                unit="wt%"
                showComparison={true}
              />
            </Grid>

            {/* <Grid size={12}>
              <HistoryComparisonChart
                title="History Data & Perbandingan"
                subtitle="Grafik NCG history data dan perbandingan"
                dataset1={ncgHistoryDataset1}
                dataset2={ncgHistoryDataset2}
                yAxisTitle="NCG (wt%)"
                unit="wt%"
              />
            </Grid> */}

            <Grid size={12}>
              <StatisticsTable
                title="Tabel Data Statistik"
                subtitle="Tabel data statistik yang telah diperoleh"
                metric="ncg"
              />
            </Grid>
          </Grid>
        </Box>
      );
};

export default NCG;
