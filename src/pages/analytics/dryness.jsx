
import { Grid, Box, Typography, useTheme } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

import { useState, useEffect } from 'react';
import { generateAnalyticData } from 'data/simulasi';

import GaugeChart from '../../components/GaugeChart';
import MainCard from 'components/MainCard';

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

    const dryness = analyticData?.dryness ?? 6.8;
    const anomalyCount = '03';
    const minDryness = '89.77%';
    const avgDryness = '99.51%';
    const maxDryness = '89.77%';

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
            <Typography variant="h4" sx={{ mb: 2 }}>
                Dryness / Analytic
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <MainCard sx={{ height: '70%' }}>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" color="textSecondary">Dryness Fraction</Typography>
                        {/* dynamic percent-change badge */}
                        <Box sx={{
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: (changePct > 0 ? 'success.dark' : changePct < 0 ? 'error.dark' : 'text.secondary'),
                          backgroundColor: (changePct > 0 ? 'success.light' : changePct < 0 ? 'error.light' : 'grey.100'),
                        }}>
                          {changePct === null ? '–' : (changePct > 0 ? `+${changePct}%` : `${changePct}%`)}
                        </Box>
                        </Box>
                        <GaugeChart
                            value={dryness}
                            min={0}
                            max={20}
                            unit="ppm"
                            idealHigh={8}
                            warningHigh={15}
                            abnormalHigh={20}
                            changePct={changePct}
                        />
                    </MainCard>
                </Grid>

                {cardData.map((card, index) => (
                    <Grid item xs={12} sm={6} md={2} key={index}>
                        <MainCard sx={{ height: '52%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" color="textSecondary">{card.title}</Typography>
                                <LaunchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            </Box>
                            <Box sx={{ py: 2 }}>
                                <Box sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '50%',
                                    backgroundColor: card.iconBgColor,
                                    color: card.iconColor,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2.5,
                                    textAlign: 'center'
                                }}>
                                    {card.icon}
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Box>
                                        <Typography variant="h2" component="span">{card.value}</Typography>
                                        {card.unit && 
                                            <Typography variant="body1" component="span" color="textSecondary" sx={{ ml: 0.5 }}>{card.unit}</Typography>
                                        }
                                    </Box>
                                    <Typography variant="caption" color="textSecondary">1 Jam terakhir</Typography>
                                </Box>
                            </Box>
                        </MainCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Dryness;
