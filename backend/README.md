# PertaSmart Backend API

Backend API untuk sistem authentication PertaSmart menggunakan Node.js, Express, dan MySQL.

## Prerequisites

- Node.js (v16 atau lebih baru)
- MySQL Database
- npm atau yarn

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database

1. Buka MySQL panel: https://10.9.40.17:36109/database/mysql
2. Login ke MySQL
3. Jalankan SQL script dari file: `/sql/create_auth_table.sql`
4. Pastikan tabel `users` berhasil dibuat
5. Pastikan user `pertasmart@unpad.ac.id` berhasil diinsert

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi database Anda:

```env
DB_HOST=10.9.40.17
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=pertasmart
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 4. Generate Password Hash (Optional)

Jika ingin menggunakan bcrypt untuk password hash, gunakan tool online:
- https://bcrypt-generator.com/
- Input: `pertasmart.unpad!!2025`
- Rounds: 10
- Copy hash dan update di tabel users

Atau gunakan script Node.js:

```javascript
const bcrypt = require('bcrypt');
const password = 'pertasmart.unpad!!2025';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

### 5. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di: http://localhost:5000

## API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "success": true,
  "message": "PertaSmart API is running",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Login
```
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "pertasmart@unpad.ac.id",
      "name": "PERTA SMART Admin",
      "role": "admin"
    }
  }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>
```

## Testing

### Test dengan curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pertasmart@unpad.ac.id","password":"pertasmart.unpad!!2025"}'
```

### Test dengan Postman atau Thunder Client:
1. Import collection atau buat request manual
2. Test endpoint login
3. Copy token dari response
4. Test endpoint verify dengan token

## Troubleshooting

### Error: "ER_ACCESS_DENIED_ERROR"
- Pastikan DB_USER dan DB_PASSWORD sudah benar di .env
- Cek user MySQL memiliki akses ke database

### Error: "ER_BAD_DB_ERROR"
- Pastikan database sudah dibuat
- Cek DB_NAME di .env

### Error: "ECONNREFUSED"
- Pastikan MySQL server berjalan
- Cek DB_HOST dan DB_PORT di .env

### Password tidak match
- Jika menggunakan bcrypt: pastikan hash di database benar
- Jika menggunakan plain password: ubah kode di authController.js (lihat komentar)
