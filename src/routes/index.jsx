import { createBrowserRouter, Navigate } from 'react-router-dom';

// layout dan halaman
import DashboardLayout from 'layout/Dashboard';
import DashboardDefault from 'pages/dashboard/default';
import SamplePage from 'pages/extra-pages/sample-page';

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
        path: 'documentation', //sample-page
        element: <SamplePage />
      }
    ]
  }
]);

export default router;