// material-ui
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

// project import
import NavGroup from './NavGroup';
import menuItem, { getMenuItems } from 'menu-items';
import NavItem from './NavItem';

import { PoweroffOutlined } from '@ant-design/icons';

const icons = {
  PoweroffOutlined
};

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const location = useLocation();
  const isTestEnvironment = location.pathname.startsWith('/test');

  // Use test menu if in test environment, otherwise use production menu
  const currentMenuItems = isTestEnvironment ? getMenuItems(true) : menuItem;

  const navGroups = currentMenuItems.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return (
    <Box sx={{ pt: 2 }}>
      {navGroups}
      {/* <NavItem
        item={{
          id: 'logout',
          title: 'Logout',
          type: 'item',
          url: '/logout',
          icon: icons.PoweroffOutlined
        }}
        level={1}
      /> */}
    </Box>
  );
};

export default Navigation;
