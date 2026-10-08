import { useEffect, useMemo, useRef, useState } from 'react';
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
import TablePagination from '@mui/material/TablePagination';
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
//
// `axis` groups the metrics onto shared y-axes in the combined view: only
// temperature (~165 °C) sits far from the others (all under 7.5), so two axes
// are enough. Four would clutter both edges of the plot for no extra clarity.
const METRICS = [
  { key: 'pressure', label: 'Pressure', unit: 'barg', decimals: 2, axis: 'low', color: '#9271FF' },
  { key: 'temperature', label: 'Temperature', unit: '°C', decimals: 1, axis: 'high', color: '#ef4444' },
  { key: 'tds', label: 'TDS', unit: 'ppm', decimals: 2, axis: 'low', color: '#22c55e' },
  { key: 'ncg', label: 'NCG', unit: '%', decimals: 2, axis: 'low', color: '#f59e0b' }
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
  if (comparedAgainst.startsWith('ai2.')) {
    // `table.column`, e.g. 'ai2.dryness_predict' / 'ai2.ncg_predict' -- name
    // the specific model (Dryness Prediction / NCG Prediction) instead of a
    // generic 'Prediksi AI' now that those are the dashboard's official names.
    if (comparedAgainst.includes('dryness')) return 'Dryness Prediction';
    if (comparedAgainst.includes('ncg')) return 'NCG Prediction';
    return 'Prediksi AI';
  }
  return 'Sensor (rata-rata)';
};

/**
 * Fetch the lab-vs-reference series for one metric.
 *
 * `enabled` keeps the single-metric view down to one request: all four hooks
 * are mounted (hook order has to stay fixed) but only the ones the current view
 * actually needs go to the network.
 */
const useLabComparison = (metricKey, enabled = true) => {
  const [samples, setSamples] = useState([]);
  const [comparedAgainst, setComparedAgainst] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;

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
  }, [metricKey, enabled]);

  return { samples, comparedAgainst, loading, error };
};

/** Window the newest N samples and derive everything the single view shows. */
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
 * Line up all four metrics on one shared time axis.
 *
 * They cannot simply be zipped together: the comparison endpoint drops rows
 * where its own metric is null, so a sample missing TDS is absent from the TDS
 * response while still present in the other three. Indexing by position would
 * then shift that series by one and silently plot every later reading against
 * the wrong date. Keying on sampled_at is what keeps them honest.
 */
const useCombinedView = (datasets, showAll) => {
  return useMemo(() => {
    const times = [...new Set(datasets.flatMap((d) => d.samples.map((s) => s.sampled_at)))].sort();
    const windowed = showAll ? times : times.slice(-DEFAULT_VISIBLE);
    const position = new Map(windowed.map((t, i) => [t, i]));

    const series = datasets.map((dataset) => {
      const values = new Array(windowed.length).fill(null);
      dataset.samples.forEach((sample) => {
        const at = position.get(sample.sampled_at);
        if (at !== undefined && sample.lab_value !== null) values[at] = Number(sample.lab_value);
      });
      return values;
    });

    return {
      categories: windowed.map((t) => formatStoredTimestamp(t, { short: true })),
      series,
      total: times.length,
      shown: windowed.length
    };
  }, [datasets, showAll]);
};

/** Shared chart chrome, so the two views cannot drift apart visually. */
const baseChartOptions = (height, showLegend) => ({
  chart: {
    type: 'line',
    height,
    fontFamily: 'inherit',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: false }
  },
  stroke: { curve: 'straight', width: 2.5 },
  // Markers stay on top of the line: lab sampling is roughly monthly, and the
  // markers are what show where an actual measurement exists rather than a
  // segment drawn between two of them.
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
  tooltip: { shared: true, intersect: false },
  noData: { text: 'Belum ada data lab', style: { color: '#8b93a7' } }
});

const axisLabelStyle = { colors: '#8b93a7', fontSize: '11px' };
const axisTitleStyle = { fontSize: '12px', color: '#8b93a7' };

/**
 * One metric: the lab reading against its reference series.
 *
 * Created once and updated in place — rebuilding on every data change makes the
 * card visibly flash, which is what the analytics charts in this project
 * already had to be fixed for.
 */
function ComparisonChart({ metricConfig, view, comparedAgainst }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;

    const chart = new ApexCharts(chartRef.current, {
      ...baseChartOptions(360, true),
      series: [
        { name: 'Lab', data: [] },
        { name: 'Pembanding', data: [] }
      ],
      colors: [LAB_COLOR, REF_COLOR],
      yaxis: {
        forceNiceScale: true,
        labels: {
          style: axisLabelStyle,
          // Without an explicit formatter the axis prints the raw float, so a
          // tick at 7.5 rendered as "7.500000000000000".
          formatter: (v) => (v === null || v === undefined ? '' : Number(v).toFixed(2))
        },
        title: { text: '', style: axisTitleStyle }
      }
    });

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
            style: axisLabelStyle,
            formatter: (v) => (v === null || v === undefined ? '' : Number(v).toFixed(metricConfig.decimals))
          },
          title: { text: `${metricConfig.label} (${metricConfig.unit})`, style: axisTitleStyle }
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

    chart.updateSeries([
      { name: 'Lab', data: view.lab },
      { name: referenceLabel(comparedAgainst), data: view.reference }
    ]);
  }, [view, metricConfig, comparedAgainst]);

  return <div ref={chartRef} />;
}

/**
 * All four lab metrics on one chart.
 *
 * Two y-axes rather than one: temperature runs around 165 °C while the other
 * three sit under 7.5, so a single shared scale would press all of them flat
 * along the bottom. Pressure, TDS and NCG share the left axis; temperature gets
 * the right one to itself.
 */
function CombinedLabChart({ combined }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Index of the series that owns each axis. Apex shares an axis between series
  // by repeating the owner's `seriesName` and hiding the duplicate entries.
  const lowOwner = METRICS.find((m) => m.axis === 'low');
  const highOwner = METRICS.find((m) => m.axis === 'high');

  useEffect(() => {
    if (!chartRef.current) return undefined;

    const yaxis = METRICS.map((m) => {
      const owner = m.axis === 'high' ? highOwner : lowOwner;
      const isOwner = owner.key === m.key;
      return {
        seriesName: owner.label,
        opposite: m.axis === 'high',
        show: isOwner,
        forceNiceScale: true,
        labels: {
          style: axisLabelStyle,
          formatter: (v) => (v === null || v === undefined ? '' : Number(v).toFixed(owner.decimals))
        },
        title: {
          text: isOwner ? (m.axis === 'high' ? `${m.label} (${m.unit})` : 'Pressure (barg) · TDS (ppm) · NCG (%)') : '',
          style: axisTitleStyle
        }
      };
    });

    const chart = new ApexCharts(chartRef.current, {
      ...baseChartOptions(400, true),
      series: METRICS.map((m) => ({ name: m.label, data: [] })),
      colors: METRICS.map((m) => m.color),
      yaxis,
      tooltip: {
        shared: true,
        intersect: false,
        // Per-series units: a shared tooltip would otherwise label every value
        // with the same unit and quietly misreport three of the four.
        y: METRICS.map((m) => ({
          formatter: (v) => (v === null || v === undefined ? 'tidak ada data' : `${v.toFixed(m.decimals)} ${m.unit}`)
        }))
      }
    });

    chart.render();
    chartInstanceRef.current = chart;

    return () => {
      chart.destroy();
      chartInstanceRef.current = null;
    };
  }, [lowOwner, highOwner]);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    chart.updateOptions({ xaxis: { categories: combined.categories } }, true, false);
    chart.updateSeries(METRICS.map((m, i) => ({ name: m.label, data: combined.series[i] ?? [] })));
  }, [combined]);

  return <div ref={chartRef} />;
}

export default function LabComparisonChart() {
  const [metric, setMetric] = useState('pressure');
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isAll = metric === ALL;
  const active = METRICS.find((m) => m.key === metric) ?? METRICS[0];

  // Four fixed hook calls rather than a loop: hook order has to be identical on
  // every render, and `enabled` keeps the single-metric view to one request.
  const pressure = useLabComparison('pressure', isAll || metric === 'pressure');
  const temperature = useLabComparison('temperature', isAll || metric === 'temperature');
  const tds = useLabComparison('tds', isAll || metric === 'tds');
  const ncg = useLabComparison('ncg', isAll || metric === 'ncg');

  const byKey = { pressure, temperature, tds, ncg };
  const activeData = byKey[isAll ? 'pressure' : metric] ?? pressure;

  const datasets = useMemo(
    () => METRICS.map((m) => ({ key: m.key, samples: byKey[m.key].samples })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pressure.samples, temperature.samples, tds.samples, ncg.samples]
  );

  const { visible, view } = useComparisonView(activeData.samples, showAll);
  const combined = useCombinedView(datasets, showAll);

  const combinedLoading = isAll && [pressure, temperature, tds, ncg].some((d) => d.loading);
  const combinedError = isAll && [pressure, temperature, tds, ncg].find((d) => d.error)?.error;

  // Newest first in the table, matching every other listing in this project.
  const rows = useMemo(() => [...visible].reverse(), [visible]);

  // Back to the first page whenever the table's contents are swapped out.
  useEffect(() => {
    setPage(0);
  }, [metric, showAll]);

  // Clamped at render time too, so a shrinking dataset (e.g. a refetch) can
  // never leave the table on a page past the end.
  const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const safePage = Math.min(page, lastPage);
  const pagedRows = rows.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);

  const totalSamples = isAll ? combined.total : activeData.samples.length;
  const loading = isAll ? combinedLoading : activeData.loading;
  const error = isAll ? combinedError : activeData.error;

  // Lowercase, mid-sentence form for the "belum mencakup" note below --
  // referenceLabel's "Dryness Prediction"/"Sensor (rata-rata)" reads oddly
  // capitalized inside a sentence, so this stays a separate, shorter phrasing
  // rather than reusing that function's output directly.
  const comparedNoun = !activeData.comparedAgainst?.startsWith('ai2.')
    ? 'sensor'
    : activeData.comparedAgainst.includes('dryness')
      ? 'Dryness Prediction'
      : activeData.comparedAgainst.includes('ncg')
        ? 'NCG Prediction'
        : 'prediksi AI';

  return (
    <MainCard>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { md: 'center' }, gap: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Perbandingan Lab vs Sensor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAll
              ? 'Seluruh metrik lab pada satu sumbu waktu — temperature memakai sumbu kanan'
              : `Nilai lab dibandingkan dengan rata-rata pembacaan pada waktu sampling yang sama${
                  activeData.comparedAgainst ? ` — sumber: ${activeData.comparedAgainst}` : ''
                }`}
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" sx={{ gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {!loading && !error && totalSamples > 0 && (
          <>
            {isAll ? (
              <Chip size="small" label={`${combined.shown} tanggal sampling`} />
            ) : (
              <>
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
              </>
            )}
          </>
        )}

        {totalSamples > DEFAULT_VISIBLE && (
          <Button size="small" variant="text" onClick={() => setShowAll((v) => !v)} sx={{ textTransform: 'none' }}>
            {showAll ? `Tampilkan ${DEFAULT_VISIBLE} terakhir` : `Tampilkan semua (${totalSamples})`}
          </Button>
        )}
      </Stack>

      {!isAll && view.unmatched > 0 && view.matched === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Tidak ada satu pun sampel yang punya data pembanding. Biasanya ini berarti riwayat{' '}
          {comparedNoun} belum mencakup
          tanggal-tanggal sampling tersebut.
        </Alert>
      )}

      <Box sx={{ position: 'relative', minHeight: isAll ? 400 : 360 }}>
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
        {isAll ? (
          <CombinedLabChart combined={combined} />
        ) : (
          <ComparisonChart metricConfig={active} view={view} comparedAgainst={activeData.comparedAgainst} />
        )}
      </Box>

      {!isAll && rows.length > 0 && (
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
                  <TableCell align="right">{referenceLabel(activeData.comparedAgainst)}</TableCell>
                  <TableCell align="right">Selisih</TableCell>
                  <TableCell align="right">Titik Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedRows.map((row) => {
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
          <TablePagination
            component="div"
            count={rows.length}
            page={safePage}
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Rows per-page:"
          />
        </Box>
      )}
    </MainCard>
  );
}
