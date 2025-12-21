import { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PropTypes from 'prop-types';

const MetricConfigCard = ({ metric, label, unit, config, onChange, onToggle }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={config.enabled}
                onChange={(e) => onToggle(metric, e.target.checked)}
                color="primary"
              />
            }
            label={config.enabled ? 'Manual Mode' : 'Auto Mode'}
          />
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {config.enabled
            ? 'Using manual reference values for chart display'
            : 'Using calculated values from real-time data'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Minimum"
              type="number"
              value={config.min}
              onChange={(e) => onChange(metric, 'min', parseFloat(e.target.value))}
              disabled={!config.enabled}
              InputProps={{
                endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>{unit}</Typography>
              }}
              inputProps={{
                step: metric === 'dryness' || metric === 'ncg' ? 0.1 : 1
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Average"
              type="number"
              value={config.avg}
              onChange={(e) => onChange(metric, 'avg', parseFloat(e.target.value))}
              disabled={!config.enabled}
              InputProps={{
                endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>{unit}</Typography>
              }}
              inputProps={{
                step: metric === 'dryness' || metric === 'ncg' ? 0.1 : 1
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Maximum"
              type="number"
              value={config.max}
              onChange={(e) => onChange(metric, 'max', parseFloat(e.target.value))}
              disabled={!config.enabled}
              InputProps={{
                endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>{unit}</Typography>
              }}
              inputProps={{
                step: metric === 'dryness' || metric === 'ncg' ? 0.1 : 1
              }}
            />
          </Grid>
        </Grid>

        {config.enabled && (
          <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
            Note: Changing these values will also update the anomaly detection thresholds in Limit Configuration.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

MetricConfigCard.propTypes = {
  metric: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  config: PropTypes.shape({
    enabled: PropTypes.bool.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    avg: PropTypes.number.isRequired
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired
};

const ChartReferenceRender = ({ config, onChange, onToggle, onSave, onReset, loading }) => {
  const metrics = [
    { key: 'pressure', label: 'Pressure', unit: 'barg' },
    { key: 'temperature', label: 'Temperature', unit: '°C' },
    { key: 'flow_rate', label: 'Flow Rate', unit: 't/h' },
    { key: 'ncg', label: 'NCG (Non-Condensable Gases)', unit: 'wt%' },
    { key: 'dryness', label: 'Dryness', unit: '%' },
    { key: 'tds', label: 'TDS (Total Dissolved Solids)', unit: 'ppm' }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="textSecondary">
          Configure reference lines (Min/Max/Avg) displayed on Real-Time Data charts for each parameter.
          Toggle between manual configuration and automatic calculation from live data.
        </Typography>
      </Box>

      {/* Metric Configuration Cards */}
      {metrics.map((metric) => (
        <MetricConfigCard
          key={metric.key}
          metric={metric.key}
          label={metric.label}
          unit={metric.unit}
          config={config[metric.key]}
          onChange={onChange}
          onToggle={onToggle}
        />
      ))}

      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          disabled={loading}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Info Box */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: 'info.lighter',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.light'
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          How it works:
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <strong>Auto Mode (default):</strong> Reference lines are calculated from real-time data statistics
            </li>
            <li>
              <strong>Manual Mode:</strong> Use fixed reference values set here. These values also update:
              <ul>
                <li>Min → abnormalLow threshold</li>
                <li>Max → abnormalHigh threshold</li>
                <li>Avg → idealLow and idealHigh range</li>
              </ul>
            </li>
            <li>Changes apply to both test and production environments</li>
            <li>Reference lines help visualize target ranges on charts</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

ChartReferenceRender.propTypes = {
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

ChartReferenceRender.defaultProps = {
  loading: false
};

export default ChartReferenceRender;
