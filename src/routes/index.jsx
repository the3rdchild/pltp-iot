import { createBrowserRouter, Navigate } from 'react-router-dom';

// layout dan halaman
import DashboardLayout from 'layout/Dashboard';
import DashboardDefault from 'pages/dashboard/default';
import SamplePage from 'pages/extra-pages/documentationpage';
import History from 'pages/component-overview/history';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
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