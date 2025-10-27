
// assets
import {
  BarChartOutlined,
  ExperimentOutlined,
  HeatMapOutlined,
  ThunderboltOutlined,
  ScheduleOutlined
} from '@ant-design/icons';

// icons
const icons = {
  BarChartOutlined,
  ExperimentOutlined,
  HeatMapOutlined,
  ThunderboltOutlined,
  ScheduleOutlined
};

// ==============================|| MENU ITEMS - ANALYTICS ||============================== //

const analytics = {
  id: 'group-analytics',
  type: 'group',
  children: [
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
          url: '/analytics/dryness',
          icon: icons.ThunderboltOutlined, // Placeholder, find a better icon
          breadcrumbs: false
        },
        {
          id: 'ncg',
          title: 'NCG',
          type: 'item',
          url: '/analytics/ncg',
          icon: icons.ExperimentOutlined,
          breadcrumbs: false
        },
        {
          id: 'tds',
          title: 'TDS',
          type: 'item',
          url: '/analytics/tds',
          icon: icons.ScheduleOutlined, // Placeholder, find a better icon
          breadcrumbs: false
        },
        {
          id: 'ptf',
          title: 'P, T, F',
          type: 'item',
          url: '/analytics/ptf',
          icon: icons.HeatMapOutlined,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default analytics;
