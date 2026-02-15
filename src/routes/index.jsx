import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';

// layout dan halaman
import DashboardLayout from 'layout/Dashboard';
import AuthLayout from 'layout/Auth';
import DashboardDefault from 'pages/dashboard/default';
import History from 'pages/component-overview/history';
import HomePage from 'pages/home/home';
import Loadable from 'components/Loadable';
import Typography from 'pages/component-overview/typography';
import Color from 'pages/component-overview/color';
import ProtectedRoute from 'components/ProtectedRoute';
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
//test pages
import SimulationPage from 'pages/test/simulation';
import { TestDataProvider } from 'contexts/TestDataContext';

//artikel umum
import MisiKami from 'pages/extra-pages/articles/MisiKami';
import CaraKerjaPLTP from 'pages/extra-pages/articles/CaraKerjaPLTP';

//artikel Pentingnya Memantau Kualitas Uap yang Masuk Turbin
import TDSArticle from 'pages/extra-pages/articles/TDSArticle';
import DrynessFractionArticle from 'pages/extra-pages/articles/DrynessFractionArticle';
import NCGArticle from 'pages/extra-pages/articles/NCGArticle';

//artikel Sampling Data
import SamplingTDS from 'pages/extra-pages/articles/SamplingTDS';
import SamplingDryness from 'pages/extra-pages/articles/SamplingDryness';
import SamplingNCG from 'pages/extra-pages/articles/SamplingNCG';

//artikel Sistem Monitoring & Analisis AI
import AnalisisAI1 from 'pages/extra-pages/articles/AI1';
import AnalisisAI2 from 'pages/extra-pages/articles/AI2';


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
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <DashboardDefault />
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
  //Analytics Pages
  {
    path: '/dryness',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Dryness />
      }
    ]
  },
  {
    path: '/ncg',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <NCG />
      }
    ]
  },
  {
    path: '/tds',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <TDS />
      }
    ]
  },
  {
    path: '/ptf',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <PTF />
      }
    ]
  },
  {
    path: '/prediction',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
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
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <DataInput />
      }
    ]
  },
  {
    path: '/calibration',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Calibration />
      }
    ]
  },
  {
    path: '/configuration',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Configuration />
      }
    ]
  },

  //articles (public)
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
  },
  {
    path:'/artikel-AI1',
    element: <AnalisisAI1 />
  },
  {
    path:'/artikel-AI2',
    element: <AnalisisAI2 />
  },
  {
    path:'/artikel-SamplingTDS',
    element: <SamplingTDS />
  },
  {
    path:'/artikel-SamplingDryness',
    element: <SamplingDryness />
  },
  {
    path:'/artikel-SamplingNCG',
    element: <SamplingNCG />
  },

  // ==============================|| TEST ENVIRONMENT ROUTES ||============================== //
  // Test environment with simulated data - mirrors all production routes under /test
  {
    path: '/test',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <Navigate to="/test/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardDefault />
      },
      {
        path: 'simulation',
        element: <SimulationPage />
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
  // Test Analytics Pages
  {
    path: '/test/dryness',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <Dryness />
      }
    ]
  },
  {
    path: '/test/ncg',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <NCG />
      }
    ]
  },
  {
    path: '/test/tds',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <TDS />
      }
    ]
  },
  {
    path: '/test/ptf',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <PTF />
      }
    ]
  },
  {
    path: '/test/prediction',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <Prediction />
      }
    ]
  },
  // Test Settings Pages
  {
    path: '/test/dataInput',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <DataInput />
      }
    ]
  },
  {
    path: '/test/calibration',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <Calibration />
      }
    ]
  },
  {
    path: '/test/configuration',
    element: <TestDataProvider><DashboardLayout /></TestDataProvider>,
    children: [
      {
        index: true,
        element: <Configuration />
      }
    ]
  }
]);

export default router;
