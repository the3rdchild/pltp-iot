import { Grid, Box, Typography } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

import { useMultiMetricData } from '../../hooks/useTestAwareAnalyticsData';
import { formatValueWithUnit } from '../../utils/analyticsHelpers';
import { useAnomalyCounts } from '../../hooks/useAnomalyTracker';
import { useMetricStats } from '../../hooks/useMetricStatistics';
import { PowerChart, AnalyticsHeader, StatisticsTable, StatCard } from '../../components/analytics';
import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';
import { getLimitData } from '../../utils/limitData';

// icons
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';

// Chart/live metric keys (VALID_METRICS in liveDataController) vs stats keys
// (METRIC_COLUMN_MAP + metric_limits in dataController) intentionally differ:
// live/chart/stats-table want active_power/reactive_power/speed, while
// metric-stats/anomaly-counts want gen_output/reactive_power/speed_detection.
// Mirrors /ptf, which uses 'flow' for stats but 'flow_rate' for live.
const Power = () => {
  const limitData = getLimitData();

  const { metricsData, loading } = useMultiMetricData(['active_power', 'reactive_power', 'speed'], '1d');

  const activePower = metricsData.active_power?.live?.value;
  const reactivePower = metricsData.reactive_power?.live?.value;
  const stSpeed = metricsData.speed?.live?.value;

  // Local state for percentage changes
  const [activePowerChangePct, setActivePowerChangePct] = useState(null);
  const [reactivePowerChangePct, setReactivePowerChangePct] = useState(null);
  const [stSpeedChangePct, setStSpeedChangePct] = useState(null);

  // Refs to track previous values
  const prevActivePowerRef = useRef(null);
  const prevReactivePowerRef = useRef(null);
  const prevStSpeedRef = useRef(null);

  // Calculate percentage changes (same pattern as ptf.jsx)
  useEffect(() => {
    const applyChange = (value, prevRef, setPct) => {
      if (value === undefined || value === null) return;
      const prev = prevRef.current;
      if (prev === null || prev === undefined) {
        setPct(0);
      } else {
        const pct = prev === 0 ? 0 : ((value - prev) / Math.abs(prev)) * 100;
        setPct(Math.round(pct));
      }
      prevRef.current = value;
    };

    applyChange(activePower, prevActivePowerRef, setActivePowerChangePct);
    applyChange(reactivePower, prevReactivePowerRef, setReactivePowerChangePct);
    applyChange(stSpeed, prevStSpeedRef, setStSpeedChangePct);
  }, [activePower, reactivePower, stSpeed]);

  // Real-time statistics tracking (stats keys are the limit/DB keys)
  const activePowerStats = useMetricStats('gen_output', activePower);
  const reactivePowerStats = useMetricStats('reactive_power', reactivePower);
  const stSpeedStats = useMetricStats('speed_detection', stSpeed);

  // Real-time anomaly tracking
  const activePowerAnomalies = useAnomalyCounts('gen_output', activePower);
  const reactivePowerAnomalies = useAnomalyCounts('reactive_power', reactivePower);
  const stSpeedAnomalies = useAnomalyCounts('speed_detection', stSpeed);

  // Card data builder — identical layout to ptf.jsx's card arrays
  // unitOnHover: hide the unit in the collapsed card and show it only on hover (for wide units)
  const buildCardData = (stats, anomalies, unit, unitOnHover = false) => {
    const valueUnit = unitOnHover ? '' : unit;
    const hoverUnit = unitOnHover ? unit : undefined;
    return [
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
      value: formatValueWithUnit(stats.min24h, valueUnit),
      hoverUnit,
      icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
      iconBgColor: '#FF7E7E',
      iconColor: '#fff',
      additionalData: [
        { value: formatValueWithUnit(stats.min12h, valueUnit), timeLabel: '12 Jam terakhir' },
        { value: formatValueWithUnit(stats.min24h, valueUnit), timeLabel: '1 hari terakhir' },
        { value: formatValueWithUnit(stats.min7d, valueUnit), timeLabel: '1 minggu terakhir' }
      ]
    },
    {
      title: 'Average',
      value: formatValueWithUnit(stats.avg24h, valueUnit),
      hoverUnit,
      icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
      iconBgColor: '#53A1FF',
      iconColor: '#fff',
      additionalData: [
        { value: formatValueWithUnit(stats.avg12h, valueUnit), timeLabel: '12 Jam terakhir' },
        { value: formatValueWithUnit(stats.avg24h, valueUnit), timeLabel: '1 hari terakhir' },
        { value: formatValueWithUnit(stats.avg7d, valueUnit), timeLabel: '1 minggu terakhir' }
      ]
    },
    {
      title: 'Maximum',
      value: formatValueWithUnit(stats.max24h, valueUnit),
      hoverUnit,
      icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
      iconBgColor: '#58E58C',
      iconColor: '#fff',
      additionalData: [
        { value: formatValueWithUnit(stats.max12h, valueUnit), timeLabel: '12 Jam terakhir' },
        { value: formatValueWithUnit(stats.max24h, valueUnit), timeLabel: '1 hari terakhir' },
        { value: formatValueWithUnit(stats.max7d, valueUnit), timeLabel: '1 minggu terakhir' }
      ]
    }
  ];
  };

  const activePowerCardData = buildCardData(activePowerStats, activePowerAnomalies, 'MW');
  const reactivePowerCardData = buildCardData(reactivePowerStats, reactivePowerAnomalies, 'MVAR', true);
  const stSpeedCardData = buildCardData(stSpeedStats, stSpeedAnomalies, 'RPM');

  // One row config per parameter — the gauge + 4 StatCards render identically
  // to the Pressure/Temperature/Flow rows in ptf.jsx.
  // NOTE: reactive_power's lowerLimit equals its min, so its gauge has no
  // low-side warning/abnormal band.
  const rows = [
    {
      key: 'active-power',
      label: 'Active Power',
      value: activePower,
      changePct: activePowerChangePct,
      limit: limitData.gen_output,
      cardData: activePowerCardData
    },
    {
      key: 'reactive-power',
      label: 'Reactive Power',
      value: reactivePower,
      changePct: reactivePowerChangePct,
      limit: limitData.reactive_power,
      cardData: reactivePowerCardData
    },
    {
      key: 'st-speed',
      label: 'S.T Speed',
      // RPM values are 4 digits wide and collide with the in-gauge unit, so show it in the title
      unitInTitle: true,
      value: stSpeed,
      changePct: stSpeedChangePct,
      limit: limitData.speed_detection,
      cardData: stSpeedCardData
    }
  ];

  return (
    <Box>
      <AnalyticsHeader title="Power" subtitle="Analytic" />

      <Grid container spacing={3} alignItems="stretch">
        {rows.map((row) => (
          <React.Fragment key={row.key}>
            {/* 1. Gauge MainCard (Takes up 2.5 columns) */}
            <Grid size={{ xs: 12, lg: 2.5 }}>
              <MainCard
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {row.unitInTitle ? `${row.label} (${row.limit.unit})` : row.label}
                  </Typography>
                  <Box
                    sx={{
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: row.changePct > 0 ? 'success.dark' : row.changePct < 0 ? 'error.dark' : 'text.secondary',
                      backgroundColor: row.changePct > 0 ? 'success.light' : row.changePct < 0 ? 'error.light' : 'grey.100'
                    }}
                  >
                    {loading ? '...' : row.changePct == null ? '–' : row.changePct > 0 ? `+${row.changePct}%` : `${row.changePct}%`}
                  </Box>
                </Box>

                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                  <GaugeChart
                    value={row.value}
                    min={row.limit.min}
                    max={row.limit.max}
                    unit={row.unitInTitle ? '' : row.limit.unit}
                    lowerLimit={row.limit.lowerLimit}
                    upperLimit={row.limit.upperLimit}
                    withCard={false}
                    sx={{ width: '100%', maxWidth: 360 }}
                    loading={loading}
                  />
                </Box>
              </MainCard>
            </Grid>

            {/* 2. Stats (Each takes 2.37 columns = 9.5 columns total) */}
            {row.cardData.map((card, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 2.37 }} key={`${row.key}-${index}`}>
                <StatCard
                  title={card.title}
                  value={card.value}
                  unit={card.unit}
                  hoverUnit={card.hoverUnit}
                  icon={card.icon}
                  iconBgColor={card.iconBgColor}
                  iconColor={card.iconColor}
                  backgroundColor="#F5F5F5"
                  additionalData={card.additionalData}
                />
              </Grid>
            ))}
          </React.Fragment>
        ))}

        {/* --- CHART & TABLES --- */}
        <Grid size={12}>
          <PowerChart
            title="Power Real Time Data"
            subtitle="Active Power, Reactive Power, S.T Speed data chart"
            liveValues={{ active_power: activePower, reactive_power: reactivePower, speed: stSpeed }}
          />
        </Grid>

        {/* Tables */}
        <Grid size={12}>
          <StatisticsTable
            title="Tabel Data Statistik Active Power"
            subtitle="Tabel data statistik yang telah diperoleh untuk active power"
            metric="active_power"
          />
        </Grid>
        <Grid size={12}>
          <StatisticsTable
            title="Tabel Data Statistik Reactive Power"
            subtitle="Tabel data statistik yang telah diperoleh untuk reactive power"
            metric="reactive_power"
          />
        </Grid>
        <Grid size={12}>
          <StatisticsTable
            title="Tabel Data Statistik S.T Speed"
            subtitle="Tabel data statistik yang telah diperoleh untuk s.t speed"
            metric="speed"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Power;
