# Backend Setup Instructions

## Masalah yang Diperbaiki

1. ✅ **CORS Error**: Ditambahkan `cors` middleware
2. ✅ **Missing Auth Endpoints**: Ditambahkan `/api/auth/login`, `/api/auth/register`, `/api/auth/verify`
3. ✅ **Port Mismatch**: Backend menggunakan port 5000 (sesuai dengan frontend)
4. ✅ **Auto-setup Database**: Tabel dan user otomatis dibuat saat server start

## Cara Menjalankan Backend

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

File `.env` sudah ada dengan konfigurasi:

```
DB_HOST=10.9.40.17
DB_PORT=3306
DB_USER=Pertasmart
DB_PASSWORD=pertasmart.unpad!!2025
DB_NAME=pertasmart
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

### 3. Pastikan MySQL Database Accessible

**Jika database MySQL di `10.9.40.17` tidak bisa diakses**, Anda perlu:

- Pastikan MySQL server running
- Pastikan network/firewall mengizinkan koneksi
- Atau ubah `DB_HOST` di `.env` ke localhost jika MySQL lokal

### 4. Start Server

```bash
node server.js
```

Server akan:
- Berjalan di `http://localhost:5000`
- Otomatis membuat tabel `users` jika belum ada
- Otomatis membuat user default:
  - Email: `pertasmart@unpad.ac.id`
  - Password: `pertasmart.unpad!!2025`
  - Name: `Pertasmart Admin`

## API Endpoints

### Authentication

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "pertasmart@unpad.ac.id",
  "password": "pertasmart.unpad!!2025"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "email": "pertasmart@unpad.ac.id",
      "name": "Pertasmart Admin"
    }
  }
}
```

#### 2. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### 3. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

## Troubleshooting

### Database Connection Error

Jika melihat error:
```
Error connecting to database: Error: connect ETIMEDOUT
```

**Solusi:**
1. Cek apakah MySQL server running di `10.9.40.17`
2. Cek firewall/network access
3. Test koneksi manual: `mysql -h 10.9.40.17 -u Pertasmart -p`
4. Jika perlu, ubah DB_HOST di `.env` ke server MySQL yang accessible

### Port Already in Use

Jika port 5000 sudah digunakan, ubah `PORT` di `.env`:
```
PORT=5001
```

Jangan lupa update frontend `.env` juga:
```
VITE_API_URL=http://localhost:5001/api
```

## Database Schema

Tabel `users` akan otomatis dibuat dengan struktur:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Default Credentials

- **Email**: pertasmart@unpad.ac.id
- **Password**: pertasmart.unpad!!2025

User ini otomatis dibuat saat server pertama kali start (jika database accessible).
