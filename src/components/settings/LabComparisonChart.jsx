import { useEffect, useMemo, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
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

const ALL = 'all';

const LAB_COLOR = '#9271FF';
const REF_COLOR = '#3b82f6';

// Ceiling on how many samples a chart draws at once, counted from the newest.
// Nothing is discarded: once the table holds more than this, a "Tampilkan
// semua" toggle appears. Lab readings are individual measurements, so trimming
// the view is a display choice and never an aggregation — no point shown is
// ever an average of several samples.
const DEFAULT_VISIBLE = 100;

// Human name for the series the lab value is being checked against. The API
// reports it as `table.column`; spelling it out keeps the legend honest about
// the fact that NCG is compared to a prediction, not to a sensor.
const referenceLabel = (comparedAgainst) => {
  if (!comparedAgainst) return 'Pembanding';
  return comparedAgainst.startsWith('ai2.') ? 'Prediksi AI' : 'Sensor (rata-rata)';
};

/** Fetch the lab-vs-reference series for one metric. */
const useLabComparison = (metricKey) => {
  const [samples, setSamples] = useState([]);
  const [comparedAgainst, setComparedAgainst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getLabComparison(metricKey)
      .then((res) => {
        if (cancelled) return;
        setSamples(res?.data?.samples ?? []);
        setComparedAgainst(res?.data?.compared_against ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Gagal memuat data perbandingan');
        setSamples([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Switching metrics quickly would otherwise let a slow earlier response
    // land after a newer one and show the wrong series.
    return () => {
      cancelled = true;
    };
  }, [metricKey]);

  return { samples, comparedAgainst, loading, error };
};

/** Window the newest N samples and derive everything the UI shows from them. */
const useComparisonView = (samples, showAll) => {
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
    const meanAbsDelta = deltas.length ? deltas.reduce((sum, d) => sum + d, 0) / deltas.length : null;

    return { categories, lab, reference, unmatched, matched: visible.length - unmatched, meanAbsDelta };
  }, [visible]);

  return { visible, view };
};

/**
 * The ApexCharts instance. Created once and updated in place — rebuilding on
 * every data change makes the card visibly flash, which is what the analytics
 * charts in this project already had to be fixed for.
 */
function ComparisonChart({ metricConfig, view, comparedAgainst, height, showLegend }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;

    const chart = new ApexCharts(chartRef.current, {
      chart: {
        type: 'line',
        height,
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
      legend: { show: showLegend, position: 'top', horizontalAlign: 'right', markers: { radius: 4 } },
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
    });

    chart.render();
    chartInstanceRef.current = chart;

    return () => {
      chart.destroy();
      chartInstanceRef.current = null;
    };
    // Height and legend are structural rather than data: they only change when
    // switching between the single-metric and grid layouts, which is exactly
    // when a fresh instance is wanted anyway.
  }, [height, showLegend]);

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
            formatter: (v) => (v === null || v === undefined ? '' : Number(v).toFixed(metricConfig.decimals))
          },
          title: {
            text: `${metricConfig.label} (${metricConfig.unit})`,
            style: { fontSize: '12px', color: '#8b93a7' }
          }
        },
        tooltip: {
          y: {
            formatter: (v) =>
              v === null || v === undefined
                ? 'tidak ada data'
                : `${v.toFixed(metricConfig.decimals)} ${metricConfig.unit}`
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
  }, [view, metricConfig, comparedAgainst]);

  return <div ref={chartRef} />;
}

/**
 * One metric inside the "All" grid: its own fetch, its own chart, its own
 * caption. Each panel loads independently, so a slow or failing metric cannot
 * blank out the other three.
 */
function MetricPanel({ metricConfig, showAll }) {
  const { samples, comparedAgainst, loading, error } = useLabComparison(metricConfig.key);
  const { view } = useComparisonView(samples, showAll);

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {metricConfig.label} <Typography component="span" variant="caption" color="text.secondary">({metricConfig.unit})</Typography>
        </Typography>
        <Typography variant="caption" color={view.matched > 0 ? 'text.secondary' : 'warning.main'}>
          {loading ? 'memuat…' : `${view.matched}/${view.matched + view.unmatched} punya pembanding`}
        </Typography>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ position: 'relative', minHeight: 220 }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
            >
              <CircularProgress size={22} />
            </Box>
          )}
          <ComparisonChart
            metricConfig={metricConfig}
            view={view}
            comparedAgainst={comparedAgainst}
            height={220}
            showLegend={false}
          />
        </Box>
      )}
    </Box>
  );
}

export default function LabComparisonChart() {
  const [metric, setMetric] = useState('pressure');
  const [showAll, setShowAll] = useState(false);

  const isAll = metric === ALL;
  const active = METRICS.find((m) => m.key === metric) ?? METRICS[0];

  // In grid mode each panel fetches for itself; this one still runs so the
  // shared sample-count control has a total to work from. Hooks cannot be
  // called conditionally, so it stays mounted either way.
  const { samples, comparedAgainst, loading, error } = useLabComparison(isAll ? METRICS[0].key : metric);
  const { visible, view } = useComparisonView(samples, showAll);

  // Newest first in the table, matching every other listing in this project.
  const rows = useMemo(() => [...visible].reverse(), [visible]);

  const totalSamples = samples.length;

  return (
    <MainCard>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { md: 'center' }, gap: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Perbandingan Lab vs Sensor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nilai lab dibandingkan dengan rata-rata pembacaan pada waktu sampling yang sama
            {!isAll && comparedAgainst ? ` — sumber: ${comparedAgainst}` : ''}
          </Typography>
        </Box>

        <ButtonGroup variant="outlined" size="small">
          {[...METRICS, { key: ALL, label: 'All' }].map((m) => (
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

      {/* The window applies to every panel in grid mode too, so this control
          sits above the layout switch rather than inside either branch. */}
      {totalSamples > DEFAULT_VISIBLE && (
        <Stack direction="row" sx={{ gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            size="small"
            label={showAll ? `${totalSamples} sampel lab` : `Menampilkan ${DEFAULT_VISIBLE} dari ${totalSamples} sampel`}
          />
          <Button size="small" variant="text" onClick={() => setShowAll((v) => !v)} sx={{ textTransform: 'none' }}>
            {showAll ? `Tampilkan ${DEFAULT_VISIBLE} terakhir` : `Tampilkan semua (${totalSamples})`}
          </Button>
        </Stack>
      )}

      {isAll ? (
        <Grid container spacing={2}>
          {METRICS.map((m) => (
            <Grid key={m.key} size={{ xs: 12, md: 6 }}>
              {/* Four separate charts rather than four series on one: temperature
                  sits around 165 °C while NCG sits around 0.25 %, so a shared
                  axis would flatten three of the four into a line along the
                  bottom and show nothing useful about any of them. */}
              <MetricPanel metricConfig={m} showAll={showAll} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && totalSamples > 0 && (
            <Stack direction="row" sx={{ gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Counts describe the window on screen, not the whole table — a
                  chip reading "43 sampel" beside a chart showing fewer would
                  make the average next to it look wrong. */}
              <Chip
                size="small"
                color={view.matched > 0 ? 'success' : 'default'}
                variant="outlined"
                label={`${view.matched} punya pembanding`}
              />
              {view.unmatched > 0 && (
                <Chip size="small" color="warning" variant="outlined" label={`${view.unmatched} tanpa data pembanding`} />
              )}
              {view.meanAbsDelta !== null && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Rata-rata selisih ${view.meanAbsDelta.toFixed(active.decimals)} ${active.unit}`}
                />
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
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                <CircularProgress size={28} />
              </Box>
            )}
            <ComparisonChart
              metricConfig={active}
              view={view}
              comparedAgainst={comparedAgainst}
              height={360}
              showLegend
            />
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
                            sx={{
                              color:
                                diff === null || diff === undefined
                                  ? 'text.disabled'
                                  : diff > 0
                                    ? 'error.main'
                                    : 'success.main'
                            }}
                          >
                            {diff === null || diff === undefined
                              ? '-'
                              : `${diff > 0 ? '+' : ''}${Number(diff).toFixed(active.decimals)}`}
                          </TableCell>
                          {/* How many readings backed the average — a comparison
                              resting on 3 rows deserves less trust than one
                              resting on 8000, and that is invisible from the
                              value alone. */}
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
        </>
      )}
    </MainCard>
  );
}
