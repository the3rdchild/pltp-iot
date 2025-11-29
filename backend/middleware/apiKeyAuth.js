/**
 * API Key Authentication Middleware
 * Validates Bearer token for external API access (Honeywell, Edge devices, etc.)
 */

const crypto = require('crypto');

/**
 * Generate a secure API key
 * Usage: node -e "console.log(require('./middleware/apiKeyAuth').generateApiKey())"
 */
const generateApiKey = () => {
  return 'sk_live_' + crypto.randomBytes(32).toString('hex');
};

/**
 * Get valid API keys from environment
 */
const getValidApiKeys = () => {
  const keys = [];

  // API key untuk Honeywell PHD system
  if (process.env.HONEYWELL_API_KEY) {
    keys.push(process.env.HONEYWELL_API_KEY);
  }

  // API key untuk Edge PC / Mini PC
  if (process.env.EDGE_PC_API_KEY) {
    keys.push(process.env.EDGE_PC_API_KEY);
  }

  // API key untuk testing
  if (process.env.TEST_API_KEY) {
    keys.push(process.env.TEST_API_KEY);
  }

  // Additional API keys (comma-separated)
  if (process.env.ADDITIONAL_API_KEYS) {
    const additionalKeys = process.env.ADDITIONAL_API_KEYS.split(',').map(k => k.trim());
    keys.push(...additionalKeys);
  }

  return keys;
};

/**
 * Validate API Key middleware
 * Checks Authorization header for Bearer token
 */
const validateApiKey = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Missing Authorization header',
        hint: 'Include header: Authorization: Bearer YOUR_API_KEY'
      });
    }

    // Check if it's Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Authorization format',
        hint: 'Use format: Authorization: Bearer YOUR_API_KEY'
      });
    }

    // Extract API key (remove "Bearer " prefix)
    const apiKey = authHeader.substring(7).trim();

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Empty API key'
      });
    }

    // Get valid API keys
    const validKeys = getValidApiKeys();

    if (validKeys.length === 0) {
      console.error('⚠️ WARNING: No API keys configured in environment variables!');
      return res.status(500).json({
        success: false,
        message: 'API key authentication not configured'
      });
    }

    // Validate API key
    if (!validKeys.includes(apiKey)) {
      // Log failed attempt (untuk security monitoring)
      console.warn('❌ Invalid API key attempt:', {
        key: apiKey.substring(0, 10) + '...',
        ip: req.headers['x-forwarded-for'] || req.ip,
        path: req.path,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    // API key valid - log success
    console.log('✅ API key validated:', {
      key: apiKey.substring(0, 15) + '...',
      path: req.path,
      method: req.method
    });

    // Attach API key info to request for logging
    req.apiKey = {
      key: apiKey.substring(0, 15) + '...',
      validated: true
    };

    next();

  } catch (error) {
    console.error('❌ API Key validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating API key',
      error: error.message
    });
  }
};

/**
 * Optional API Key middleware
 * Allows request to pass even without API key, but validates if present
 */
const optionalApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No API key provided - skip validation
  if (!authHeader) {
    return next();
  }

  // API key provided - validate it
  return validateApiKey(req, res, next);
};

module.exports = {
  generateApiKey,
  validateApiKey,
  optionalApiKey,
  getValidApiKeys
};
