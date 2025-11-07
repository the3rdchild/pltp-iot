import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';

// layout dan halaman
import DashboardLayout from 'layout/Dashboard';
import AuthLayout from 'layout/Auth';
import DashboardDefault from 'pages/dashboard/default';
import SamplePage from 'pages/extra-pages/documentationpage';
import History from 'pages/component-overview/history';
import HomePage from 'pages/home/home';
import Loadable from 'components/Loadable';
import Typography from 'pages/component-overview/typography';
import Color from 'pages/component-overview/color';

import Dryness from 'pages/analytics/dryness';


// auth pages
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />
      }
    ]
  },
  {
    path: '/register',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <RegisterPage />
      }
    ]
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
      },
      {
        path: 'typography',
        element: <Typography />
      },
      {
        path: 'color',
        element: <Color />
      }
    ]
  },
  {
    path: '/dryness',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dryness />
      }
    ]
  }
]);

export default router;