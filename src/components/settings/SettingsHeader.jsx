import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const SettingsHeader = ({ title, subtitle = 'Analytic' }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h4" component="span">
        {title} /
      </Typography>
      <Typography variant="h6" component="span" color="text.secondary" sx={{ ml: 0.5 }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

SettingsHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
};

export default SettingsHeader;
