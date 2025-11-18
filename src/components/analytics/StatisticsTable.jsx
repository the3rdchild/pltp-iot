import React, { useState } from 'react';
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
  MenuItem
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import MainCard from '../MainCard';
import PropTypes from 'prop-types';

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
  onDownloadCSV,
  onPickDate,
  onAddNew
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Generate random data if no data provided
  const generateRandomData = () => {
    const generatedData = [];
    for (let i = 1; i <= 58; i++) {
      const minValue = (98 + Math.random() * 2).toFixed(15);
      const maxValue = (99 + Math.random() * 1).toFixed(15);
      const average = ((parseFloat(minValue) + parseFloat(maxValue)) / 2).toFixed(15);
      const stdDev = (Math.random() * 0.5).toFixed(15);

      generatedData.push({
        no: i,
        date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
        minValue: minValue,
        maxValue: maxValue,
        average: average,
        stdDeviation: stdDev
      });
    }
    return generatedData;
  };

  const tableData = data.length > 0 ? data : generateRandomData();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <MainCard>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="textSecondary">{subtitle}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box
            onClick={onDownloadCSV}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: '8px',
              border: '1px solid #d2d2d7',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#86868b',
                backgroundColor: '#f9f9f9'
              }
            }}
          >
            <Typography variant="body2" color="textSecondary">Download CSV</Typography>
            <CloudDownloadIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
          </Box>
          <Box
            onClick={onPickDate}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: '8px',
              border: '1px solid #d2d2d7',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#86868b',
                backgroundColor: '#f9f9f9'
              }
            }}
          >
            <Typography variant="body2" color="textSecondary">Pick a date</Typography>
            <CalendarTodayIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
          </Box>
          <Box
            onClick={onAddNew}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: '20px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Add New</Typography>
            <Box component="span" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>+</Box>
          </Box>
        </Box>
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
            {paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                {columns.map((column) => (
                  <TableCell key={column.id}>{row[column.id]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, tableData.length)} of {tableData.length} entries
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
            page={page}
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
  onDownloadCSV: PropTypes.func,
  onPickDate: PropTypes.func,
  onAddNew: PropTypes.func
};

export default StatisticsTable;
