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
DB_HOST=localhost
DB_PORT=5432
DB_NAME= 
DB_USER= 
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

There is **no registration endpoint** — accounts are created by hand in the
database. `/register` in the frontend redirects to `/login`.

**One login, role decides what opens.** Everyone signs in at `/login` and gets a
single bearer token. The `role` on the account is what separates a session that
can only read from one that can rewrite alarm thresholds:

| Role | Can do |
|------|--------|
| `viewer` | Read the dashboard and analytics pages |
| `operator` | Same as viewer (reserved; no endpoint grants it more yet) |
| `admin` | Everything, plus the `/admin/*` pages and the admin endpoints below |

Admin sessions are issued with a **shorter lifetime** than the rest —
`ADMIN_TOKEN_EXPIRES_IN` (default `2h`) instead of `JWT_EXPIRES_IN` (default
`24h`). With one login page the role is the only thing standing between reading
and writing, so a privileged session should not survive an unattended browser
for a full day. `POST /api/auth/login` returns `expiresAt` alongside the token.

### External Data (Honeywell & Edge Computing)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/external/sensor-data` | Receive sensor data | API Key |
| POST | `/api/external/ml-prediction` | Receive ML predictions | API Key |
| POST | `/api/external/batch` | Receive batch data | API Key |
| POST | `/api/external/sensor-data/ulubelu` | Receive sensor data from Ulubelu | API Key |
| POST | `/api/external/batch/ulubelu` | Receive batch data from Ulubelu | API Key |

### Frontend Data

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/data/sensor/latest` | Get latest sensor data | No |
| GET | `/api/data/sensor/range` | Get data by date range | No |
| GET | `/api/data/ml/latest` | Get ML predictions | No |
| GET | `/api/data/field` | Get field data | No |
| POST | `/api/data/field` | Create field data | Yes — role `admin` |
| GET | `/api/data/dashboard/stats` | Dashboard statistics | No |
| GET | `/api/data/metric-limits` | Get alarm thresholds | No |
| POST | `/api/data/metric-limits` | Save/sync alarm thresholds | Yes — role `admin` |

Endpoints marked **role `admin`** require a bearer token whose account has
`users.role = 'admin'`; a missing token gets `401`, a valid token on a
non-admin account gets `403`. The gate lives in `middleware/auth.js`
(`authenticateToken` + `requireRole`) and is enforced server-side —
`ProtectedRoute` in the frontend only decides what to render, so it is not a
substitute for it.

`requireRole` fails closed: an absent or unrecognised `role` claim is refused,
never waved through.

### Managing accounts

`users.role` defaults to `'viewer'` and there is no registration endpoint —
accounts are provisioned by hand with `scripts/manage-user.js`:

```bash
# create an admin
node scripts/manage-user.js admin@unpad.ac.id --role admin --name "Admin"

# rotate a password / change a role on an existing account
node scripts/manage-user.js someone@unpad.ac.id --role viewer

# role change only, leave the password alone
node scripts/manage-user.js someone@unpad.ac.id --role viewer --keep-password

# revoke access without deleting the row
node scripts/manage-user.js someone@unpad.ac.id --deactivate
```

The password is prompted for with echo suppressed. It is never accepted as a
command-line argument — that would put it in shell history and in the process
list — and never written to a file in this repository. For unattended runs set
`USER_PASSWORD` in the environment instead.

The same applies to `scripts/initDatabase.js`, which now requires
`SEED_ADMIN_PASSWORD` rather than carrying a literal.

## 🧪 Testing Endpoints

### Test Ulubelu Single Data

```bash
curl -X POST https://pertasmart.unpad.ac.id/api/external/sensor-data/ulubelu \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "device_id": "ULUBELU_001",
    "timestamp": "2025-12-01T10:00:00Z",
    "temperature": 25.5,
    "pressure": 101.3,
    "flow_rate": 150.0,
    "gen_voltage_V_W": 220.5,
    "gen_voltage_W_U": 221.0,
    "gen_reactive_power": 15.2,
    "gen_output": 500.0,
    "gen_power_factor": 0.95,
    "gen_frequency": 50.0,
    "speed_detection": 1500.0,
    "MCV_L": 75.5,
    "MCV_R": 76.0,
    "TDS": 450.0
  }'
```

### Test Ulubelu Batch Data

```bash
curl -X POST https://pertasmart.unpad.ac.id/api/external/batch/ulubelu \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "data": [
      {
        "device_id": "ULUBELU_001",
        "timestamp": "2025-12-01T10:00:00Z",
        "temperature": 25.5,
        "pressure": 101.3,
        "flow_rate": 150.0
      },
      {
        "device_id": "ULUBELU_002",
        "timestamp": "2025-12-01T10:01:00Z",
        "temperature": 26.0,
        "pressure": 102.0,
        "flow_rate": 155.0
      }
    ]
  }'
```

### Point-to-Point Security Setup

For secure communication from HQ Pertamina to VPS:

1. **Configure VPS Firewall** (allow specific HQ IP):
   ```bash
   # Allow only HQ Pertamina IP
   sudo ufw allow from <HQ_IP_ADDRESS> to any port 5000
   ```

2. **NGINX Configuration** (IP whitelist):
   ```nginx
   location /api/external/ {
       # Allow only HQ Pertamina IP
       allow <HQ_IP_ADDRESS>;
       deny all;

       proxy_pass http://localhost:5000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

3. **Environment Variables** (.env):
   ```env
   # API Key for Ulubelu/HQ Pertamina
   API_KEY_ULUBELU=your_secure_api_key_here
   ALLOWED_IPS=<HQ_IP_ADDRESS>
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

## 📄 License

This project is proprietary to PertaSmart UNPAD.

---

**Version**: 2.70.0  
**Last Updated**: November 2025

Made with ❤️ for PertaSmart UNPAD
