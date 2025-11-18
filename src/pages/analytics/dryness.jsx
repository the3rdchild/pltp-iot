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

// icons
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import RemoveIcon from '@mui/icons-material/Remove';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import AddIcon from '@mui/icons-material/Add';


const Dryness = () => {
    const theme = useTheme();
    const [analyticData, setAnalyticData] = useState(null);
    const [changePct, setChangePct] = useState(null);


    useEffect(() => {
      const prevDryRef = { current: null }; // simple ref-like object (no extra hook required)
    
      const updateData = () => {
        const data = generateAnalyticData();
        setAnalyticData((prev) => {
          // compute percent change relative to previous (prefer prev from state if present)
          const prevVal = prev?.dryness ?? prevDryRef.current;
          if (prevVal === undefined || prevVal === null) {
            // first run: no change
            setChangePct(0);
          } else {
            const cur = data.dryness;
            // protect against division by zero
            const pct = prevVal === 0 ? 0 : ((cur - prevVal) / Math.abs(prevVal)) * 100;
            setChangePct(Math.round(pct)); // integer percent, change as you like
          }
          prevDryRef.current = data.dryness;
          return data;
        });
      };
    
      // first-run populate
      updateData();
    
      const interval = setInterval(updateData, 3000);
    
      return () => clearInterval(interval);
    }, []);

    const dryness = analyticData?.dryness ?? 99.3;
    const anomalyCount = '03';
    const minDryness = '97.77%';
    const avgDryness = '99.01%';
    const maxDryness = '99.89%';

    const cardData = [
        {
            title: 'Anomali Status',
            value: anomalyCount,
            unit: 'Anomali',
            icon: <PriorityHighIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#9271FF',
            iconColor: '#fff'
        },
        {
            title: 'Minimum',
            value: minDryness,
            icon: <RemoveIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#FF7E7E',
            iconColor: '#fff'
        },
        {
            title: 'Average',
            value: avgDryness,
            icon: <DragHandleIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#53A1FF',
            iconColor: '#fff'
        },
        {
            title: 'Maximum',
            value: maxDryness,
            icon: <AddIcon sx={{ fontSize: '2.5rem' }} />,
            iconBgColor: '#58E58C',
            iconColor: '#fff'
        }
    ];

    return (
        <Box>
          <AnalyticsHeader title="Dryness" subtitle="Analytic" />
      
          {/* Give the whole grid a definite height on large screens so % heights work */}
          <Grid
            container
            spacing={3}
            alignItems="stretch"
            sx={{
              // tune this minHeight to match your header/sidebar so 84%/70% feel identical to previous design
              minHeight: { lg: '640px' }, // 640px is an example — 84% of 640 ≈ 538px; adjust to taste
            }}
          >
            {/* Left big gauge card */}
            <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
            <MainCard
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                // percent only on lg+, auto on smaller sizes
                height: { xs: 'auto', lg: '84%' },
                minHeight: { md: '230px' },
                // add a small bottom margin on lg to guarantee visual gap if needed
                mb: { lg: 3 },
              }}
            >
                {/* header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">Dryness Fraction</Typography>
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
                    value={dryness}
                    min={95}
                    max={99.9}
                    unit="%"
                    abnormalLow={95}
                    warningLow={98}
                    idealLow={100}
                    idealHigh={100}
                    warningHigh={100}
                    abnormalHigh={100}
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
                />
              </Grid>
            ))}
      
            <Grid item xs={12} sx={{ mt: { xs: 0, lg: -5 } }}>
              <RealTimeDataChart
                title="Real Time Data"
                subtitle="Dryness level data chart"
                yAxisTitle="Dryness (%)"
                unit="%"
              />
            </Grid>

            <Grid item xs={12}>
              <HistoryComparisonChart
                title="History Data & Perbandingan"
                subtitle="Grafik dryness history data dan perbandingan"
                yAxisTitle="Dryness (%)"
                unit="%"
              />
            </Grid>

            <Grid item xs={12}>
              <StatisticsTable
                title="Tabel Data Statistik"
                subtitle="Tabel data statistik yang telah diperoleh"
              />
            </Grid>
          </Grid>
        </Box>
      );
};

export default Dryness;
