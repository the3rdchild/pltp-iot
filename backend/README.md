# 🚀 PertaSmart Backend API

Backend API untuk sistem monitoring PertaSmart yang menerima data dari Honeywell server dan edge computing, serta menyediakan data untuk frontend React.

## 📋 Features

- ✅ **JWT Authentication** - Secure login system
- ✅ **External Data Reception** - Receive data from Honeywell server
- ✅ **ML Predictions** - Store and retrieve machine learning predictions
- ✅ **Field Data Management** - Manual data input from field operators
- ✅ **RESTful API** - Standard REST endpoints
- ✅ **PostgreSQL Database** - Reliable data storage
- ✅ **Rate Limiting** - Protect against abuse
- ✅ **CORS Support** - Cross-origin requests
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Production Ready** - PM2 process management

## 🏗️ Tech Stack

- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Process Manager**: PM2
- **Web Server**: NGINX

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js         # Database connection & pooling
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── dataController.js   # Frontend data endpoints
│   └── externalController.js # External data reception
├── middleware/
│   └── auth.js             # JWT authentication middleware
├── models/
│   └── init.sql            # Database schema
├── routes/
│   ├── auth.js             # Auth routes
│   ├── data.js             # Data routes
│   └── external.js         # External data routes
├── scripts/
│   └── initDatabase.js     # DB initialization script
├── .env                    # Environment variables
├── .gitignore              # Git ignore rules
├── deploy.sh               # Deployment script
├── package.json            # Dependencies
└── server.js               # Main application
```

## 🔧 Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- PM2 (for production)
- NGINX (for reverse proxy)

### Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd /www/wwwroot/frontend/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Edit .env file if needed
   nano .env
   ```

4. **Initialize database:**
   ```bash
   npm run init-db
   ```

5. **Start the server:**
   
   **Development:**
   ```bash
   npm run dev
   ```
   
   **Production:**
   ```bash
   npm start
   # or use deployment script
   chmod +x deploy.sh
   sudo ./deploy.sh
   ```

## 🔑 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=10.9.40.17
DB_PORT=5432
DB_NAME=pertasmart_db
DB_USER=pertasmart_user
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://pertasmart.unpad.ac.id

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Database Schema

### Tables

1. **users** - User accounts for authentication
2. **sensor_data** - Data from Honeywell sensors
3. **field_data** - Manual field data input
4. **ml_predictions** - Machine learning predictions

### Relationships

- `field_data.created_by` → `users.id`
- `ml_predictions.sensor_data_id` → `sensor_data.id`

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/verify` | Verify token | Yes |

### External Data (Honeywell & Edge Computing)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/external/sensor-data` | Receive sensor data | No |
| POST | `/api/external/ml-prediction` | Receive ML predictions | No |
| POST | `/api/external/batch` | Receive batch data | No |

### Frontend Data

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/data/sensor/latest` | Get latest sensor data | No |
| GET | `/api/data/sensor/range` | Get data by date range | No |
| GET | `/api/data/ml/latest` | Get ML predictions | No |
| GET | `/api/data/field` | Get field data | No |
| POST | `/api/data/field` | Create field data | Yes |
| GET | `/api/data/dashboard/stats` | Dashboard statistics | No |

## 🔐 Authentication

### Login Request

```bash
curl -X POST https://pertasmart.unpad.ac.id/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pertasmart@unpad.ac.id",
    "password": "pertasmart.unpad!!2025"
  }'
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "pertasmart@unpad.ac.id",
      "name": "PertaSmart Admin",
      "role": "admin"
    }
  }
}
```

### Using Token

Include token in Authorization header:

```bash
curl -X GET https://pertasmart.unpad.ac.id/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📡 Example: Sending Sensor Data

```bash
curl -X POST https://pertasmart.unpad.ac.id/api/external/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "HW-001",
    "timestamp": "2025-11-05T10:30:00Z",
    "temperature": 85.5,
    "pressure": 1013.25,
    "flow_rate": 150.8,
    "humidity": 65.2,
    "voltage": 220.5,
    "current": 10.2,
    "status": "normal"
  }'
```

## 🔧 PM2 Commands

```bash
# Start application
pm2 start server.js --name pertasmart-api

# Restart application
pm2 restart pertasmart-api

# Stop application
pm2 stop pertasmart-api

# View logs
pm2 logs pertasmart-api

# Monitor
pm2 monit

# Application status
pm2 status

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

## 📝 Logging

Logs are available through:

1. **PM2 Logs:**
   ```bash
   pm2 logs pertasmart-api
   ```

2. **NGINX Logs:**
   ```bash
   tail -f /www/wwwlogs/pertasmart.unpad.ac.id.log
   tail -f /www/wwwlogs/pertasmart.unpad.ac.id.error.log
   ```

## 🐛 Troubleshooting

### Backend not starting

```bash
# Check logs
pm2 logs pertasmart-api

# Check if port is in use
netstat -tlnp | grep 5000

# Restart PM2
pm2 restart pertasmart-api
```

### Database connection issues

```bash
# Test database connection
psql -h 10.9.40.17 -p 5432 -U pertasmart_user -d pertasmart_db

# Check WireGuard status
wg show

# Restart WireGuard
systemctl restart wg-quick@wg0
```

### NGINX 502 Bad Gateway

```bash
# Check backend status
pm2 status

# Check if backend is listening
netstat -tlnp | grep 5000

# Test NGINX config
nginx -t

# Reload NGINX
systemctl reload nginx
```

## 🔒 Security Considerations

1. **Change Default Credentials** - Update default email and password
2. **JWT Secret** - Generate strong random JWT secret
3. **HTTPS Only** - Always use SSL/TLS in production
4. **Rate Limiting** - Configure appropriate rate limits
5. **CORS** - Set specific allowed origins
6. **Database Access** - Use secure WireGuard tunnel
7. **Environment Variables** - Never commit .env to git

## 📈 Performance

- **Connection Pooling**: PostgreSQL connection pool (max 20)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Caching**: Static file caching via NGINX
- **Compression**: Gzip compression enabled
- **PM2 Clustering**: Can be enabled for multi-core systems

## 🔄 Updates & Deployment

### Quick Deployment

```bash
cd /www/wwwroot/frontend/backend
sudo ./deploy.sh
```

### Manual Deployment

```bash
cd /www/wwwroot/frontend/backend
git pull  # if using git
npm install --production
pm2 restart pertasmart-api
nginx -t && systemctl reload nginx
```

## 📚 Additional Documentation

- [Setup Guide](SETUP_GUIDE.md) - Complete setup instructions
- [API Testing](API_TESTING.md) - API testing examples
- [NGINX Config](nginx-config/) - NGINX configuration files

## 👥 Default Login

- **Email**: pertasmart@unpad.ac.id
- **Password**: pertasmart.unpad!!2025

**⚠️ IMPORTANT**: Change these credentials in production!

## 📞 Support

For issues or questions:
1. Check logs: `pm2 logs pertasmart-api`
2. Review NGINX logs
3. Verify database connection
4. Check firewall rules

## 📄 License

This project is proprietary to PertaSmart UNPAD.

---

**Version**: 1.0.0  
**Last Updated**: November 2025

Made with ❤️ for PertaSmart UNPAD
