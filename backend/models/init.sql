-- PertaSmart Database Schema
-- Created: 2025-11-05

-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Users (untuk authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Sensor Data (data dari Honeywell & Generator)
CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100),
    timestamp TIMESTAMP NOT NULL,
    temperature DECIMAL(10, 2),
    pressure DECIMAL(10, 2),
    flow_rate DECIMAL(10, 2),
    gen_voltage_v_w DECIMAL(10, 2), -- Generator Voltage V-W phase
    gen_voltage_w_u DECIMAL(10, 2), -- Generator Voltage W-U phase
    gen_reactive_power DECIMAL(10, 2), -- Generator Reactive Power
    gen_output DECIMAL(10, 2), -- Generator Output Power
    gen_power_factor DECIMAL(5, 4), -- Generator Power Factor (0-1)
    gen_frequency DECIMAL(10, 2), -- Generator Frequency (Hz)
    speed_detection DECIMAL(10, 2), -- Speed Detection value
    mcv_l DECIMAL(10, 2), -- MCV Left valve position
    mcv_r DECIMAL(10, 2), -- MCV Right valve position
    tds DECIMAL(10, 2), -- Total Dissolved Solids
    status VARCHAR(50),
    raw_data JSONB, -- untuk menyimpan data mentah lengkap
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Field Data (input manual dari frontend)
CREATE TABLE IF NOT EXISTS field_data (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    operator_name VARCHAR(255),
    field_type VARCHAR(100),
    measurement_value DECIMAL(10, 2),
    unit VARCHAR(50),
    notes TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    photo_url VARCHAR(500),
    recorded_at TIMESTAMP NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: ML Predictions (hasil machine learning dari edge computing)
CREATE TABLE IF NOT EXISTS ml_predictions (
    id SERIAL PRIMARY KEY,
    sensor_data_id INTEGER REFERENCES sensor_data(id),
    model_name VARCHAR(100),
    prediction_type VARCHAR(100),
    predicted_value DECIMAL(10, 2),
    confidence_score DECIMAL(5, 4),
    anomaly_detected BOOLEAN DEFAULT false,
    anomaly_severity VARCHAR(50),
    features JSONB, -- fitur yang digunakan untuk prediksi
    result_data JSONB, -- hasil lengkap dari ML
    processed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk performa query
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_device_id ON sensor_data(device_id);
CREATE INDEX IF NOT EXISTS idx_field_data_recorded_at ON field_data(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_processed_at ON ml_predictions(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_anomaly ON ml_predictions(anomaly_detected);

-- Insert default admin user
-- Password: pertasmart.unpad!!2025
-- Hash generated with bcryptjs (will be created by init script)
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'pertasmart@unpad.ac.id',
    '$2a$10$placeholder', -- akan di-generate oleh script
    'PertaSmart Admin',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers untuk auto-update
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_field_data_updated_at BEFORE UPDATE ON field_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments untuk dokumentasi
COMMENT ON TABLE users IS 'User accounts untuk authentication system';
COMMENT ON TABLE sensor_data IS 'Data sensor dari Honeywell server';
COMMENT ON TABLE field_data IS 'Data manual input dari lapangan';
COMMENT ON TABLE ml_predictions IS 'Hasil prediksi machine learning dari edge computing';
