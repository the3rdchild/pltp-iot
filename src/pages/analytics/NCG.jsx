import { Grid, Box, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

import { useAi2Data } from '../../hooks/useAi2Data';
import { useAi2StatsTable } from '../../hooks/useAi2StatsTable';
import { useAnomalyCounts } from '../../hooks/useAnomalyTracker';
import { useMetricStats } from '../../hooks/useMetricStatistics';

import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';
import { getLimitData } from '../../utils/limitData';
import {
  AnalyticsHeader,
  StatCard,
  Ai2Chart,
  StatisticsTable
} from '../../components/analytics';

// icons
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';


const NCG = () => {
    const limitData = getLimitData();

    const { liveData, loading } = useAi2Data();
    const { data: ncgTableData } = useAi2StatsTable('ncg_predict');
    const ncg = liveData?.ncg_predict != null ? parseFloat(liveData.ncg_predict) : null;

    const [changePct, setChangePct] = useState(null);
    const prevNcgRef = useRef(null);

    useEffect(() => {
        if (ncg == null) return;
        const prev = prevNcgRef.current;
        if (prev == null) {
            setChangePct(0);
        } else {
            const pct = prev === 0 ? 0 : ((ncg - prev) / Math.abs(prev)) * 100;
            setChangePct(Math.round(pct));
        }
        prevNcgRef.current = ncg;
    }, [ncg]);

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
                  <Typography variant="subtitle1" color="textSecondary">NCG Level (AI)</Typography>
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
                    {loading ? '...' : (changePct === null ? '–' : (changePct > 0 ? `+${changePct}%` : `${changePct}%`))}
                  </Box>
                </Box>

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
                    loading={loading}
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
              <Ai2Chart
                title="NCG Real Time Data (AI)"
                subtitle="NCG prediction dari AI model"
                metric="ncg_predict"
                liveValue={ncg}
                unit=" wt%"
                yAxisTitle="NCG (wt%)"
              />
            </Grid>

            <Grid size={12}>
              <StatisticsTable
                title="Tabel Data Statistik"
                subtitle="Tabel data statistik yang telah diperoleh"
                metric="ncg"
                data={ncgTableData}
              />
            </Grid>
          </Grid>
        </Box>
      );
};

export default NCG;
