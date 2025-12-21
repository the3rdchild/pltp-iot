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
  LogoutOutlined,
  ExperimentOutlined
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
  TimelineIcon,
  ExperimentOutlined
};

// ==============================|| MENU ITEMS - TEST DASHBOARD ||============================== //

const testDashboard = {
  id: 'group-test-dashboard',
  title: 'Test Navigation',
  type: 'group',
  children: [
    {
      id: 'test-dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/test/dashboard',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'test-simulation',
      title: 'Simulation',
      type: 'item',
      url: '/test/simulation',
      icon: icons.ExperimentOutlined,
      breadcrumbs: false
    },
    {
      id: 'test-analytics',
      title: 'Analytics',
      type: 'collapse',
      icon: icons.BarChartOutlined,
      children: [
        {
          id: 'test-dryness',
          title: 'Dryness',
          type: 'item',
          url: '/test/dryness',
          icon: icons.ExperimentFilled,
        },
        {
          id: 'test-ncg',
          title: 'NCG',
          type: 'item',
          url: '/test/ncg',
          icon: icons.HourglassOutlined,
        },
        {
          id: 'test-tds',
          title: 'TDS',
          type: 'item',
          url: '/test/tds',
          icon: icons.DatabaseOutlined,
        },
        {
          id: 'test-ptf',
          title: 'P, T, F',
          type: 'item',
          url: '/test/ptf',
          icon: icons.DashboardOutlined,
        },
        {
          id: 'test-prediction',
          title: 'Prediction',
          type: 'item',
          url: '/test/prediction',
          icon: icons.TimelineIcon,
        }
      ]
    },
    {
      id: 'test-settings',
      title: 'Settings',
      type: 'collapse',
      icon: icons.SettingOutlined,
      children: [
        {
          id: 'test-dataInput',
          title: 'Manual Data Input',
          type: 'item',
          url: '/test/dataInput',
          icon: icons.EditOutlined,
        },
        {
          id: 'test-configuration',
          title: 'Configuration',
          type: 'item',
          url: '/test/configuration',
          icon: icons.FundViewOutlined,
        },
        {
          id: 'test-calibration',
          title: 'Calibration',
          type: 'item',
          url: '/test/calibration',
          icon: icons.SlidersOutlined,
        }
      ]
    },
    {
      id: 'test-logout',
      title: 'Logout',
      type: 'item',
      url: '/login',
      icon: icons.LogoutOutlined
    }
  ]
};

export default testDashboard;
