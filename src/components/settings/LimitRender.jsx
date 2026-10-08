import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider
} from '@mui/material';
import MainCard from 'components/MainCard';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

// Section configuration - groups parameters by category
export const SECTIONS = [
  {
    title: 'TDS (Total Dissolved Solids)',
    description: 'Configure limits for TDS measurements',
    parameters: ['TDS: Overall']
  },
  {
    title: 'Steam Quality',
    description: 'Configure limits for dryness fraction and NCG',
    parameters: ['dryness', 'ncg']
  },
  {
    title: 'Pipe Parameters',
    description: 'Configure limits for pressure, temperature, and flow',
    parameters: ['pressure', 'temperature', 'flow']
  },
  {
    title: 'Power & Generator',
    description: 'Configure limits for active power, reactive power, voltage, current, and turbine speed',
    parameters: ['gen_output', 'reactive_power', 'voltage', 'current', 'speed_detection']
  },
  {
    title: 'Honeywell Raw Parameters',
    description: 'Configure limits for individual Honeywell sensor readings',
    parameters: [
      'main_steam_pressure', 'main_steam_flow', 'main_steam_temp',
      'gen_output_mw', 'gen_reactive_power_net', 'gen_freq',
      'turbine_speed', 'mcv_l_position', 'mcv_r_position',
      'voltage_u_v', 'voltage_v_w', 'voltage_u_w'
    ]
  }
];

// Display names for parameters
export const PARAMETER_LABELS = {
  'TDS: Overall': 'TDS Overall',
  'dryness': 'Dryness Fraction',
  'ncg': 'NCG (Non-Condensable Gas)',
  'pressure': 'Pressure',
  'temperature': 'Temperature',
  'flow': 'Flow Rate',
  'gen_output': 'Active Power',
  'voltage': 'Voltage (Average)',
  'reactive_power': 'Reactive Power',
  'current': 'Current',
  'speed_detection': 'S.T Speed',
  'main_steam_pressure': 'Main Steam Pressure',
  'main_steam_flow': 'Main Steam Flow',
  'main_steam_temp': 'Main Steam Temperature',
  'gen_output_mw': 'Gen Output (MW)',
  'gen_reactive_power_net': 'Gen Reactive Power Net',
  'gen_freq': 'Gen Frequency',
  'turbine_speed': 'Turbine Speed',
  'mcv_l_position': 'MCV L Position',
  'mcv_r_position': 'MCV R Position',
  'voltage_u_v': 'Voltage U-V',
  'voltage_v_w': 'Voltage V-W',
  'voltage_u_w': 'Voltage W-U'
};

const limitFieldSx = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#22c55e' },
    '&:hover fieldset': { borderColor: '#16a34a' }
  }
};

// Parameter card component
export const ParameterCard = ({ paramKey, data, onChange }) => {
  const label = PARAMETER_LABELS[paramKey] || paramKey;
  const lowerInvalid = data.lowerLimit < data.min || data.lowerLimit > data.upperLimit;
  const upperInvalid = data.upperLimit > data.max || data.upperLimit < data.lowerLimit;

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
        <Grid size={12}>
          <TextField
            fullWidth
            size="small"
            label="Unit"
            value={data.unit}
            onChange={(e) => onChange(paramKey, 'unit', e.target.value)}
          />
        </Grid>

        {/* Min/Max Row */}
        <Grid size={6}>
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
        <Grid size={6}>
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

        {/* Lower/Upper limit row. The amber and red bands are derived from
            these two (see utils/limitZones), so there is nothing else to set.
            Setting a limit equal to Min/Max switches that side's alarm off. */}
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Lower Limit"
            type="number"
            value={data.lowerLimit}
            onChange={(e) => onChange(paramKey, 'lowerLimit', parseFloat(e.target.value) || 0)}
            error={lowerInvalid}
            helperText={lowerInvalid ? 'Must be between Min and Upper Limit' : ' '}
            InputProps={{
              inputProps: { step: 'any' }
            }}
            sx={limitFieldSx}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            size="small"
            label="Upper Limit"
            type="number"
            value={data.upperLimit}
            onChange={(e) => onChange(paramKey, 'upperLimit', parseFloat(e.target.value) || 0)}
            error={upperInvalid}
            helperText={upperInvalid ? 'Must be between Lower Limit and Max' : ' '}
            InputProps={{
              inputProps: { step: 'any' }
            }}
            sx={limitFieldSx}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

// Threshold Legend component
export const ThresholdLegend = () => (
  <MainCard sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      Limit Zones
    </Typography>
    <Grid container spacing={2}>
      {[
        ['#22c55e', 'Normal (Green): between Lower and Upper Limit'],
        ['#f59e0b', 'Warning (Yellow): past a limit, up to halfway toward Min/Max'],
        ['#ef4444', 'Abnormal (Red): the remaining half toward Min/Max'],
        ['#94a3b8', 'Limit = Min/Max: that side never alarms']
      ].map(([color, text]) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={color}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, flexShrink: 0, bgcolor: color, borderRadius: 1 }} />
            <Typography variant="body2">{text}</Typography>
          </Box>
        </Grid>
      ))}
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
export const ParameterSection = ({ section, limitData, onChange }) => (
  <Box sx={{ mb: 5 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={paramKey}>
          <ParameterCard
            paramKey={paramKey}
            data={limitData[paramKey]}
            onChange={onChange}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

// Main LimitRender component that combines everything
const LimitRender = ({ limitData, onChange, onSave, onReset }) => (
  <>
    <ThresholdLegend />
    <ActionButtons onSave={onSave} onReset={onReset} />
    {SECTIONS.map((section) => (
      <ParameterSection
        key={section.title}
        section={section}
        limitData={limitData}
        onChange={onChange}
      />
    ))}
  </>
);

export default LimitRender;
