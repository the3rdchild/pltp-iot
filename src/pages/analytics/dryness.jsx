import { Grid, Box, Typography } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

import { useAi2Data } from '../../hooks/useAi2Data';
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

const Dryness = () => {
    const limitData = getLimitData();

    const { liveData, loading } = useAi2Data();
    const dryness = liveData?.dryness_predict != null ? parseFloat(liveData.dryness_predict) : NaN;

    const [changePct, setChangePct] = useState(null);
    const prevDryRef = useRef(null);

    useEffect(() => {
        if (dryness == null || isNaN(dryness)) return;
        const prev = prevDryRef.current;
        if (prev == null) {
            setChangePct(0);
        } else {
            const pct = prev === 0 ? 0 : ((dryness - prev) / Math.abs(prev)) * 100;
            setChangePct(Math.round(pct));
        }
        prevDryRef.current = dryness;
    }, [dryness]);

    // Real-time statistics tracking
    const drynessStats = useMetricStats('dryness', dryness);

    // Real-time anomaly tracking
    const anomalies = useAnomalyCounts('dryness', dryness);

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
            value: `${drynessStats.min24h}%`,
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff',
            additionalData: [
                { value: `${drynessStats.min12h}%`, timeLabel: '12 Jam terakhir' },
                { value: `${drynessStats.min24h}%`, timeLabel: '1 hari terakhir' },
                { value: `${drynessStats.min7d}%`, timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Average',
            value: `${drynessStats.avg24h}%`,
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff',
            additionalData: [
              { value: `${drynessStats.avg12h}%`, timeLabel: '12 Jam terakhir' },
              { value: `${drynessStats.avg24h}%`, timeLabel: '1 hari terakhir' },
              { value: `${drynessStats.avg7d}%`, timeLabel: '1 minggu terakhir' }
            ]
        },
        {
            title: 'Maximum',
            value: `${drynessStats.max24h}%`,
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff',
            additionalData: [
              { value: `${drynessStats.max12h}%`, timeLabel: '12 Jam terakhir' },
              { value: `${drynessStats.max24h}%`, timeLabel: '1 hari terakhir' },
              { value: `${drynessStats.max7d}%`, timeLabel: '1 minggu terakhir' }
            ]
        }
    ];

    return (
        <Box>
          <AnalyticsHeader title="Dryness" subtitle="Analytic" />

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
                  <Typography variant="subtitle1" color="textSecondary">Dryness Fraction (AI)</Typography>
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
                    value={dryness}
                    min={limitData.dryness.min}
                    max={limitData.dryness.max}
                    unit={limitData.dryness.unit}
                    abnormalLow={limitData.dryness.abnormalLow}
                    warningLow={limitData.dryness.warningLow}
                    idealLow={limitData.dryness.idealLow}
                    idealHigh={limitData.dryness.idealHigh}
                    warningHigh={limitData.dryness.warningHigh}
                    abnormalHigh={limitData.dryness.abnormalHigh}
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
                title="Dryness Real Time Data (AI)"
                subtitle="Dryness prediction dari AI model"
                metric="dryness_predict"
                liveValue={dryness}
                unit="%"
                yAxisTitle="Dryness (%)"
                color="#3b82f6"
              />
            </Grid>

            <Grid size={12}>
              <StatisticsTable
                title="Tabel Data Statistik"
                subtitle="Tabel data statistik yang telah diperoleh"
                metric="dryness"
              />
            </Grid>
          </Grid>
        </Box>
      );
};

export default Dryness;
