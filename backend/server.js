const express = require('express');
const mysql = require('mysql2');
const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: '10.9.40.17',
  user: 'Pertasmart',      // Ganti dengan username MySQL Anda
  password: 'pertasmart.unpad!!2025',  // Ganti dengan password MySQL Anda
  database: 'pertasmart'   // Ganti dengan nama database Anda
});

// Koneksi ke database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


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

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});