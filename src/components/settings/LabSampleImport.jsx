// components/settings/LabSampleImport.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { parseLabCsv } from '../../utils/labCsv';
import { importLabSamples, getLabSamples, deleteLabSample } from '../../utils/api';

const PREVIEW_LIMIT = 10;
const ERROR_PREVIEW_LIMIT = 10;

const METRIC_COLUMNS = [
  { key: 'pressure', label: 'Pressure' },
  { key: 'temperature', label: 'Temperature' },
  { key: 'flow_rate', label: 'Flow' },
  { key: 'tds', label: 'TDS' },
  { key: 'dryness', label: 'Dryness' },
  { key: 'ncg', label: 'NCG' }
];

const formatNumber = (v) => (v === null || v === undefined ? '-' : v);

const formatSampledAt = (value) => {
  if (!value) return '-';
  // Date-only values (YYYY-MM-DD) are shown as-is; full timestamps are
  // rendered in the local timezone.
  if (!String(value).includes('T')) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString('id-ID');
};

export default function LabSampleImport() {
  const fileInputRef = useRef(null);

  // CSV import state
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState(null); // { rows, errors, mapped, ignored }
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { severity, message, errors }

  // Stored samples table state
  const [samples, setSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [samplesError, setSamplesError] = useState(null);

  const refreshSamples = useCallback(async () => {
    setLoadingSamples(true);
    setSamplesError(null);
    try {
      const res = await getLabSamples({ limit: 20 });
      setSamples(res?.data || []);
    } catch (error) {
      setSamplesError(error?.message || 'Gagal memuat data lab');
    } finally {
      setLoadingSamples(false);
    }
  }, []);

  useEffect(() => {
    refreshSamples();
  }, [refreshSamples]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    // allow re-picking the same file
    e.target.value = '';
    if (!file) return;

    setImportResult(null);
    try {
      const text = await file.text();
      setFileName(file.name);
      setParsed(parseLabCsv(text));
    } catch (error) {
      setParsed(null);
      setImportResult({ severity: 'error', message: 'Gagal membaca file', errors: [] });
    }
  };

  const handleImport = async () => {
    if (!parsed || parsed.rows.length === 0) return;

    setImporting(true);
    setImportResult(null);
    try {
      // Strip parser-internal fields before sending
      const rows = parsed.rows.map(({ _dateOnly, _line, ...row }) => row);
      const res = await importLabSamples(rows, fileName);
      const summary = res?.data;
      const message = summary
        ? `${summary.inserted ?? 0} baru, ${summary.updated ?? 0} diperbarui, ${summary.skipped ?? 0} dilewati`
        : (res?.message || 'Import selesai');
      setImportResult({
        severity: summary?.errors?.length ? 'warning' : 'success',
        message,
        errors: summary?.errors || []
      });
      // Reset selection and refresh stored table
      setParsed(null);
      setFileName('');
      refreshSamples();
    } catch (error) {
      setImportResult({
        severity: 'error',
        message: error?.message || 'Gagal mengimport data',
        errors: []
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data lab ini?')) return;
    try {
      await deleteLabSample(id);
      refreshSamples();
    } catch (error) {
      setSamplesError(error?.message || 'Gagal menghapus data');
    }
  };

  const mappedEntries = parsed ? Object.entries(parsed.mapped) : [];

  return (
    <Card sx={{ borderRadius: 2 }} elevation={1}>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h6">Import CSV Data Lab</Typography>
          <Typography variant="body2" color="text.secondary">
            Import data sampling lab dari file CSV (kolom: date, pressure, temperature, dryness, ncg, tds)
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
          >
            Pilih File CSV
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {fileName && (
            <Typography variant="body2" color="text.secondary">{fileName}</Typography>
          )}
        </Stack>

        {parsed && (
          <Box mt={3}>
            <Typography variant="body2" gutterBottom>
              {parsed.rows.length} baris valid, {parsed.errors.length} error
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              {mappedEntries.map(([field, header]) => (
                <Chip key={field} size="small" color="primary" variant="outlined" label={`${field} ← ${header}`} />
              ))}
              {parsed.ignored.map((header) => (
                <Chip key={header} size="small" variant="outlined" label={`diabaikan: ${header}`} />
              ))}
            </Stack>

            {parsed.rows.length > 0 && (
              <TableContainer sx={{ maxHeight: 300, mb: 2 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tanggal</TableCell>
                      {METRIC_COLUMNS.map((col) => (
                        <TableCell key={col.key} align="right">{col.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsed.rows.slice(0, PREVIEW_LIMIT).map((row) => (
                      <TableRow key={row._line}>
                        <TableCell>{formatSampledAt(row.sampled_at)}</TableCell>
                        {METRIC_COLUMNS.map((col) => (
                          <TableCell key={col.key} align="right">{formatNumber(row[col.key])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {parsed.rows.length > PREVIEW_LIMIT && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Menampilkan {PREVIEW_LIMIT} dari {parsed.rows.length} baris valid
              </Typography>
            )}

            {parsed.errors.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  {parsed.errors.length} baris bermasalah:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, maxHeight: 150, overflow: 'auto' }}>
                  {parsed.errors.slice(0, ERROR_PREVIEW_LIMIT).map((err, idx) => (
                    <li key={idx}>
                      <Typography variant="caption">
                        Baris {err.line}: {err.message}
                      </Typography>
                    </li>
                  ))}
                </Box>
                {parsed.errors.length > ERROR_PREVIEW_LIMIT && (
                  <Typography variant="caption">
                    ... dan {parsed.errors.length - ERROR_PREVIEW_LIMIT} lainnya
                  </Typography>
                )}
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleImport}
              disabled={parsed.rows.length === 0 || importing}
            >
              {importing ? 'Mengimport...' : 'Import'}
            </Button>
          </Box>
        )}

        {importResult && (
          <Alert severity={importResult.severity} sx={{ mt: 2 }} onClose={() => setImportResult(null)}>
            <Typography variant="body2">{importResult.message}</Typography>
            {importResult.errors?.length > 0 && (
              <Box component="ul" sx={{ m: 0, pl: 2, maxHeight: 150, overflow: 'auto' }}>
                {importResult.errors.map((err, idx) => (
                  <li key={idx}>
                    <Typography variant="caption">
                      Baris {err.row}: {err.message}
                    </Typography>
                  </li>
                ))}
              </Box>
            )}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Data Lab Tersimpan</Typography>
          <Tooltip title="Muat ulang">
            <span>
              <IconButton size="small" onClick={refreshSamples} disabled={loadingSamples}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {samplesError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSamplesError(null)}>
            {samplesError}
          </Alert>
        )}

        {loadingSamples ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : samples.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Belum ada data lab</Typography>
        ) : (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Tanggal Sampling</TableCell>
                  {METRIC_COLUMNS.map((col) => (
                    <TableCell key={col.key} align="right">{col.label}</TableCell>
                  ))}
                  <TableCell>Sumber</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {samples.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{formatSampledAt(row.sampled_at)}</TableCell>
                    {METRIC_COLUMNS.map((col) => (
                      <TableCell key={col.key} align="right">{formatNumber(row[col.key])}</TableCell>
                    ))}
                    <TableCell>{row.source || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
