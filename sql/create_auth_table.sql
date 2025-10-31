-- ==============================|| AUTH TABLE SETUP ||============================== --
-- Script untuk membuat tabel users untuk authentication
-- Database: pertasmart (sesuaikan dengan nama database Anda)
-- Jalankan di MySQL panel: https://10.9.40.17:36109/database/mysql

-- Buat database jika belum ada (optional)
-- CREATE DATABASE IF NOT EXISTS pertasmart;
-- USE pertasmart;

-- Tabel users untuk authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert user pertama (pertasmart@unpad.ac.id)
-- Password: pertasmart.unpad!!2025
-- Hash password menggunakan bcrypt (cost factor: 10)
-- IMPORTANT: Password ini adalah hash dari "pertasmart.unpad!!2025"
-- Gunakan bcrypt online tool atau backend untuk generate hash
-- Untuk demo, ini adalah contoh hash (ganti dengan hash yang sebenarnya)

INSERT INTO users (email, password, name, role) VALUES
('pertasmart@unpad.ac.id', '$2a$10$rPxJhVGLZC/8qhW0gYRiSePJ.kYx5.VW3zxN0LqRxPqHT4Y8K.qLO', 'PERTA SMART Admin', 'admin');

-- Verifikasi insert
SELECT * FROM users WHERE email = 'pertasmart@unpad.ac.id';

-- ==============================|| NOTES ||============================== --
-- 1. Password di-hash menggunakan bcrypt untuk keamanan
-- 2. Password asli: pertasmart.unpad!!2025
-- 3. Hash di atas adalah contoh, Anda perlu generate hash yang sebenarnya
-- 4. Gunakan tool online seperti: https://bcrypt-generator.com/
-- 5. Atau gunakan backend Node.js dengan library bcrypt untuk generate hash

-- ==============================|| ALTERNATIVE: Plain Password (NOT RECOMMENDED) ||============================== --
-- Jika ingin test dulu tanpa bcrypt, bisa pakai plain password (TIDAK AMAN untuk production!)
-- INSERT INTO users (email, password, name, role) VALUES
-- ('pertasmart@unpad.ac.id', 'pertasmart.unpad!!2025', 'PERTA SMART Admin', 'admin');
