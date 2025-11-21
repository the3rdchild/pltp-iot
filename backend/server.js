const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const externalRoutes = require('./routes/external');
const dataRoutes = require('./routes/data');
const dataTestRoutes = require('./routes/dataTest');

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (required when behind nginx/reverse proxy for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting untuk mencegah abuse
const { skipIfWhitelisted } = require('./middleware/ipWhitelist');
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  skip: (req) => {
    if (req.path.startsWith('/data-test')) return true;
    if (req.path.startsWith('/external')) return true;
    return skipIfWhitelisted(req);
  },
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PertaSmart API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/data-test', dataTestRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to PertaSmart API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify'
      },
      external: {
        sensorData: 'POST /api/external/sensor-data',
        mlPrediction: 'POST /api/external/ml-prediction',
        batch: 'POST /api/external/batch',
        test: 'POST /api/external/test',
        testDummy: 'POST /api/external/test/dummy',
        testValidate: 'GET /api/external/test/validate'
      },
      data: {
        latestSensor: 'GET /api/data/sensor/latest',
        sensorRange: 'GET /api/data/sensor/range',
        sensorExport: 'GET /api/data/sensor/export',
        latestML: 'GET /api/data/ml/latest',
        fieldData: 'GET /api/data/field',
        createField: 'POST /api/data/field',
        dashboardStats: 'GET /api/data/dashboard/stats'
      },
      dataTest: {
        exportTestData: 'GET /api/data-test/sensor/export',
        insertTestData: 'POST /api/data-test/sensor/export'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     🚀 PertaSmart API Server          ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API Base URL: http://localhost:${PORT}/api`);
  console.log('════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
