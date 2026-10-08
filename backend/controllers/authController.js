const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
require('dotenv').config();

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Admin sessions are deliberately shorter-lived than viewer ones. There is
    // one login page and one token, so the role is the only thing separating a
    // session that can rewrite alarm thresholds from one that can only read --
    // an unattended browser should not stay privileged for a full day.
    const expiresIn =
      user.role === 'admin'
        ? process.env.ADMIN_TOKEN_EXPIRES_IN || '2h'
        : process.env.JWT_EXPIRES_IN || '24h';

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Surfaced so the client can warn before a session lapses mid-edit rather
    // than letting the user discover it by losing a form submission.
    const { exp } = jwt.decode(token);

    // Return user data and token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        expiresAt: new Date(exp * 1000).toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify Token (untuk check apakah token masih valid)
const verifyToken = async (req, res) => {
  try {
    // User sudah di-attach di middleware
    const userId = req.user.userId;

    const result = await query(
      'SELECT id, email, name, role FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  verifyToken
};
