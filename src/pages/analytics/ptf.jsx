import { Grid, Box, Typography, useTheme } from '@mui/material';

import { useState, useEffect } from 'react';
import { generateAnalyticData } from 'data/simulasi';
import { PTFChart } from '../../components/analytics';

import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';
import {
  AnalyticsHeader,
  StatCard,
  RealTimeDataChart,
  HistoryComparisonChart,
  StatisticsTable
} from '../../components/analytics';

import {
  ptfPressureRealTimeData,
  ptfTemperatureRealTimeData,
  ptfFlowRealTimeData,
  ptfPressureHistoryDataset1,
  ptfPressureHistoryDataset2,
  ptfTemperatureHistoryDataset1,
  ptfTemperatureHistoryDataset2,
  ptfFlowHistoryDataset1,
  ptfFlowHistoryDataset2,
  generatePTFTableData
} from 'data/chartData';

// icons
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';


const PTF = () => {
    const theme = useTheme();
    const [analyticData, setAnalyticData] = useState(null);
    const [pressureChangePct, setPressureChangePct] = useState(null);
    const [temperatureChangePct, setTemperatureChangePct] = useState(null);
    const [flowChangePct, setFlowChangePct] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('pressure'); // 'pressure', 'temperature', 'flow'

    useEffect(() => {
      const prevPressureRef = { current: null };
      const prevTemperatureRef = { current: null };
      const prevFlowRef = { current: null };

      const updateData = () => {
        const data = generateAnalyticData();
        setAnalyticData((prev) => {
          // Pressure change
          const prevPressure = prev?.pressure ?? prevPressureRef.current;
          if (prevPressure === undefined || prevPressure === null) {
            setPressureChangePct(0);
          } else {
            const cur = data.pressure;
            const pct = prevPressure === 0 ? 0 : ((cur - prevPressure) / Math.abs(prevPressure)) * 100;
            setPressureChangePct(Math.round(pct));
          }
          prevPressureRef.current = data.pressure;

          // Temperature change
          const prevTemperature = prev?.temperature ?? prevTemperatureRef.current;
          if (prevTemperature === undefined || prevTemperature === null) {
            setTemperatureChangePct(0);
          } else {
            const cur = data.temperature;
            const pct = prevTemperature === 0 ? 0 : ((cur - prevTemperature) / Math.abs(prevTemperature)) * 100;
            setTemperatureChangePct(Math.round(pct));
          }
          prevTemperatureRef.current = data.temperature;

          // Flow change
          const prevFlow = prev?.flow ?? prevFlowRef.current;
          if (prevFlow === undefined || prevFlow === null) {
            setFlowChangePct(0);
          } else {
            const cur = data.flow;
            const pct = prevFlow === 0 ? 0 : ((cur - prevFlow) / Math.abs(prevFlow)) * 100;
            setFlowChangePct(Math.round(pct));
          }
          prevFlowRef.current = data.flow;

          return data;
        });
      };

      updateData();
      const interval = setInterval(updateData, 3000);

      return () => clearInterval(interval);
    }, []);

    const pressure = analyticData?.pressure ?? 1437;
    const temperature = analyticData?.temperature ?? 131;
    const flow = analyticData?.flow ?? 298;

    // Pressure cards data
    const pressureCardData = [
        {
            title: 'Anomali Status',
            value: '0',
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: '0', unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: '0', unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: '2', unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: '1353',
            unit: 'kPa',
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: '1360', unit: 'kPa', timeLabel: '12 Jam terakhir' },
                { value: '1355', unit: 'kPa', timeLabel: '1 hari terakhir' },
                { value: '1353', unit: 'kPa', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: '1437',
            unit: 'kPa',
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
              { value: '1445', unit: 'kPa', timeLabel: '12 Jam terakhir' },
              { value: '1440', unit: 'kPa', timeLabel: '1 hari terakhir' },
              { value: '1437', unit: 'kPa', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: '1556',
            unit: 'kPa',
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
              { value: '1550', unit: 'kPa', timeLabel: '12 Jam terakhir' },
              { value: '1556', unit: 'kPa', timeLabel: '1 hari terakhir' },
              { value: '1556', unit: 'kPa', timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    // Temperature cards data
    const temperatureCardData = [
        {
            title: 'Anomali Status',
            value: '03',
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: '5', unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: '8', unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: '15', unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: '131',
            unit: '°C',
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: '132', unit: '°C', timeLabel: '12 Jam terakhir' },
                { value: '131', unit: '°C', timeLabel: '1 hari terakhir' },
                { value: '131', unit: '°C', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: '140',
            unit: '°C',
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
              { value: '142', unit: '°C', timeLabel: '12 Jam terakhir' },
              { value: '141', unit: '°C', timeLabel: '1 hari terakhir' },
              { value: '140', unit: '°C', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: '155',
            unit: '°C',
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
              { value: '154', unit: '°C', timeLabel: '12 Jam terakhir' },
              { value: '155', unit: '°C', timeLabel: '1 hari terakhir' },
              { value: '155', unit: '°C', timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    // Flow cards data
    const flowCardData = [
        {
            title: 'Anomali Status',
            value: '05',
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff',
            additionalData: [
                { value: '7', unit: 'Anomali', timeLabel: '12 Jam terakhir' },
                { value: '12', unit: 'Anomali', timeLabel: '1 hari terakhir' },
                { value: '20', unit: 'Anomali', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Minimum',
            value: '251',
            unit: 't/h',
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: '255', unit: 't/h', timeLabel: '12 Jam terakhir' },
                { value: '252', unit: 't/h', timeLabel: '1 hari terakhir' },
                { value: '251', unit: 't/h', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: '272',
            unit: 't/h',
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
              { value: '275', unit: 't/h', timeLabel: '12 Jam terakhir' },
              { value: '273', unit: 't/h', timeLabel: '1 hari terakhir' },
              { value: '272', unit: 't/h', timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: '298',
            unit: 't/h',
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
              { value: '295', unit: 't/h', timeLabel: '12 Jam terakhir' },
              { value: '298', unit: 't/h', timeLabel: '1 hari terakhir' },
              { value: '298', unit: 't/h', timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    // Combine all data for RealTimeDataChart with range scaling
    const combinedRealTimeData = ptfPressureRealTimeData.map((p, i) => ({
        pressure: p,
        temperature: ptfTemperatureRealTimeData[i],
        flow: ptfFlowRealTimeData[i]
    }));

    // Get history data based on selected metric
    const getHistoryData = () => {
        switch(selectedMetric) {
            case 'temperature':
                return {
                    dataset1: ptfTemperatureHistoryDataset1,
                    dataset2: ptfTemperatureHistoryDataset2,
                    unit: '°C',
                    yAxisTitle: 'Temperature (°C)',
                    dataset1Label: 'Temperature',
                    dataset2Label: 'Temperature AI'
                };
            case 'flow':
                return {
                    dataset1: ptfFlowHistoryDataset1,
                    dataset2: ptfFlowHistoryDataset2,
                    unit: 't/h',
                    yAxisTitle: 'Flow (t/h)',
                    dataset1Label: 'Flow',
                    dataset2Label: 'Flow AI'
                };
            default: // pressure
                return {
                    dataset1: ptfPressureHistoryDataset1,
                    dataset2: ptfPressureHistoryDataset2,
                    unit: 'kPa',
                    yAxisTitle: 'Pressure (kPa)',
                    dataset1Label: 'Pressure',
                    dataset2Label: 'Pressure AI'
                };
        }
    };

    const historyData = getHistoryData();

    return (
        <Box>
          <AnalyticsHeader title="Pressure, Temperature and Flow" subtitle="Analytic" />

          <Grid container spacing={3} alignItems="stretch">
            
            {/* --- PRESSURE ROW --- */}
            {/* 1. Pressure Gauge MainCard (Takes up 4 columns) */}
            <Grid size={{ xs: 12, lg: 2.5 }} sx={{ display: 'flex' }}>
                <MainCard
                    sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%', // Ensure it stretches
                    // height: { xs: 'auto', lg: '95%' },
                    // minHeight: { md: '230px' },
                    // mb: { lg: 0 },
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
                        {pressureChangePct === null ? '–' : (pressureChangePct > 0 ? `+${pressureChangePct}%` : `${pressureChangePct}%`)}
                        </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                        <GaugeChart
                        value={pressure}
                        min={322}
                        max={1678}
                        unit="kPa"
                        abnormalLow={333}
                        warningLow={444}
                        idealLow={1000}
                        idealHigh={1400}
                        warningHigh={1600}
                        abnormalHigh={1667}
                        changePct={pressureChangePct}
                        withCard={false}
                        sx={{ width: '100%', maxWidth: 360 }}
                        />
                    </Box>
                </MainCard>
            </Grid>

            {/* 2. Pressure Stats (Each takes 2 columns = 8 columns total) */}
            {pressureCardData.map((card, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 2.37 }} key={`pressure-${index}`} sx={{ display: 'flex' }}>
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
             <Grid size={{ xs: 12, lg: 2.5 }} sx={{ display: 'flex' }}>
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
                        {temperatureChangePct === null ? '–' : (temperatureChangePct > 0 ? `+${temperatureChangePct}%` : `${temperatureChangePct}%`)}
                        </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                        <GaugeChart
                        value={temperature}
                        min={100}
                        max={200}
                        unit="°C"
                        abnormalLow={105}
                        warningLow={120}
                        idealLow={135}
                        idealHigh={165}
                        warningHigh={180}
                        abnormalHigh={195}
                        changePct={temperatureChangePct}
                        withCard={false}
                        sx={{ width: '100%', maxWidth: 360 }}
                        />
                    </Box>
                </MainCard>
            </Grid>

            {/* 2. Temperature Stats */}
            {temperatureCardData.map((card, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 2.37 }} key={`temperature-${index}`} sx={{ display: 'flex' }}>
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
            <Grid size={{ xs: 12, lg: 2.5 }} sx={{ display: 'flex' }}>
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
                        {flowChangePct === null ? '–' : (flowChangePct > 0 ? `+${flowChangePct}%` : `${flowChangePct}%`)}
                        </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                        <GaugeChart
                        value={flow}
                        min={200}
                        max={300}
                        unit="t/h"
                        abnormalLow={210}
                        warningLow={220}
                        idealLow={225}
                        idealHigh={265}
                        warningHigh={270}
                        abnormalHigh={285}
                        changePct={flowChangePct}
                        withCard={false}
                        sx={{ width: '100%', maxWidth: 360 }}
                        />
                    </Box>
                </MainCard>
            </Grid>

            {/* 2. Flow Stats */}
            {flowCardData.map((card, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 2.37 }} key={`flow-${index}`} sx={{ display: 'flex' }}>
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
              />
            </Grid>

            {/* <Grid size={12}>
              <HistoryComparisonChart
                title="History Data & Perbandingan"
                subtitle="Grafik history data dan perbandingan"
                dataset1={historyData.dataset1}
                dataset2={historyData.dataset2}
                dataset1Label={historyData.dataset1Label}
                dataset2Label={historyData.dataset2Label}
                unit={historyData.unit}
                yAxisTitle={historyData.yAxisTitle}
                selectedMetric={selectedMetric}
                onMetricChange={setSelectedMetric}
              />
            </Grid> */}

            <Grid size={18}>
              <StatisticsTable
                title="Tabel Data Statistik"
                subtitle="Tabel data statistik yang telah diperoleh"
                data={generatePTFTableData()}
              />
            </Grid>
          </Grid>
        </Box>
      );
};

export default PTF;