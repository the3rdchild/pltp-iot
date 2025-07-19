import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import RiskTable from './RiskTable';
import RiskVideoPreview from './RiskVideoPreview';
import DrynessFractionDoc from './DrynessFractionDoc';
import RForest from './RForest';

// import semua video
import Ideal from 'assets/videos/predict/1_Ideal_0001-0088.mp4';
import Contaminated from 'assets/videos/predict/2_Contaminated Dry_0001-0088.mp4';
import WetClean from 'assets/videos/predict/3_Wet Clean_0001-0088.mp4';
import MoistureFailure from 'assets/videos/predict/4_Moisture Failure0001-0088.mp4';
import CriticalDamage from 'assets/videos/predict/5_Critical Damage_0001-0088.mp4';

export default function SamplePage() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Set default video ke 'Ideal' saat load awal
  useEffect(() => {
    setSelectedVideo(Ideal);
  }, []);

  const handleRiskClick = (label) => {
    const videoMap = {
      Ideal: Ideal,
      'Contaminated Dry': Contaminated,
      'Wet Clean': WetClean,
      'Moisture Failure': MoistureFailure,
      'Critical Damage': CriticalDamage
    };
    setSelectedVideo(videoMap[label] || null);
  };

  return (
    <MainCard 
    title={<span style={{ fontSize: '18px' }}>Klasifikasi Risiko Operasional Turbin</span>}
    >
      <Grid container spacing={3}>
        {/* Kolom Tabel – lebar 7/12 */}
        <Grid item xs={12} md={7}>
          <RiskTable onRiskClick={handleRiskClick} />
        </Grid>

        {/* Kolom Video – lebar 5/12 */}
        <Grid item xs={12} md={5}>
          <Typography variant="h7">Video Simulation Overview (Klik Label Prediksi Risiko)</Typography>
          <RiskVideoPreview src={selectedVideo} />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
      <DrynessFractionDoc />
      </Grid>

      <Grid container spacing={3}>
      <RForest />
      </Grid>
    </MainCard>

    
  );
}
