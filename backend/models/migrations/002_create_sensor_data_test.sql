-- Migration: Create sensor_data_test table for live data testing
-- Created: 2025-11-21

-- Table: sensor_data_test (untuk testing dengan live data)
CREATE TABLE IF NOT EXISTS sensor_data_test (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    temperature DECIMAL(10, 2),
    pressure DECIMAL(10, 2),
    flow_rate DECIMAL(10, 2),
    gen_voltage_v_w DECIMAL(10, 2),      -- Generator Voltage V-W phase
    gen_voltage_w_u DECIMAL(10, 2),      -- Generator Voltage W-U phase
    gen_reactive_power DECIMAL(10, 2),   -- Generator Reactive Power
    gen_output DECIMAL(10, 2),           -- Generator Output Power
    gen_power_factor DECIMAL(5, 4),      -- Generator Power Factor (0-1)
    gen_frequency DECIMAL(10, 2),        -- Generator Frequency (Hz)
    speed_detection DECIMAL(10, 2),      -- Speed Detection value
    mcv_l DECIMAL(10, 2),                -- MCV Left valve position
    mcv_r DECIMAL(10, 2),                -- MCV Right valve position
    tds DECIMAL(10, 2),                  -- Total Dissolved Solids
    status VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_sensor_data_test_timestamp ON sensor_data_test(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_test_status ON sensor_data_test(status);

-- Comment untuk dokumentasi
COMMENT ON TABLE sensor_data_test IS 'Test data sensor untuk simulasi live data streaming';
