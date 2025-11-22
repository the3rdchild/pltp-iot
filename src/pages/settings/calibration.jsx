// material-ui
import { Typography, Box } from '@mui/material';

// Import komponen Calibration yang sudah kamu taruh di components
import Calibration from '../../components/settings/Calibration.jsx';

// ==============================|| CALIBRATION PAGE ||============================== //

const CalibrationPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Settings - Calibration
      </Typography>

      {/* Render komponen Calibration */}
      <Calibration />
    </Box>
  );
};

export default CalibrationPage;
