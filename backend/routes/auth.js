const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login - User login
router.post('/login', login);

// GET /api/auth/verify - Verify token validity
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;
