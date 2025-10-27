// assets
import { PoweroffOutlined } from '@ant-design/icons';

// icons
const icons = {
  PoweroffOutlined
};

// ==============================|| MENU ITEMS - LOGOUT ||============================== //

const logout = {
  id: 'group-logout',
  type: 'group',
  children: [
    {
      id: 'logout',
      title: 'Logout',
      type: 'item',
      url: '/logout',
      icon: icons.PoweroffOutlined,
      breadcrumbs: false
    }
  ]
};

export default logout;
