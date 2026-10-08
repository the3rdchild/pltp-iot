import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  Button,
  Popover,
  IconButton,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import {
  generateDrynessTableData,
  generateNCGTableData,
  generateTDSTableData,
  generatePressureTableData,
  generateTemperatureTableData,
  generateFlowRateTableData
} from '../../data/chartData';
import { useStatsTableData } from '../../hooks/useStatsTableData';

const API_DATE_FORMAT = 'YYYY-MM-DD';
const LABEL_DATE_FORMAT = 'DD MMM YYYY';

// Row dates arrive as 'YYYY-MM-DD' from the API but as 'MM/DD/YYYY' from the
// test generators, so parse both; an unparseable date is never filtered out.
const parseRowDate = (value) => {
  if (!value) return null;
  const d = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? dayjs(value) : dayjs(new Date(value));
  return d.isValid() ? d : null;
};

const StatisticsTable = ({
  title = 'Tabel Data Statistik',
  subtitle = 'Tabel data statistik yang telah diperoleh',
  columns = [
    { id: 'no', label: 'No' },
    { id: 'date', label: 'Date' },
    { id: 'minValue', label: 'Minimum Value' },
    { id: 'maxValue', label: 'Max Value' },
    { id: 'average', label: 'Average' },
    { id: 'stdDeviation', label: 'Standard Deviation' }
  ],
  data = [],
  metric,
  dataGenerator,
  onDateRangeChange
}) => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Applied date filter ({ start, end } as dayjs) and the picker's draft values
  const [dateRange, setDateRange] = useState(null);
  const [datePickerAnchor, setDatePickerAnchor] = useState(null);
  const [draftStart, setDraftStart] = useState(dayjs().subtract(7, 'day'));
  const [draftEnd, setDraftEnd] = useState(dayjs());

  const apiStartDate = dateRange?.start.format(API_DATE_FORMAT);
  const apiEndDate = dateRange?.end.format(API_DATE_FORMAT);
  const apiRange = useMemo(
    () => (apiStartDate ? { start_date: apiStartDate, end_date: apiEndDate } : null),
    [apiStartDate, apiEndDate]
  );

  // Fetch aggregated stats from API for production mode. The date range goes
  // to the server so days older than the default 60-row window are reachable.
  const { data: apiData, loading: apiLoading } = useStatsTableData(metric, apiRange);

  // Select appropriate data generator based on metric
  const getDataGenerator = () => {
    if (dataGenerator) return dataGenerator;

    // Map metric to appropriate generator (separate per parameter)
    const generators = {
      'pressure': generatePressureTableData,
      'temperature': generateTemperatureTableData,
      'flow_rate': generateFlowRateTableData,
      'tds': generateTDSTableData,
      'dryness': generateDrynessTableData,
      'ncg': generateNCGTableData
    };

    return generators[metric] || generateDrynessTableData;
  };

  // Use memoized data generator to avoid regenerating on every render
  const generatedData = useMemo(() => {
    const generator = getDataGenerator();
    return generator();
  }, [metric, dataGenerator]);

  // For test environment: use generated data
  // For production: use data from API
  const sourceData = isTestEnvironment
    ? generatedData
    : (data.length > 0 ? data : apiData);

  // Also filtered client-side: generated test rows and a page-supplied `data`
  // source don't necessarily honour the server-side filter.
  const tableData = useMemo(() => {
    if (!dateRange) return sourceData;
    return sourceData.filter((row) => {
      const d = parseRowDate(row.date);
      if (!d) return true;
      return !d.isBefore(dateRange.start, 'day') && !d.isAfter(dateRange.end, 'day');
    });
  }, [sourceData, dateRange]);

  // Clamp so a narrower filter never leaves the table on a page past the end
  const lastPage = Math.max(0, Math.ceil(tableData.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = tableData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  // Helper function to format cell values with max 3 decimals
  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '';

    // If it's a number, format to max 3 decimals
    if (typeof value === 'number') {
      return parseFloat(value.toFixed(3));
    }

    // If it's a string that contains numbers with units (e.g., "1.628312584916454wt%")
    if (typeof value === 'string') {
      // Extract number and unit using regex
      const match = value.match(/^([-+]?[0-9]*\.?[0-9]+)(.*)$/);
      if (match) {
        const number = parseFloat(match[1]);
        const unit = match[2].trim();

        // Format number to max 3 decimals and append unit
        if (!isNaN(number)) {
          return `${parseFloat(number.toFixed(3))}${unit}`;
        }
      }
    }

    // Return as-is if not a number
    return value;
  };

  // Dates and row numbers are shown verbatim; the number formatter above would
  // otherwise read "2026-09-14" as the number 2026 followed by a "unit".
  const formatCell = (row, columnId) =>
    columnId === 'date' || columnId === 'no' ? (row[columnId] ?? '') : formatCellValue(row[columnId]);

  const applyDateRange = (range) => {
    setDateRange(range);
    setPage(0);
    onDateRangeChange?.(
      range ? { start_date: range.start.format(API_DATE_FORMAT), end_date: range.end.format(API_DATE_FORMAT) } : null
    );
  };

  const handleDatePickerOpen = (event) => {
    if (dateRange) {
      setDraftStart(dateRange.start);
      setDraftEnd(dateRange.end);
    }
    setDatePickerAnchor(event.currentTarget);
  };

  const handleApplyDateRange = () => {
    applyDateRange({ start: draftStart.startOf('day'), end: draftEnd.startOf('day') });
    setDatePickerAnchor(null);
  };

  const handleResetDateRange = () => {
    applyDateRange(null);
    setDatePickerAnchor(null);
  };

  const isDraftRangeValid = Boolean(
    draftStart?.isValid?.() && draftEnd?.isValid?.() && !draftStart.isAfter(draftEnd, 'day')
  );

  // Exports every row matching the current filter (not just the visible page),
  // with the same values the table shows.
  const handleDownloadCSV = () => {
    if (tableData.length === 0) return;

    const escapeCsv = (value) => {
      const text = String(value ?? '');
      return /[",;\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const lines = [
      columns.map((column) => escapeCsv(column.label)).join(','),
      ...tableData.map((row) => columns.map((column) => escapeCsv(formatCell(row, column.id))).join(','))
    ];

    const rangeSuffix = dateRange ? `${apiStartDate}_${apiEndDate}` : 'semua';
    const fileName = `statistik_${metric || 'data'}_${rangeSuffix}.csv`;

    // BOM so Excel opens the file as UTF-8 (units such as °C)
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const isLoading = !isTestEnvironment && apiLoading && sourceData.length === 0;
  const firstEntry = tableData.length === 0 ? 0 : currentPage * rowsPerPage + 1;
  const lastEntry = Math.min((currentPage + 1) * rowsPerPage, tableData.length);

  return (
    <MainCard>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3
        }}
      >
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="textSecondary">{subtitle}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleDatePickerOpen}
              endIcon={<CalendarTodayIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 400,
                borderColor: dateRange ? '#3b82f6' : '#d2d2d7',
                color: dateRange ? '#2563eb' : 'text.secondary',
                backgroundColor: dateRange ? '#eff6ff' : 'transparent',
                '&:hover': {
                  borderColor: dateRange ? '#2563eb' : '#86868b',
                  backgroundColor: dateRange ? '#dbeafe' : '#f9f9f9'
                }
              }}
            >
              {dateRange
                ? `${dateRange.start.format(LABEL_DATE_FORMAT)} – ${dateRange.end.format(LABEL_DATE_FORMAT)}`
                : 'Pick a date'}
            </Button>
            {dateRange && (
              <Tooltip title="Hapus filter tanggal">
                <IconButton size="small" onClick={handleResetDateRange} sx={{ ml: 0.5 }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Button
            variant="contained"
            disableElevation
            onClick={handleDownloadCSV}
            disabled={tableData.length === 0}
            endIcon={<CloudDownloadIcon />}
            sx={{
              px: 2.5,
              py: 0.75,
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 500,
              backgroundColor: '#3b82f6',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            Download CSV
          </Button>
        </Box>

        <Popover
          open={Boolean(datePickerAnchor)}
          anchorEl={datePickerAnchor}
          onClose={() => setDatePickerAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 260 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Filter Tanggal</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={draftStart}
                onChange={(value) => setDraftStart(value)}
                disableFuture
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={draftEnd}
                onChange={(value) => setDraftEnd(value)}
                disableFuture
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={handleResetDateRange} disabled={!dateRange} sx={{ textTransform: 'none' }}>
                Reset
              </Button>
              <Button
                variant="contained"
                size="small"
                disableElevation
                onClick={handleApplyDateRange}
                disabled={!isDraftRangeValid}
                sx={{ textTransform: 'none' }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {isLoading
                    ? 'Memuat data...'
                    : dateRange
                      ? 'Tidak ada data pada rentang tanggal yang dipilih'
                      : 'Belum ada data'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>{formatCell(row, column.id)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Showing {firstEntry} to {lastEntry} of {tableData.length} entries
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="textSecondary">Rows per-page:</Typography>
            <Select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              size="small"
              sx={{
                fontSize: '0.875rem',
                '.MuiSelect-select': {
                  padding: '4px 8px'
                }
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Box>
          <TablePagination
            component="div"
            count={tableData.length}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[]}
            labelDisplayedRows={() => ''}
            sx={{
              '.MuiTablePagination-toolbar': {
                minHeight: '40px',
                paddingLeft: 0
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                display: 'none'
              }
            }}
          />
        </Box>
      </Box>
    </MainCard>
  );
};

StatisticsTable.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  data: PropTypes.arrayOf(PropTypes.object),
  metric: PropTypes.string,
  dataGenerator: PropTypes.func,
  // Called with { start_date, end_date } (YYYY-MM-DD) or null, so a page that
  // supplies `data` can refetch that source for the chosen dates
  onDateRangeChange: PropTypes.func
};

export default StatisticsTable;
