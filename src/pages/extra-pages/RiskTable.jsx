import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';

const riskPredictionData = [
  {
    id: 1,
    drynessRange: '0.99 ≤ x ≤ 1.00',
    tdsRange: '≤ 60',
    label: '✅ Ideal',
    riskKey: 'Ideal',
    description: 'Kondisi uap sangat kering dengan tingkat kontaminan rendah; risiko erosi dan korosi pada turbin minimal.'
  },
  {
    id: 2,
    drynessRange: '0.95 ≤ x ≤ 0.99',
    tdsRange: '> 100',
    label: '⚠️ Contaminated Dry',
    riskKey: 'Contaminated Dry',
    description: 'Uap sangat kering namun mengandung kontaminan tinggi; berpotensi menyebabkan deposit dan peningkatan gesekan pada bilah turbin.'
  },
  {
    id: 3,
    drynessRange: '0.90 ≤ x < 0.95',
    tdsRange: '≤ 60',
    label: '⚠️ Wet Clean',
    riskKey: 'Wet Clean',
    description: 'Uap relatif bersih dari kontaminan tetapi masih mengandung kelembapan; perlu tindakan pengeringan lebih lanjut untuk mencegah erosi turbin.'
  },
  {
    id: 4,
    drynessRange: 'x < 0.90',
    tdsRange: '≤ 60',
    label: '❌ Failure Due to Moisture',
    riskKey: 'Moisture Failure',
    description: 'Uap basah dengan kandungan air tinggi meski kontaminan rendah; potensi erosi mekanis dan turbin beroperasi di bawah efisiensi desain.'
  },
  {
    id: 5,
    drynessRange: 'x < 0.90',
    tdsRange: '> 100',
    label: '🔴 Critical Contamination',
    riskKey: 'Critical Damage',
    description: 'Kombinasi uap basah dan kontaminan tinggi; kondisi kritis yang dapat menyebabkan kerusakan parah pada turbin dan memerlukan intervensi pemeliharaan segera.'
  }
];

export default function RiskTable({ onRiskClick }) {
  return (
    <>
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
                <TableCell
                  style={{ cursor: 'pointer', color: '#1890FF' }}
                  onClick={() => onRiskClick(row.riskKey)}
                >
                  {row.label}
                </TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
