import { Typography, Box } from '@mui/material';
import ilust from '../../assets//images/risk-ilust.png';

// ==============================|| BLANK PAGE ||============================== //

const Dryness = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Turbine Risk Prediction
      </Typography>
      <Typography>
        This is a blank canvas. This page is under construction.
      </Typography>
      {/* Image Insertion using MUI Box */}
      <Box
        component="img"
        sx={{
          height: 300,
          width: 1000,
          mt: 2
        }}
        alt="Risk Illustration"
        src={ilust}
      />
    </Box>
  );
};

export default Dryness;