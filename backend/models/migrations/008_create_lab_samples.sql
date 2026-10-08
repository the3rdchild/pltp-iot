-- Migration 008: Create lab_samples
--
-- Laboratory readings, entered by hand or imported from CSV. Deliberately NOT
-- stored in field_data: that table is one measurement per row (field_type +
-- measurement_value), so a single lab sample carrying six metrics would be
-- shredded into six rows that have to be stitched back together on every read,
-- and it has nowhere to record when the result was filed.
--
-- Three different times matter here and they are not interchangeable:
--
--   sampled_at  -- when the steam was actually sampled. This is the analytical
--                  axis: every comparison against sensor_data or ai2 is made at
--                  THIS moment, never at import time.
--   result_at   -- when the laboratory issued the result (the report date,
--                  "tanggal result"). Display and bookkeeping only; it never
--                  shifts a comparison.
--   imported_at -- when the row reached this database. Bookkeeping only. A
--                  sample taken on the 5th may well be typed in on the 10th;
--                  that lag must not shift the comparison.

CREATE TABLE IF NOT EXISTS lab_samples (
    id SERIAL PRIMARY KEY,

    sampled_at TIMESTAMP NOT NULL,

    -- The CSV carries dates without a clock (05/01/22), so there is no honest
    -- instant to compare against -- the comparison uses the whole calendar day.
    -- When a source does supply a time, this is false and the comparison
    -- narrows to a window around that moment instead. Storing the distinction
    -- beats inferring it later from a midnight timestamp, which would be
    -- indistinguishable from a sample genuinely taken at 00:00.
    sampled_at_is_date_only BOOLEAN NOT NULL DEFAULT true,

    -- Report date from the lab ("tanggal result"). DATE rather than TIMESTAMP:
    -- a report date carries no meaningful clock time, and a plain date also
    -- sidesteps the timezone drift a midnight timestamp would introduce.
    result_at DATE,

    pressure    DECIMAL(10, 4),
    temperature DECIMAL(10, 4),
    flow_rate   DECIMAL(10, 4),
    tds         DECIMAL(10, 4),
    dryness     DECIMAL(10, 4),
    ncg         DECIMAL(10, 4),

    notes TEXT,

    -- 'manual' (the form on /admin/dataInput) or 'csv' (bulk import).
    source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'csv')),
    source_file VARCHAR(255),

    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Makes re-importing the same CSV idempotent: the importer upserts on this key,
-- so running a file twice corrects the rows instead of duplicating them. The
-- consequence to know about: two samples bearing the same sampled_at are one
-- row, not two. That holds for this dataset (roughly monthly sampling) but
-- would need a wider key if same-day repeat sampling ever starts.
-- result_at was added after this migration had already shipped, and
-- CREATE TABLE IF NOT EXISTS above short-circuits on an existing table -- so on
-- any database where the first version of 008 already ran, the column would
-- never appear and every insert would fail on a missing column. Stated
-- separately so the migration is genuinely re-runnable either way.
ALTER TABLE lab_samples ADD COLUMN IF NOT EXISTS result_at DATE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_samples_sampled_at_unique
    ON lab_samples(sampled_at);

CREATE INDEX IF NOT EXISTS idx_lab_samples_sampled_at
    ON lab_samples(sampled_at DESC);

-- The comparison query filters sensor_data and ai2 by a per-sample time window.
-- sensor_data(timestamp DESC) and ai2(processed_at DESC) already exist from
-- earlier migrations, so those windows are index-served.
