import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  LinearProgress
} from '@mui/material';
import MainCard from 'components/MainCard';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SendIcon from '@mui/icons-material/Send';

// Display names for parameters
const PARAMETER_LABELS = {
  dryness: 'Dryness Fraction',
  ncg: 'NCG (Non-Condensable Gas)'
};

// Helper function to calculate mA output from value
const calculateMaOutput = (value, config) => {
  if (!config.enabled) return config.failsafeValue;

  // Apply deadband
  const { inputMin, inputMax, outputMin, outputMax, zeroOffset, spanMultiplier } = config;

  // Clamp input value
  const clampedValue = Math.max(inputMin, Math.min(inputMax, value));

  // Linear scaling with zero offset and span
  let normalized = (clampedValue - inputMin) / (inputMax - inputMin);
  normalized = (normalized + zeroOffset) * spanMultiplier;

  // Map to output range
  let output = outputMin + normalized * (outputMax - outputMin);

  // Apply output clamps
  output = Math.max(config.outputClampMin, Math.min(config.outputClampMax, output));

  return output;
};

// Live Preview Component
const LivePreview = ({ paramKey, config, currentValue }) => {
  const label = PARAMETER_LABELS[paramKey] || paramKey;
  const maOutput = calculateMaOutput(currentValue, config);
  const percentage = ((maOutput - 4) / 16) * 100;

  return (
    <MainCard sx={{ mb: 2, bgcolor: '#F5F5F5' }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Live Preview - {label}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid size={4}>
          <Typography variant="body2" color="textSecondary">Input Value</Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {currentValue.toFixed(2)} {config.unit}
          </Typography>
        </Grid>
        <Grid size={4}>
          <Typography variant="body2" color="textSecondary">Output Signal</Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {maOutput.toFixed(2)} mA
          </Typography>
        </Grid>
        <Grid size={4}>
          <Typography variant="body2" color="textSecondary">Signal Range</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                flexGrow: 1,
                height: 8,
                borderRadius: 1,
                bgcolor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  bgcolor: config.enabled ? 'primary.main' : 'grey.500'
                }
              }}
            />
            <Typography variant="body2">{percentage.toFixed(0)}%</Typography>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
};

// Output Calibration Card
const OutputCalibrationCard = ({ paramKey, config, onChange }) => {
  const label = PARAMETER_LABELS[paramKey] || paramKey;

  return (
    <MainCard sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {label}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={config.enabled}
              onChange={(e) => onChange(paramKey, 'enabled', e.target.checked)}
              color="primary"
            />
          }
          label={config.enabled ? 'Enabled' : 'Disabled'}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Input Range (Process Value)
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Input Min"
            type="number"
            value={config.inputMin}
            onChange={(e) => onChange(paramKey, 'inputMin', parseFloat(e.target.value) || 0)}
            InputProps={{ inputProps: { step: 'any' } }}
            disabled={!config.enabled}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Input Max"
            type="number"
            value={config.inputMax}
            onChange={(e) => onChange(paramKey, 'inputMax', parseFloat(e.target.value) || 0)}
            InputProps={{ inputProps: { step: 'any' } }}
            disabled={!config.enabled}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            size="small"
            label="Unit"
            value={config.unit}
            onChange={(e) => onChange(paramKey, 'unit', e.target.value)}
            disabled={!config.enabled}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Output Range (4-20mA)
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Output Min (mA)"
            type="number"
            value={config.outputMin}
            onChange={(e) => onChange(paramKey, 'outputMin', parseFloat(e.target.value) || 4)}
            InputProps={{ inputProps: { step: 0.1, min: 0, max: 20 } }}
            disabled={!config.enabled}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Output Max (mA)"
            type="number"
            value={config.outputMax}
            onChange={(e) => onChange(paramKey, 'outputMax', parseFloat(e.target.value) || 20)}
            InputProps={{ inputProps: { step: 0.1, min: 0, max: 20 } }}
            disabled={!config.enabled}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Zero/Span Adjustment
      </Typography>
      <Grid container spacing={5}>
        <Grid size={6}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Zero Offset: {(config.zeroOffset * 100).toFixed(1)}%
          </Typography>
          <Slider
            value={config.zeroOffset}
            onChange={(e, val) => onChange(paramKey, 'zeroOffset', val)}
            min={-0.1}
            max={0.1}
            step={0.001}
            disabled={!config.enabled}
            marks={[
              { value: -0.1, label: '-10%' },
              { value: 0, label: '0' },
              { value: 0.1, label: '+10%' }
            ]}
          />
        </Grid>
        <Grid size={6}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Span Multiplier: {config.spanMultiplier.toFixed(3)}x
          </Typography>
          <Slider
            value={config.spanMultiplier}
            onChange={(e, val) => onChange(paramKey, 'spanMultiplier', val)}
            min={0.9}
            max={1.1}
            step={0.001}
            disabled={!config.enabled}
            marks={[
              { value: 0.9, label: '0.9x' },
              { value: 1.0, label: '1.0x' },
              { value: 1.1, label: '1.1x' }
            ]}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

// Signal Testing Card
const SignalTestingCard = ({ paramKey, config, onChange, onSendTest }) => {
  const label = PARAMETER_LABELS[paramKey] || paramKey;

  return (
    <MainCard sx={{ height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
        Signal Testing - {label}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={config.overrideEnabled}
              onChange={(e) => onChange(paramKey, 'overrideEnabled', e.target.checked)}
              color="warning"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Manual Override Mode</Typography>
              {config.overrideEnabled && (
                <Chip label="ACTIVE" color="warning" size="small" />
              )}
            </Box>
          }
        />
        <Typography variant="caption" color="textSecondary" display="block">
          When enabled, manual value overrides calculated output
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={12}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Manual Output Value: {config.manualValue.toFixed(2)} mA
          </Typography>
          <Slider
            value={config.manualValue}
            onChange={(e, val) => onChange(paramKey, 'manualValue', val)}
            min={4}
            max={20}
            step={0.01}
            disabled={!config.overrideEnabled}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v.toFixed(2)} mA`}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Quick Test Signals
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onSendTest(paramKey, 4)}
          startIcon={<SendIcon />}
          disabled={!config.overrideEnabled}
        >
          4 mA (Min)
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onSendTest(paramKey, 12)}
          startIcon={<SendIcon />}
          disabled={!config.overrideEnabled}
        >
          12 mA (Mid)
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onSendTest(paramKey, 20)}
          startIcon={<SendIcon />}
          disabled={!config.overrideEnabled}
        >
          20 mA (Max)
        </Button>
      </Box>
    </MainCard>
  );
};

// Scaling Configuration Card
const ScalingConfigCard = ({ paramKey, config, onChange }) => {
  const label = PARAMETER_LABELS[paramKey] || paramKey;

  return (
    <MainCard sx={{ height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
        Scaling - {label}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Scaling Type
      </Typography>
      <ToggleButtonGroup
        value={config.scalingType}
        exclusive
        onChange={(e, val) => val && onChange(paramKey, 'scalingType', val)}
        size="small"
        sx={{ mb: 3 }}
      >
        <ToggleButton value="linear">Linear</ToggleButton>
        <ToggleButton value="square">Square Root</ToggleButton>
        <ToggleButton value="logarithmic">Logarithmic</ToggleButton>
      </ToggleButtonGroup>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Deadband"
            type="number"
            value={config.deadband}
            onChange={(e) => onChange(paramKey, 'deadband', parseFloat(e.target.value) || 0)}
            InputProps={{ inputProps: { step: 0.01, min: 0 } }}
            helperText="Ignore changes smaller than this"
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Update Rate (ms)"
            type="number"
            value={config.updateRate}
            onChange={(e) => onChange(paramKey, 'updateRate', parseInt(e.target.value) || 1000)}
            InputProps={{ inputProps: { step: 100, min: 100 } }}
            helperText="Push interval to edge"
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

// Safety Features Card
const SafetyFeaturesCard = ({ paramKey, config, onChange }) => {
  const label = PARAMETER_LABELS[paramKey] || paramKey;

  return (
    <MainCard sx={{ height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
        Safety - {label}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            fullWidth
            size="small"
            label="Failsafe Value (mA)"
            type="number"
            value={config.failsafeValue}
            onChange={(e) => onChange(paramKey, 'failsafeValue', parseFloat(e.target.value) || 4)}
            InputProps={{ inputProps: { step: 0.1, min: 4, max: 20 } }}
            helperText="Output when communication lost"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#ef4444' },
                '&:hover fieldset': { borderColor: '#dc2626' }
              }
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Output Clamp Min (mA)"
            type="number"
            value={config.outputClampMin}
            onChange={(e) => onChange(paramKey, 'outputClampMin', parseFloat(e.target.value) || 4)}
            InputProps={{ inputProps: { step: 0.1, min: 0, max: 20 } }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Output Clamp Max (mA)"
            type="number"
            value={config.outputClampMax}
            onChange={(e) => onChange(paramKey, 'outputClampMax', parseFloat(e.target.value) || 20)}
            InputProps={{ inputProps: { step: 0.1, min: 0, max: 20 } }}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

// Status Legend
const StatusLegend = () => (
  <MainCard sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      4-20mA Signal Reference
    </Typography>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
          <Typography variant="body2">4 mA = Minimum (0%)</Typography>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#22c55e', borderRadius: 1 }} />
          <Typography variant="body2">12 mA = Midpoint (50%)</Typography>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#f59e0b', borderRadius: 1 }} />
          <Typography variant="body2">20 mA = Maximum (100%)</Typography>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#ef4444', borderRadius: 1 }} />
          <Typography variant="body2">&lt;4 mA = Fault Condition</Typography>
        </Box>
      </Grid>
    </Grid>
  </MainCard>
);

// Action Buttons
const ActionButtons = ({ onSave, onReset }) => (
  <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
    <Button
      variant="contained"
      color="primary"
      startIcon={<SaveIcon />}
      onClick={onSave}
      sx={{ px: 3 }}
    >
      Save Configuration
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

// Channel Section
const ChannelSection = ({ paramKey, config, currentValue, onChange, onSendTest }) => {
  const label = PARAMETER_LABELS[paramKey] || paramKey;

  return (
    <Box sx={{ mb: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {label} Channel
          </Typography>
          <Chip
            label={config.enabled ? 'ACTIVE' : 'DISABLED'}
            color={config.enabled ? 'success' : 'default'}
            size="small"
          />
          {config.overrideEnabled && (
            <Chip label="OVERRIDE" color="warning" size="small" />
          )}
        </Box>
        <Typography variant="body2" color="textSecondary">
          Configure 4-20mA output signal for {label.toLowerCase()} measurement
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      {/* Live Preview */}
      <LivePreview paramKey={paramKey} config={config} currentValue={currentValue} />

      {/* Configuration Cards - 2 per row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <OutputCalibrationCard paramKey={paramKey} config={config} onChange={onChange} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SignalTestingCard
            paramKey={paramKey}
            config={config}
            onChange={onChange}
            onSendTest={onSendTest}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ScalingConfigCard paramKey={paramKey} config={config} onChange={onChange} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SafetyFeaturesCard paramKey={paramKey} config={config} onChange={onChange} />
        </Grid>
      </Grid>
    </Box>
  );
};

// Main CalibrationRender component
const CalibrationRender = ({
  calibrationData,
  currentValues,
  onChange,
  onSave,
  onReset,
  onSendTest
}) => (
  <>
    <StatusLegend />
    <ActionButtons onSave={onSave} onReset={onReset} />

    {['dryness', 'ncg'].map((paramKey) => (
      <ChannelSection
        key={paramKey}
        paramKey={paramKey}
        config={calibrationData[paramKey]}
        currentValue={currentValues[paramKey]}
        onChange={onChange}
        onSendTest={onSendTest}
      />
    ))}
  </>
);

export default CalibrationRender;
