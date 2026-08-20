import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginIcon from '@mui/icons-material/Login';

import AuthWrapper from 'sections/auth/AuthWrapper';
import { getCurrentUser, logout } from '../services/authService';

/**
 * Shown when a signed-in account reaches an admin page without the admin role.
 *
 * There is exactly one login page, so the only way up is to sign in as a
 * different account -- which means this screen has to offer that route out
 * explicitly. Bouncing silently back to the dashboard would leave someone who
 * just clicked a visible menu item with no idea what happened or what to do.
 */
export default function AdminRequired() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: '12px',
                bgcolor: 'error.lighter',
                color: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h3">Halaman Khusus Admin</Typography>
              <Typography variant="body2" color="text.secondary">
                Akun yang sedang dipakai tidak punya akses ke halaman ini.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Login saat ini
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.25 }}>
              {user?.email || 'Tidak diketahui'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Role: {user?.role || 'tidak diketahui'} — halaman Configuration, Manual Data Input, dan
              Calibration hanya bisa dibuka oleh akun dengan role admin.
            </Typography>
          </Box>
        </Grid>

        <Grid size={12}>
          <Stack sx={{ gap: 1.5 }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={<LoginIcon />}
              // logout() clears the stored session and sends the browser to
              // /login itself, so there is no navigate() call to follow it.
              onClick={() => logout()}
            >
              Login sebagai Admin
            </Button>
            <Button
              fullWidth
              size="large"
              variant="text"
              color="secondary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Kembali ke Dashboard
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
