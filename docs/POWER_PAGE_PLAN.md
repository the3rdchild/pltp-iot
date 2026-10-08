# Rencana Fitur: Halaman `/power` (Active Power, Reactive Power, S.T Speed)

Status: **rencana final — keputusan sudah dikunci, belum ada kode yang ditulis**
Tanggal: 2026-09-08
Referensi utama: [src/pages/analytics/ptf.jsx](../src/pages/analytics/ptf.jsx)

---

## 1. Ringkasan

Tambah satu nav baru **"Power"** di grup `Analytics` (sejajar dengan Dryness / NCG / TDS / P,T,F /
Prediction) yang membuka halaman `/power`. **UI-nya identik dengan `/ptf`** — layout, spacing,
warna, ikon, urutan komponen semuanya sama; yang berbeda hanya isinya: tiga baris parameter,
tiap baris = 1 gauge + 4 StatCard, lalu satu chart multi-series, lalu tiga tabel statistik.

### Keputusan yang sudah dikunci

| Topik | Keputusan |
|---|---|
| Layout | Sama persis dengan `/ptf`, hanya kontennya diganti |
| Chart | `PowerChart.jsx` hasil copy-adapt dari `PTFChart.jsx` (`/ptf` tidak disentuh) |
| Judul halaman | **"Power"** (header jadi `Power / Analytic`) |
| Ikon nav | `ThunderboltOutlined` |
| Lab overlay | **Tidak ada** — hanya data sensor |
| Halaman `/test/power` | **Tidak dibuat** — production saja |
| Limit config | Pakai ulang section "Power & Generator" yang sudah ada |

Tiga parameternya:

| Nama di UI | Live metric (API) | Kolom DB | Key Limit.json | Unit |
|---|---|---|---|---|
| Active Power | `active_power` | `gen_output` | `gen_output` | MW |
| Reactive Power | `reactive_power` | `gen_reactive_power` | `reactive_power` | MVAR |
| S.T Speed | `speed` | `speed_detection` | `speed_detection` | RPM |

Penamaan `activePower` / `reactivePower` / `stSpeed` sudah dipakai di
[src/pages/dashboard/default.jsx:49-52](../src/pages/dashboard/default.jsx#L49-L52) dan
[src/data/simulasi.js:57-61](../src/data/simulasi.js#L57-L61) sebagai nama variabel React —
rencana ini memakai nama yang sama untuk variabel lokal, sementara key API/limit tetap
snake_case supaya tidak menyentuh backend sama sekali.

---

## 2. Yang SUDAH ada (tidak perlu dibuat ulang)

Ini penting: backend dan config limit untuk ketiga parameter **sudah lengkap**.

- **Backend live/chart/stats** — `VALID_METRICS` di
  [backend/controllers/liveDataController.js:8-13](../backend/controllers/liveDataController.js#L8-L13)
  sudah memuat `active_power`, `reactive_power`, `speed`. Jadi endpoint berikut sudah jalan:
  - `GET /api/data/live/{metric}`
  - `GET /api/data/chart/{metric}?range=…`
  - `GET /api/data/stats/{metric}/aggregated` (untuk StatisticsTable)
- **Mapping ke kolom DB** — [backend/utils/calculations.js:163-185](../backend/utils/calculations.js#L163-L185)
  (`active_power → gen_output`, `reactive_power → gen_reactive_power`, `speed → speed_detection`).
- **Stats & anomali per metric** — `METRIC_COLUMN_MAP` di
  [backend/controllers/dataController.js:578-594](../backend/controllers/dataController.js#L578-L594)
  memetakan `gen_output`, `reactive_power`, `speed_detection`, sehingga
  `/api/data/metric-stats/:metric` dan `/api/data/anomaly-counts/:metric` sudah bisa dipanggil.
- **Limit config di Settings** — section **"Power & Generator"** di
  [src/components/settings/LimitRender.jsx:30-33](../src/components/settings/LimitRender.jsx#L30-L33)
  sudah mengelola `gen_output`, `reactive_power`, `voltage`, `current`, `speed_detection`,
  dengan label `Active Power` / `Reactive Power` / `S.T Speed`. Nilai default ada di
  [src/data/Limit.json](../src/data/Limit.json).
- **Data simulasi test env** — `TestDataContext` sudah punya `active_power`, `reactive_power`,
  `speed` di [src/contexts/TestDataContext.jsx:136-140](../src/contexts/TestDataContext.jsx#L136-L140).

Artinya: **tidak ada perubahan backend, tidak ada migrasi DB, tidak ada penambahan key Limit.json.**
Halaman `/power` cukup membaca `getLimitData()` pada key `gen_output`, `reactive_power`,
`speed_detection`.

---

## 3. Yang perlu DIBUAT / DIUBAH

### 3.1 Halaman baru — `src/pages/analytics/power.jsx`

Struktur dijiplak dari `ptf.jsx`:

```
AnalyticsHeader  title="Power"  subtitle="Analytic"

Grid container
  ├─ Row Active Power   : MainCard+GaugeChart (lg 2.5) + 4× StatCard (lg 2.37)
  ├─ Row Reactive Power : idem
  ├─ Row S.T Speed      : idem
  ├─ PowerChart (size 12)
  ├─ StatisticsTable metric="active_power"
  ├─ StatisticsTable metric="reactive_power"
  └─ StatisticsTable metric="speed"
```

Hook yang dipakai (sama persis dengan pola `ptf.jsx`):

| Hook | Argumen |
|---|---|
| `useMultiMetricData` | `['active_power', 'reactive_power', 'speed'], '1d'` |
| `useMetricStats` | `'gen_output'`, `'reactive_power'`, `'speed_detection'` |
| `useAnomalyCounts` | `'gen_output'`, `'reactive_power'`, `'speed_detection'` |

> Kenapa key hook beda dengan key live? `useMetricStats`/`useAnomalyCounts` memanggil
> `/api/data/metric-stats/:metric` dan `/anomaly-counts/:metric`, yang memetakan lewat
> `METRIC_COLUMN_MAP` dan tabel `metric_limits` — keduanya memakai key
> `gen_output` / `reactive_power` / `speed_detection`. Sementara `useMultiMetricData` memanggil
> `/data/live/:metric` + `/data/chart/:metric` yang memakai `VALID_METRICS`
> (`active_power` / `reactive_power` / `speed`). Perbedaan ini konsisten dengan `ptf.jsx`
> yang juga memakai `'flow'` untuk stats tapi `'flow_rate'` untuk live/tabel — **jangan
> disamakan**, salah satu sisi akan mengembalikan 400 atau 0.

4 StatCard per baris (identik `ptf.jsx`): Anomali Status, Minimum, Average, Maximum — masing-masing
dengan `additionalData` 12 jam / 1 hari / 1 minggu, ikon & warna yang sama
(`#9271FF`, `#FF7E7E`, `#53A1FF`, `#58E58C`).

Badge persentase perubahan (`activePowerChangePct` dkk) memakai pola `useState` + `useRef` yang
sama seperti `ptf.jsx`.

Gauge memakai `getLimitData()`:

```js
const limitData = getLimitData();
limitData.gen_output       // Active Power   (MW)
limitData.reactive_power   // Reactive Power (MVAR)
limitData.speed_detection  // S.T Speed      (RPM)
```

⚠️ `reactive_power` tidak punya `abnormalLow`/`warningLow` — lihat §6 Catatan implementasi.

### 3.2 Chart baru — `src/components/analytics/PowerChart.jsx`

`PTFChart.jsx` (~900 baris) di-hardcode ke pressure/temperature/flow: nama seri, tiga y-axis,
range simulasi, dan overlay lab sample. Rekomendasi: **copy jadi `PowerChart.jsx`** dan adaptasi,
bukan digeneralisasi — supaya perubahan tidak berisiko ke halaman `/ptf` yang baru saja
di-fix (lihat commit `dcdc42f` soal anchor bucket grid).

Perubahan dari `PTFChart`:
- Tiga seri: `Active Power (MW)` (biru), `Reactive Power (MVAR)` (oranye),
  `S.T Speed (RPM)` (hijau, `opposite: true`).
- `fetchChartFromAPI` memanggil `getChartData('active_power'|'reactive_power'|'speed', range)`
  dengan **`end_time` yang sama untuk ketiganya** (pola anchor dari commit `dcdc42f`).
- **Hapus lab overlay** (`getLabComparison`, `alignLabSamplesToTimestamps`,
  `labPressureSamples` dsb) — tidak ada lab sample untuk parameter listrik.
- **Hapus cabang test environment** (`isTestEnvironment`, `generateRealTimeChartData`,
  `generateAIData`, interval simulasi) — `/power` tidak punya kembaran di `/test`.
- Time-range selector, date picker, dan mode `now` (sliding window 60 titik) dipertahankan apa adanya.
- Props: `title`, `subtitle`, `liveValues={{ active_power, reactive_power, speed }}`.

Lalu export dari [src/components/analytics/index.js](../src/components/analytics/index.js).

### 3.3 Data simulasi — **TIDAK DIPERLUKAN**

Karena `/test/power` tidak dibuat, `simulasi.js` dan `chartData.js` **tidak perlu diubah sama
sekali**. `/power` selalu berjalan di jalur production:

- `location.pathname.startsWith('/test')` selalu `false` di `/power`, sehingga
  `useMultiMetricData`, `useMetricStats`, `useAnomalyCounts`, dan `StatisticsTable` semuanya
  langsung memakai data API.
- Konsekuensinya cabang test di `PowerChart` (`generateRealTimeChartData`, `generateAIData`,
  interval simulasi 3 detik) ikut dibuang saat copy-adapt — chart jadi jauh lebih ramping
  daripada `PTFChart` karena hanya menyisakan jalur API + live-append dari props.

### 3.4 Navigasi

- [src/menu-items/dashboard.jsx](../src/menu-items/dashboard.jsx): item baru di `children`
  grup `analytics`, diletakkan **setelah `ptf`, sebelum `prediction`**:
  ```js
  { id: 'power', title: 'Power', type: 'item', url: '/power', icon: icons.ThunderboltOutlined }
  ```
  (`ThunderboltOutlined` dari `@ant-design/icons` — perlu ditambah ke blok import & objek `icons`.)
- [src/menu-items/test-dashboard.jsx](../src/menu-items/test-dashboard.jsx): **tidak diubah** —
  `/test/power` tidak dibuat.

### 3.5 Routing

[src/routes/index.jsx](../src/routes/index.jsx) — satu entri, meniru pola `/ptf`:

```jsx
{ path: '/power', element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>, children: [{ index: true, element: <Power /> }] }
```

plus `import Power from 'pages/analytics/power'`. Tidak ada route `/test/power`.

---

## 4. Daftar file terdampak

| File | Aksi |
|---|---|
| `src/pages/analytics/power.jsx` | **baru** — halaman utama |
| `src/components/analytics/PowerChart.jsx` | **baru** — chart 3 seri |
| `src/components/analytics/index.js` | export `PowerChart` |
| `src/menu-items/dashboard.jsx` | nav item `Power` + ikon `ThunderboltOutlined` |
| `src/routes/index.jsx` | route `/power` |
| `src/data/simulasi.js`, `src/data/chartData.js`, `StatisticsTable.jsx` | **tidak ada perubahan** (tanpa `/test/power`) |
| `src/menu-items/test-dashboard.jsx` | **tidak ada perubahan** |
| backend/** | **tidak ada perubahan** |
| `src/data/Limit.json`, `LimitRender.jsx` | **tidak ada perubahan** (section "Power & Generator" sudah ada) |

---

## 5. Urutan pengerjaan

1. Route + nav + halaman kosong (`AnalyticsHeader title="Power"`) → pastikan `/power` terbuka.
2. Tiga baris gauge + StatCard (pakai `getLimitData()` + hook stats/anomali) → cek angka production.
3. `PowerChart` (copy-adapt dari `PTFChart`, buang lab overlay + cabang test).
4. Tiga `StatisticsTable` → cek `/api/data/stats/{metric}/aggregated` mengembalikan baris.
5. Verifikasi manual: `/power` render, toggle range chart, dan ubah limit di
   `/admin/configuration` → gauge `/power` ikut berubah.

---

## 6. Catatan implementasi

- **Anomali butuh baris di tabel `metric_limits`.** `GET /api/data/anomaly-counts/:metric`
  membaca `warning_low`/`warning_high` dari tabel `metric_limits`
  ([dataController.js:771-790](../backend/controllers/dataController.js#L771-L790)); kalau
  `metric_key` belum ada di sana, endpoint mengembalikan 0 dengan pesan
  "No limits configured for this metric". Baris itu terisi ketika admin menekan Save di
  `/admin/configuration` (POST `/data/metric-limits` meng-upsert semua key dari `Limit.json`,
  termasuk `gen_output` / `reactive_power` / `speed_detection`). Jadi kalau StatCard "Anomali
  Status" menampilkan 0 terus, cek dulu tabel ini sebelum menuduh halaman `/power`.
- **`reactive_power` tanpa threshold bawah.** Di `Limit.json` key ini hanya punya `idealLow`,
  `idealHigh`, `warningHigh`, `abnormalHigh`. `GaugeChart` sudah menangani nilai `undefined`
  ([GaugeChart.jsx:42](../src/components/GaugeChart.jsx#L42) mem-filter `undefined/null/NaN`,
  dan pengecekan warna di baris 241-243 memakai `!== undefined`), jadi gauge tetap tergambar —
  zona merah/kuning bawah saja yang absen. Perilaku ini disengaja, bukan bug.
- **Skala tiga seri jauh berbeda** (MW ~32, MVAR ~6, RPM ~3000) — pola tiga y-axis milik
  `PTFChart` (`buildYAxes`, y-axis ketiga `opposite: true`) sudah menangani ini; jangan
  disatukan ke satu sumbu.

## 7. Pertanyaan yang sudah terjawab

1. Chart copy atau generalisasi → **copy-adapt** (`PowerChart.jsx`), `/ptf` tidak disentuh.
2. Limit config → **pakai ulang** section "Power & Generator" yang sudah ada.
3. Judul halaman → **"Power"**.
4. Ikon nav → **`ThunderboltOutlined`**.
5. Lab overlay → **tidak ada**, hanya data sensor.
6. `/test/power` → **tidak dibuat**.
