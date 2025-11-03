# Backend Deployment ke Production Server

## Status Saat Ini

✅ Frontend menggunakan endpoint: `https://pertasmart.unpad.ac.id/be/api`
❌ Backend belum di-deploy ke production server (saat ini return 404)

## Yang Perlu Dilakukan

### 1. Deploy Backend ke Production Server

Backend Node.js perlu di-deploy ke server `pertasmart.unpad.ac.id`. Ada beberapa cara:

#### Option A: Deploy dengan PM2 (Recommended)

```bash
# Di server production
cd /path/to/backend
npm install
npm install -g pm2

# Start dengan PM2
pm2 start server.js --name "pertasmart-api"
pm2 save
pm2 startup
```

#### Option B: Deploy dengan systemd service

Buat file `/etc/systemd/system/pertasmart-api.service`:

```ini
[Unit]
Description=Pertasmart API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/pltp/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Kemudian:
```bash
sudo systemctl daemon-reload
sudo systemctl start pertasmart-api
sudo systemctl enable pertasmart-api
```

### 2. Setup Nginx Reverse Proxy

Backend Node.js akan berjalan di port 5000 (internal). Nginx perlu dikonfigurasi untuk proxy ke port tersebut.

Edit nginx config (biasanya di `/etc/nginx/sites-available/pertasmart.unpad.ac.id`):

```nginx
server {
    listen 443 ssl http2;
    server_name pertasmart.unpad.ac.id;

    # SSL certificates
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Frontend (existing)
    location / {
        root /path/to/pltp/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - TAMBAHKAN INI
    location /be/api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Penjelasan:**
- Request ke `https://pertasmart.unpad.ac.id/be/api/auth/login` akan di-proxy ke `http://localhost:5000/api/auth/login`
- Trailing slash (`/api/`) penting untuk rewrite path yang benar

Reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Setup Database Production

Pastikan MySQL database sudah ready di server production dengan:

```sql
-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS pertasmart;

-- Buat user jika belum ada
CREATE USER IF NOT EXISTS 'Pertasmart'@'localhost' IDENTIFIED BY 'pertasmart.unpad!!2025';
GRANT ALL PRIVILEGES ON pertasmart.* TO 'Pertasmart'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Update .env di Production Server

Edit `/path/to/pltp/backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=Pertasmart
DB_PASSWORD=pertasmart.unpad!!2025
DB_NAME=pertasmart

# JWT Secret (use strong secret in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (untuk CORS)
FRONTEND_URL=https://pertasmart.unpad.ac.id
```

### 5. Security Checklist

- [ ] Ganti `JWT_SECRET` dengan value yang random dan aman
- [ ] Setup firewall untuk block external access ke port 5000
- [ ] Setup SSL certificate (Let's Encrypt recommended)
- [ ] Setup log rotation untuk Node.js logs
- [ ] Enable HTTPS only (redirect HTTP to HTTPS)
- [ ] Setup backup database reguler
- [ ] Monitor server resources (CPU, Memory, Disk)

### 6. Test Deployment

Setelah deploy, test endpoints:

```bash
# Test health check
curl https://pertasmart.unpad.ac.id/be/api/data

# Test login
curl -X POST https://pertasmart.unpad.ac.id/be/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pertasmart@unpad.ac.id","password":"pertasmart.unpad!!2025"}'
```

### 7. Monitoring

Setup monitoring dengan PM2:
```bash
pm2 monit
pm2 logs pertasmart-api
```

## Troubleshooting

### Backend 404 Not Found

**Symptom:** `curl https://pertasmart.unpad.ac.id/be/api/data` return 404

**Solution:**
1. Cek apakah Node.js server running: `pm2 status` atau `systemctl status pertasmart-api`
2. Cek nginx config: `sudo nginx -t`
3. Cek nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Cek apakah port 5000 listening: `netstat -tlnp | grep 5000`

### CORS Error

**Symptom:** Browser console show CORS error

**Solution:**
1. Pastikan `FRONTEND_URL` di `.env` benar
2. Atau ubah CORS config di `server.js` jadi wildcard untuk development:
   ```javascript
   app.use(cors({
     origin: 'https://pertasmart.unpad.ac.id'
   }));
   ```

### Database Connection Error

**Symptom:** Login return "Database error"

**Solution:**
1. Cek MySQL running: `sudo systemctl status mysql`
2. Test connection: `mysql -u Pertasmart -p pertasmart`
3. Cek database logs: `sudo tail -f /var/log/mysql/error.log`

## Current Setup Summary

- **Frontend**: Deploy ke `https://pertasmart.unpad.ac.id/`
- **Backend**: Perlu di-deploy ke port 5000 di server yang sama
- **API Endpoint**: `https://pertasmart.unpad.ac.id/be/api`
- **Database**: MySQL di `10.9.40.17` atau `localhost` production server
