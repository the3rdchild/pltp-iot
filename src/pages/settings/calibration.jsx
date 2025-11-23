import { useState, useEffect } from 'react';
import { Typography, Box, Snackbar, Alert } from '@mui/material';
import SettingsHeader from '../../components/settings/SettingsHeader.jsx';
import CalibrationRender from '../../components/settings/CalibrationRender.jsx';

// ==============================|| CALIBRATION SETTINGS PAGE ||============================== //

// Default calibration configuration
const DEFAULT_CALIBRATION_DATA = {
  dryness: {
    enabled: true,
    // Input range (process value)
    inputMin: 0,
    inputMax: 100,
    unit: '%',
    // Output range (4-20mA)
    outputMin: 4,
    outputMax: 20,
    // Zero/Span adjustment
    zeroOffset: 0,
    spanMultiplier: 1.0,
    // Signal testing
    overrideEnabled: false,
    manualValue: 12,
    // Scaling
    scalingType: 'linear',
    deadband: 0.1,
    updateRate: 1000,
    // Safety
    failsafeValue: 4,
    outputClampMin: 4,
    outputClampMax: 20
  },
  ncg: {
    enabled: true,
    // Input range (process value)
    inputMin: 0,
    inputMax: 10,
    unit: '%',
    // Output range (4-20mA)
    outputMin: 4,
    outputMax: 20,
    // Zero/Span adjustment
    zeroOffset: 0,
    spanMultiplier: 1.0,
    // Signal testing
    overrideEnabled: false,
    manualValue: 12,
    // Scaling
    scalingType: 'linear',
    deadband: 0.05,
    updateRate: 1000,
    // Safety
    failsafeValue: 4,
    outputClampMin: 4,
    outputClampMax: 20
  }
};

const CalibrationSettings = () => {
  // State for calibration data
  const [calibrationData, setCalibrationData] = useState(() => {
    const saved = localStorage.getItem('calibrationData');
    return saved ? JSON.parse(saved) : DEFAULT_CALIBRATION_DATA;
  });

  // Simulated current values (in real app, these would come from your data source)
  const [currentValues, setCurrentValues] = useState({
    dryness: 85.5,
    ncg: 2.3
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Simulate live data updates (replace with actual data fetching)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValues({
        dryness: 80 + Math.random() * 15,
        ncg: 1 + Math.random() * 4
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Handle field change
  const handleChange = (paramKey, field, value) => {
    setCalibrationData((prev) => ({
      ...prev,
      [paramKey]: {
        ...prev[paramKey],
        [field]: value
      }
    }));
  };

  // Save to localStorage (and optionally send to backend)
  const handleSave = () => {
    try {
      localStorage.setItem('calibrationData', JSON.stringify(calibrationData));

      // TODO: Send to backend API
      // await api.post('/calibration', calibrationData);

      setSnackbar({
        open: true,
        message: 'Calibration settings saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save calibration settings',
        severity: 'error'
      });
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setCalibrationData(DEFAULT_CALIBRATION_DATA);
    localStorage.removeItem('calibrationData');
    setSnackbar({
      open: true,
      message: 'Calibration settings reset to defaults',
      severity: 'info'
    });
  };

  // Send test signal
  const handleSendTest = (paramKey, maValue) => {
    // Update the manual value
    handleChange(paramKey, 'manualValue', maValue);

    // TODO: Send to backend/edge device
    // await api.post('/calibration/test', { channel: paramKey, value: maValue });

    setSnackbar({
      open: true,
      message: `Test signal ${maValue} mA sent to ${paramKey} channel`,
      severity: 'info'
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <SettingsHeader title="Calibration" subtitle="Settings" />
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Configure 4-20mA analog output signals for Dryness and NCG parameters. These signals are
          sent to the edge computing device for transmission to the FCS.
        </Typography>
      </Box>

      {/* Render all calibration components */}
      <CalibrationRender
        calibrationData={calibrationData}
        currentValues={currentValues}
        onChange={handleChange}
        onSave={handleSave}
        onReset={handleReset}
        onSendTest={handleSendTest}
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

export default CalibrationSettings;
