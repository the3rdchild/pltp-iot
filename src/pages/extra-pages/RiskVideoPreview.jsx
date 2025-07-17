import React from 'react';
import Box from '@mui/material/Box';

export default function RiskVideoPreview({ src }) {
  if (!src) return null;

  return (
    <Box mt={4}>
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        style={{ width: '100%', borderRadius: '8px' }}
      />
    </Box>
  );
}
