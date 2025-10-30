import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Drawer from './Drawer';
import Header from './Header';
import Footer from 'components/layout/Footer';
import Loader from 'components/Loader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT ||============================== //

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery((theme) => theme.breakpoints.down('xl'));

  // Check if current page is dashboard default
  const isDashboard = pathname === '/dashboard' || pathname === '/dashboard/default';

  // set media wise responsive drawer
  useEffect(() => {
    handlerDrawerOpen(!downXL);
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      <Drawer />

      <Box component="main" sx={{
        width: 'calc(100% - 260px)',
        flexGrow: 1,
        p: isDashboard ? 0 : { xs: 2, sm: 3 },
        m: 0
      }}>
        {!isDashboard && <Toolbar sx={{ mt: 'inherit' }} />}
        <Box
          sx={{
            position: 'relative',
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            m: 0
          }}
        >
          {pathname !== '/apps/profiles/account/my-account' && !isDashboard && <Breadcrumbs />}
          <Outlet />
          <Footer sx={{ mt: 'auto', py: 2, px: 0, mx: 0 }} />
        </Box>
      </Box>
    </Box>
  );
}
