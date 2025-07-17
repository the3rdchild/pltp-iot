import React, { useState } from 'react';
import MainCard from 'components/MainCard';
import RiskTable from './RiskTable';
import RiskVideoPreview from './RiskVideoPreview';

// import video assets
import Ideal from 'assets/videos/predict/1_Ideal_0001-0088.mp4';
import Contaminated from 'assets/videos/predict/2_Contaminated Dry_0001-0088.mp4';
import WetClean from 'assets/videos/predict/3_Wet Clean_0001-0088.mp4';
import MoistureFailure from 'assets/videos/predict/4_Moisture Failure0001-0088.mp4';
import CriticalDamage from 'assets/videos/predict/5_Critical Damage_0001-0088.mp4';

export default function SamplePage() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleRiskClick = (label) => {
    const videoMap = {
      'Ideal': Ideal,
      'Contaminated Dry': Contaminated,
      'Wet Clean': WetClean,
      'Moisture Failure': MoistureFailure,
      'Critical Damage': CriticalDamage
    };
    setSelectedVideo(videoMap[label] || null);
  };

  return (
    <>
      <MainCard title="Klasifikasi Risiko Operasional Turbin">
        <RiskTable onRiskClick={handleRiskClick} />
      </MainCard>
      <RiskVideoPreview src={selectedVideo} />
    </>
  );
}
