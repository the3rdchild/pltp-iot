import { Typography, Grid, Stack } from '@mui/material';
import MainCard from 'components/MainCard';

export default function DrynessFractionDoc() {
  return (
    <MainCard title="Dryness Fraction">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body1" paragraph>
            <strong>Fraksi Kekeringan (Dryness Fraction)</strong> adalah parameter penting dalam sistem PLTP
            (Pembangkit Listrik Tenaga Panas Bumi) yang menunjukkan rasio antara massa uap kering terhadap total massa campuran uap dan air.
            Nilai ini dinyatakan dalam rentang 0 hingga 1, di mana nilai mendekati 1 menandakan uap semakin kering.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1" paragraph>
            Rumus umum untuk menghitung fraksi kekeringan:
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'monospace', backgroundColor: '#f0f0f0', p: 2 }}>
            x = (h - h<sub>f</sub>) / h<sub>fg</sub>
          </Typography>
          <Typography variant="body2" paragraph>
            dengan:
            <br />x = dryness fraction
            <br />h = entalpi campuran (kJ/kg)
            <br />h<sub>f</sub> = entalpi air jenuh (kJ/kg)
            <br />h<sub>fg</sub> = entalpi penguapan (kJ/kg)
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1" paragraph>
            Dalam proyek ini, rentang ideal fraksi kekeringan berada antara <strong>0.90 – 0.95</strong>. Di bawah nilai tersebut, uap
            mengandung terlalu banyak air, yang dapat menyebabkan erosi dan penurunan efisiensi turbin.
            Sebaliknya, fraksi di atas 0.95 menunjukkan uap sangat kering dan relatif aman.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body1" paragraph>
            Sistem pemantauan menggunakan sensor dan AI untuk mendeteksi nilai fraksi kekeringan secara real-time,
            memetakan status operasi menjadi kategori seperti: <em>Ideal</em>, <em>Contaminated Dry</em>, hingga <em>Critical Damage</em>.
          </Typography>
        </Grid>
      </Grid>
    </MainCard>
  );
}
