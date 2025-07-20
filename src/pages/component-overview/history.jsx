import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function createRow() {
  const pressureSeparator = clamp(Math.random() * 111 + 1000, 1000, 1300);
  const pressureSteam = clamp(Math.random() * 20 + 910, 900, 1133);
  const boilerTemp = clamp(Math.random() * 10 + 180, 180, 190);
  const tankLevel = clamp(Math.random() * 20 + 46, 0, 100);

  const tdsOverall = clamp(Math.random() * 20 + 40, 30, 60);
  const co2 = clamp(Math.random() * 10 + 10, 5, 25);
  const argon = clamp(Math.random() * 5 + 2, 1, 8);
  const methane = clamp(Math.random() * 3 + 1, 1, 5);
  const ma3 = clamp(Math.random() * 2 + 1, 1, 3);
  const scalingDeposit = clamp(Math.random() * 1.5 + 0.5, 0.5, 2);

  const drynessFraction = clamp(Math.random() * 0.1 + 0.85, 0.85, 1);
  const anomalyScore = clamp(Math.random() * 0.1 + 0.05, 0, 1);
  const riskLevels = ['Low', 'Medium', 'Medium'];
  const riskIndex = drynessFraction < 0.9 || anomalyScore > 0.3 ? 2 : (anomalyScore > 0.15 ? 1 : 0);
  const riskPrediction = riskLevels[riskIndex];

  const dot = "...";

  return {
    pressureSeparator,
    pressureSteam,
    boilerTemp,
    tankLevel,
    tdsOverall,
    co2,
    argon,
    methane,
    ma3,
    scalingDeposit,
    drynessFraction,
    anomalyScore,
    riskPrediction,
    dot
  };
}

const rows = Array.from({ length: 200 }, () => createRow());

export default function HistoryTable() {
  const theme = useTheme();

  return (
    <MainCard title={<Typography variant="h5">Riwayat Data Sensor</Typography>}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Separator (kPa)</TableCell>
              <TableCell>Steam (kPa)</TableCell>
              <TableCell>Boiler Temp (°C)</TableCell>
              <TableCell>Tank Level (%)</TableCell>
              <TableCell>TDS (ppm)</TableCell>
              <TableCell>CO2 (ppm)</TableCell>
              <TableCell>Argon (ppm)</TableCell>
              <TableCell>Methane (ppm)</TableCell>
              <TableCell>MA3 (ppm)</TableCell>
              <TableCell>Scaling (ppm)</TableCell>
              <TableCell>Dryness</TableCell>
              <TableCell>Anomaly</TableCell>
              <TableCell>Risk</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.pressureSeparator.toFixed(2)}</TableCell>
                <TableCell>{row.pressureSteam.toFixed(2)}</TableCell>
                <TableCell>{row.boilerTemp.toFixed(1)}</TableCell>
                <TableCell>{row.tankLevel.toFixed(1)}</TableCell>
                <TableCell>{row.tdsOverall.toFixed(1)}</TableCell>
                <TableCell>{row.co2.toFixed(1)}</TableCell>
                <TableCell>{row.argon.toFixed(1)}</TableCell>
                <TableCell>{row.methane.toFixed(1)}</TableCell>
                <TableCell>{row.ma3.toFixed(1)}</TableCell>
                <TableCell>{row.scalingDeposit.toFixed(2)}</TableCell>
                <TableCell>{row.drynessFraction.toFixed(3)}</TableCell>
                <TableCell>{row.anomalyScore.toFixed(3)}</TableCell>
                <TableCell>{row.riskPrediction}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          
        </Table>
      </TableContainer>
    </MainCard>
  );
}

HistoryTable.propTypes = {
  theme: PropTypes.object
};
