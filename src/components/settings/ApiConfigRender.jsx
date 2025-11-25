import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Chip
} from '@mui/material';
import MainCard from 'components/MainCard';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import ApiIcon from '@mui/icons-material/Api';

// Section configuration for API endpoints
export const API_SECTIONS = [
  {
    title: 'Base Configuration',
    description: 'Configure the base API URL',
    type: 'base'
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
export const ApiSection = ({ section, apiConfig, onChange, onMetricsChange }) => {
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
const ApiConfigRender = ({ apiConfig, onChange, onMetricsChange, onSave, onReset }) => (
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
