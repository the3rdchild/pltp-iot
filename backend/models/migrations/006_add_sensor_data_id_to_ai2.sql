-- Migration 006: Add sensor_data_id to ai2 table
-- Links each AI prediction to the corresponding sensor_data row

ALTER TABLE ai2
    ADD COLUMN IF NOT EXISTS sensor_data_id INTEGER REFERENCES sensor_data(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ai2_sensor_data_id ON ai2(sensor_data_id);
