import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTestData, PRESET_SCENARIOS } from '../../contexts/TestDataContext';
import MainCard from '../../components/MainCard';

// ==============================|| SIMULATION PAGE ||============================== //

export default function SimulationPage() {
  const {
    baseValues,
    config,
    updateMetric,
    updateVariance,
    toggleDynamicMode,
    loadPreset,
    resetToDefaults
  } = useTestData();

  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');

  // Local state for form inputs (base values)
  const [formValues, setFormValues] = useState({});

  // Local state for variance inputs
  const [varianceValues, setVarianceValues] = useState({});

  // Initialize form values from context
  useEffect(() => {
    const values = {};
    const variances = {};
    Object.entries(baseValues).forEach(([key, data]) => {
      values[key] = data.value;
    });
    Object.entries(config.variance).forEach(([key, value]) => {
      variances[key] = value;
    });
    setFormValues(values);
    setVarianceValues(variances);
  }, [baseValues, config.variance]);

  const handleInputChange = (metricName, value) => {
    setFormValues(prev => ({
      ...prev,
      [metricName]: value
    }));
  };

  const handleVarianceChange = (metricName, value) => {
    setVarianceValues(prev => ({
      ...prev,
      [metricName]: value
    }));
  };

  const handleApplyChanges = () => {
    // Update base values
    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== '' && !isNaN(value)) {
        updateMetric(key, value);
      }
    });

    // Update variances
    Object.entries(varianceValues).forEach(([key, value]) => {
      if (value !== '' && !isNaN(value)) {
        updateVariance(key, value);
      }
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePresetChange = (event) => {
    const presetKey = event.target.value;
    setSelectedPreset(presetKey);
    if (presetKey) {
      loadPreset(presetKey);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setSelectedPreset('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    // Create simulation state snapshot
    const simulationState = {
      timestamp: new Date().toISOString(),
      dynamicMode: config.dynamicMode,
      baseValues: {},
      variance: config.variance,
      currentValues: {}
    };

    // Add base values and current values
    Object.entries(baseValues).forEach(([key, data]) => {
      simulationState.baseValues[key] = data.value;
      simulationState.currentValues[key] = data.value;
    });

    // Create JSON blob and download
    const jsonString = JSON.stringify(simulationState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `simulation-state-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Metric configurations organized by category
  const metricCategories = {
    ai_quality: {
      title: 'AI / Quality Parameters',
      color: 'primary',
      metrics: [
        { key: 'tds', label: 'TDS', unit: 'ppm', description: 'Total Dissolved Solids', step: '0.01' },
        { key: 'dryness', label: 'Dryness Fraction', unit: '%', description: 'Steam dryness percentage (0-100%)', step: '1' },
        { key: 'ncg', label: 'NCG', unit: '%', description: 'Non-Condensable Gas content', step: '0.01' }
      ]
    },
    sensor: {
      title: 'Sensor Parameters',
      color: 'secondary',
      metrics: [
        { key: 'pressure', label: 'Pressure', unit: 'bar', description: 'Steam pressure', step: '0.1' },
        { key: 'temperature', label: 'Temperature', unit: '°C', description: 'Steam temperature', step: '0.1' },
        { key: 'flow_rate', label: 'Flow Rate', unit: 'kg/s', description: 'Steam flow rate', step: '0.1' },
        { key: 'speed', label: 'Speed', unit: 'RPM', description: 'Turbine speed', step: '1' }
      ]
    },
    power: {
      title: 'Power Parameters',
      color: 'success',
      metrics: [
        { key: 'active_power', label: 'Active Power', unit: 'MW', description: 'Generator active power', step: '0.1' },
        { key: 'reactive_power', label: 'Reactive Power', unit: 'MVAR', description: 'Generator reactive power', step: '0.1' },
        { key: 'voltage', label: 'Voltage', unit: 'kV', description: 'Generator voltage', step: '0.1' },
        { key: 'current', label: 'Current', unit: 'A', description: 'Generator current', step: '1' }
      ]
    }
  };

  const renderMetricField = (config) => (
    <Grid item xs={12} sm={6} md={4} key={config.key}>
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          {config.label}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          {config.description}
        </Typography>

        {/* Base Value */}
        <TextField
          fullWidth
          type="number"
          label={`Base Value (${config.unit})`}
          value={formValues[config.key] || ''}
          onChange={(e) => handleInputChange(config.key, e.target.value)}
          inputProps={{ step: config.step }}
          size="small"
          sx={{ mb: 2 }}
        />

        {/* Variance/Offset */}
        <TextField
          fullWidth
          type="number"
          label={`Variance (±${config.unit})`}
          value={varianceValues[config.key] || ''}
          onChange={(e) => handleVarianceChange(config.key, e.target.value)}
          inputProps={{ step: config.step }}
          size="small"
          helperText={`Random offset range: ±${varianceValues[config.key] || 0} ${config.unit}`}
          disabled={!config.dynamicMode}
        />
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <MainCard>
        <Typography variant="h4" gutterBottom>
          Test Data Simulation
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure test data with dynamic variance. Set base values and variance ranges for realistic simulations.
        </Typography>

        {showSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Changes applied successfully!
          </Alert>
        )}

        {/* Control Panel */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.dynamicMode}
                    onChange={toggleDynamicMode}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Dynamic Mode</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {config.dynamicMode ? 'Data updates with variance every 2s' : 'Static values'}
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <FormControl fullWidth size="small">
                <InputLabel>Load Preset Scenario</InputLabel>
                <Select
                  value={selectedPreset}
                  label="Load Preset Scenario"
                  onChange={handlePresetChange}
                >
                  <MenuItem value="">
                    <em>Custom Configuration</em>
                  </MenuItem>
                  {Object.entries(PRESET_SCENARIOS).map(([key, preset]) => (
                    <MenuItem key={key} value={key}>
                      <Box>
                        <Typography variant="body2">{preset.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {preset.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* AI / Quality Parameters */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">{metricCategories.ai_quality.title}</Typography>
              <Chip label="AI" color={metricCategories.ai_quality.color} size="small" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {metricCategories.ai_quality.metrics.map(renderMetricField)}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Sensor Parameters */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">{metricCategories.sensor.title}</Typography>
              <Chip label="Sensors" color={metricCategories.sensor.color} size="small" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {metricCategories.sensor.metrics.map(renderMetricField)}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Power Parameters */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">{metricCategories.power.title}</Typography>
              <Chip label="Power" color={metricCategories.power.color} size="small" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {metricCategories.power.metrics.map(renderMetricField)}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="info"
            onClick={handleExportJSON}
          >
            Export Current State (JSON)
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyChanges}
            >
              Apply Changes
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>How it works:</strong> Set base values and variance ranges for each parameter.
            In Dynamic Mode, values fluctuate randomly within ±variance range every 2 seconds,
            simulating real sensor behavior. Values are persisted in localStorage.
          </Typography>
        </Box>
      </MainCard>
    </Box>
  );
}
