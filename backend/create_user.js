const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: '10.9.40.17',
  user: 'Pertasmart',
  password: 'pertasmart.unpad!!2025',
  database: 'pertasmart'
});

// User data
const userData = {
  email: 'pertasmart@unpad.ac.id',
  password: 'pertasmart.unpad!!2025',
  name: 'Pertasmart Admin'
};

async function createUser() {
  try {
    // Connect to database
    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Connected to MySQL database');

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log('Password hashed successfully');

    // Insert user
    const sql = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
    await new Promise((resolve, reject) => {
      db.query(sql, [userData.email, hashedPassword, userData.name], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log('User created successfully!');
    console.log('Email:', userData.email);
    console.log('Password:', userData.password);

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('User already exists!');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    db.end();
  }
}

createUser();
