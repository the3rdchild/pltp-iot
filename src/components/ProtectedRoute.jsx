import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, verifyToken } from '../services/authService';
import AdminRequired from './AdminRequired';

/**
 * Route guard.
 *
 * There is a single login page; which features open up is decided by the role
 * on the account that signed in. `requireRole` narrows a route to the listed
 * roles (string or array).
 *
 * This is a UX guard only -- it decides what to render. The authoritative check
 * lives on the API (authenticateToken + requireRole in the backend middleware),
 * because anything enforced in the browser can be bypassed by calling the
 * endpoint directly. Both are needed: this one stops a viewer landing on a page
 * full of controls that would only fail on submit.
 *
 * The role comes from /auth/verify rather than the cached localStorage user, so
 * a role revoked server-side takes effect on the next navigation instead of
 * persisting until the user happens to log out.
 */
const ProtectedRoute = ({ children, requireRole = null }) => {
  const location = useLocation();
  // 'loading' | 'authenticated' | 'unauthenticated' | 'forbidden'
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      // Quick check: no token at all
      if (!isAuthenticated()) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }

      // Verify token is still valid with backend
      try {
        const response = await verifyToken();
        if (cancelled) return;

        if (requireRole) {
          const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
          const role = response?.data?.user?.role;
          // Fails closed: an unrecognised or absent role is a refusal, never a
          // pass-through.
          if (!allowed.includes(role)) {
            setStatus('forbidden');
            return;
          }
        }

        setStatus('authenticated');
      } catch {
        if (cancelled) return;
        // Token expired or invalid - clean up and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setStatus('unauthenticated');
      }
    };

    checkAuth();
    // Navigating away mid-request would otherwise set state on an unmounted
    // component and, worse, clear a perfectly good token on a stale rejection.
    return () => {
      cancelled = true;
    };
  }, [location.pathname, requireRole]);

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in, just not entitled. Explained on screen with a way to switch
  // accounts -- a silent bounce to /dashboard leaves the user with no idea why
  // the menu item they clicked did nothing.
  if (status === 'forbidden') {
    return <AdminRequired />;
  }

  return children;
};

export default ProtectedRoute;
