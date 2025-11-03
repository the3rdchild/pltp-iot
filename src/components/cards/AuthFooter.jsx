// material-ui
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

export default function AuthFooter() {
  return (
    <Container maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: 2, justifyContent: 'center', textAlign: 'center' }}
      >
        <Typography variant="subtitle2" color="secondary">
          © 2025 SMART (System Monitoring Analysis Real Time). All Rights Reserved.
        </Typography>
      </Stack>
    </Container>
  );
}
