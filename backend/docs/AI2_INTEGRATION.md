# AI2 Integration (Dryness & NCG Predictions) - PertaSmart

Dokumentasi endpoint dan alur data untuk prediksi AI2 (dryness fraction & NCG) yang dikirim oleh model AI eksternal ke sistem PertaSmart.

## 📋 Daftar Isi

- [Ringkasan](#ringkasan)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Metric Mapping (Backend)](#metric-mapping-backend)
- [Konsumen Frontend](#konsumen-frontend)
- [Testing](#testing)
- [Catatan Keamanan](#catatan-keamanan)

## 🎯 Ringkasan

Model AI2 (eksternal) melakukan prediksi terhadap dua parameter:

- **Dryness Fraction** (`dryness_predict`) — persentase kekeringan uap
- **NCG** (`ncg_predict`) — Non-Condensable Gas

Model mem-push hasil prediksi ke backend melalui `POST /api/external/ai2`, disimpan ke tabel `ai2`, lalu dikonsumsi dashboard untuk gauge live, grafik historis, dan tabel statistik harian.

**Alur Data:**
```
AI2 Model (eksternal) → POST /api/external/ai2 → PostgreSQL (tabel ai2) → Dashboard Frontend
```

## 🗄️ Database Schema

Table: `ai2` (`backend/models/migrations/005_create_ai2.sql`)

```sql
CREATE TABLE ai2 (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100),
    dryness_predict DECIMAL(10, 4),
    dryness_confidence DECIMAL(5, 4),
    dryness_mae DECIMAL(10, 4),
    ncg_predict DECIMAL(10, 4),
    ncg_confidence DECIMAL(5, 4),
    ncg_mae DECIMAL(10, 4),
    status VARCHAR(50) DEFAULT 'normal',
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sensor_data_id INT REFERENCES sensor_data(id) ON DELETE SET NULL
);

CREATE INDEX idx_ai2_processed_at ON ai2(processed_at DESC);
CREATE INDEX idx_ai2_status ON ai2(status);
```

## 🔌 API Endpoints

File: `backend/routes/external.js` (mounted di `/api/external`), controller: `backend/controllers/externalController.js`

### 1. Receive AI2 Prediction (Webhook)
```http
POST /api/external/ai2
Content-Type: application/json
```

Endpoint untuk menerima hasil prediksi dari model AI2. **Tidak ada autentikasi API Key** (lihat [Catatan Keamanan](#catatan-keamanan)).

**Request Body:**
```json
{
  "model_name": "ai2_model",
  "dryness_predict": 98.25,
  "dryness_confidence": 0.94,
  "dryness_mae": 0.31,
  "ncg_predict": 2.15,
  "ncg_confidence": 0.91,
  "ncg_mae": 0.12,
  "status": "normal",
  "processed_at": "2026-07-17T10:30:00.000Z"
}
```
Semua field opsional kecuali disimpan apa adanya; `model_name` default `"ai2_model"`, `status` default `"normal"`, `processed_at` default waktu server saat request diterima.

**Response `201`:**
```json
{
  "success": true,
  "message": "AI2 prediction received successfully",
  "data": {
    "id": 123,
    "model_name": "ai2_model",
    "dryness_predict": "98.2500",
    "ncg_predict": "2.1500",
    "status": "normal",
    "processed_at": "2026-07-17T10:30:00.000Z",
    ...
  }
}
```

### 2. Get Latest AI2 Predictions
```http
GET /api/external/ai2?limit=50&status=normal&start_date=2026-07-01&end_date=2026-07-17
```

Mengambil baris terbaru dari tabel `ai2`, urut `processed_at DESC`.

| Query Param | Wajib | Deskripsi |
|---|---|---|
| `limit` | tidak | Default `50`. Diabaikan jika `start_date` & `end_date` diisi. |
| `status` | tidak | Filter exact match kolom `status`. |
| `start_date`, `end_date` | tidak (harus dua-duanya) | Filter rentang `processed_at`, menggantikan `limit`. |

**Response:**
```json
{
  "success": true,
  "data": [ { "id": 123, "dryness_predict": "98.2500", "ncg_predict": "2.1500", "processed_at": "...", ... } ],
  "count": 1
}
```

### 3. Get Aggregated Daily Stats
```http
GET /api/external/ai2/stats?metric=ncg_predict
```

Statistik harian (min/max/avg/std dev) per hari, maksimum 60 hari terakhir, `GROUP BY DATE(processed_at)`.

| Query Param | Wajib | Deskripsi |
|---|---|---|
| `metric` | tidak | Default `ncg_predict`. Valid: `ncg_predict`, `dryness_predict`, `ncg_confidence`, `dryness_confidence`. |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "no": 1,
      "date": "2026-07-17",
      "minValue": 1.8,
      "maxValue": 2.6,
      "average": 2.15,
      "stdDeviation": 0.21
    }
  ]
}
```

## 🔄 Metric Mapping (Backend)

Selain endpoint `/api/external/ai2/*` di atas, dashboard umum (`/api/data/metric-stats/:metric` dan `/api/data/anomaly-counts/:metric` — routes: `backend/routes/data.js`, controller: `backend/controllers/dataController.js`) juga mendukung metric key `dryness` dan `ncg` melalui mapping berikut:

```js
// backend/controllers/dataController.js
const AI2_METRIC_MAP = {
  'dryness': 'dryness_predict',
  'ncg': 'ncg_predict'
};

const AI2_METRIC_LIMITS = {
  'dryness': { warningLow: 97, warningHigh: 100 },
  'ncg':     { warningLow: null, warningHigh: 5 }
};
```

Ketika `metric` param cocok dengan key di `AI2_METRIC_MAP` (`dryness` / `ncg`), kedua endpoint ini query tabel `ai2` (bukan `sensor_data`) menggunakan kolom hasil mapping, dan anomaly threshold memakai `AI2_METRIC_LIMITS` (mirror dari `Limit.json` di frontend), bukan tabel `metric_limits`.

- `GET /api/data/metric-stats/dryness` / `GET /api/data/metric-stats/ncg` → min/max/avg untuk window 12h, 24h, 7d dari kolom AI2.
- `GET /api/data/anomaly-counts/dryness` / `GET /api/data/anomaly-counts/ncg` → jumlah kejadian di luar `warningLow`/`warningHigh` untuk window 12h, 24h, 7d.

## 🖥️ Konsumen Frontend

| File | Fungsi |
|---|---|
| `src/hooks/useAi2Data.js` | Poll `GET /api/external/ai2?limit=1` tiap 3 detik untuk gauge live (data dianggap stale jika `processed_at` > 10 menit), plus fetch `?limit=60` sekali untuk history chart. |
| `src/hooks/useAi2StatsTable.js` | Fetch `GET /api/external/ai2/stats?metric=<dryness_predict\|ncg_predict>` untuk tabel statistik harian. |
| `src/hooks/useMetricStatistics.js` | Fetch `GET /api/data/metric-stats/:metric` (dipakai juga untuk `dryness`/`ncg`). |
| `src/hooks/useAnomalyTracker.js` | Fetch `GET /api/data/anomaly-counts/:metric` (dipakai juga untuk `dryness`/`ncg`). |
| `src/components/analytics/Ai2Chart.jsx`, `src/pages/analytics/dryness.jsx`, `src/pages/analytics/NCG.jsx` | Halaman/komponen yang merender data di atas. |

## 🧪 Testing

```bash
# Kirim data prediksi dummy
curl -X POST http://localhost:5000/api/external/ai2 \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "ai2_model",
    "dryness_predict": 98.25,
    "dryness_confidence": 0.94,
    "ncg_predict": 2.15,
    "ncg_confidence": 0.91,
    "status": "normal"
  }'

# Ambil data terbaru
curl "http://localhost:5000/api/external/ai2?limit=5"

# Ambil statistik harian dryness
curl "http://localhost:5000/api/external/ai2/stats?metric=dryness_predict"

# Ambil metric-stats & anomaly-counts via alias dashboard
curl "http://localhost:5000/api/data/metric-stats/dryness"
curl "http://localhost:5000/api/data/anomaly-counts/ncg"
```

## 🔒 Catatan Keamanan

`POST /api/external/ai2` **tidak** dipasangi middleware `validateApiKey`, berbeda dari endpoint POST lain di `external.js` (`/sensor-data`, `/batch`, `/sensor-data/ulubelu`, `/batch/ulubelu`) yang semuanya protected. Ini berarti siapa pun yang bisa mencapai endpoint tersebut dapat menyisipkan baris prediksi palsu ke tabel `ai2`. Jika ini bukan by design, tambahkan `validateApiKey` (`backend/middleware/apiKeyAuth.js`) ke route tersebut di `backend/routes/external.js:55`.
