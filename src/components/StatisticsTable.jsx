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
import MainCard from './MainCard';

const StatisticsTable = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Generate random data
    const generateRandomData = () => {
        const data = [];
        for (let i = 1; i <= 58; i++) {
            const minValue = (98 + Math.random() * 2).toFixed(15);
            const maxValue = (99 + Math.random() * 1).toFixed(15);
            const average = ((parseFloat(minValue) + parseFloat(maxValue)) / 2).toFixed(15);
            const stdDev = (Math.random() * 0.5).toFixed(15);

            data.push({
                no: i,
                date: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/2024`,
                minValue: minValue,
                maxValue: maxValue,
                average: average,
                stdDeviation: stdDev
            });
        }
        return data;
    };

    const tableData = generateRandomData();

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
                    <Typography variant="h5">Tabel Data Statistik</Typography>
                    <Typography variant="body2" color="textSecondary">Tabel data statistik yang telah diperoleh</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
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
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>No</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Minimum Value</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Max Value</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Average</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Standard Deviation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row) => (
                            <TableRow key={row.no} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                                <TableCell>{row.no}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>{row.minValue}</TableCell>
                                <TableCell>{row.maxValue}</TableCell>
                                <TableCell>{row.average}</TableCell>
                                <TableCell>{row.stdDeviation}</TableCell>
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

export default StatisticsTable;
