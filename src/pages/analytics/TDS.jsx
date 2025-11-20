import { Grid, Box, Typography } from '@mui/material';

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
import { tdsRealTimeData, tdsHistoryDataset1, tdsHistoryDataset2, generateTDSTableData } from '../../data/chartData';

// icons
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';


const TDS = () => {
    const [analyticData, setAnalyticData] = useState(null);
    const [changePct, setChangePct] = useState(null);


    useEffect(() => {
      const prevTDSRef = { current: null };

      const updateData = () => {
        const data = generateAnalyticData();
        setAnalyticData((prev) => {
          const prevVal = prev?.tds ?? prevTDSRef.current;
          if (prevVal === undefined || prevVal === null) {
            setChangePct(0);
          } else {
            const cur = data.tds;
            const pct = prevVal === 0 ? 0 : ((cur - prevVal) / Math.abs(prevVal)) * 100;
            setChangePct(Math.round(pct));
          }
          prevTDSRef.current = data.tds;
          return data;
        });
      };

      updateData();

      const interval = setInterval(updateData, 3000);

      return () => clearInterval(interval);
    }, []);

    const tdsOverall = analyticData?.tds ?? 5.8;
    const tdsCO2 = 2.3;
    const tdsArgon = 0.4;
    const tdsMethane = 1.1;
    const tdsMA3 = 0.2;

    const minTDS = '4.35ppm';
    const avgTDS = '5.80ppm';
    const maxTDS = '7.70ppm';

    const cardData = [
        {
            title: 'Anomali Status',
            value: '03',
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: '05', unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: '12', unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: '28', unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: minTDS,
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: '4.50ppm', timeLabel: '12 Jam terakhir' },
                { value: '4.28ppm', timeLabel: '1 hari terakhir' },
                { value: '4.12ppm', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: avgTDS,
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
              { value: '5.75ppm', timeLabel: '12 Jam terakhir' },
              { value: '5.82ppm', timeLabel: '1 hari terakhir' },
              { value: '5.88ppm', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: maxTDS,
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
              { value: '7.50ppm', timeLabel: '12 Jam terakhir' },
              { value: '7.70ppm', timeLabel: '1 hari terakhir' },
              { value: '7.95ppm', timeLabel: '1 minggu terakhir' }
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
            {/* Top row: 5 gauge cards */}
            <Grid item xs={12} sm={6} md={2.4}>
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
                    {changePct === null ? '–' : (changePct > 0 ? `+${changePct}%` : `${changePct}%`)}
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={tdsOverall}
                    min={0}
                    max={10}
                    unit="ppm"
                    idealHigh={0}
                    warningHigh={6}
                    abnormalHigh={10}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
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
                    min={0}
                    max={5}
                    unit="ppm"
                    idealHigh={0}
                    warningHigh={1}
                    abnormalHigh={5}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
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
                    min={0}
                    max={2}
                    unit="ppm"
                    idealHigh={0}
                    warningHigh={1.2}
                    abnormalHigh={2}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
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
                    min={0}
                    max={1.5}
                    unit="ppm"
                    idealHigh={0}
                    warningHigh={0.5}
                    abnormalHigh={1}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
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
                    min={0}
                    max={1}
                    unit="ppm"
                    idealHigh={0}
                    warningHigh={0.6}
                    abnormalHigh={1}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 200 }}
                  />
                </Box>
              </MainCard>
            </Grid>

            {/* small cards */}
            {cardData.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
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

            <Grid item xs={12}>
              <RealTimeDataChart
                title="Real Time Data"
                subtitle="TDS Overall level data chart"
                dataType='tds'
                yAxisTitle="TDS (ppm)"
                unit="ppm"
              />
            </Grid>

            {/* <Grid item xs={12}>
              <HistoryComparisonChart
                title="History Data & Perbandingan"
                subtitle="Grafik TDS history data dan perbandingan"
                dataset1={tdsHistoryDataset1}
                dataset2={tdsHistoryDataset2}
                yAxisTitle="TDS (ppm)"
                unit="ppm"
              />
            </Grid> */}

            <Grid item xs={12}>
              <StatisticsTable
                title="Tabel Data Statistik"
                subtitle="Tabel data statistik yang telah diperoleh"
                dataGenerator={generateTDSTableData}
              />
            </Grid>
          </Grid>
        </Box>
      );
};

export default TDS;
