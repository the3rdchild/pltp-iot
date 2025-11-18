import { Grid, Box, Typography, useTheme } from '@mui/material';

import { useState, useEffect } from 'react';
import { generateAnalyticData } from 'data/simulasi';

import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';
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
    const [analyticData, setAnalyticData] = useState(null);
    const [changePct, setChangePct] = useState(null);


    useEffect(() => {
      const prevNCGRef = { current: null };

      const updateData = () => {
        const data = generateAnalyticData();
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
    }, []);

    const ncg = analyticData?.ncg ?? 1.5;
    const anomalyCount = '03';
    const minNCG = '0.85%';
    const avgNCG = '1.52%';
    const maxNCG = '2.15%';

    const cardData = [
        {
            title: 'Anomali Status',
            value: '03',
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: '08', unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: '15', unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: '32', unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: minNCG,
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: '0.92%', timeLabel: '12 Jam terakhir' },
                { value: '0.78%', timeLabel: '1 hari terakhir' },
                { value: '0.65%', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: avgNCG,
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
              { value: '1.48%', timeLabel: '12 Jam terakhir' },
              { value: '1.56%', timeLabel: '1 hari terakhir' },
              { value: '1.61%', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: maxNCG,
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
              { value: '2.01%', timeLabel: '12 Jam terakhir' },
              { value: '2.15%', timeLabel: '1 hari terakhir' },
              { value: '2.28%', timeLabel: '1 minggu terakhir' }
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
            <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
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
                    min={0}
                    max={10}
                    unit="wt%"
                    abnormalLow={0}
                    warningLow={0}
                    idealLow={0}
                    idealHigh={7}
                    warningHigh={8}
                    abnormalHigh={10}
                    changePct={changePct}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 360 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            {/* small cards */}
            {cardData.map((card, index) => (
              <Grid item xs={12} sm={6} md={2.2} key={index} sx={{ display: 'flex' }}>
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

            <Grid item xs={12} sx={{ mt: { xs: 0, lg: -5 } }}>
              <RealTimeDataChart
                title="Real Time Data"
                subtitle="NCG level data chart"
                data={ncgRealTimeData}
                yAxisTitle="NCG (wt%)"
                unit="wt%"
              />
            </Grid>

            <Grid item xs={12}>
              <HistoryComparisonChart
                title="History Data & Perbandingan"
                subtitle="Grafik NCG history data dan perbandingan"
                dataset1={ncgHistoryDataset1}
                dataset2={ncgHistoryDataset2}
                yAxisTitle="NCG (wt%)"
                unit="wt%"
              />
            </Grid>

            <Grid item xs={12}>
              <StatisticsTable
                title="Tabel Data Statistik"
                subtitle="Tabel data statistik yang telah diperoleh"
                dataGenerator={generateNCGTableData}
              />
            </Grid>
          </Grid>
        </Box>
      );
};

export default NCG;
