-- ============================================================================
-- DDL untuk tabel ai1a / ai1b / ai2 / ai1a_direction_annotation di VPS
-- (10.9.40.17 / pertasmart_db)
-- ============================================================================
-- Disalin dari struktur AKTUAL di VPS (DBeaver "Generate SQL > DDL", bukan
-- dari AI_Pertasmart_V3/scripts/init_db.sql — ada perbedaan, lihat catatan
-- ai2 di bawah). Tujuan file ini: referensi siap-jalan untuk DBeaver, BUKAN
-- migrasi otomatis.
--
-- STATUS PENGUJIAN (integrasi AI1a/AI1b, lihat riwayat percakapan terkait):
--   - ai1a & ai1b: skema ini SUDAH TERBUKTI jalan end-to-end di simulasi
--     Docker lokal (pertasmart_sim) — workers/jobs_ai1.py (AI_Pertasmart_V3)
--     benar-benar INSERT baris nyata lewat skema persis di bawah ini, via
--     RQ worker + APScheduler, dan terbaca balik lewat backend pltp-iot
--     (GET /api/external/ai1a, /ai1b).
--   - ai2: skema ini HANYA disalin dari struktur VPS (yang sudah berisi data
--     lama milik anggota tim lain — JANGAN disentuh/dihapus). run_ai2 di
--     AI_Pertasmart_V3 masih stub dan sengaja TIDAK dijadwalkan, jadi bagian
--     ai2 di file ini belum diuji lewat INSERT nyata di simulasi. Disertakan
--     untuk kelengkapan referensi saja.
--   - ai1a_direction_annotation: layer TAMBAHAN dibangun terpisah di sisi AI
--     (repo AI_Pertasmart_V3), murni additive di atas ai1a/ai1a_shadow.
--     Skema di bawah disalin dari deskripsi tim AI, BELUM diverifikasi
--     independen lewat DBeaver DDL seperti tabel lain di file ini. Backfill
--     historis masih berjalan di VPS (background); tick live sudah
--     teranotasi real-time. Diekspos lewat backend pltp-iot (GET
--     /api/external/ai1a/direction, default source_table='ai1a' karena
--     AI1a-70 belum di-cutover — produksi masih model 65-fitur).
--     ⚠️ 11 dari 14 parameter driver (drivers_json) masih hipotesis riset
--     AI, belum divalidasi ahli PLTP/Pertamina (hanya TDS yang dikonfirmasi
--     manusia) — lihat disclaimer di response endpoint sebelum ditampilkan
--     ke UI/operator.
--
-- AMAN DIULANG (idempotent):
--   - Semua CREATE TABLE / CREATE INDEX pakai IF NOT EXISTS.
--   - Constraint FK ai2 dibungkus DO-block yang cek pg_constraint dulu
--     (ALTER TABLE ADD CONSTRAINT polos akan error kalau constraint-nya
--     sudah ada, dan constraint ini kemungkinan BESAR sudah ada di VPS).
--   - TIDAK ADA DROP / DELETE / TRUNCATE di file ini, sama sekali.
--
-- Perbedaan ai2 (VPS aktual) vs AI_Pertasmart_V3/scripts/init_db.sql — kalau
-- suatu saat ai2 mau disamakan dengan definisi AI repo, ini yang beda:
--   - id: VPS `serial4` (int4) vs init_db.sql `BIGSERIAL` (int8)
--   - VPS TIDAK punya kolom `timestamp`; init_db.sql punya (`TIMESTAMPTZ`)
--   - VPS PUNYA kolom `created_at`; init_db.sql tidak mendefinisikannya
--   - model_name: VPS `varchar(100)` vs init_db.sql `varchar(50)`
--   - dryness_predict/dryness_mae/ncg_predict/ncg_mae: VPS `numeric(10,4)`
--     vs init_db.sql `numeric(8,4)`
--   - dryness_confidence/ncg_confidence: VPS `numeric(5,4)` vs init_db.sql
--     `numeric(6,4)`
--   - status: VPS `varchar(50) DEFAULT 'normal'` vs init_db.sql `varchar(20)`
--     tanpa default
--   - processed_at: VPS `timestamp` (TANPA timezone) vs init_db.sql
--     `TIMESTAMPTZ`
--   - sensor_data_id: VPS `int4` (cocok dgn sensor_data.id yg serial4) vs
--     init_db.sql `BIGINT`
--   - VPS punya FK sensor_data_id -> sensor_data(id) ON DELETE SET NULL +
--     3 index (processed_at, sensor_data_id, status); init_db.sql tidak
--     mendefinisikan keduanya.
-- Skema di bawah ini mengikuti VPS AKTUAL (bukan init_db.sql), supaya tidak
-- bentrok dengan data lama yang sudah ada di sana.
-- ============================================================================

-- ── ai1a — hasil deteksi anomali / status risiko saat ini ───────────────────
CREATE TABLE IF NOT EXISTS public.ai1a (
	id bigserial NOT NULL,
	"timestamp" timestamptz NOT NULL,
	model_version varchar(50) NOT NULL,
	anomaly_score numeric(6, 4) NOT NULL,
	is_anomaly bool NOT NULL,
	risk_percentage numeric(5, 2) NOT NULL,
	risk_label varchar(20) NOT NULL,
	severity varchar(20) NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT ai1a_pkey PRIMARY KEY (id)
);

-- ── ai1a_direction_annotation — anotasi arah proses (menguntungkan/merugikan)
-- di atas ai1a/ai1a_shadow, lihat catatan status pengujian di atas ──────────
CREATE TABLE IF NOT EXISTS public.ai1a_direction_annotation (
	id bigserial NOT NULL,
	source_table varchar(20) NOT NULL,
	source_id bigint NOT NULL,
	model_version varchar(50) NULL,
	direction_flag varchar(40) NOT NULL,
	drivers_json jsonb NULL,
	config_version varchar(50) NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT ai1a_direction_annotation_pkey PRIMARY KEY (id),
	CONSTRAINT ai1a_direction_annotation_source_uniq UNIQUE (source_table, source_id)
);
CREATE INDEX IF NOT EXISTS idx_ai1a_direction_annotation_source ON public.ai1a_direction_annotation USING btree (source_table, source_id);

-- ── ai1b — prakiraan risiko 30 hari ke depan ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai1b (
	id bigserial NOT NULL,
	generated_at timestamptz NOT NULL,
	model_version varchar(50) NOT NULL,
	day_1_risk numeric(5, 2) NULL,
	day_2_risk numeric(5, 2) NULL,
	day_3_risk numeric(5, 2) NULL,
	day_4_risk numeric(5, 2) NULL,
	day_5_risk numeric(5, 2) NULL,
	day_6_risk numeric(5, 2) NULL,
	day_7_risk numeric(5, 2) NULL,
	day_8_risk numeric(5, 2) NULL,
	day_9_risk numeric(5, 2) NULL,
	day_10_risk numeric(5, 2) NULL,
	day_11_risk numeric(5, 2) NULL,
	day_12_risk numeric(5, 2) NULL,
	day_13_risk numeric(5, 2) NULL,
	day_14_risk numeric(5, 2) NULL,
	day_15_risk numeric(5, 2) NULL,
	day_16_risk numeric(5, 2) NULL,
	day_17_risk numeric(5, 2) NULL,
	day_18_risk numeric(5, 2) NULL,
	day_19_risk numeric(5, 2) NULL,
	day_20_risk numeric(5, 2) NULL,
	day_21_risk numeric(5, 2) NULL,
	day_22_risk numeric(5, 2) NULL,
	day_23_risk numeric(5, 2) NULL,
	day_24_risk numeric(5, 2) NULL,
	day_25_risk numeric(5, 2) NULL,
	day_26_risk numeric(5, 2) NULL,
	day_27_risk numeric(5, 2) NULL,
	day_28_risk numeric(5, 2) NULL,
	day_29_risk numeric(5, 2) NULL,
	day_30_risk numeric(5, 2) NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT ai1b_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_ai1b_generated ON public.ai1b USING btree (generated_at DESC);

-- ── ai2 — virtual sensor (dryness fraction + NCG), BELUM diuji di sim ───────
CREATE TABLE IF NOT EXISTS public.ai2 (
	id serial4 NOT NULL,
	model_name varchar(100) NULL,
	dryness_predict numeric(10, 4) NULL,
	dryness_confidence numeric(5, 4) NULL,
	dryness_mae numeric(10, 4) NULL,
	ncg_predict numeric(10, 4) NULL,
	ncg_confidence numeric(5, 4) NULL,
	ncg_mae numeric(10, 4) NULL,
	status varchar(50) DEFAULT 'normal'::character varying NULL,
	processed_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	sensor_data_id int4 NULL,
	CONSTRAINT ai2_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_ai2_processed_at ON public.ai2 USING btree (processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai2_sensor_data_id ON public.ai2 USING btree (sensor_data_id);
CREATE INDEX IF NOT EXISTS idx_ai2_status ON public.ai2 USING btree (status);

-- FK dibungkus DO-block: ALTER TABLE ADD CONSTRAINT polos tidak punya
-- IF NOT EXISTS di Postgres, dan constraint ini kemungkinan besar sudah ada
-- di VPS (ai2 sudah berisi data lama).
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'ai2_sensor_data_id_fkey'
	) THEN
		ALTER TABLE public.ai2
			ADD CONSTRAINT ai2_sensor_data_id_fkey
			FOREIGN KEY (sensor_data_id) REFERENCES public.sensor_data(id) ON DELETE SET NULL;
	END IF;
END $$;
