import { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import MainCard from 'components/MainCard';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

// Import the initial limit data
import initialLimitData from '../../components/settings/Limit.json';

// ==============================|| LIMIT SETTINGS PAGE ||============================== //

// Section configuration - groups parameters by category
const SECTIONS = [
  {
    title: 'TDS (Total Dissolved Solids)',
    description: 'Configure limits for TDS measurements',
    parameters: ['TDS: Overall', 'tdsCO2', 'tdsArgon', 'tdsMethane', 'tdsMA3']
  },
  {
    title: 'Steam Quality',
    description: 'Configure limits for dryness fraction and NCG',
    parameters: ['dryness', 'ncg']
  },
  {
    title: 'Process Parameters',
    description: 'Configure limits for pressure, temperature, and flow',
    parameters: ['pressure', 'temperature', 'flow']
  }
];

// Display names for parameters
const PARAMETER_LABELS = {
  'TDS: Overall': 'TDS Overall',
  'tdsCO2': 'TDS CO₂',
  'tdsArgon': 'TDS Argon',
  'tdsMethane': 'TDS Methane (CH₄)',
  'tdsMA3': 'TDS MA3',
  'dryness': 'Dryness Fraction',
  'ncg': 'NCG (Non-Condensable Gas)',
  'pressure': 'Pressure',
  'temperature': 'Temperature',
  'flow': 'Flow Rate'
};

// Parameter card component
const ParameterCard = ({ paramKey, data, onChange }) => {
  const label = PARAMETER_LABELS[paramKey] || paramKey;

  return (
    <MainCard
      sx={{
        height: '100%',
        '& .MuiCardContent-root': {
          height: '100%'
        }
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
        {label}
      </Typography>

      <Grid container spacing={2}>
        {/* Unit field */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Unit"
            value={data.unit}
            onChange={(e) => onChange(paramKey, 'unit', e.target.value)}
          />
        </Grid>

        {/* Min/Max Row */}
        <Grid item xs={6}>
          <TextField
            fullWidth
            size="small"
            label="Min"
            type="number"
            value={data.min}
            onChange={(e) => onChange(paramKey, 'min', parseFloat(e.target.value) || 0)}
            InputProps={{
              inputProps: { step: 'any' }
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            size="small"
            label="Max"
            type="number"
            value={data.max}
            onChange={(e) => onChange(paramKey, 'max', parseFloat(e.target.value) || 0)}
            InputProps={{
              inputProps: { step: 'any' }
            }}
          />
        </Grid>

        {/* Threshold fields */}
        {data.abnormalLow !== undefined && (
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Abnormal Low"
              type="number"
              value={data.abnormalLow}
              onChange={(e) => onChange(paramKey, 'abnormalLow', parseFloat(e.target.value) || 0)}
              InputProps={{
                inputProps: { step: 'any' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ef4444' },
                  '&:hover fieldset': { borderColor: '#dc2626' }
                }
              }}
            />
          </Grid>
        )}

        {data.warningLow !== undefined && (
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Warning Low"
              type="number"
              value={data.warningLow}
              onChange={(e) => onChange(paramKey, 'warningLow', parseFloat(e.target.value) || 0)}
              InputProps={{
                inputProps: { step: 'any' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#f59e0b' },
                  '&:hover fieldset': { borderColor: '#d97706' }
                }
              }}
            />
          </Grid>
        )}

        {data.idealLow !== undefined && (
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Ideal Low"
              type="number"
              value={data.idealLow}
              onChange={(e) => onChange(paramKey, 'idealLow', parseFloat(e.target.value) || 0)}
              InputProps={{
                inputProps: { step: 'any' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#22c55e' },
                  '&:hover fieldset': { borderColor: '#16a34a' }
                }
              }}
            />
          </Grid>
        )}

        {data.idealHigh !== undefined && (
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Ideal High"
              type="number"
              value={data.idealHigh}
              onChange={(e) => onChange(paramKey, 'idealHigh', parseFloat(e.target.value) || 0)}
              InputProps={{
                inputProps: { step: 'any' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#22c55e' },
                  '&:hover fieldset': { borderColor: '#16a34a' }
                }
              }}
            />
          </Grid>
        )}

        {data.warningHigh !== undefined && (
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Warning High"
              type="number"
              value={data.warningHigh}
              onChange={(e) => onChange(paramKey, 'warningHigh', parseFloat(e.target.value) || 0)}
              InputProps={{
                inputProps: { step: 'any' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#f59e0b' },
                  '&:hover fieldset': { borderColor: '#d97706' }
                }
              }}
            />
          </Grid>
        )}

        {data.abnormalHigh !== undefined && (
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Abnormal High"
              type="number"
              value={data.abnormalHigh}
              onChange={(e) => onChange(paramKey, 'abnormalHigh', parseFloat(e.target.value) || 0)}
              InputProps={{
                inputProps: { step: 'any' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#ef4444' },
                  '&:hover fieldset': { borderColor: '#dc2626' }
                }
              }}
            />
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
};

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
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Limit Settings
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          Configure threshold limits for all sensor parameters. Changes will affect gauge displays across all pages.
        </Typography>
      </Box>

      {/* Legend - moved below title */}
      <MainCard sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Threshold Legend
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#ef4444', borderRadius: 1 }} />
              <Typography variant="body2">Abnormal (Red Zone)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#f59e0b', borderRadius: 1 }} />
              <Typography variant="body2">Warning (Yellow Zone)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#22c55e', borderRadius: 1 }} />
              <Typography variant="body2">Ideal (Green Zone)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#94a3b8', borderRadius: 1 }} />
              <Typography variant="body2">Min/Max (Range)</Typography>
            </Box>
          </Grid>
        </Grid>
      </MainCard>

      {/* Action Buttons */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ px: 3 }}
        >
          Save Changes
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<RestoreIcon />}
          onClick={handleReset}
        >
          Reset to Defaults
        </Button>
      </Box>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <Box key={section.title} sx={{ mb: 5 }}>
          {/* Section Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {section.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {section.description}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {/* Parameter Cards - max 3 per row */}
          <Grid container spacing={3}>
            {section.parameters.map((paramKey) => (
              <Grid item xs={12} sm={6} md={4} key={paramKey}>
                <ParameterCard
                  paramKey={paramKey}
                  data={limitData[paramKey]}
                  onChange={handleChange}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

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
