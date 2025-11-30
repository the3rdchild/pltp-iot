# PertaSmart System Architecture Diagrams

**Version:** 1.0
**Last Updated:** 2025-01-29

---

## 1. VPS System Architecture

### 1.1 Minimum Detail (High-Level Overview)

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet (HTTPS)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   VPS Server         │
              │  pertasmart.unpad    │
              │  (10.9.40.17)        │
              └──────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   PostgreSQL DB      │
              │   (pertasmart_db)    │
              └──────────────────────┘
```

**Components:**
- **Internet Access:** HTTPS connections from external systems
- **VPS Server:** Main application server hosting backend API
- **Database:** PostgreSQL for data storage

---

### 1.2 Medium Detail (Component View)

```
┌────────────────────────────────────────────────────────────────────────┐
│                         External Clients                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐      │
│  │  Honeywell PHD  │  │   Frontend App  │  │   Mobile App     │      │
│  │  Export Service │  │   (Dashboard)   │  │   (Engineers)    │      │
│  └────────┬────────┘  └────────┬────────┘  └─────────┬────────┘      │
└───────────┼────────────────────┼──────────────────────┼───────────────┘
            │                    │                      │
            │ HTTPS              │ HTTPS                │ HTTPS
            │ API Key            │ JWT Token            │ JWT Token
            │                    │                      │
            ▼                    ▼                      ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    VPS: pertasmart.unpad.ac.id                        │
│                         (10.9.40.17)                                  │
│   ┌───────────────────────────────────────────────────────────────┐  │
│   │                    NGINX Reverse Proxy                        │  │
│   │  - SSL/TLS Termination (Port 443)                             │  │
│   │  - Load Balancing                                             │  │
│   │  - Static File Serving                                        │  │
│   └─────────────────────────┬─────────────────────────────────────┘  │
│                             │                                         │
│                             ▼                                         │
│   ┌───────────────────────────────────────────────────────────────┐  │
│   │              Node.js Backend (PM2)                            │  │
│   │                  Port: 5000                                   │  │
│   │  ┌─────────────────────────────────────────────────────────┐ │  │
│   │  │  - Express.js Framework                                 │ │  │
│   │  │  - API Routes (auth, external, data)                    │ │  │
│   │  │  - Middleware (CORS, Helmet, Rate Limit, API Key Auth)  │ │  │
│   │  └─────────────────────────────────────────────────────────┘ │  │
│   └─────────────────────────┬─────────────────────────────────────┘  │
│                             │                                         │
│                             ▼                                         │
│   ┌───────────────────────────────────────────────────────────────┐  │
│   │              PostgreSQL Database                              │  │
│   │                  Port: 5432                                   │  │
│   │  - Database: pertasmart_db                                    │  │
│   │  - Tables: sensor_data, devices, api_logs, ml_predictions    │  │
│   └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **NGINX:** Handles SSL/TLS, reverse proxy, static files
- **Node.js Backend:** Express API with PM2 process manager
- **PostgreSQL:** Main data storage
- **Security:** API Key auth for external, JWT for web/mobile

---

### 1.3 Detailed View (Full Stack)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              External Systems & Clients                              │
│                                                                                      │
│  ┌─────────────────────────┐  ┌───────────────────┐  ┌────────────────────────┐   │
│  │   Honeywell PHD         │  │  Web Dashboard    │  │   Mobile Application   │   │
│  │   Shadow Server         │  │  (React/Vue)      │  │   (Field Engineers)    │   │
│  │  - IP: 10.242.1.122     │  │                   │  │                        │   │
│  │  - Export Service       │  │                   │  │                        │   │
│  │  - Batch/Real-time      │  │                   │  │                        │   │
│  └───────────┬─────────────┘  └─────────┬─────────┘  └──────────┬─────────────┘   │
└──────────────┼────────────────────────────┼──────────────────────┼──────────────────┘
               │                            │                      │
               │ POST /api/external/*       │ GET/POST /api/*      │ GET/POST /api/*
               │ Auth: Bearer API_KEY       │ Auth: Bearer JWT     │ Auth: Bearer JWT
               │ TLS 1.2+                   │ TLS 1.2+             │ TLS 1.2+
               │                            │                      │
               ▼                            ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                           VPS Infrastructure                                         │
│                      pertasmart.unpad.ac.id (111.223.x.x)                           │
│                        Internal IP: 10.9.40.17                                       │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │                          NGINX (Port 443/80)                                   │ │
│  │  ┌──────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  SSL/TLS: Let's Encrypt, TLSv1.2/1.3                                     │ │ │
│  │  │  Proxy: http://localhost:5000                                            │ │ │
│  │  │  Max Body: 10MB, Timeout: 60s                                            │ │ │
│  │  └──────────────────────────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────┬─────────────────────────────────────────────────┘ │
│                                 │                                                   │
│                                 ▼                                                   │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │                    Node.js Application (PM2) - Port 5000                       │ │
│  │                                                                                │ │
│  │  Middleware Stack: Helmet → CORS → Rate Limit → Body Parser → Morgan         │ │
│  │                                                                                │ │
│  │  Routes:                                                                       │ │
│  │  /api/auth         - POST /login, GET /verify                                 │ │
│  │  /api/external     - POST /sensor-data, /batch, /ml-prediction [API Key]     │ │
│  │  /api/data         - GET /sensor/*, /ml/*, /dashboard/* [JWT]                │ │
│  │  /api/data-test    - GET/POST /sensor/export [No Auth]                        │ │
│  │                                                                                │ │
│  │  Controllers → Models → Database Pool (20 connections)                        │ │
│  └──────────────────────────────┬─────────────────────────────────────────────────┘ │
│                                 │                                                   │
│                                 ▼                                                   │
│  ┌────────────────────────────────────────────────────────────────────────────────┐ │
│  │              PostgreSQL 14+ (Port 5432)                                        │ │
│  │  Database: pertasmart_db                                                       │ │
│  │  Tables: sensor_data, ml_predictions, devices, users, api_logs                │ │
│  │  Users: postgres (admin), pertasmart_user (app + read-only)                   │ │
│  └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                      │
│  System Services: SSH (22), WireGuard VPN (51820), UFW Firewall, Fail2Ban          │
└──────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                    Remote Access (Honeywell Engineers via VPN)                       │
│  WireGuard VPN → SSH Tunnel → DBeaver → PostgreSQL (Read-only)                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Database System Architecture

### 2.1 Minimum Detail (Database Overview)

```
┌────────────────────────────────────┐
│      PostgreSQL Server             │
│      (pertasmart_db)               │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  sensor_data                 │  │
│  │  ml_predictions              │  │
│  │  devices                     │  │
│  │  users                       │  │
│  │  api_logs                    │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Core Tables:**
- **sensor_data:** Time-series readings from Honeywell PHD
- **ml_predictions:** Machine learning predictions
- **devices:** Device registry
- **users:** Application users
- **api_logs:** API access logs

---

### 2.2 Medium Detail (Schema View)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PostgreSQL: pertasmart_db                            │
│                         Host: 10.9.40.17:5432                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  TABLE: sensor_data (~1M rows, ~500 MB)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  - id (SERIAL PRIMARY KEY)                                              │
│  - device_id (VARCHAR) → FK to devices                                  │
│  - timestamp (TIMESTAMPTZ)                                              │
│  - temperature, pressure, flow_rate (DECIMAL)                           │
│  - gen_output, gen_voltage_V_W, gen_voltage_W_U (DECIMAL)               │
│  - gen_reactive_power, gen_power_factor, gen_frequency (DECIMAL)        │
│  - speed_detection, MCV_L, MCV_R, TDS (DECIMAL)                         │
│  - created_at (TIMESTAMP)                                               │
│                                                                         │
│  Indexes: (device_id, timestamp DESC), UNIQUE(device_id, timestamp)    │
│  Partitioning: Monthly by timestamp                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  TABLE: ml_predictions (~100k rows, ~50 MB)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  - id (SERIAL PRIMARY KEY)                                              │
│  - device_id (VARCHAR) → FK to devices                                  │
│  - timestamp (TIMESTAMPTZ)                                              │
│  - prediction_type (VARCHAR)                                            │
│  - prediction_value, confidence_score (DECIMAL)                         │
│  - model_version (VARCHAR)                                              │
│  - metadata (JSONB)                                                     │
│                                                                         │
│  Indexes: (device_id, timestamp DESC), (prediction_type)               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  TABLE: devices (~50 rows)                                              │
├─────────────────────────────────────────────────────────────────────────┤
│  - id (SERIAL PRIMARY KEY)                                              │
│  - device_id (VARCHAR UNIQUE)                                           │
│  - device_name, location, device_type (VARCHAR)                         │
│  - status (active/inactive/maintenance)                                 │
│  - last_seen (TIMESTAMPTZ)                                              │
│                                                                         │
│  Examples: KMJ_UNIT1, KMJ_UNIT2, KMJ_UNIT3                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  TABLE: users (~20 rows)                                                │
├─────────────────────────────────────────────────────────────────────────┤
│  - id (SERIAL PRIMARY KEY)                                              │
│  - username, email (VARCHAR UNIQUE)                                     │
│  - password_hash (VARCHAR bcrypt)                                       │
│  - role (admin/user/engineer)                                           │
│  - is_active, last_login                                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  TABLE: api_logs (~500k rows, ~200 MB, 90-day retention)                │
├─────────────────────────────────────────────────────────────────────────┤
│  - id (BIGSERIAL PRIMARY KEY)                                           │
│  - endpoint, method, status_code                                        │
│  - ip_address, user_agent                                               │
│  - response_time_ms, error_message                                      │
│                                                                         │
│  Indexes: (created_at DESC), (endpoint), (status_code)                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  Database Users:                                                        │
│  - postgres (superuser) - Admin only                                    │
│  - pertasmart_user (app) - Full R/W access                              │
│  - pertasmart_user (readonly) - SELECT only for Honeywell               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.3 Detailed View (Full Database Architecture)

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL 14+ Database Server                            │
│                            Host: 10.9.40.17:5432                                  │
│                         Database: pertasmart_db (UTF-8)                           │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                            Connection Layer                                       │
├───────────────────────────────────────────────────────────────────────────────────┤
│  Application Pool (Node.js):                                                      │
│  - Max: 20 connections, Idle timeout: 30s, Connection timeout: 10s               │
│                                                                                   │
│  Remote Access (Honeywell):                                                       │
│  - WireGuard VPN → SSH Tunnel (mipa@10.9.40.17:22) → DBeaver → PostgreSQL       │
│  - User: pertasmart_user (read-only), Max connections: 5                         │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                              Schema: public                                       │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  sensor_data (Time-series sensor readings)                              │    │
│  │  Rows: ~1,000,000+ | Storage: ~500 MB | Growth: ~50k rows/day           │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  Columns:                                                               │    │
│  │  - id SERIAL PRIMARY KEY                                                │    │
│  │  - device_id VARCHAR(50) NOT NULL → FK devices(device_id)               │    │
│  │  - timestamp TIMESTAMPTZ NOT NULL                                       │    │
│  │  - temperature DECIMAL(10,2)                                            │    │
│  │  - pressure DECIMAL(10,2)                                               │    │
│  │  - flow_rate DECIMAL(10,2)                                              │    │
│  │  - gen_voltage_V_W DECIMAL(10,2)                                        │    │
│  │  - gen_voltage_W_U DECIMAL(10,2)                                        │    │
│  │  - gen_reactive_power DECIMAL(10,2)                                     │    │
│  │  - gen_output DECIMAL(10,2)                                             │    │
│  │  - gen_power_factor DECIMAL(5,3)  CHECK (0 to 1)                        │    │
│  │  - gen_frequency DECIMAL(6,2)  CHECK (45 to 55 Hz)                      │    │
│  │  - speed_detection DECIMAL(10,2)                                        │    │
│  │  - MCV_L, MCV_R DECIMAL(5,2)                                            │    │
│  │  - TDS DECIMAL(10,2)                                                    │    │
│  │  - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       │    │
│  │                                                                          │    │
│  │  Indexes:                                                               │    │
│  │  - PRIMARY KEY (id)                                                     │    │
│  │  - idx_sensor_device_time (device_id, timestamp DESC)                   │    │
│  │  - UNIQUE uq_device_timestamp (device_id, timestamp)                    │    │
│  │                                                                          │    │
│  │  Partitioning: Range by timestamp (monthly)                             │    │
│  │  - sensor_data_2025_01, sensor_data_2025_02, ... (auto-created)         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  ml_predictions (ML model outputs)                                      │    │
│  │  Rows: ~100,000+ | Storage: ~50 MB | Growth: ~5k rows/day               │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  Columns:                                                               │    │
│  │  - id SERIAL PRIMARY KEY                                                │    │
│  │  - device_id VARCHAR(50) NOT NULL → FK devices(device_id)               │    │
│  │  - timestamp TIMESTAMPTZ NOT NULL                                       │    │
│  │  - prediction_type VARCHAR(50) (anomaly_detection, forecasting, etc)    │    │
│  │  - prediction_value DECIMAL(10,4)                                       │    │
│  │  - confidence_score DECIMAL(5,4)  CHECK (0 to 1)                        │    │
│  │  - model_version VARCHAR(20)                                            │    │
│  │  - metadata JSONB (processing_time_ms, features_used, etc)              │    │
│  │  - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       │    │
│  │                                                                          │    │
│  │  Indexes:                                                               │    │
│  │  - PRIMARY KEY (id)                                                     │    │
│  │  - idx_ml_device_time (device_id, timestamp DESC)                       │    │
│  │  - idx_ml_type (prediction_type)                                        │    │
│  │  - idx_ml_metadata GIN (metadata jsonb_path_ops)                        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  devices (Device registry)                                              │    │
│  │  Rows: ~50 | Storage: <1 MB                                             │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  Columns:                                                               │    │
│  │  - id SERIAL PRIMARY KEY                                                │    │
│  │  - device_id VARCHAR(50) UNIQUE NOT NULL                                │    │
│  │  - device_name VARCHAR(100)                                             │    │
│  │  - location VARCHAR(100)  (e.g., "Kamojang Unit 1")                     │    │
│  │  - device_type VARCHAR(50)                                              │    │
│  │  - status VARCHAR(20)  CHECK (active, inactive, maintenance)            │    │
│  │  - last_seen TIMESTAMPTZ                                                │    │
│  │  - metadata JSONB                                                       │    │
│  │  - created_at, updated_at TIMESTAMP                                     │    │
│  │                                                                          │    │
│  │  Sample data:                                                           │    │
│  │  - KMJ_UNIT1: "Kamojang Unit 1", status: active                         │    │
│  │  - KMJ_UNIT2: "Kamojang Unit 2", status: active                         │    │
│  │  - KMJ_UNIT3: "Kamojang Unit 3", status: active                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  users (Application users for JWT auth)                                 │    │
│  │  Rows: ~20 | Storage: <1 MB                                             │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  Columns:                                                               │    │
│  │  - id SERIAL PRIMARY KEY                                                │    │
│  │  - username VARCHAR(50) UNIQUE NOT NULL                                 │    │
│  │  - email VARCHAR(100) UNIQUE NOT NULL                                   │    │
│  │  - password_hash VARCHAR(255) (bcrypt)  CHECK (length >= 60)            │    │
│  │  - role VARCHAR(20)  CHECK (admin, user, engineer)                      │    │
│  │  - is_active BOOLEAN DEFAULT true                                       │    │
│  │  - last_login TIMESTAMPTZ                                               │    │
│  │  - created_at, updated_at TIMESTAMP                                     │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  api_logs (API audit trail)                                             │    │
│  │  Rows: ~500,000+ | Storage: ~200 MB | Retention: 90 days                │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │  Columns:                                                               │    │
│  │  - id BIGSERIAL PRIMARY KEY                                             │    │
│  │  - endpoint VARCHAR(255)  (e.g., "/api/external/sensor-data")           │    │
│  │  - method VARCHAR(10)  (GET, POST, PUT, DELETE)                         │    │
│  │  - status_code INTEGER  (200, 201, 400, 401, 500, etc)                  │    │
│  │  - ip_address VARCHAR(45)  (IPv4/IPv6)                                  │    │
│  │  - user_agent TEXT                                                      │    │
│  │  - response_time_ms INTEGER                                             │    │
│  │  - error_message TEXT                                                   │    │
│  │  - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                       │    │
│  │                                                                          │    │
│  │  Indexes:                                                               │    │
│  │  - idx_logs_created (created_at DESC)                                   │    │
│  │  - idx_logs_endpoint (endpoint)                                         │    │
│  │  - idx_logs_status (status_code)                                        │    │
│  │                                                                          │    │
│  │  Maintenance: Auto-purge records older than 90 days (cron job)          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                          Database Users & Permissions                             │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  User: postgres                                                                   │
│  - Role: Superuser                                                                │
│  - Permissions: Full admin access (ALL PRIVILEGES)                                │
│  - Access: Local only (Unix socket)                                               │
│  - Usage: Backups, maintenance, schema changes                                    │
│                                                                                   │
│  User: pertasmart_user (application)                                              │
│  - Role: Application user                                                         │
│  - Password: pertasmart.unpad!!2025                                               │
│  - Permissions: SELECT, INSERT, UPDATE, DELETE on all tables                      │
│  - Access: Node.js backend via connection pool                                    │
│  - Connection limit: 25                                                           │
│                                                                                   │
│  User: pertasmart_user (read-only for Honeywell)                                  │
│  - Role: Analyst/Engineer                                                         │
│  - Password: pertasmart.unpad!!2025                                               │
│  - Permissions: SELECT only on all tables                                         │
│  - Access: DBeaver via SSH tunnel from WireGuard VPN                              │
│  - Connection limit: 5                                                            │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│                        Performance Configuration                                  │
├───────────────────────────────────────────────────────────────────────────────────┤
│  postgresql.conf settings:                                                        │
│  - shared_buffers = 2GB               (25% of system RAM)                         │
│  - effective_cache_size = 6GB         (75% of system RAM)                         │
│  - work_mem = 50MB                    (per-query memory)                          │
│  - maintenance_work_mem = 512MB                                                   │
│  - max_connections = 100                                                          │
│  - checkpoint_completion_target = 0.9                                             │
│  - random_page_cost = 1.1             (SSD optimized)                             │
│  - effective_io_concurrency = 200     (SSD parallel I/O)                          │
│                                                                                   │
│  Extensions:                                                                      │
│  - pg_stat_statements (query performance tracking)                                │
│                                                                                   │
│  Maintenance:                                                                     │
│  - Auto-vacuum: Enabled                                                           │
│  - Daily backup: pg_dump at 02:00 AM (7-day retention)                            │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary Tables

### VPS System Components

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **NGINX** | v1.18+ | 443, 80 | Reverse proxy, SSL termination |
| **Node.js** | v18+ | 5000 | Backend API server |
| **Express** | v4.18+ | - | Web framework |
| **PM2** | v5.3+ | - | Process manager |
| **PostgreSQL** | v14+ | 5432 | Database server |
| **WireGuard** | Latest | 51820 UDP | VPN server |
| **SSH** | OpenSSH | 22 | Remote access |

### Database Tables Statistics

| Table | Rows | Storage | Growth/Day |
|-------|------|---------|------------|
| **sensor_data** | 1M+ | ~500 MB | ~50k rows |
| **ml_predictions** | 100k+ | ~50 MB | ~5k rows |
| **devices** | ~50 | <1 MB | Minimal |
| **users** | ~20 | <1 MB | Minimal |
| **api_logs** | 500k+ | ~200 MB | ~20k rows |

---

**End of Document**
