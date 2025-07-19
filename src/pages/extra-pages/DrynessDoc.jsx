import React from 'react';

// material-ui
import { Typography, Box, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import MainCard from 'components/MainCard';

export default function DrynessDoc() {
  return (
    <MainCard title="Dryness Fraction Documentation">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            📘 What is Dryness Fraction?
          </Typography>
          <Typography variant="body1" paragraph>
            Dryness Fraction (<b>x</b>) is a thermodynamic property that indicates the quality of steam. It is defined as the mass ratio between vapor and the total mixture (vapor + liquid). In geothermal turbines, high dryness fraction indicates dry steam, which is ideal for efficient and safe operation.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            🔢 Mathematical Formula
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontFamily: 'monospace' }}>
            x = mvapor / (mvapor + mliquid)
          </Typography>
          <Typography variant="body2">
            where:
            <ul>
              <li><b>x</b> is the dryness fraction (0 ≤ x ≤ 1)</li>
              <li><b>mvapor</b> is the mass of vapor</li>
              <li><b>mliquid</b> is the mass of liquid</li>
            </ul>
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            ⚠️ Operational Thresholds in This System
          </Typography>
          <Typography variant="body1" paragraph>
            Based on the AI classification used in the PLTP monitoring system:
            <ul>
              <li><b>x &lt; 0.80</b>: High risk (wet steam)</li>
              <li><b>0.80 ≤ x &lt; 0.90</b>: Acceptable with caution</li>
              <li><b>0.90 ≤ x ≤ 0.95</b>: Ideal operational range</li>
            </ul>
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            🔍 Role in AI-based Prediction
          </Typography>
          <Typography variant="body1" paragraph>
            The dryness fraction is one of the main features used in AI classification to predict operational risk levels. It is paired with Total Dissolved Solids (TDS) values to improve prediction accuracy and anomaly detection using supervised machine learning.
          </Typography>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Divider />
        <Typography variant="caption" display="block" align="center" sx={{ mt: 2 }}>
          PLTP Monitoring System © 2025
        </Typography>
      </Box>
    </MainCard>
  );
}
