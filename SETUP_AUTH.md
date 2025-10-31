# Setup Authentication Flow - PertaSmart

Panduan lengkap untuk setup authentication dengan MySQL di PertaSmart.

## Arsitektur

```
Frontend (React) <---> Backend API (Node.js + Express) <---> MySQL Database
```

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT (JSON Web Token)
- Password: Bcrypt hash

## Step-by-Step Setup

### 1. Setup Database MySQL

1. **Akses MySQL Panel**: https://10.9.40.17:36109/database/mysql
2. **Login** dengan credentials MySQL Anda
3. **Buat Database** (jika belum ada):
   ```sql
   CREATE DATABASE pertasmart;
   ```
4. **Pilih Database**: `USE pertasmart;`
5. **Jalankan SQL Script**: Copy dan paste dari file `/sql/create_auth_table.sql`

#### Isi SQL Script:

```sql
-- Buat tabel users
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
```

6. **Insert User Pertama**:

**PILIHAN A: Menggunakan Bcrypt Hash (RECOMMENDED - Aman)**
```sql
-- Generate hash dari password "pertasmart.unpad!!2025" di https://bcrypt-generator.com/
-- Pilih rounds: 10
-- Contoh hash: $2a$10$rPxJhVGLZC/8qhW0gYRiSePJ.kYx5.VW3zxN0LqRxPqHT4Y8K.qLO

INSERT INTO users (email, password, name, role) VALUES
('pertasmart@unpad.ac.id', 'HASH_DARI_BCRYPT_GENERATOR', 'PERTA SMART Admin', 'admin');
```

**PILIHAN B: Plain Password (HANYA UNTUK TESTING - Tidak Aman)**
```sql
INSERT INTO users (email, password, name, role) VALUES
('pertasmart@unpad.ac.id', 'pertasmart.unpad!!2025', 'PERTA SMART Admin', 'admin');
```

⚠️ **PENTING**: Jika menggunakan plain password, Anda harus update kode di backend!

7. **Verifikasi Insert**:
   ```sql
   SELECT * FROM users WHERE email = 'pertasmart@unpad.ac.id';
   ```

---

### 2. Setup Backend API

1. **Masuk ke folder backend**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Edit file `.env`**:
   ```env
   DB_HOST=10.9.40.17
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=pertasmart
   JWT_SECRET=pertasmart_jwt_secret_key_2025
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. **Jika menggunakan PLAIN PASSWORD** (Pilihan B), edit file `backend/controllers/authController.js`:

   Cari baris ini (sekitar line 35):
   ```javascript
   const isPasswordValid = await bcrypt.compare(password, user.password);
   ```

   Ganti dengan:
   ```javascript
   const isPasswordValid = password === user.password;
   ```

6. **Start backend server**:
   ```bash
   # Development mode
   npm run dev

   # Atau production mode
   npm start
   ```

7. **Verifikasi server berjalan**:
   - Buka: http://localhost:5000/api/health
   - Harus muncul: `{"success": true, "message": "PertaSmart API is running"}`

---

### 3. Setup Frontend

1. **Kembali ke root project**:
   ```bash
   cd ..
   ```

2. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Edit file `.env`**:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Install dependencies** (jika belum):
   ```bash
   npm install
   ```

5. **Start frontend**:
   ```bash
   npm start
   ```

6. **Akses aplikasi**: http://localhost:3000

---

### 4. Test Login Flow

1. **Buka browser**: http://localhost:3000/login
2. **Input credentials**:
   - Email: `pertasmart@unpad.ac.id`
   - Password: `pertasmart.unpad!!2025`
3. **Klik Login**
4. **Jika berhasil**: Redirect ke `/dashboard`
5. **Jika gagal**: Periksa console browser (F12) dan terminal backend untuk error

---

## Troubleshooting

### ❌ "Failed to fetch" atau "Network Error"

**Penyebab**: Backend tidak berjalan atau CORS issue

**Solusi**:
1. Pastikan backend berjalan di http://localhost:5000
2. Cek terminal backend untuk error
3. Test endpoint: `curl http://localhost:5000/api/health`

---

### ❌ "Invalid email or password"

**Penyebab**: Password tidak cocok

**Solusi**:

**Jika menggunakan Bcrypt**:
1. Generate hash baru di: https://bcrypt-generator.com/
2. Input: `pertasmart.unpad!!2025`
3. Rounds: 10
4. Update hash di database:
   ```sql
   UPDATE users
   SET password = 'HASH_BARU_DARI_GENERATOR'
   WHERE email = 'pertasmart@unpad.ac.id';
   ```

**Jika menggunakan Plain Password**:
1. Pastikan sudah edit `authController.js` (lihat Step 2.5)
2. Restart backend server

---

### ❌ Database Connection Error

**Penyebab**: Kredensial database salah

**Solusi**:
1. Cek file `backend/.env`
2. Pastikan `DB_USER`, `DB_PASSWORD`, `DB_NAME` benar
3. Test koneksi MySQL dari terminal:
   ```bash
   mysql -h 10.9.40.17 -u USERNAME -p
   ```

---

### ❌ Token tidak tersimpan

**Penyebab**: LocalStorage issue atau CORS

**Solusi**:
1. Buka DevTools (F12) > Application > Local Storage
2. Pastikan `token` dan `user` tersimpan
3. Cek CORS di backend (seharusnya sudah diatur)

---

## Testing dengan curl

### Test Health Check:
```bash
curl http://localhost:5000/api/health
```

### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pertasmart@unpad.ac.id","password":"pertasmart.unpad!!2025"}'
```

Response sukses:
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

### Test Verify Token:
```bash
# Ganti YOUR_TOKEN dengan token dari response login
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## File Structure

```
pltp/
├── backend/                    # Backend API
│   ├── config/
│   │   └── database.js        # MySQL connection config
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── routes/
│   │   └── authRoutes.js      # API routes
│   ├── .env                   # Backend environment variables
│   ├── server.js              # Express server
│   └── package.json
│
├── sql/
│   └── create_auth_table.sql  # SQL script untuk setup database
│
├── src/
│   ├── services/
│   │   └── authService.js     # Frontend API service
│   ├── sections/auth/
│   │   └── AuthLogin.jsx      # Login form component
│   └── routes/
│       └── index.jsx          # Routes config
│
├── .env                       # Frontend environment variables
└── SETUP_AUTH.md             # Dokumentasi ini
```

---

## Next Steps

Setelah login berhasil, Anda bisa:

1. **Protect Routes**: Tambahkan route guard untuk halaman yang perlu authentication
2. **Add Logout**: Implement logout functionality
3. **Session Management**: Handle token expiry dan refresh token
4. **User Profile**: Buat halaman user profile
5. **Role-based Access**: Implement authorization berdasarkan role (admin/user)

---

## Security Notes

⚠️ **PENTING untuk Production**:

1. **JANGAN** gunakan plain password di production
2. **SELALU** gunakan HTTPS untuk production
3. **Ganti** JWT_SECRET dengan yang lebih aman
4. **Implement** rate limiting untuk login endpoint
5. **Add** refresh token mechanism
6. **Enable** secure cookies untuk token storage
7. **Validate** dan sanitize semua input
8. **Log** failed login attempts

---

## Support

Jika ada masalah:
1. Cek console browser (F12)
2. Cek terminal backend untuk error logs
3. Cek MySQL logs
4. Baca dokumentasi di `backend/README.md`
