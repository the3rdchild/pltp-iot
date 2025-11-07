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

  // Check if current page is dashboard default (case-insensitive)
  const isDashboard = pathname.toLowerCase() === '/dashboard' || pathname.toLowerCase() === '/dashboard/default';

  // set media wise responsive drawer
  useEffect(() => {
    handlerDrawerOpen(!downXL);
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      <Drawer />
      <Box
        component="main"
        sx={{
          width: 'calc(100% - 260px)',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          p: 0, // No padding on the main container
          m: 0
        }}
      >
        {/* Toolbar spacer for fixed header - always needed */}
        <Toolbar />
        {/* Content area with padding */}
        <Box
          sx={{
            flex: 1, // Let the content grow to push the footer down
            p: isDashboard ? 0 : { xs: 2, sm: 3 }, // Apply padding here
            m: 0,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {pathname !== '/apps/profiles/account/my-account' && !isDashboard && <Breadcrumbs />}
          <Outlet />
        </Box>
        {/* Footer outside the padded content area */}
        <Footer sx={{ mt: 'auto', py: 2, px: isDashboard ? 0 : 3 }} />
      </Box>
    </Box>
  );
}
