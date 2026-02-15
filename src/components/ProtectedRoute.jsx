import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, verifyToken } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    const checkAuth = async () => {
      // Quick check: no token at all
      if (!isAuthenticated()) {
        setStatus('unauthenticated');
        return;
      }

      // Verify token is still valid with backend
      try {
        await verifyToken();
        setStatus('authenticated');
      } catch {
        // Token expired or invalid - clean up and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setStatus('unauthenticated');
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
