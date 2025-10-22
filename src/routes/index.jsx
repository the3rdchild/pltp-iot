import { createBrowserRouter, Navigate } from 'react-router-dom';

// layout dan halaman
import DashboardLayout from 'layout/Dashboard';
import DashboardDefault from 'pages/dashboard/default';
import SamplePage from 'pages/extra-pages/documentationpage';
import History from 'pages/component-overview/history';
import HomePage from 'pages/home/home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardDefault />
      },
      {
        path: 'documentation', //documentationpage
        element: <SamplePage />
      },
      {
        path: 'History', //documentationpage
        element: <History />
      }
    ]
  }
]);

export default router;