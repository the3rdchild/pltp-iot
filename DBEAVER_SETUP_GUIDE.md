# DBeaver Setup Guide - PertaSmart MySQL

Panduan lengkap untuk mengatasi masalah "Public Key Retrieval is not allowed" di DBeaver.

## Masalah: Public Key Retrieval Error

Error ini terjadi karena:
1. MySQL 8.0+ menggunakan `caching_sha2_password` sebagai default authentication
2. DBeaver membutuhkan setting tambahan untuk connect

---

## Solusi 1: DBeaver dengan SSH Tunnel (RECOMMENDED)

### Step-by-Step:

#### 1. Buka DBeaver
   - File → New → Database Connection
   - Pilih MySQL
   - Klik Next

#### 2. Tab "Main" (Connection Settings)
   ```
   Host: localhost          ← PENTING: Gunakan localhost, bukan 10.9.40.17!
   Port: 3306
   Database: pertasmart
   Username: (your MySQL username)
   Password: (your MySQL password)
   ```

#### 3. Tab "SSH" (SSH Tunnel)
   ```
   ✅ Use SSH Tunnel

   Host/IP: 10.9.40.17
   Port: 22
   User Name: mipa
   Authentication Method: Password
   Password: (your SSH password)
   ```

#### 4. Tab "Driver Properties"
   Klik "Driver properties" di bagian bawah, lalu tambahkan:

   | Property | Value |
   |----------|-------|
   | allowPublicKeyRetrieval | true |
   | useSSL | false |

   Cara menambahkan:
   - Klik tombol "+" (Add new property)
   - Ketik nama property di kolom kiri
   - Ketik value di kolom kanan

#### 5. Test Connection
   - Klik "Test Connection"
   - Jika muncul "Download driver files", klik Download
   - Tunggu sampai muncul "Connected"

#### 6. Finish
   - Klik "Finish"
   - Database connection siap digunakan!

---

## Solusi 2: Via SSH Command Line (No DBeaver)

Jika DBeaver tetap tidak bisa, gunakan SSH terminal:

### Windows (PowerShell/CMD):
```bash
ssh mipa@10.9.40.17
# Masukkan SSH password

# Setelah login, akses MySQL:
mysql -u your_username -p
# Masukkan MySQL password
```

### Mac/Linux:
```bash
ssh mipa@10.9.40.17
# Masukkan SSH password

# Setelah login, akses MySQL:
mysql -u your_username -p
# Masukkan MySQL password
```

### Setup Database via Command Line:

Setelah login ke MySQL, copy-paste commands dari file:
- `sql/manual_setup.sql`

Atau jalankan satu per satu:

```sql
-- Buat database
CREATE DATABASE IF NOT EXISTS pertasmart;
USE pertasmart;

-- Buat tabel
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

-- Insert user
INSERT INTO users (email, password, name, role) VALUES
('pertasmart@unpad.ac.id', 'pertasmart.unpad!!2025', 'PERTA SMART Admin', 'admin');

-- Verifikasi
SELECT * FROM users;
```

### Automated Script:

Atau gunakan script otomatis:

```bash
# 1. Upload script ke server
scp sql/setup_via_ssh.sh mipa@10.9.40.17:~/

# 2. SSH ke server
ssh mipa@10.9.40.17

# 3. Jalankan script
bash setup_via_ssh.sh

# 4. Masukkan MySQL username dan password saat diminta
```

---

## Solusi 3: phpMyAdmin (Web Interface)

Jika server punya phpMyAdmin:

### 1. Akses via Browser:
   ```
   URL: https://10.9.40.17:36109/phpmyadmin
   atau: http://10.9.40.17/phpmyadmin
   ```

### 2. Login dengan MySQL credentials

### 3. Klik "SQL" tab

### 4. Copy-paste SQL dari `sql/manual_setup.sql`

### 5. Klik "Go"

---

## Solusi 4: MySQL Workbench

Alternative ke DBeaver:

### 1. Download MySQL Workbench:
   https://dev.mysql.com/downloads/workbench/

### 2. Setup Connection:
   - Connection Method: Standard TCP/IP over SSH

   **SSH Parameters:**
   ```
   SSH Hostname: 10.9.40.17:22
   SSH Username: mipa
   SSH Password: (your SSH password)
   ```

   **MySQL Parameters:**
   ```
   MySQL Hostname: 127.0.0.1
   MySQL Port: 3306
   Username: (your MySQL username)
   Password: (your MySQL password)
   ```

### 3. Test Connection → OK

---

## Solusi 5: Fix MySQL User Authentication (Advanced)

Jika punya akses MySQL root, update authentication method:

```sql
-- Login sebagai root
mysql -u root -p

-- Update user authentication
ALTER USER 'your_username'@'localhost'
IDENTIFIED WITH mysql_native_password BY 'your_password';

-- Atau untuk remote access:
ALTER USER 'your_username'@'%'
IDENTIFIED WITH mysql_native_password BY 'your_password';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verifikasi
SELECT user, host, plugin FROM mysql.user WHERE user='your_username';
```

---

## Troubleshooting

### ❌ SSH Connection Failed

**Penyebab**: SSH credentials salah atau port blocked

**Solusi**:
```bash
# Test SSH connection
ssh -v mipa@10.9.40.17

# Test dengan custom port (jika bukan 22)
ssh -p 2222 mipa@10.9.40.17
```

---

### ❌ MySQL Access Denied

**Penyebab**: MySQL username/password salah

**Solusi**:
1. Konfirmasi credentials dengan admin
2. Coba login manual via SSH:
   ```bash
   mysql -u username -p
   ```

---

### ❌ Database 'pertasmart' doesn't exist

**Penyebab**: Database belum dibuat

**Solusi**:
```sql
-- Cek databases yang ada
SHOW DATABASES;

-- Buat database
CREATE DATABASE pertasmart;
```

---

### ❌ Table 'users' doesn't exist

**Penyebab**: Tabel belum dibuat

**Solusi**:
```sql
-- Gunakan database
USE pertasmart;

-- Cek tables
SHOW TABLES;

-- Buat tabel (copy dari sql/manual_setup.sql)
```

---

## Quick Reference

### DBeaver Connection Settings Summary:

```
┌─────────────────────────────────────┐
│ Main Tab                            │
├─────────────────────────────────────┤
│ Host: localhost                     │
│ Port: 3306                          │
│ Database: pertasmart                │
│ Username: your_mysql_user           │
│ Password: your_mysql_pass           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SSH Tab                             │
├─────────────────────────────────────┤
│ ✅ Use SSH Tunnel                   │
│ Host: 10.9.40.17                    │
│ Port: 22                            │
│ Username: mipa                      │
│ Password: your_ssh_pass             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Driver Properties                   │
├─────────────────────────────────────┤
│ allowPublicKeyRetrieval: true       │
│ useSSL: false                       │
└─────────────────────────────────────┘
```

---

## Files Reference

- **SQL Script (Manual)**: `sql/manual_setup.sql`
- **Bash Script (Auto)**: `sql/setup_via_ssh.sh`
- **Original SQL**: `sql/create_auth_table.sql`
- **This Guide**: `DBEAVER_SETUP_GUIDE.md`

---

## Next Steps After Setup

Setelah database berhasil dibuat dan user di-insert:

1. ✅ Verifikasi user ada di database:
   ```sql
   SELECT * FROM users WHERE email = 'pertasmart@unpad.ac.id';
   ```

2. ✅ Setup backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env dengan MySQL credentials
   npm run dev
   ```

3. ✅ Test login di aplikasi:
   - Buka: http://localhost:3000/login
   - Email: pertasmart@unpad.ac.id
   - Password: pertasmart.unpad!!2025

---

## Support

Jika masih ada masalah:

1. **Check SSH Access**:
   ```bash
   ssh -v mipa@10.9.40.17
   ```

2. **Check MySQL Access**:
   ```bash
   ssh mipa@10.9.40.17
   mysql -u username -p
   ```

3. **Check Server Logs**:
   ```bash
   # MySQL error log
   sudo tail -f /var/log/mysql/error.log

   # SSH log
   sudo tail -f /var/log/auth.log
   ```

4. **DBeaver Logs**:
   - Help → Open Log File
   - Cari error messages
