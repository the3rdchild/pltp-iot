require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || '10.9.40.17',
  user: process.env.DB_USER || 'Pertasmart',
  password: process.env.DB_PASSWORD || 'pertasmart.unpad!!2025',
  database: process.env.DB_NAME || 'pertasmart'
});

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'pertasmart_secret_key_2025';
const PORT = process.env.PORT || 5000;

// Koneksi ke database dan setup initial
db.connect(async (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    console.error('Make sure the database server is running and accessible');
    return;
  }
  console.log('Connected to MySQL database');

  // Auto-setup: Create users table if not exists
  await setupDatabase();
});

// ==============================|| AUTH ROUTES ||============================== //

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    // Query untuk mencari user berdasarkan email
    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }

      // Cek apakah user ditemukan
      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const user = results[0];

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return success response
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Register endpoint (optional)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  // Validasi input
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
    });
  }

  try {
    // Cek apakah email sudah terdaftar
    const checkSql = 'SELECT * FROM users WHERE email = ?';

    db.query(checkSql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }

      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user ke database
      const insertSql = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';

      db.query(insertSql, [email, hashedPassword, name], (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            id: result.insertId,
            email,
            name
          }
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      data: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// ==============================|| DATA ROUTES ||============================== //

// Route GET
app.get('/api/data', (req, res) => {
  res.send('get OKE');
});

// Route POST untuk insert data
app.post('/api/data', (req, res) => {
  const { content } = req.body;

  // Validasi input
  if (!content) {
    return res.status(400).json({ 
      success: false, 
      message: 'Content is required' 
    });
  }

  // Query SQL untuk insert data
  const sql = 'INSERT INTO test (content) VALUES (?)';

  db.query(sql, [content], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error inserting data',
        error: err.message 
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Data inserted successfully',
      data: {
        id: result.insertId,
        content: content
      }
    });
  });
});

// Setup database function
async function setupDatabase() {
  return new Promise((resolve, reject) => {
    // Create users table if not exists
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    db.query(createTableSQL, async (err, result) => {
      if (err) {
        console.error('Error creating users table:', err);
        reject(err);
        return;
      }
      console.log('Users table ready');

      // Check if default user exists
      db.query('SELECT * FROM users WHERE email = ?', ['pertasmart@unpad.ac.id'], async (err, results) => {
        if (err) {
          console.error('Error checking user:', err);
          reject(err);
          return;
        }

        if (results.length === 0) {
          // Create default user
          try {
            const hashedPassword = await bcrypt.hash('pertasmart.unpad!!2025', 10);
            const insertSQL = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';

            db.query(insertSQL, ['pertasmart@unpad.ac.id', hashedPassword, 'Pertasmart Admin'], (err, result) => {
              if (err) {
                console.error('Error creating default user:', err);
                reject(err);
              } else {
                console.log('Default user created successfully');
                console.log('Email: pertasmart@unpad.ac.id');
                console.log('Password: pertasmart.unpad!!2025');
                resolve();
              }
            });
          } catch (error) {
            console.error('Error hashing password:', error);
            reject(error);
          }
        } else {
          console.log('Default user already exists');
          resolve();
        }
      });
    });
  });
}

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});