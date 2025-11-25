import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';

// layout dan halaman
import DashboardLayout from 'layout/Dashboard';
import AuthLayout from 'layout/Auth';
import DashboardDefault from 'pages/dashboard/default';
// import SamplePage from 'pages/extra-pages/documentationpage';
import History from 'pages/component-overview/history';
import HomePage from 'pages/home/home';
import Loadable from 'components/Loadable';
import Typography from 'pages/component-overview/typography';
import Color from 'pages/component-overview/color';
//analytics pages
import Dryness from 'pages/analytics/dryness';
import NCG from 'pages/analytics/NCG';
import TDS from 'pages/analytics/TDS';
import PTF from 'pages/analytics/ptf'
import Prediction from 'pages/analytics/prediction'
//settings pages
import DataInput from 'pages/settings/dataInput'
import Calibration from 'pages/settings/calibration';
import Configuration from 'pages/settings/configuration';

//article
import CaraKerjaPLTP from 'pages/extra-pages/articles/CaraKerjaPLTP';
import TDSArticle from 'pages/extra-pages/articles/TDSArticle';
import DrynessFractionArticle from 'pages/extra-pages/articles/DrynessFractionArticle';
import NCGArticle from 'pages/extra-pages/articles/NCGArticle';
import MisiKami from 'pages/extra-pages/articles/MisiKami';

// dashboard pages

// map monitoring pages
import UnitPemantauan from 'pages/extra-pages/articles/UnitPemantauan';

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
      // {
      //   path: 'documentation', //documentationpage
      //   element: <SamplePage />
      // },
      // {
      //   path: 'History', //documentationpage
      //   element: <History />
      // },
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
  //Analytics Pages
  {
    path: '/dryness',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dryness />
      }
    ]
  },
  {
    path: '/ncg',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <NCG />
      }
    ]
  },
  {
    path: '/tds',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <TDS />
      }
    ]
  },
  {
    path: '/ptf',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <PTF />
      }
    ]
  },
  {
    path: '/prediction',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Prediction />
      }
    ]
  },
  //Settings Pages
  {
    path: '/dataInput',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DataInput />
      }
    ]
  },
  {
    path: '/calibration',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Calibration />
      }
    ]
  },
  {
    path: '/configuration',
    element: <DashboardLayout />,
    children: [ 
      {
        index: true,
        element: <Configuration />
      }
    ]
  },

  //articles
  {
    path:'/cara-kerja-pltp',
    element: <CaraKerjaPLTP />
  },
  {
    path:'/artikel-tds',
    element: <TDSArticle />
  },
  {
    path:'/artikel-dryness',
    element: <DrynessFractionArticle />
  },
  {
    path:'/artikel-ncg',
    element: <NCGArticle />
  },
  {
    path:'/misi-kami',
    element: <MisiKami />
  },
  {
    path: '/unit-pemantauan',
    element: <UnitPemantauan />
  }
  
]);

export default router;