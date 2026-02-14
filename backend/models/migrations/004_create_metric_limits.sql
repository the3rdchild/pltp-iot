-- Migration 004: Create metric_limits table
-- Stores configurable thresholds synced from frontend settings

CREATE TABLE IF NOT EXISTS metric_limits (
    id SERIAL PRIMARY KEY,
    metric_key VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    unit VARCHAR(50),
    min_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    warning_low DOUBLE PRECISION,
    warning_high DOUBLE PRECISION,
    abnormal_low DOUBLE PRECISION,
    abnormal_high DOUBLE PRECISION,
    ideal_low DOUBLE PRECISION,
    ideal_high DOUBLE PRECISION,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metric_limits_key ON metric_limits(metric_key);

-- Insert default limits for PTF metrics
INSERT INTO metric_limits (metric_key, display_name, unit, min_value, max_value, warning_low, warning_high, abnormal_low, abnormal_high, ideal_low, ideal_high)
VALUES
    ('pressure', 'Pressure', 'barg', 4, 8, 5, 7, 4, 8, 5.5, 6.5),
    ('temperature', 'Temperature', '°C', 100, 200, 120, 180, 105, 195, 135, 175),
    ('flow_rate', 'Flow Rate', 't/h', 200, 300, 220, 270, 210, 285, 225, 265),
    ('gen_output', 'Active Power', 'MW', 0, 40, 5, 38, 1, 40, 10, 35),
    ('gen_reactive_power', 'Reactive Power', 'MVAR', 0, 10, NULL, 8.5, NULL, 10, NULL, 7),
    ('voltage', 'Voltage (Average)', 'kV', 10, 15, 11, 14.5, 10.5, 15, 13, 14),
    ('current', 'Current', 'A', 800, 2000, 1000, 1800, 800, 2000, 1150, 1550),
    ('speed_detection', 'S.T Speed', 'RPM', 2800, 3200, 2900, 3100, 2850, 3150, 2950, 3050),
    ('tds', 'TDS Overall', 'ppm', 0, 10, NULL, 6, NULL, 10, NULL, 0),
    ('dryness', 'Dryness Fraction', '%', 95, 99.9, 97, 100, 95, 100, 100, 100),
    ('ncg', 'NCG', 'wt%', 0, 10, NULL, 5, NULL, 10, NULL, 0)
ON CONFLICT (metric_key) DO NOTHING;
