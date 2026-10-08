const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expired'
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Invalid token'
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Optional authentication (tidak wajib login)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Role gate. Use AFTER authenticateToken, which is what puts req.user there.
 *
 *   router.post('/x', authenticateToken, requireRole('admin'), handler)
 *
 * Deliberately fails closed: a token minted before roles existed has no `role`
 * claim at all, and that must be a refusal, not a pass. Those tokens expire
 * within JWT_EXPIRES_IN (24h by default) and the next login re-mints them with
 * the claim present.
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    // Reaching here means the route forgot authenticateToken -- refusing is
    // the only safe reading, since we have no identity to check.
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient privileges for this action'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};
