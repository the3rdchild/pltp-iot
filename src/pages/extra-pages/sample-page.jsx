import React from 'react';
// material-ui
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';


// project imports
import MainCard from 'components/MainCard';

const riskPredictionData = [
  {
    id: 1,
    drynessRange: '0.90 ≤ x ≤ 0.95',
    tdsRange: '≤ 60',
    label: '✅ Ideal',
    description: 'Kondisi uap sangat kering dengan tingkat kontaminan rendah; risiko erosi dan korosi pada turbin minimal.'
  },
  {
    id: 2,
    drynessRange: '0.90 ≤ x ≤ 0.95',
    tdsRange: '> 100',
    label: '⚠️ Contaminated Dry',
    description: 'Uap sangat kering namun mengandung kontaminan tinggi; berpotensi menyebabkan deposit dan peningkatan gesekan pada bilah turbin.'
  },
  {
    id: 3,
    drynessRange: '0.80 ≤ x < 0.90',
    tdsRange: '≤ 60',
    label: '⚠️ Wet Clean',
    description: 'Uap relatif bersih dari kontaminan tetapi masih mengandung kelembapan; perlu tindakan pengeringan lebih lanjut untuk mencegah erosi turbin.'
  },
  {
    id: 4,
    drynessRange: 'x < 0.80',
    tdsRange: '≤ 60',
    label: '❌ Failure Due to Moisture',
    description: 'Uap basah dengan kandungan air tinggi meski kontaminan rendah; potensi erosi mekanis dan turbin beroperasi di bawah efisiensi desain.'
  },
  {
    id: 5,
    drynessRange: 'x < 0.90',
    tdsRange: '> 100',
    label: '🔴 Critical Contamination',
    description: 'Kombinasi uap basah dan kontaminan tinggi; kondisi kritis yang dapat menyebabkan kerusakan parah pada turbin dan memerlukan intervensi pemeliharaan segera.'
  }
];

export default function SamplePage() {
  return (
    <>
    <MainCard title="">
      <Typography variant="h6" gutterBottom>
        Tabel Klasifikasi Risiko Operasional Turbin Berdasarkan Dryness Fraction dan TDS
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="risk prediction table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Kondisi ID</strong></TableCell>
              <TableCell><strong>Dryness Fraction Range (x)</strong></TableCell>
              <TableCell><strong>TDS Overall Range (ppm)</strong></TableCell>
              <TableCell><strong>Label Prediksi Risiko</strong></TableCell>
              <TableCell><strong>Deskripsi Formal</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {riskPredictionData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.drynessRange}</TableCell>
                <TableCell>{row.tdsRange}</TableCell>
                <TableCell>{row.label}</TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>

  <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 4 - full width image */}
      <Box
      title="Diagram Flow"
      component="img"
      src={simulasiImage}
      alt="Simulation"
      sx={{ width: '100%', borderRadius: 2 }}
        />
  </Grid>
  </>

  );
}
