# PertaSmart API Documentation

## Overview

This document describes the API endpoints for the PertaSmart sensor data system.

---

## Database Schema

### Table: `sensor_data`

Stores all incoming sensor data from Honeywell and generator systems.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `device_id` | VARCHAR(100) | Device identifier (default: 'unknown') |
| `timestamp` | TIMESTAMP | Data timestamp (ISO 8601) |
| `temperature` | DECIMAL(10,2) | Temperature in °C |
| `pressure` | DECIMAL(10,2) | Pressure in kPa |
| `flow_rate` | DECIMAL(10,2) | Flow rate in t/h |
| `gen_voltage_v_w` | DECIMAL(10,2) | Generator voltage V-W in V |
| `gen_voltage_w_u` | DECIMAL(10,2) | Generator voltage W-U in V |
| `gen_reactive_power` | DECIMAL(10,2) | Reactive power in VAR |
| `gen_output` | DECIMAL(10,2) | Active power output in W |
| `gen_power_factor` | DECIMAL(5,3) | Power factor (0-1) |
| `gen_frequency` | DECIMAL(6,2) | Frequency in Hz |
| `speed_detection` | DECIMAL(10,2) | Steam turbine speed in RPM |
| `mcv_l` | DECIMAL(10,2) | MCV Left valve position |
| `mcv_r` | DECIMAL(10,2) | MCV Right valve position |
| `tds` | DECIMAL(10,2) | Total Dissolved Solids in ppm |
| `status` | VARCHAR(50) | Status string (optional) |
| `raw_data` | JSONB | Raw payload for debugging |
| `created_at` | TIMESTAMP | Record creation time |

**Indexes:**
- `idx_sensor_data_timestamp` (DESC) - Fast time-based queries
- `idx_sensor_data_device_id` - Device filtering

---

## Incoming Payload

### POST `/api/external/sensor-data`

Receives sensor data from external systems (Honeywell/Generator).

**Payload:**
```json
{
  "device_id": "string (optional)",
  "timestamp": "string (ISO 8601 format)",
  "temperature": "number",
  "pressure": "number",
  "flow_rate": "number",
  "gen_voltage_V-W": "number",
  "gen_voltage_W-U": "number",
  "gen_reactive_power": "number",
  "gen_output": "number",
  "gen_power_factor": "number",
  "gen_frequency": "number",
  "speed_detection": "number",
  "MCV_L": "number",
  "MCV_R": "number",
  "TDS": "number",
  "status": "string (optional)"
}
```

**Example:**
```json
{
  "device_id": "PLTP-001",
  "timestamp": "2025-01-15T10:30:00Z",
  "temperature": 150.5,
  "pressure": 1200,
  "flow_rate": 245.8,
  "gen_voltage_V-W": 398,
  "gen_voltage_W-U": 402,
  "gen_reactive_power": 1500,
  "gen_output": 7800,
  "gen_power_factor": 0.86,
  "gen_frequency": 50.02,
  "speed_detection": 3000,
  "MCV_L": 45.2,
  "MCV_R": 44.8,
  "TDS": 3.5,
  "status": "normal"
}
```

---

## Live Data Endpoints

### GET `/api/data/live`

Get all live metrics for dashboard display.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-01-15T10:30:00Z",
    "device_id": "PLTP-001",
    "metrics": {
      "tds": {
        "value": 3.5,
        "unit": "ppm",
        "status": "normal",
        "details": "Value is within normal range",
        "limit": {
          "min": 0,
          "max": 10,
          "warningHigh": 6,
          "abnormalHigh": 10
        }
      },
      "pressure": {
        "value": 1200,
        "unit": "kPa",
        "status": "ideal",
        "details": "Value is within ideal range",
        "limit": { ... }
      },
      "temperature": {
        "value": 150.5,
        "unit": "°C",
        "status": "ideal",
        "details": "Value is within ideal range",
        "limit": { ... }
      },
      "flow_rate": {
        "value": 245.8,
        "unit": "t/h",
        "status": "ideal",
        "details": "Value is within ideal range",
        "limit": { ... }
      },
      "active_power": {
        "value": 7800,
        "unit": "W",
        "status": "ideal",
        "details": "Value is within ideal range",
        "limit": { ... }
      },
      "voltage": {
        "value": 400,
        "unit": "V",
        "status": "ideal",
        "details": "Value is within ideal range",
        "limit": { ... }
      },
      "reactive_power": {
        "value": 1500,
        "unit": "VAR",
        "status": "ideal",
        "details": "Value is within ideal range",
        "limit": { ... }
      },
      "speed": {
        "value": 3000,
        "unit": "RPM",
        "status": "ideal",
        "details": "Value is within ideal range",
        "limit": { ... }
      },
      "current": {
        "value": 13.07,
        "unit": "A",
        "status": "ideal",
        "details": "Value is within ideal range",
        "limit": { ... }
      },
      "power_factor": {
        "value": 0.86,
        "unit": "",
        "status": "normal",
        "details": null
      },
      "frequency": {
        "value": 50.02,
        "unit": "Hz",
        "status": "normal",
        "details": null
      }
    },
    "raw": { ... }
  }
}
```

---

### GET `/api/data/live/:metric`

Get single live metric with anomaly status.

**Valid metrics:**
- `tds` - Total Dissolved Solids
- `pressure` - Pressure
- `temperature` - Temperature
- `flow_rate` or `flow` - Flow rate
- `gen_output` or `active_power` - Active power
- `voltage` - Average voltage (V-W + W-U) / 2
- `gen_reactive_power` or `reactive_power` - Reactive power
- `speed_detection` or `speed` - Steam turbine speed
- `current` - Calculated current (I = S / √3 × V)

**Example:** `GET /api/data/live/tds`

**Response:**
```json
{
  "success": true,
  "data": {
    "metric": "tds",
    "value": 3.5,
    "timestamp": "2025-01-15T10:30:00Z",
    "device_id": "PLTP-001",
    "status": "normal",
    "details": "Value is within normal range",
    "limit": {
      "min": 0,
      "max": 10,
      "unit": "ppm",
      "warningHigh": 6,
      "abnormalHigh": 10
    }
  }
}
```

---

## Chart Data Endpoint

### GET `/api/data/chart/:metric`

Get aggregated chart data with min/avg/max values.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `range` | string | `1d` | Time range: `1h`, `1d`, `7d`, `1m`, `10y` |

**Range Configuration:**
| Range | Interval | Aggregation | Max Points |
|-------|----------|-------------|------------|
| `1h` | 1 hour | Per minute | 60 |
| `1d` | 1 day | Per hour | 24 |
| `7d` | 7 days | Per 4 hours | 42 |
| `1m` | 30 days | Per day | 30 |
| `10y` | 10 years | Per month | 120 |

**Example:** `GET /api/data/chart/tds?range=7d`

**Response:**
```json
{
  "success": true,
  "data": {
    "metric": "tds",
    "range": "7d",
    "points": 42,
    "limit": {
      "min": 0,
      "max": 10,
      "warningHigh": 6,
      "abnormalHigh": 10
    },
    "chart": [
      {
        "timestamp": "2025-01-08T00:00:00Z",
        "min": 2.1,
        "avg": 3.5,
        "max": 5.2,
        "data_points": 15
      },
      {
        "timestamp": "2025-01-08T04:00:00Z",
        "min": 2.3,
        "avg": 3.8,
        "max": 4.9,
        "data_points": 18
      }
    ]
  }
}
```

---

## Statistics Table Endpoint

### GET `/api/data/stats/:metric`

Get statistics table data with pagination and optional date filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | `50` | Number of records per page |
| `offset` | number | `0` | Skip N records (for pagination) |
| `start_date` | string | - | Filter from date (ISO 8601) |
| `end_date` | string | - | Filter to date (ISO 8601) |

**Example:** `GET /api/data/stats/tds?limit=10&offset=0`

**Response:**
```json
{
  "success": true,
  "data": {
    "metric": "tds",
    "summary": {
      "min": 2.1,
      "max": 5.8,
      "avg": 3.45,
      "count": 10
    },
    "limit": {
      "unit": "ppm",
      "min": 0,
      "max": 10,
      "warningHigh": 6,
      "abnormalHigh": 10
    },
    "records": [
      {
        "id": 1234,
        "timestamp": "2025-01-15T10:30:00Z",
        "device_id": "PLTP-001",
        "value": 3.5,
        "status": "normal",
        "details": "Value is within normal range"
      },
      {
        "id": 1233,
        "timestamp": "2025-01-15T10:29:00Z",
        "device_id": "PLTP-001",
        "value": 3.8,
        "status": "normal",
        "details": "Value is within normal range"
      }
    ],
    "pagination": {
      "total": 5000,
      "limit": 10,
      "offset": 0,
      "current_page": 1,
      "total_pages": 500
    }
  }
}
```

**With date range:** `GET /api/data/stats/pressure?start_date=2025-01-01&end_date=2025-01-15`

---

## Anomaly Status Logic

Values are checked against thresholds defined in `/src/data/Limit.json`.

**Status levels:**
| Status | Condition |
|--------|-----------|
| `abnormal` | value < abnormalLow OR value > abnormalHigh |
| `warning` | value < warningLow OR value > warningHigh |
| `ideal` | idealLow ≤ value ≤ idealHigh |
| `normal` | Within limits but not in ideal range |
| `null` | No data or no limit defined |

---

## Calculated Fields

### Current (I)

Calculated using three-phase formula:

```
I = S / (√3 × V_LL)

Where:
- S = Apparent Power (VA)
- V_LL = Average line-to-line voltage = (gen_voltage_V-W + gen_voltage_W-U) / 2

Apparent Power calculation:
- If power_factor available: S = P / PF
- If reactive_power available: S = √(P² + Q²)
- Otherwise: S = P (assume PF = 1)
```

### Voltage (average)

```
voltage = (gen_voltage_V-W + gen_voltage_W-U) / 2
```

---

## Threshold Limits (Limit.json)

Located at: `/src/data/Limit.json`

| Metric | Unit | Abnormal Low | Warning Low | Ideal Low | Ideal High | Warning High | Abnormal High |
|--------|------|--------------|-------------|-----------|------------|--------------|---------------|
| TDS | ppm | - | - | - | 0 | 6 | 10 |
| Pressure | kPa | 333 | 444 | 1000 | 1400 | 1600 | 1667 |
| Temperature | °C | 105 | 120 | 135 | 165 | 180 | 195 |
| Flow | t/h | 210 | 220 | 225 | 265 | 270 | 285 |
| Gen Output | W | 100 | 500 | 1000 | 40000 | 45000 | 50000 |
| Voltage | V | 180 | 200 | 380 | 420 | 440 | 460 |
| Reactive Power | VAR | - | - | - | 5000 | 10000 | 15000 |
| Speed Detection | RPM | 500 | 1000 | 2500 | 3500 | 4000 | 4500 |
| Current | A | - | - | - | 50 | 100 | 150 |

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (in development only)"
}
```

**Common HTTP Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (auth required) |
| 500 | Internal server error |
