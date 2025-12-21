// project import
import dashboard from './dashboard';
import testDashboard from './test-dashboard';

// ==============================|| MENU ITEMS ||============================== //

// Function to get menu items based on current path
export const getMenuItems = (isTestEnvironment = false) => {
  return {
    items: [isTestEnvironment ? testDashboard : dashboard]
  };
};

// Default export for backward compatibility
const menuItems = {
  items: [dashboard]
};

export default menuItems;
