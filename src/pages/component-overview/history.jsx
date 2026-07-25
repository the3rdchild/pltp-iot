import * as React from 'react';
import { useState, useEffect } from 'react';
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
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

const SEVERITY_COLOR = {
  normal: 'success',
  warning: 'warning',
  critical: 'error'
};

function fmt(value, digits = 2) {
  if (value === null || value === undefined) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(n) ? '—' : n.toFixed(digits);
}

function fmtTimestamp(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });
}

export default function HistoryTable() {
  const theme = useTheme();
  const [sensorRows, setSensorRows] = useState([]);
  const [ai1aByTimestamp, setAi1aByTimestamp] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/data/sensor/latest?limit=60').then((r) => r.json()),
      fetch('/api/external/ai1a?limit=60').then((r) => r.json())
    ])
      .then(([sensorJson, ai1aJson]) => {
        if (sensorJson.success) setSensorRows(sensorJson.data);

        if (ai1aJson.success) {
          const map = new Map();
          ai1aJson.data.forEach((row) => {
            map.set(new Date(row.timestamp).getTime(), row);
          });
          setAi1aByTimestamp(map);
        }
      })
      .catch((err) => {
        console.error('history data fetch error:', err);
        setError('Gagal memuat riwayat data');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainCard title={<Typography variant="h5">Riwayat Data Sensor</Typography>}>
      {!loading && ai1aByTimestamp.size === 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Data AI1a (severity/risk) belum tersedia — kolom terkait ditampilkan sebagai &ldquo;—&rdquo;.
          </Typography>
        </Box>
      )}

      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Memuat riwayat data sensor...
        </Typography>
      ) : error ? (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Waktu</TableCell>
                <TableCell>Pressure (bar)</TableCell>
                <TableCell>Temperature (°C)</TableCell>
                <TableCell>Flow Rate</TableCell>
                <TableCell>TDS (ppm)</TableCell>
                <TableCell>Gen Output (MW)</TableCell>
                <TableCell>Current (A)</TableCell>
                <TableCell>Severity (AI1a)</TableCell>
                <TableCell>Risk % (AI1a)</TableCell>
                <TableCell>Anomaly Score (AI1a)</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sensorRows.map((row) => {
                const ai1a = ai1aByTimestamp.get(new Date(row.timestamp).getTime());
                const severity = ai1a?.severity?.toLowerCase();

                return (
                  <TableRow key={row.id}>
                    <TableCell>{fmtTimestamp(row.timestamp)}</TableCell>
                    <TableCell>{fmt(row.pressure)}</TableCell>
                    <TableCell>{fmt(row.temperature, 1)}</TableCell>
                    <TableCell>{fmt(row.flow_rate)}</TableCell>
                    <TableCell>{fmt(row.tds)}</TableCell>
                    <TableCell>{fmt(row.gen_output)}</TableCell>
                    <TableCell>{fmt(row.current)}</TableCell>
                    <TableCell>
                      {severity ? (
                        <Chip
                          size="small"
                          label={severity.charAt(0).toUpperCase() + severity.slice(1)}
                          color={SEVERITY_COLOR[severity] || 'default'}
                        />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{ai1a ? fmt(ai1a.risk_percentage, 1) : '—'}</TableCell>
                    <TableCell>{ai1a ? fmt(ai1a.anomaly_score, 3) : '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}
