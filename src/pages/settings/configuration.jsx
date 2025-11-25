import { useState } from 'react';
import { Typography, Box, Snackbar, Alert, Tabs, Tab } from '@mui/material';
import SettingsHeader from '../../components/settings/SettingsHeader.jsx';
import LimitRender from '../../components/settings/LimitRender.jsx';
import ApiConfigRender from '../../components/settings/ApiConfigRender.jsx';

// Import the initial data
import initialLimitData from '../../data/Limit.json';
import initialApiConfig from '../../data/apiConfig.json';

// ==============================|| CONFIGURATION SETTINGS PAGE ||============================== //

const ConfigurationSettings = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // State for limit data
  const [limitData, setLimitData] = useState(() => {
    const saved = localStorage.getItem('limitData');
    return saved ? JSON.parse(saved) : initialLimitData;
  });

  // State for API config
  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem('apiConfig');
    return saved ? JSON.parse(saved) : initialApiConfig;
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // ==================== LIMIT DATA HANDLERS ====================

  const handleLimitChange = (paramKey, field, value) => {
    setLimitData(prev => ({
      ...prev,
      [paramKey]: {
        ...prev[paramKey],
        [field]: value
      }
    }));
  };

  const handleLimitSave = () => {
    try {
      localStorage.setItem('limitData', JSON.stringify(limitData));
      setSnackbar({
        open: true,
        message: 'Limit settings saved successfully! Refresh the page to see changes.',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save limit settings',
        severity: 'error'
      });
    }
  };

  const handleLimitReset = () => {
    setLimitData(initialLimitData);
    localStorage.removeItem('limitData');
    setSnackbar({
      open: true,
      message: 'Limit settings reset to defaults',
      severity: 'info'
    });
  };

  // ==================== API CONFIG HANDLERS ====================

  const handleApiChange = (category, key, value) => {
    if (category === 'baseURL') {
      setApiConfig(prev => ({
        ...prev,
        baseURL: value
      }));
    } else {
      setApiConfig(prev => ({
        ...prev,
        endpoints: {
          ...prev.endpoints,
          [category]: {
            ...prev.endpoints[category],
            [key]: value
          }
        }
      }));
    }
  };

  const handleMetricsChange = (type, value) => {
    setApiConfig(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [type]: value
      }
    }));
  };

  const handleApiSave = () => {
    try {
      localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
      setSnackbar({
        open: true,
        message: 'API configuration saved successfully! Refresh the page to apply changes.',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save API configuration',
        severity: 'error'
      });
    }
  };

  const handleApiReset = () => {
    setApiConfig(initialApiConfig);
    localStorage.removeItem('apiConfig');
    setSnackbar({
      open: true,
      message: 'API configuration reset to defaults',
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
        <SettingsHeader title="Configuration" subtitle="Settings" />
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Configure system limits and API endpoints. Changes are saved to browser localStorage.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Limit Configuration" />
          <Tab label="API Configuration" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Configure threshold limits for all sensor parameters. Changes will affect gauge displays across all pages.
          </Typography>
          <LimitRender
            limitData={limitData}
            onChange={handleLimitChange}
            onSave={handleLimitSave}
            onReset={handleLimitReset}
          />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Configure API endpoints and base URL. Make sure endpoints match your backend API structure.
          </Typography>
          <ApiConfigRender
            apiConfig={apiConfig}
            onChange={handleApiChange}
            onMetricsChange={handleMetricsChange}
            onSave={handleApiSave}
            onReset={handleApiReset}
          />
        </Box>
      )}

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

export default ConfigurationSettings;
