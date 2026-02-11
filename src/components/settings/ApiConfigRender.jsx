import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert
} from '@mui/material';
import MainCard from 'components/MainCard';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import ApiIcon from '@mui/icons-material/Api';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import { useState } from 'react';

// Section configuration for API endpoints
export const API_SECTIONS = [
  {
    title: 'Base Configuration',
    description: 'Configure the base API URL',
    type: 'base'
  },
  {
    title: 'Honeywell Live Data',
    description: 'Configure Honeywell API integration for live data',
    type: 'honeywell'
  },
  {
    title: 'Dashboard Endpoints',
    description: 'Configure endpoints for dashboard data',
    category: 'dashboard'
  },
  {
    title: 'Analytics Endpoints',
    description: 'Configure endpoints for analytics charts and statistics',
    category: 'analytics'
  },
  {
    title: 'TDS Endpoints',
    description: 'Configure endpoints for Total Dissolved Solids data',
    category: 'tds'
  },
  {
    title: 'Pressure Endpoints',
    description: 'Configure endpoints for pressure data',
    category: 'pressure'
  },
  {
    title: 'Temperature Endpoints',
    description: 'Configure endpoints for temperature data',
    category: 'temperature'
  },
  {
    title: 'Flow Rate Endpoints',
    description: 'Configure endpoints for flow rate data',
    category: 'flow'
  },
  {
    title: 'Power Endpoints',
    description: 'Configure endpoints for power measurements',
    category: 'power'
  },
  {
    title: 'Generator Endpoints',
    description: 'Configure endpoints for generator parameters',
    category: 'generator'
  }
];

// Display names for endpoint fields
const ENDPOINT_LABELS = {
  liveData: 'Live Data (All)',
  liveMetric: 'Live Metric (Dynamic)',
  stats: 'Dashboard Statistics',
  chartData: 'Chart Data (Dynamic)',
  statsTable: 'Statistics Table (Dynamic)',
  live: 'Live Data',
  chart: 'Chart Data',
  activePower: 'Active Power (Live)',
  reactivePower: 'Reactive Power (Live)',
  chartActive: 'Active Power (Chart)',
  chartReactive: 'Reactive Power (Chart)',
  voltage: 'Voltage (Live)',
  current: 'Current (Live)',
  speed: 'Speed (Live)',
  chartVoltage: 'Voltage (Chart)',
  chartCurrent: 'Current (Chart)',
  chartSpeed: 'Speed (Chart)'
};

// Base URL component
export const BaseUrlCard = ({ baseURL, onChange }) => (
  <MainCard>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <ApiIcon color="primary" />
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
        Base API URL
      </Typography>
    </Box>
    <TextField
      fullWidth
      size="small"
      label="Base URL"
      value={baseURL}
      onChange={(e) => onChange(e.target.value)}
      placeholder="/api"
      helperText="The base URL for all API requests (e.g., /api or https://api.example.com)"
    />
  </MainCard>
);

// Honeywell Configuration Card
export const HoneywellConfigCard = ({ config, onChange }) => {
  const [refreshIntervalError, setRefreshIntervalError] = useState('');

  const handleRefreshIntervalChange = (value) => {
    const interval = parseInt(value);
    if (interval < 3000 && interval > 0) {
      setRefreshIntervalError(
        '⚠️ Warning: Refresh interval below 3000ms may cause excessive API calls and potential rate limiting.'
      );
    } else {
      setRefreshIntervalError('');
    }
    onChange('refreshInterval', interval);
  };

  return (
    <MainCard>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SettingsInputAntennaIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Honeywell Live Data Configuration
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Data Source Selection */}
        <Grid size={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Live Data Source</InputLabel>
            <Select
              value={config.liveDataSource || 'database'}
              label="Live Data Source"
              onChange={(e) => onChange('liveDataSource', e.target.value)}
            >
              <MenuItem value="database">Database (Historical Data)</MenuItem>
              <MenuItem value="api">Honeywell API (Direct Live Feed)</MenuItem>
            </Select>
            <FormHelperText>
              Select whether to fetch live data from database or directly from Honeywell API
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Honeywell API URL */}
        <Grid size={12}>
          <TextField
            fullWidth
            size="small"
            label="Honeywell API URL"
            value={config.honeywellApiUrl || ''}
            onChange={(e) => onChange('honeywellApiUrl', e.target.value)}
            placeholder="https://honeywell-api.example.com/data"
            helperText="The Honeywell API URL for fetching live data (API key is configured in backend .env)"
            disabled={config.liveDataSource === 'database'}
          />
        </Grid>

        {/* Refresh Interval */}
        <Grid size={12}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Refresh Interval (ms)"
            value={config.refreshInterval || 3000}
            onChange={(e) => handleRefreshIntervalChange(e.target.value)}
            placeholder="3000"
            helperText="How often to refresh live data (minimum recommended: 3000ms)"
            inputProps={{ min: 1000, step: 1000 }}
          />
          {refreshIntervalError && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {refreshIntervalError}
            </Alert>
          )}
        </Grid>

        {/* Info about current selection */}
        {config.liveDataSource === 'api' && (
          <Grid size={12}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Direct Honeywell API Mode:</strong> Live data will be fetched directly from Honeywell API.
                Make sure the Honeywell API URL and credentials are properly configured.
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
};

// Endpoint card component for a category
export const EndpointCategoryCard = ({ category, endpoints, onChange }) => (
  <MainCard
    sx={{
      height: '100%',
      '& .MuiCardContent-root': {
        height: '100%'
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Typography>
      <Chip label={Object.keys(endpoints).length} size="small" color="primary" />
    </Box>

    <Grid container spacing={2}>
      {Object.entries(endpoints).map(([key, value]) => (
        <Grid size={12} key={key}>
          <TextField
            fullWidth
            size="small"
            label={ENDPOINT_LABELS[key] || key}
            value={value}
            onChange={(e) => onChange(category, key, e.target.value)}
            placeholder={`/data/${category}/${key}`}
            helperText={value.includes('{') ? 'Dynamic endpoint - uses path parameters' : ''}
          />
        </Grid>
      ))}
    </Grid>
  </MainCard>
);

// Metrics configuration card
export const MetricsCard = ({ metrics, onChange }) => (
  <MainCard>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
      Available Metrics & Ranges
    </Typography>

    <Grid container spacing={2}>
      {/* Dashboard Metrics */}
      <Grid size={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Dashboard Metrics
        </Typography>
        <TextField
          fullWidth
          size="small"
          label="Metrics List (comma-separated)"
          value={metrics.dashboard.join(', ')}
          onChange={(e) =>
            onChange(
              'dashboard',
              e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
            )
          }
          multiline
          rows={3}
          helperText="List of available metrics for dashboard (e.g., tds, pressure, temperature)"
        />
      </Grid>

      {/* Time Ranges */}
      <Grid size={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Time Ranges
        </Typography>
        <TextField
          fullWidth
          size="small"
          label="Ranges List (comma-separated)"
          value={metrics.ranges.join(', ')}
          onChange={(e) =>
            onChange(
              'ranges',
              e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
            )
          }
          helperText="Available time ranges for charts (e.g., 1h, 1d, 7d, 1m, 10y)"
        />
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {metrics.ranges.map((range) => (
            <Chip key={range} label={range} size="small" variant="outlined" />
          ))}
        </Box>
      </Grid>
    </Grid>
  </MainCard>
);

// Action Buttons component
export const ActionButtons = ({ onSave, onReset }) => (
  <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
    <Button
      variant="contained"
      color="primary"
      startIcon={<SaveIcon />}
      onClick={onSave}
      sx={{ px: 3 }}
    >
      Save Changes
    </Button>
    <Button
      variant="outlined"
      color="secondary"
      startIcon={<RestoreIcon />}
      onClick={onReset}
    >
      Reset to Defaults
    </Button>
  </Box>
);

// Section component
export const ApiSection = ({ section, apiConfig, onChange, onMetricsChange, onHoneywellChange }) => {
  if (section.type === 'base') {
    return (
      <Box sx={{ mb: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {section.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {section.description}
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
        <BaseUrlCard
          baseURL={apiConfig.baseURL}
          onChange={(value) => onChange('baseURL', null, value)}
        />
      </Box>
    );
  }

  if (section.type === 'honeywell') {
    return (
      <Box sx={{ mb: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {section.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {section.description}
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
        <HoneywellConfigCard
          config={apiConfig}
          onChange={onHoneywellChange}
        />
      </Box>
    );
  }

  if (section.category) {
    return (
      <Box sx={{ mb: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {section.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {section.description}
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 12 }}>
            <EndpointCategoryCard
              category={section.category}
              endpoints={apiConfig.endpoints[section.category]}
              onChange={onChange}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return null;
};

// Info card about API configuration
export const ApiInfoCard = () => (
  <MainCard sx={{ mb: 3, bgcolor: 'primary.lighter' }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      API Configuration Guide
    </Typography>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Dynamic Endpoints:</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Endpoints with <code>{'{ }'}</code> are dynamic and accept path parameters.
          Example: <code>/data/live/&#123;metric&#125;</code>
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Testing Changes:</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          After saving, refresh the page to apply changes. Make sure the API endpoints are valid.
        </Typography>
      </Grid>
    </Grid>
  </MainCard>
);

// Main ApiConfigRender component
const ApiConfigRender = ({ apiConfig, onChange, onMetricsChange, onHoneywellChange, onSave, onReset }) => (
  <>
    <ApiInfoCard />
    <ActionButtons onSave={onSave} onReset={onReset} />

    {API_SECTIONS.map((section) => (
      <ApiSection
        key={section.title}
        section={section}
        apiConfig={apiConfig}
        onChange={onChange}
        onMetricsChange={onMetricsChange}
        onHoneywellChange={onHoneywellChange}
      />
    ))}

    {/* Metrics Configuration */}
    <Box sx={{ mb: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Metrics Configuration
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Configure available metrics and time ranges
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>
      <MetricsCard metrics={apiConfig.metrics} onChange={onMetricsChange} />
    </Box>
  </>
);

export default ApiConfigRender;
