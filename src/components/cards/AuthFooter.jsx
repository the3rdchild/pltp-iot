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
        sx={{ gap: 2, justifyContent: { xs: 'center', sm: 'space-between', textAlign: { xs: 'center', sm: 'inherit' } } }}
      >
        <Typography variant="subtitle2" color="secondary">
          © Made with love by Team{' '}
          <Link href="https://codedthemes.com/" target="_blank" underline="hover">
            CodedThemes
          </Link>
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { xs: 1, sm: 3 }, textAlign: { xs: 'center', sm: 'inherit' } }}>
        <Typography variant="subtitle2" color="secondary">
          Distributed by {' '}
          <Link href="https://themewagon.com/" target="_blank" underline="hover">
            ThemeWagon
          </Link>
        </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
