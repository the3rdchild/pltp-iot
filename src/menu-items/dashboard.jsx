// assets
import { 
  DashboardOutlined,
  BarChartOutlined,
  ExperimentFilled,
  HourglassOutlined,
  DatabaseOutlined,
  SettingOutlined,
  EditOutlined,
  SlidersOutlined,
  FundViewOutlined,
  LogoutOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  BarChartOutlined,
  ExperimentFilled,
  HourglassOutlined,
  DatabaseOutlined,
  SettingOutlined,
  EditOutlined,
  SlidersOutlined,
  FundViewOutlined,
  LogoutOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'analytics',
      title: 'Analytics',
      type: 'collapse',
      icon: icons.BarChartOutlined,
      children: [
        {
          id: 'dryness',
          title: 'Dryness',
          type: 'item',
          url: '/dryness',
          icon: icons.ExperimentFilled,
        },
        {
          id: 'ncg',
          title: 'NCG',
          type: 'item',
          url: '/analytics/ncg',
          icon: icons.HourglassOutlined,
        },
        {
          id: 'tds',
          title: 'TDS',
          type: 'item',
          url: '/analytics/tds',
          icon: icons.DatabaseOutlined,
        },
        {
          id: 'ptf',
          title: 'P, T, F',
          type: 'item',
          url: '/analytics/ptf',
          icon: icons.DashboardOutlined,
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      type: 'collapse',
      icon: icons.SettingOutlined,
      children: [
        {
          id: 'manual-data-input',
          title: 'Manual Data Input',
          type: 'item',
          url: '/settings/manual-data-input',
          icon: icons.EditOutlined,
        },
        {
          id: 'calibration',
          title: 'Calibration',
          type: 'item',
          url: '/settings/calibration',
          icon: icons.SlidersOutlined,
        },
        {
          id: 'limit',
          title: 'Limit',
          type: 'item',
          url: '/settings/limit',
          icon: icons.FundViewOutlined,
        }
      ]
    },
    {
      id: 'logout',
      title: 'Logout',
      type: 'item',
      url: '/logout',
      icon: icons.LogoutOutlined
    }
  ]
};

export default dashboard;
