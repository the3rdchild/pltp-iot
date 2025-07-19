import React from 'react';
import { Grid, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

export default function RandomForestDoc() {
  return (
    <MainCard
        title={<span style={{ fontSize: '18px' }}>Algoritma AI Random Forest</span>}
      >

      <Grid container spacing={2} direction="column">
        <Grid item>
          <Typography variant="h6" gutterBottom>
            Definisi
          </Typography>
          <Typography variant="body1">
            Random Forest adalah algoritma machine learning berbasis ensemble yang digunakan untuk klasifikasi dan regresi. Metode ini bekerja dengan membangun banyak pohon keputusan (decision tree) selama proses pelatihan dan memberikan hasil berdasarkan mayoritas prediksi (untuk klasifikasi) atau rata-rata (untuk regresi) dari pohon-pohon tersebut.
          </Typography>
        </Grid>

        <Grid item>
          <Typography variant="h6" gutterBottom>
            Alasan Pemilihan Random Forest
          </Typography>
          <Typography variant="body1">
            Random Forest cocok digunakan pada proyek ini karena memiliki kemampuan untuk:
            <ul>
              <li>Menangani data numerik maupun kategorik</li>
              <li>Mengurangi risiko overfitting yang umum terjadi pada decision tree tunggal</li>
              <li>Memberikan hasil prediksi yang stabil dan akurat</li>
            </ul>
          </Typography>
        </Grid>

        <Grid item>
          <Typography variant="h6" gutterBottom>
            Cara Kerja
          </Typography>
          <Typography variant="body1">
            Proses kerja Random Forest secara umum:
            <ol>
              <li>Mengambil sampel data secara acak (bootstrapping)</li>
              <li>Untuk setiap sampel, dibuat pohon keputusan berdasarkan subset fitur secara acak</li>
              <li>Setiap pohon menghasilkan prediksi</li>
              <li>Hasil akhir ditentukan berdasarkan mayoritas (klasifikasi) atau rata-rata (regresi)</li>
            </ol>
          </Typography>
        </Grid>

        <Grid item>
          <Typography variant="h6" gutterBottom>
            Penerapan dalam Proyek PLTP
          </Typography>
          <Typography variant="body1">
            Dalam proyek ini, Random Forest digunakan untuk memprediksi risiko operasional turbin berdasarkan parameter seperti fraksi kekeringan dan nilai TDS. Dataset pelatihan berisi label risiko (Ideal, Contaminated, dll.) yang dipelajari model untuk mengklasifikasikan kondisi baru.
          </Typography>
        </Grid>

        <Grid item>
          <Typography variant="h6" gutterBottom>
            Visualisasi Sederhana Algoritma
          </Typography>
          <Typography variant="body1">
            Misalkan dataset memiliki 100 data dengan 5 fitur. Random Forest akan:
            <ul>
              <li>Mengambil 100 data acak untuk tiap pohon</li>
              <li>Memilih 2-3 fitur acak untuk tiap split node</li>
              <li>Membuat 100 pohon keputusan</li>
              <li>Menghasilkan prediksi akhir berdasarkan mayoritas pohon</li>
            </ul>
          </Typography>
        </Grid>
      </Grid>
    </MainCard>
  );
}
