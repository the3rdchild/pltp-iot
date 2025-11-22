// pages/settings/dataInput.jsx
import { Grid, Box, Typography, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { generateAnalyticData } from 'data/simulasi';

import {
  AnalyticsHeader,
  HistoryComparisonChart,
  StatisticsTable
} from '../../components/analytics';

// tambahan: form input component (letakkan file komponen di components/settings/DataInputForm.jsx)
import DataInputForm from '../../components/settings/DataInputForm';

// Path lokal image mockup (akan diubah jadi URL oleh sistem/tool yang Anda gunakan)
const MOCKUP_URL = '/mnt/data/1f10e2d7-6b71-4b11-bec0-1c6740e73f52.png';

const Dryness = () => {
  const theme = useTheme();
  const [analyticData, setAnalyticData] = useState(null);
  const [changePct, setChangePct] = useState(null);

  useEffect(() => {
    const prevDryRef = { current: null };

    const updateData = () => {
      const data = generateAnalyticData();
      setAnalyticData((prev) => {
        const prevVal = prev?.dryness ?? prevDryRef.current;
        if (prevVal === undefined || prevVal === null) {
          setChangePct(0);
        } else {
          const cur = data.dryness;
          const pct = prevVal === 0 ? 0 : ((cur - prevVal) / Math.abs(prevVal)) * 100;
          setChangePct(Math.round(pct));
        }
        prevDryRef.current = data.dryness;
        return data;
      });
    };

    updateData();

    const interval = setInterval(updateData, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <AnalyticsHeader title="Manual Data Input" subtitle="Settings" />
      <Grid
        container
        spacing={3}
        alignItems="stretch"
        sx={{
          minHeight: { lg: '640px' },
        }}
      >
        <Grid item xs={12}>
          <DataInputForm
            title="Grafik perbandingan dryness & prediksi AI"
            subtitle="Grafik perbandingan dryness & prediksi AI"
            yAxisTitle="Dryness (%)"
            unit="%"
          />
        </Grid>

        <Grid item xs={12}>
          <HistoryComparisonChart
            title="Tabel Hasil Input"
            subtitle="Input hasil data yang diperoleh"
          />
        </Grid>

        <Grid item xs={12}>
          <StatisticsTable
            title="Tabel Hasil Input"
            subtitle="Input hasil data yang diperoleh"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export function DataInputPage() {
  return (
    <Box>
      <AnalyticsHeader title="Manual Data Input" subtitle="Setting input data lab secara manual" />
      <Box mt={2}>
        <DataInputForm mockupUrl={MOCKUP_URL} />
      </Box>
    </Box>
  );
}

export default Dryness;
