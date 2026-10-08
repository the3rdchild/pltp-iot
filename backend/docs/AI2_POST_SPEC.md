# AI2 Prediction POST Spec - PertaSmart

Spesifikasi endpoint untuk tim/model **AI2** (dryness fraction & NCG prediction) yang akan push hasil prediksi ke backend PertaSmart. Dokumen ini untuk dibagikan ke pihak yang mengintegrasikan model AI2 eksternal.

> Detail arsitektur & konsumen frontend ada di [AI2_INTEGRATION.md](./AI2_INTEGRATION.md). Dokumen ini fokus ke kontrak POST request-nya saja.

## 📋 Daftar Isi

- [Endpoint](#endpoint)
- [Request Spec](#request-spec)
- [Response Spec](#response-spec)
- [Contoh](#contoh)
- [Perilaku & Batasan](#perilaku--batasan)
- [Environment Variables](#environment-variables)
- [Status Endpoint Saat Ini](#status-endpoint-saat-ini)

## 🌐 Endpoint

| Environment | URL |
|---|---|
| Production (public) | `https://pertasmart.unpad.ac.id/api/external/ai2` |
| Local / dev | `http://localhost:5000/api/external/ai2` |

```http
POST /api/external/ai2
Content-Type: application/json
```

Endpoint bisa dipanggil server-to-server (bukan dari browser) dari mana pun — **tidak ada pembatasan CORS/IP/API-key** untuk request ini (lihat [Status Endpoint Saat Ini](#status-endpoint-saat-ini)). Akses langsung via IP VPS (bukan domain) tergantung konfigurasi nginx di server dan belum diverifikasi di dokumen ini.

Route terdaftar di `backend/routes/external.js:55`, handler di `backend/controllers/externalController.js` (`receiveAi2Data`).

## 📦 Request Spec

**Headers:**

| Header | Wajib | Nilai |
|---|---|---|
| `Content-Type` | ya | `application/json` |
| `Authorization` | tidak | — (endpoint ini tidak memvalidasi API key saat ini) |

**Body (JSON):**

| Field | Tipe | Wajib | Default | Keterangan |
|---|---|---|---|---|
| `model_name` | string | tidak | `"ai2_model"` | Nama/versi model, disimpan sebagai `VARCHAR(100)` |
| `dryness_predict` | number | tidak | `null` | Prediksi dryness fraction (%). Disimpan `NUMERIC(10,4)` |
| `dryness_confidence` | number | tidak | `null` | Confidence score 0–1. Disimpan `NUMERIC(5,4)` |
| `dryness_mae` | number | tidak | `null` | Mean Absolute Error model dryness. Disimpan `NUMERIC(10,4)` |
| `ncg_predict` | number | tidak | `null` | Prediksi NCG (%). Disimpan `NUMERIC(10,4)` |
| `ncg_confidence` | number | tidak | `null` | Confidence score 0–1. Disimpan `NUMERIC(5,4)` |
| `ncg_mae` | number | tidak | `null` | Mean Absolute Error model NCG. Disimpan `NUMERIC(10,4)` |
| `status` | string | tidak | `"normal"` | Tidak divalidasi terhadap daftar tertentu — bebas string, `VARCHAR(50)` |
| `processed_at` | ISO 8601 string | tidak | waktu server saat request diterima | Timestamp prediksi dibuat oleh model |

**Catatan:**
- Semua field numerik boleh dikirim `null` atau tidak disertakan sama sekali — tidak ada validasi wajib-isi di level backend.
- Tidak ada validasi range/tipe data eksplisit (mis. `dryness_confidence` tidak dicek harus 0–1). Field yang tidak sesuai tipe kolom PostgreSQL akan gagal saat `INSERT` dan mengembalikan `500`.
- Kirim `dryness_predict` dan/atau `ncg_predict` saja sudah cukup untuk row dianggap valid oleh dashboard (keduanya independen, tidak saling mewajibkan).

## ✅ Response Spec

**`201 Created`** — berhasil disimpan:
```json
{
  "success": true,
  "message": "AI2 prediction received successfully",
  "data": {
    "id": 123,
    "model_name": "ai2_model",
    "dryness_predict": "98.2500",
    "dryness_confidence": "0.9400",
    "dryness_mae": "0.3100",
    "ncg_predict": "2.1500",
    "ncg_confidence": "0.9100",
    "ncg_mae": "0.1200",
    "status": "normal",
    "processed_at": "2026-07-17T10:30:00.000Z",
    "created_at": "2026-07-17T10:30:05.123Z",
    "sensor_data_id": null
  }
}
```

**`400 Bad Request`** — body kosong / bukan objek:
```json
{ "success": false, "message": "Invalid data format" }
```

**`500 Internal Server Error`** — gagal insert (mis. tipe data salah, DB down):
```json
{ "success": false, "message": "Failed to save AI2 prediction", "error": "<detail error>" }
```

## 🧪 Contoh

**cURL:**
```bash
curl -X POST https://pertasmart.unpad.ac.id/api/external/ai2 \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "ai2_model_v1",
    "dryness_predict": 98.25,
    "dryness_confidence": 0.94,
    "dryness_mae": 0.31,
    "ncg_predict": 2.15,
    "ncg_confidence": 0.91,
    "ncg_mae": 0.12,
    "status": "normal",
    "processed_at": "2026-07-17T10:30:00.000Z"
  }'
```

**Python (requests):**
```python
import requests
from datetime import datetime, timezone

payload = {
    "model_name": "ai2_model_v1",
    "dryness_predict": 98.25,
    "dryness_confidence": 0.94,
    "dryness_mae": 0.31,
    "ncg_predict": 2.15,
    "ncg_confidence": 0.91,
    "ncg_mae": 0.12,
    "status": "normal",
    "processed_at": datetime.now(timezone.utc).isoformat()
}

resp = requests.post(
    "https://pertasmart.unpad.ac.id/api/external/ai2",
    json=payload,
    timeout=10
)
resp.raise_for_status()
print(resp.json())
```

## ⚙️ Perilaku & Batasan

- **Frekuensi:** dashboard men-treat data live sebagai stale jika `processed_at` lebih tua dari **10 menit** (`src/hooks/useAi2Data.js`), jadi model idealnya push lebih sering dari itu (mis. tiap 1–5 menit) agar gauge live tidak kosong.
- **Rate limit:** semua route di bawah `/api/external/*` **di-skip dari rate limiter global** (`backend/server.js:53`), jadi tidak ada batas jumlah request per window untuk endpoint ini.
- **Body size limit:** `express.json({ limit: '10mb' })` — cukup besar untuk single prediction, tidak jadi masalah.
- **Idempotency:** tidak ada — setiap POST selalu insert row baru (tidak ada upsert berdasarkan timestamp), jadi kirim ulang payload yang sama akan menghasilkan duplikat.

## 🔐 Environment Variables

**Untuk endpoint `POST /api/external/ai2` sendiri, tidak ada environment variable khusus AI2** — handler-nya (`receiveAi2Data`) tidak membaca `process.env` apa pun secara langsung. Semua konfigurasi yang mempengaruhi endpoint ini berasal dari config server umum di `backend/.env`:

| Variable | Dipakai untuk | Relevan ke endpoint AI2 karena |
|---|---|---|
| `PORT` | Port server Express (default `5000`) | Menentukan port lokal sebelum di-proxy nginx |
| `NODE_ENV` | Mode logging (`development`/`production`) & apakah stack trace error ditampilkan di response `500` | Menentukan detail error yang terlihat saat AI2 POST gagal |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Koneksi PostgreSQL (`backend/config/database.js`) | Tempat tabel `ai2` disimpan — kalau DB down, POST akan return `500` |
| `CORS_ORIGIN` | Whitelist origin untuk request berbasis browser (`backend/server.js:27`) | **Tidak relevan** untuk POST server-to-server dari model AI2 (CORS tidak berlaku untuk request non-browser) |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` | Rate limiter global | **Tidak berlaku** untuk `/api/external/*`, termasuk `/ai2` (di-skip eksplisit) |
| `WHITELISTED_IPS` | Daftar IP tambahan yang skip rate limit (`middleware/ipWhitelist.js`) | **Tidak berlaku** untuk endpoint ini — lagipula hanya mempengaruhi rate limiter, bukan access control |

**Variable yang ADA di `.env` tapi TIDAK dipakai oleh endpoint AI2** (dipakai fitur lain, disebut agar tidak tertukar):
`JWT_SECRET`, `JWT_EXPIRES_IN` (auth login), `HONEYWELL_API_KEY`, `EDGE_PC_API_KEY`, `TEST_API_KEY`, `ADDITIONAL_API_KEYS` (dipakai `validateApiKey` — endpoint ini tidak pakai middleware tsb), `HONEYWELL_API_URL`, `HONEYWELL_API_X_API_KEY`, `HONEYWELL_API_SAMPLE_INTERVAL`, `HONEYWELL_API_MAX_ROWS`, `HONEYWELL_DEVICE_ID`, `HONEYWELL_TAGNAME_MAPPING`, `HONEYWELL_API_HEADERS` (integrasi Honeywell, lihat [HONEYWELL_INTEGRATION.md](./HONEYWELL_INTEGRATION.md)).

Jika nanti endpoint ini diberi proteksi API key (lihat bagian di bawah), variable baru yang perlu ditambahkan misalnya `AI2_API_KEY` di `.env`, lalu didaftarkan di `getValidApiKeys()` (`backend/middleware/apiKeyAuth.js`) dan route-nya dipasangi `validateApiKey` di `backend/routes/external.js:55`.

## ⚠️ Status Endpoint Saat Ini

Sesuai keputusan saat ini, endpoint **didokumentasikan apa adanya tanpa autentikasi**:

- Tidak ada `validateApiKey` di route `POST /api/external/ai2` — berbeda dari endpoint POST lain (`/sensor-data`, `/batch`, `/sensor-data/ulubelu`, `/batch/ulubelu`) yang semuanya wajib header `Authorization: Bearer <key>`.
- Tidak ada pembatasan IP (whitelist di `.env` hanya untuk skip rate-limit, bukan access control).
- CORS tidak relevan untuk proteksi karena ini konsumsi server-to-server, bukan browser.

**Implikasi:** siapa pun yang tahu URL `https://pertasmart.unpad.ac.id/api/external/ai2` dapat mengirim data prediksi palsu ke tabel `ai2`, yang akan langsung tampil di dashboard (gauge live, chart, tabel statistik). Kalau proteksi diperlukan di kemudian hari, tambahkan `validateApiKey` mengikuti pola endpoint `/sensor-data` lainnya.
