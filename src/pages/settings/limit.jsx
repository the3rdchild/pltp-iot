import { useState } from 'react';
import { Typography, Box, Snackbar, Alert } from '@mui/material';
import SettingsHeader from '../../components/settings/SettingsHeader.jsx';
import LimitRender from '../../components/settings/LimitRender.jsx';

// Import the initial limit data
import initialLimitData from '../../data/Limit.json';

// ==============================|| LIMIT SETTINGS PAGE ||============================== //

const LimitSettings = () => {
  // State for limit data
  const [limitData, setLimitData] = useState(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('limitData');
    return saved ? JSON.parse(saved) : initialLimitData;
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle field change
  const handleChange = (paramKey, field, value) => {
    setLimitData(prev => ({
      ...prev,
      [paramKey]: {
        ...prev[paramKey],
        [field]: value
      }
    }));
  };

  // Save to localStorage
  const handleSave = () => {
    try {
      localStorage.setItem('limitData', JSON.stringify(limitData));
      setSnackbar({
        open: true,
        message: 'Settings saved successfully! Refresh the page to see changes.',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setLimitData(initialLimitData);
    localStorage.removeItem('limitData');
    setSnackbar({
      open: true,
      message: 'Settings reset to defaults',
      severity: 'info'
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <SettingsHeader title="Limit" subtitle="Settings" />
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Configure threshold limits for all sensor parameters. Changes will affect gauge displays across all pages.
        </Typography>
      </Box>

      {/* Render all limit settings components */}
      <LimitRender
        limitData={limitData}
        onChange={handleChange}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LimitSettings;
