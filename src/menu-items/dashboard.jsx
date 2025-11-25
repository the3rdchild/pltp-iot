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
import TimelineIcon from '@mui/icons-material/Timeline';

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
  LogoutOutlined,
  TimelineIcon
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
          url: '/ncg',
          icon: icons.HourglassOutlined,
        },
        {
          id: 'tds',
          title: 'TDS',
          type: 'item',
          url: '/tds',
          icon: icons.DatabaseOutlined,
        },
        {
          id: 'ptf',
          title: 'P, T, F',
          type: 'item',
          url: '/ptf',
          icon: icons.DashboardOutlined,
        },
        {
          id: 'prediction',
          title: 'Prediction',
          type: 'item',
          url: '/prediction',
          icon: icons.TimelineIcon,
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
          id: 'dataInput',
          title: 'Manual Data Input',
          type: 'item',
          url: '/dataInput',
          icon: icons.EditOutlined,
        },
        {
          id: 'configuration',
          title: 'Configuration',
          type: 'item',
          url: '/configuration',
          icon: icons.FundViewOutlined,
        },
        {
          id: 'calibration',
          title: 'Calibration',
          type: 'item',
          url: '/calibration',
          icon: icons.SlidersOutlined,
        }
      ]
    },
    {
      id: 'logout',
      title: 'Logout',
      type: 'item',
      url: '/login',
      icon: icons.LogoutOutlined
    }
  ]
};

export default dashboard;
