# PertaSmart Database Access Guide
## For Honeywell Integration Engineers

**Version:** 1.0
**Last Updated:** 2025-01-29
**Classification:** Confidential
**Distribution:** Honeywell PHD Integration Team

---

## Executive Summary

This document provides step-by-step instructions for Honeywell engineers to access the PertaSmart PostgreSQL database for integration verification, data validation, and troubleshooting purposes. Access requires VPN connection via WireGuard, SSH tunneling, and DBeaver database client.

**Target Audience:** Honeywell Integration Engineers
**Access Level:** Read-only database access
**Prerequisites:** WireGuard VPN configuration file (`Pertasmart.conf`) provided by UNPAD team

---

## Key Information

| Component | Details |
|-----------|---------|
| **VPN Method** | WireGuard |
| **VPN Config File** | `Pertasmart.conf` (provided separately) |
| **SSH Server** | `10.9.40.17:22` |
| **SSH Username** | `mipa` |
| **Database Type** | PostgreSQL 14+ |
| **Database Host** | `10.9.40.17` |
| **Database Port** | `5432` |
| **Database Name** | `pertasmart_db` |
| **Database User** | `pertasmart_user` |
| **Recommended Client** | DBeaver Community Edition |

---

## Database Overview

### Database Information

- **Name:** `pertasmart_db`
- **Engine:** PostgreSQL
- **Purpose:** Store sensor data, ML predictions, and system logs from Kamojang Geothermal Plant
- **Primary Tables:**
  - `sensor_data` - Real-time sensor readings from Honeywell PHD
  - `ml_predictions` - Machine learning prediction results
  - `devices` - Device registry and metadata
  - `api_logs` - API request/response logs

### Access Permissions

The `pertasmart_user` account has:
- ✅ **SELECT** - Read data from all tables
- ✅ **VIEW** - Access to database views
- ❌ **INSERT/UPDATE/DELETE** - No write permissions (read-only)
- ❌ **DDL** - No schema modifications

---

## Prerequisites

### 1. WireGuard VPN Client

Install WireGuard on your workstation:

**Windows:**
- Download from: https://www.wireguard.com/install/
- Install WireGuard for Windows

**macOS:**
- Download from Mac App Store or https://www.wireguard.com/install/
- Install WireGuard app

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install wireguard
```

### 2. DBeaver Community Edition

Download and install DBeaver:
- **Website:** https://dbeaver.io/download/
- **Version:** Community Edition (free)
- **Supported OS:** Windows, macOS, Linux

### 3. VPN Configuration File

**Obtain `Pertasmart.conf` from UNPAD team:**
- Contact: support@pertasmart.unpad.ac.id
- File contains: VPN credentials, encryption keys, and network routes
- **Security:** Keep this file confidential, do not share

---

## Step-by-Step Access Guide

### Step 1: Configure WireGuard VPN

#### 1.1 Import VPN Configuration

**Windows/macOS:**
1. Open WireGuard application
2. Click **"Add Tunnel"** or **"Import tunnel(s) from file"**
3. Select the `Pertasmart.conf` file provided by UNPAD
4. The tunnel will appear as "Pertasmart" in the tunnel list

**Linux:**
```bash
# Copy config file to WireGuard directory
sudo cp Pertasmart.conf /etc/wireguard/

# Set proper permissions
sudo chmod 600 /etc/wireguard/Pertasmart.conf
```

#### 1.2 Activate VPN Tunnel

**Windows/macOS:**
1. Select "Pertasmart" tunnel
2. Click **"Activate"** button
3. Status should show: ✅ **Active**
4. Verify connection:
   - Check "Latest Handshake" timestamp (should be recent)
   - Check "Transfer" showing data sent/received

**Linux:**
```bash
# Start VPN tunnel
sudo wg-quick up Pertasmart

# Verify connection
sudo wg show

# Expected output:
# interface: Pertasmart
# public key: ...
# private key: (hidden)
# listening port: ...
# peer: ...
#   endpoint: 111.223.x.x:51820
#   allowed ips: 0.0.0.0/0, ::/0
#   latest handshake: X seconds ago
```

#### 1.3 Test VPN Connection

Open terminal/command prompt and test connectivity:

```bash
# Ping the database server
ping 10.9.40.17

# Expected output:
# Reply from 10.9.40.17: bytes=32 time=20ms TTL=64
```

✅ **If ping succeeds, VPN is working correctly**
❌ **If ping fails, verify:**
- WireGuard tunnel is active
- `Pertasmart.conf` file is correct
- No firewall blocking WireGuard

---

### Step 2: Verify SSH Access (Optional but Recommended)

Before configuring DBeaver, verify SSH connection works:

```bash
ssh mipa@10.9.40.17
```

**When prompted:**
- Password: `Unpad@1957`
- Accept fingerprint if first connection

**Expected result:**
```
Welcome to Ubuntu 22.04 LTS
Last login: ...
mipa@pertasmart:~$
```

Type `exit` to close SSH session.

---

### Step 3: Configure DBeaver

#### 3.1 Create New Database Connection

1. Open DBeaver
2. Click **"New Database Connection"** (plug icon) or `Ctrl+N`
3. Select **"PostgreSQL"** from database list
4. Click **"Next"**

#### 3.2 Main Settings

Enter the following connection details:

| Field | Value |
|-------|-------|
| **Host** | `10.9.40.17` |
| **Port** | `5432` |
| **Database** | `pertasmart_db` |
| **Username** | `pertasmart_user` |
| **Password** | `pertasmart.unpad!!2025` |
| **Show all databases** | ☑ Unchecked |

**Important:** Click **"Save password"** to avoid re-entering

#### 3.3 SSH Tunnel Configuration

1. Click **"SSH"** tab at the top
2. Check ☑ **"Use SSH Tunnel"**
3. Enter SSH connection details:

| Field | Value |
|-------|-------|
| **Host/IP** | `10.9.40.17` |
| **Port** | `22` |
| **User Name** | `mipa` |
| **Authentication Method** | Password |
| **Password** | `Unpad@1957` |

4. Click **"Save password"** for SSH credentials

#### 3.4 Driver Settings (First Time Only)

If prompted to download PostgreSQL driver:
1. Click **"Download"** in the driver dialog
2. Wait for download to complete
3. Click **"OK"**

#### 3.5 Test Connection

1. Click **"Test Connection"** button at the bottom
2. **Expected result:**
   ```
   Connected
   Server version: PostgreSQL 14.x
   Driver version: PostgreSQL JDBC Driver x.x.x
   ```

3. If successful, click **"Finish"**

✅ **Connection should appear in Database Navigator panel**

#### 3.6 Troubleshooting Connection Issues

**Error: "Connection refused"**
- Verify WireGuard VPN is active
- Check SSH tunnel settings are correct

**Error: "Authentication failed for user pertasmart_user"**
- Verify database password: `pertasmart.unpad!!2025`
- Check username is exact: `pertasmart_user`

**Error: "SSH connection failed"**
- Verify SSH password: `Unpad@1957`
- Check SSH username: `mipa`
- Ensure VPN is connected

**Error: "Timeout"**
- Verify VPN tunnel is active and stable
- Check ping to `10.9.40.17` works

---

### Step 4: Explore Database

#### 4.1 Navigate Database Structure

In DBeaver's Database Navigator:
1. Expand connection: **"pertasmart_db"**
2. Expand **"Databases"** → **"pertasmart_db"**
3. Expand **"Schemas"** → **"public"**
4. Expand **"Tables"** to see all tables

#### 4.2 Key Tables Overview

**`sensor_data` - Main sensor readings table**
```sql
-- View recent sensor data
SELECT
    device_id,
    timestamp,
    temperature,
    pressure,
    flow_rate,
    gen_output
FROM sensor_data
ORDER BY timestamp DESC
LIMIT 100;
```

**`devices` - Device registry**
```sql
-- List all registered devices
SELECT
    device_id,
    device_name,
    location,
    status,
    created_at
FROM devices
ORDER BY device_id;
```

**`api_logs` - API request logs**
```sql
-- View recent API calls from Honeywell
SELECT
    endpoint,
    method,
    status_code,
    response_time_ms,
    created_at
FROM api_logs
WHERE endpoint LIKE '/api/external/%'
ORDER BY created_at DESC
LIMIT 50;
```

#### 4.3 Verify Data Integration

**Check if your data is being received:**
```sql
-- Count records by device in last 24 hours
SELECT
    device_id,
    COUNT(*) as record_count,
    MIN(timestamp) as first_record,
    MAX(timestamp) as last_record
FROM sensor_data
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY device_id
ORDER BY device_id;
```

**Check data quality:**
```sql
-- Find any null values in critical fields
SELECT
    COUNT(*) as total_records,
    COUNT(temperature) as temp_not_null,
    COUNT(pressure) as pressure_not_null,
    COUNT(flow_rate) as flow_not_null
FROM sensor_data
WHERE timestamp > NOW() - INTERVAL '1 hour';
```

---

## Security Best Practices

### 1. VPN Connection

- ✅ **Always activate VPN** before accessing database
- ✅ **Disconnect VPN** when not in use to free resources
- ❌ **Never share** `Pertasmart.conf` file with unauthorized personnel
- ✅ **Store configuration file** in secure location (encrypted folder)

### 2. Credentials Management

- ✅ **Save passwords** in DBeaver (encrypted by application)
- ❌ **Never hardcode** credentials in scripts or code
- ❌ **Never commit** credentials to version control
- ✅ **Use separate accounts** for production vs testing

### 3. Database Access

- ✅ **Read-only access** - do not attempt INSERT/UPDATE/DELETE
- ✅ **Limit query scope** - use WHERE clauses to reduce data transfer
- ❌ **Do not export** entire tables unnecessarily
- ✅ **Close connections** when done to free server resources

### 4. Network Security

- ✅ **Use company/office network** when possible
- ❌ **Avoid public WiFi** for database access
- ✅ **Keep WireGuard client** updated to latest version
- ✅ **Enable firewall** on your workstation

---

## Common Tasks

### Task 1: Verify Data Transmission

Check if data from specific device is arriving:

```sql
SELECT
    timestamp,
    temperature,
    pressure,
    gen_output
FROM sensor_data
WHERE device_id = 'KMJ_UNIT1'
ORDER BY timestamp DESC
LIMIT 20;
```

### Task 2: Check Data Gaps

Identify missing data periods:

```sql
WITH time_series AS (
    SELECT
        device_id,
        timestamp,
        LAG(timestamp) OVER (PARTITION BY device_id ORDER BY timestamp) as prev_timestamp
    FROM sensor_data
    WHERE device_id = 'KMJ_UNIT1'
    AND timestamp > NOW() - INTERVAL '24 hours'
)
SELECT
    device_id,
    prev_timestamp as gap_start,
    timestamp as gap_end,
    EXTRACT(EPOCH FROM (timestamp - prev_timestamp))/60 as gap_minutes
FROM time_series
WHERE EXTRACT(EPOCH FROM (timestamp - prev_timestamp)) > 600  -- Gaps > 10 minutes
ORDER BY gap_start DESC;
```

### Task 3: Data Statistics

Get statistical summary for last hour:

```sql
SELECT
    device_id,
    COUNT(*) as record_count,
    AVG(temperature) as avg_temp,
    MIN(temperature) as min_temp,
    MAX(temperature) as max_temp,
    AVG(pressure) as avg_pressure,
    AVG(gen_output) as avg_output
FROM sensor_data
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY device_id;
```

### Task 4: Export Data to CSV

1. Run your query in DBeaver
2. Right-click on results grid
3. Select **"Export Data"** → **"CSV"**
4. Choose destination file
5. Click **"Start"**

---

## Troubleshooting

### Issue: VPN Disconnects Frequently

**Symptoms:** WireGuard shows "Latest Handshake" timing out

**Solutions:**
1. Check internet connection stability
2. Restart WireGuard tunnel:
   - Deactivate tunnel
   - Wait 5 seconds
   - Activate again
3. Contact UNPAD support if persistent

### Issue: SSH Tunnel Timeout in DBeaver

**Symptoms:** "SSH tunnel connection timeout" error

**Solutions:**
1. Verify VPN is active and stable
2. Test SSH manually: `ssh mipa@10.9.40.17`
3. Increase timeout in DBeaver:
   - Connection settings → SSH tab
   - Advanced → Connection timeout: 30000 ms
4. Reconnect database connection

### Issue: Query Taking Too Long

**Symptoms:** Queries hang or timeout

**Solutions:**
1. Add WHERE clause to limit data range:
   ```sql
   WHERE timestamp > NOW() - INTERVAL '1 hour'
   ```
2. Add LIMIT to reduce result set:
   ```sql
   LIMIT 1000
   ```
3. Check VPN connection stability
4. Avoid `SELECT *` on large tables - specify columns

### Issue: "Permission Denied" Error

**Symptoms:** Cannot INSERT/UPDATE/DELETE records

**Expected behavior:** `pertasmart_user` is read-only

**Solution:** This is intentional security restriction. Contact UNPAD support if write access is needed for specific tasks.

---

## Support and Contact

### Technical Support

**Email:** support@pertasmart.unpad.ac.id
**Response Time:** 24-48 hours (business days)

### Request Assistance For:

- VPN configuration file (`Pertasmart.conf`)
- Password reset or credential issues
- Database schema documentation
- Write access requests (requires approval)
- Network connectivity issues

### When Reporting Issues:

Please include:
1. **Error message** (screenshot or text)
2. **Steps to reproduce** the issue
3. **Your WireGuard status** (connected/disconnected)
4. **DBeaver version** (Help → About DBeaver)
5. **Operating system** (Windows/macOS/Linux version)

---

## Quick Reference Card

### Connection Checklist

- [ ] WireGuard installed
- [ ] `Pertasmart.conf` imported to WireGuard
- [ ] VPN tunnel activated (Status: Active)
- [ ] Ping `10.9.40.17` successful
- [ ] DBeaver installed
- [ ] Database connection created with SSH tunnel
- [ ] Test connection successful
- [ ] Can query `sensor_data` table

### Quick Connect Commands

```bash
# 1. Activate VPN (Linux)
sudo wg-quick up Pertasmart

# 2. Test connectivity
ping 10.9.40.17

# 3. Test SSH (optional)
ssh mipa@10.9.40.17

# 4. Open DBeaver and connect
# (Use GUI)
```

### Connection Parameters Summary

```
VPN:       WireGuard (Pertasmart.conf)
SSH:       mipa@10.9.40.17:22 (password: Unpad@1957)
Database:  postgresql://pertasmart_user@10.9.40.17:5432/pertasmart_db
Password:  pertasmart.unpad!!2025
```

---

## Appendix A: DBeaver Connection Screenshot Guide

### Expected DBeaver Configuration

**Main Tab:**
```
┌─────────────────────────────────────┐
│ Host:     10.9.40.17                │
│ Port:     5432                      │
│ Database: pertasmart_db             │
│ Username: pertasmart_user           │
│ Password: ●●●●●●●●●●●●●●●●●●●●      │
│ ☑ Save password                     │
└─────────────────────────────────────┘
```

**SSH Tab:**
```
┌─────────────────────────────────────┐
│ ☑ Use SSH Tunnel                    │
│                                     │
│ Host/IP:  10.9.40.17                │
│ Port:     22                        │
│ User:     mipa                      │
│ Auth:     Password                  │
│ Password: ●●●●●●●●●●                │
│ ☑ Save password                     │
└─────────────────────────────────────┘
```

---

## Appendix B: Database Schema Reference

### Main Tables

| Table Name | Purpose | Key Columns | Typical Query |
|------------|---------|-------------|---------------|
| `sensor_data` | Real-time sensor readings | `device_id`, `timestamp`, `temperature`, `pressure` | Last 1000 records |
| `devices` | Device registry | `device_id`, `device_name`, `status` | All active devices |
| `api_logs` | API request logs | `endpoint`, `status_code`, `created_at` | Last 24 hours |
| `ml_predictions` | ML prediction results | `device_id`, `timestamp`, `prediction_value` | Recent predictions |

### Indexes

All tables have optimized indexes for common queries:
- `sensor_data`: Index on `(device_id, timestamp DESC)`
- `api_logs`: Index on `(created_at DESC)`
- `devices`: Primary key on `device_id`

---

**Document Classification:** Confidential
**Distribution:** Honeywell Integration Team Only
**Security Notice:** Contains sensitive credentials - Do not forward or share publicly

---

**End of Document**
