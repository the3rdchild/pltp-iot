#!/bin/bash
# Script untuk setup database via SSH
# Jalankan: bash setup_via_ssh.sh

echo "========================================="
echo "PertaSmart Database Setup via SSH"
echo "========================================="
echo ""

# Prompt untuk MySQL credentials
read -p "MySQL Username: " MYSQL_USER
read -sp "MySQL Password: " MYSQL_PASS
echo ""

# SQL commands
SQL_COMMANDS="
CREATE DATABASE IF NOT EXISTS pertasmart;
USE pertasmart;

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

INSERT INTO users (email, password, name, role) VALUES
('pertasmart@unpad.ac.id', 'pertasmart.unpad!!2025', 'PERTA SMART Admin', 'admin')
ON DUPLICATE KEY UPDATE password='pertasmart.unpad!!2025';

SELECT 'Database setup completed!' as Status;
SELECT * FROM users WHERE email = 'pertasmart@unpad.ac.id';
"

# Execute SQL
echo "Executing SQL commands..."
echo "$SQL_COMMANDS" | mysql -u "$MYSQL_USER" -p"$MYSQL_PASS"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo "========================================="
    echo "User credentials:"
    echo "Email: pertasmart@unpad.ac.id"
    echo "Password: pertasmart.unpad!!2025"
    echo "========================================="
else
    echo ""
    echo "❌ Error occurred during setup"
    echo "Please check your MySQL credentials"
fi
