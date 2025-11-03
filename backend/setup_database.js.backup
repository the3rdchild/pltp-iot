const mysql = require('mysql2');

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: '10.9.40.17',
  user: 'Pertasmart',
  password: 'pertasmart.unpad!!2025',
  database: 'pertasmart'
});

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

async function setupDatabase() {
  try {
    // Connect to database
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Connected to MySQL database');

    // Create users table
    await new Promise((resolve, reject) => {
      db.query(createTableSQL, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log('Users table created successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    db.end();
  }
}

setupDatabase();
