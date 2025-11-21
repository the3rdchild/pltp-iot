/**
 * IP Whitelist Middleware
 * Whitelisted IPs bypass rate limiting
 */

// Whitelisted IPs - tambahkan IP device yang diizinkan di sini
const WHITELISTED_IPS = [
  '127.0.0.1',
  '::1',                    // localhost IPv6
  '::ffff:127.0.0.1',       // localhost mapped IPv6
  '182.10.99.33',           // User device IPv4
  '2404:c0:a301:d8a8:944c:b428:ec0f:1431', // User device IPv6
  '114.122.107.50',
  '103.125.116.42'
];

// Load tambahan dari environment variable (comma-separated)
// Contoh di .env: WHITELISTED_IPS=192.168.1.100,10.0.0.50
const getWhitelistedIPs = () => {
  const envIPs = process.env.WHITELISTED_IPS;
  if (envIPs) {
    const additionalIPs = envIPs.split(',').map(ip => ip.trim());
    return [...WHITELISTED_IPS, ...additionalIPs];
  }
  return WHITELISTED_IPS;
};

/**
 * Get client IP from request
 */
const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip;
};

/**
 * Check if IP is whitelisted
 */
const isWhitelisted = (clientIP) => {
  const whitelist = getWhitelistedIPs();
  const normalizedIP = clientIP?.replace('::ffff:', '');

  return whitelist.some(ip => {
    const normalizedWhitelistIP = ip.replace('::ffff:', '');
    return normalizedIP === normalizedWhitelistIP || clientIP === ip;
  });
};

/**
 * Skip rate limit for whitelisted IPs
 * Use as: rateLimit({ skip: skipIfWhitelisted, ... })
 */
const skipIfWhitelisted = (req) => {
  const clientIP = getClientIP(req);
  return isWhitelisted(clientIP);
};

module.exports = {
  getClientIP,
  getWhitelistedIPs,
  isWhitelisted,
  skipIfWhitelisted
};
