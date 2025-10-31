import PropTypes from 'prop-types';
import { Typography, Box, Link } from '@mui/material';

// ==============================|| FOOTER - APP ||============================== //

export default function Footer({ sx }) {
  const footerStyles = {
    textAlign: 'center',
    py: 3,
    mt: 4,
    bgcolor: 'background.paper', // White background (adapts to theme)
    borderTop: '1px solid',
    borderTopColor: 'divider',
    ...sx // Allow custom styling
  };

  return (
    <Box sx={footerStyles}>
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()}{' '}
        <Link color="inherit" href="" target="_blank">
          <strong>SMART</strong> (System Monitoring Analysis Real Time)
        </Link>
        . All Rights Reserved.
      </Typography>
    </Box>
  );
}

Footer.propTypes = {
  sx: PropTypes.object
};
