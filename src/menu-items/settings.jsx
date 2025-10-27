// assets
import { SettingOutlined, FormOutlined, ControlOutlined, DashboardOutlined } from '@ant-design/icons';

// icons
const icons = {
  SettingOutlined,
  FormOutlined,
  ControlOutlined,
  DashboardOutlined
};

// ==============================|| MENU ITEMS - SETTINGS ||============================== //

const settings = {
  id: 'group-settings',
  type: 'group',
  children: [
    {
      id: 'settings',
      title: 'Settings',
      type: 'collapse',
      icon: icons.SettingOutlined,
      children: [
        {
          id: 'manual-input',
          title: 'Manual Data Input',
          type: 'item',
          url: '/settings/manual-input',
          icon: icons.FormOutlined,
          breadcrumbs: false
        },
        {
          id: 'calibration',
          title: 'Calibration',
          type: 'item',
          url: '/settings/calibration',
          icon: icons.ControlOutlined,
          breadcrumbs: false
        },
        {
          id: 'limit',
          title: 'Limit',
          type: 'item',
          url: '/settings/limit',
          icon: icons.DashboardOutlined, // Using DashboardOutlined as a placeholder for Limit
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default settings;
