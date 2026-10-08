-- Migration 009: metric_limits keeps only a lower and an upper limit
--
-- The six thresholds (abnormal/warning/ideal x low/high) are replaced by two
-- limits. The amber and red bands are no longer stored; they are derived from
-- the limits (backend/utils/limits.js, src/utils/limitZones.js):
--
--   min -- red -- halfway -- amber -- lower_limit -- green -- upper_limit -- amber -- halfway -- red -- max
--
-- The old warning pair was the edge of the normal band, so it becomes the new
-- limit pair. A metric without a warning threshold on one side gets the scale
-- edge there, which switches that side's alarm off -- the same behaviour it
-- had before.
--
-- Also drops the per-component TDS limits (CO2, Argon, Methane, MA3, Honeywell
-- TDS): those gauges were removed from the dashboard and the settings page.
--
-- Safe to re-run: the backfill only runs while the old columns still exist.

ALTER TABLE metric_limits
    ADD COLUMN IF NOT EXISTS lower_limit DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS upper_limit DOUBLE PRECISION;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'metric_limits' AND column_name = 'warning_low'
    ) THEN
        -- LEAST ignores NULLs, so a missing max_value leaves warning_high as is.
        UPDATE metric_limits
        SET lower_limit = COALESCE(warning_low, min_value),
            upper_limit = LEAST(COALESCE(warning_high, max_value), max_value);

        ALTER TABLE metric_limits
            DROP COLUMN warning_low,
            DROP COLUMN warning_high,
            DROP COLUMN abnormal_low,
            DROP COLUMN abnormal_high,
            DROP COLUMN ideal_low,
            DROP COLUMN ideal_high;
    END IF;
END $$;

DELETE FROM metric_limits
WHERE metric_key IN ('tdsCO2', 'tdsArgon', 'tdsMethane', 'tdsMA3', 'tds_honeywell');
