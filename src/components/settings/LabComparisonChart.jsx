import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import MainCard from '../MainCard';
import { getLabComparison } from '../../utils/api';
import { formatStoredTimestamp } from '../../utils/labOverlay';

/**
 * Lab readings plotted against what the sensors (or the AI model) reported at
 * the same sampling time.
 *
 * Two questions are being asked at once and they need different answers:
 * the chart shows whether the two move together, the table shows how far apart
 * they actually are. A chart alone hides a constant offset; a table alone hides
 * a drift that only appears in one season.
 */

// flow_rate is absent because the lab CSV carries no flow column, and dryness
// because that reading is no longer recorded. Offering either would mean a
// picker button that always resolves to an empty chart.
const METRICS = [
  { key: 'pressure', label: 'Pressure', unit: 'barg', decimals: 2 },
  { key: 'temperature', label: 'Temperature', unit: '°C', decimals: 1 },
  { key: 'tds', label: 'TDS', unit: 'ppm', decimals: 2 },
  { key: 'ncg', label: 'NCG', unit: '%', decimals: 2 }
];

const LAB_COLOR = '#9271FF';
const REF_COLOR = '#3b82f6';

// Sampling runs roughly monthly, so twelve points is about the last year --
// enough to show a seasonal pattern while leaving the x-axis labels readable.
// Nothing is discarded: "Tampilkan semua" reveals the rest on demand. Lab
// readings are individual measurements, so hiding some is a display choice,
// never an aggregation.
const DEFAULT_VISIBLE = 100;

// Human name for the series the lab value is being checked against. The API
// reports it as `table.column`; spelling it out keeps the legend honest about
// the fact that NCG is compared to a prediction, not to a sensor.
const referenceLabel = (comparedAgainst) => {
  if (!comparedAgainst) return 'Pembanding';
  return comparedAgainst.startsWith('ai2.') ? 'Prediksi AI' : 'Sensor (rata-rata)';
};

export default function LabComparisonChart() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [metric, setMetric] = useState('pressure');
  const [samples, setSamples] = useState([]);
  const [comparedAgainst, setComparedAgainst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const active = METRICS.find((m) => m.key === metric) ?? METRICS[0];

  const load = useCallback(async (key) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLabComparison(key);
      setSamples(res?.data?.samples ?? []);
      setComparedAgainst(res?.data?.compared_against ?? null);
    } catch (err) {
      setError(err.message || 'Gagal memuat data perbandingan');
      setSamples([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(metric);
  }, [metric, load]);

  // The API returns samples oldest-first, so the newest window is the tail.
  const visible = useMemo(
    () => (showAll ? samples : samples.slice(-DEFAULT_VISIBLE)),
    [samples, showAll]
  );

  const view = useMemo(() => {
    const categories = visible.map((s) => formatStoredTimestamp(s.sampled_at, { short: true }));
    const lab = visible.map((s) => (s.lab_value === null ? null : Number(s.lab_value)));
    const reference = visible.map((s) => (s.comparison_avg === null ? null : Number(s.comparison_avg)));

    // Samples whose window caught no sensor rows at all. Counted rather than
    // hidden: an empty comparison line usually means the sensor history simply
    // does not reach back to that sampling date, and that is worth saying out
    // loud instead of leaving as a mysterious gap.
    const unmatched = visible.filter((s) => s.comparison_avg === null).length;

    const deltas = visible
      .filter((s) => s.difference !== null && s.difference !== undefined)
      .map((s) => Math.abs(Number(s.difference)));
    const meanAbsDelta = deltas.length
      ? deltas.reduce((sum, d) => sum + d, 0) / deltas.length
      : null;

    return { categories, lab, reference, unmatched, matched: visible.length - unmatched, meanAbsDelta };
  }, [visible]);

  // Create once, then update in place. Rebuilding the instance on every data
  // change makes the card visibly flash, which is what the analytics charts in
  // this project already had to be fixed for.
  useEffect(() => {
    if (!chartRef.current) return undefined;

    const options = {
      chart: {
        type: 'line',
        height: 360,
        fontFamily: 'inherit',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false }
      },
      // Per-series types rather than one line chart with a zero-width stroke.
      // The zero-width trick relied on `markers.size` and `stroke.width` being
      // read as per-series arrays, and when that collapsed the lab series drew
      // neither a line nor a marker and vanished entirely. An explicit
      // 'scatter' renders its points regardless of stroke settings, which is
      // also the honest shape for the data: lab readings are discrete
      // measurements, not samples of a continuous signal.
      series: [
        { name: 'Lab', type: 'scatter', data: [] },
        { name: 'Pembanding', type: 'line', data: [] }
      ],
      colors: [LAB_COLOR, REF_COLOR],
      stroke: { curve: 'straight', width: 2.5 },
      // Scalar, so there is no per-series array left to collapse.
      markers: { size: 5, strokeWidth: 0, hover: { size: 8 } },
      dataLabels: { enabled: false },
      legend: { show: true, position: 'top', horizontalAlign: 'right', markers: { radius: 4 } },
      grid: { borderColor: '#eef0f4', strokeDashArray: 4, padding: { left: 12, right: 16 } },
      xaxis: {
        categories: [],
        labels: { rotate: -40, rotateAlways: false, style: { fontSize: '11px', colors: '#8b93a7' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false }
      },
      yaxis: {
        forceNiceScale: true,
        labels: {
          style: { colors: '#8b93a7', fontSize: '11px' },
          // Without an explicit formatter the axis prints the raw float, so a
          // tick at 7.5 rendered as "7.500000000000000".
          formatter: (v) => (v === null || v === undefined ? '' : Number(v).toFixed(2))
        },
        title: { text: '', style: { fontSize: '12px', color: '#8b93a7' } }
      },
      tooltip: { shared: true, intersect: false },
      noData: { text: 'Belum ada data lab', style: { color: '#8b93a7' } }
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();
    chartInstanceRef.current = chart;

    return () => {
      chart.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    chart.updateOptions(
      {
        xaxis: { categories: view.categories },
        // The complete yaxis object, not just the title: updateOptions replaces
        // this branch wholesale, so sending only `title` dropped the label
        // styling and formatter set at creation.
        yaxis: {
          forceNiceScale: true,
          labels: {
            style: { colors: '#8b93a7', fontSize: '11px' },
            formatter: (v) => (v === null || v === undefined ? '' : Number(v).toFixed(active.decimals))
          },
          title: {
            text: `${active.label} (${active.unit})`,
            style: { fontSize: '12px', color: '#8b93a7' }
          }
        },
        tooltip: {
          y: {
            formatter: (v) => (v === null || v === undefined ? 'tidak ada data' : `${v.toFixed(active.decimals)} ${active.unit}`)
          }
        }
      },
      // redrawPaths=true so the axis follows the new categories instead of
      // staying frozen at the ones present when the chart was created.
      true,
      false
    );

    // `type` has to be repeated here -- updateSeries replaces the series
    // objects outright, and dropping it would send both series back to the
    // chart-level 'line' type.
    chart.updateSeries([
      { name: 'Lab', type: 'scatter', data: view.lab },
      { name: referenceLabel(comparedAgainst), type: 'line', data: view.reference }
    ]);
  }, [view, active, comparedAgainst]);

  // Newest first in the table, matching every other listing in this project.
  const rows = useMemo(() => [...visible].reverse(), [visible]);

  return (
    <MainCard>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { md: 'center' }, gap: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Perbandingan Lab vs Sensor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nilai lab dibandingkan dengan rata-rata pembacaan pada waktu sampling yang sama
            {comparedAgainst ? ` — sumber: ${comparedAgainst}` : ''}
          </Typography>
        </Box>

        <ButtonGroup variant="outlined" size="small">
          {METRICS.map((m) => (
            <Button
              key={m.key}
              onClick={() => setMetric(m.key)}
              sx={{
                textTransform: 'none',
                px: 2,
                borderColor: '#d2d2d7',
                color: metric === m.key ? '#fff' : '#86868b',
                backgroundColor: metric === m.key ? LAB_COLOR : 'transparent',
                '&:hover': {
                  borderColor: LAB_COLOR,
                  backgroundColor: metric === m.key ? LAB_COLOR : '#f5f3ff'
                }
              }}
            >
              {m.label}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && samples.length > 0 && (
        <Stack direction="row" sx={{ gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Every count below describes the window on screen, not the whole
              table -- a chip reading "43 sampel" beside a chart showing 12
              would make the averages beside it look wrong. */}
          <Chip
            size="small"
            label={
              showAll
                ? `${samples.length} sampel lab`
                : `Menampilkan ${visible.length} dari ${samples.length} sampel`
            }
          />
          <Chip
            size="small"
            color={view.matched > 0 ? 'success' : 'default'}
            variant="outlined"
            label={`${view.matched} punya pembanding`}
          />
          {view.unmatched > 0 && (
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={`${view.unmatched} tanpa data pembanding`}
            />
          )}
          {view.meanAbsDelta !== null && (
            <Chip
              size="small"
              variant="outlined"
              label={`Rata-rata selisih ${view.meanAbsDelta.toFixed(active.decimals)} ${active.unit}`}
            />
          )}

          {samples.length > DEFAULT_VISIBLE && (
            <Button size="small" variant="text" onClick={() => setShowAll((v) => !v)} sx={{ textTransform: 'none' }}>
              {showAll ? `Tampilkan ${DEFAULT_VISIBLE} terakhir` : `Tampilkan semua (${samples.length})`}
            </Button>
          )}
        </Stack>
      )}

      {view.unmatched > 0 && view.matched === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Tidak ada satu pun sampel yang punya data pembanding. Biasanya ini berarti riwayat{' '}
          {comparedAgainst?.startsWith('ai2.') ? 'prediksi AI' : 'sensor'} belum mencakup tanggal-tanggal
          sampling tersebut.
        </Alert>
      )}

      <Box sx={{ position: 'relative', minHeight: 360 }}>
        {loading && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        <div ref={chartRef} />
      </Box>

      {rows.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Selisih per Sampel
          </Typography>
          <TableContainer sx={{ maxHeight: 360, overflowX: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Tanggal Sampling</TableCell>
                  <TableCell align="right">Lab ({active.unit})</TableCell>
                  <TableCell align="right">{referenceLabel(comparedAgainst)}</TableCell>
                  <TableCell align="right">Selisih</TableCell>
                  <TableCell align="right">Titik Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const hasRef = row.comparison_avg !== null && row.comparison_avg !== undefined;
                  const diff = row.difference;
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{formatStoredTimestamp(row.sampled_at)}</TableCell>
                      <TableCell align="right">
                        {row.lab_value === null ? '-' : Number(row.lab_value).toFixed(active.decimals)}
                      </TableCell>
                      <TableCell align="right">
                        {hasRef ? Number(row.comparison_avg).toFixed(active.decimals) : '-'}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: diff === null || diff === undefined ? 'text.disabled' : diff > 0 ? 'error.main' : 'success.main' }}
                      >
                        {diff === null || diff === undefined
                          ? '-'
                          : `${diff > 0 ? '+' : ''}${Number(diff).toFixed(active.decimals)}`}
                      </TableCell>
                      {/* How many readings backed the average — a comparison
                          resting on 3 rows deserves less trust than one resting
                          on 8000, and that is invisible from the value alone. */}
                      <TableCell align="right" sx={{ color: row.comparison_points ? 'text.secondary' : 'warning.main' }}>
                        {row.comparison_points ?? 0}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </MainCard>
  );
}
