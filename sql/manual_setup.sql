-- ========================================
-- PertaSmart Database Setup (Manual)
-- ========================================
-- Copy dan paste commands ini satu per satu ke MySQL CLI atau phpMyAdmin

-- 1. Buat database
CREATE DATABASE IF NOT EXISTS pertasmart;

-- 2. Gunakan database
USE pertasmart;

-- 3. Buat tabel users
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

-- 4. Insert user admin
-- PENTING: Ini menggunakan plain password untuk testing
-- Untuk production, gunakan bcrypt hash!
INSERT INTO users (email, password, name, role) VALUES
('pertasmart@unpad.ac.id', 'pertasmart.unpad!!2025', 'PERTA SMART Admin', 'admin')
ON DUPLICATE KEY UPDATE password='pertasmart.unpad!!2025';

-- 5. Verifikasi insert
SELECT * FROM users WHERE email = 'pertasmart@unpad.ac.id';

-- 6. Lihat semua users
SELECT id, email, name, role, is_active, created_at FROM users;

-- ========================================
-- Additional Users (Optional)
-- ========================================

-- Tambah user biasa
-- INSERT INTO users (email, password, name, role) VALUES
-- ('user@example.com', 'password123', 'Test User', 'user');

-- Update password user
-- UPDATE users SET password = 'new_password' WHERE email = 'pertasmart@unpad.ac.id';

-- Nonaktifkan user
-- UPDATE users SET is_active = FALSE WHERE email = 'user@example.com';

-- Hapus user
-- DELETE FROM users WHERE email = 'user@example.com';

-- ========================================
-- Troubleshooting
-- ========================================

-- Cek struktur tabel
DESCRIBE users;

-- Cek semua tables di database
SHOW TABLES;

-- Cek database yang ada
SHOW DATABASES;

-- Cek user MySQL
SELECT user, host FROM mysql.user;
