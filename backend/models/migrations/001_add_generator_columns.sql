-- Migration: Add new generator and sensor columns to sensor_data table
-- Date: 2025-11-20
-- Description: Menambahkan kolom untuk generator voltage, power, frequency, MCV, dan TDS

-- Tambah kolom baru ke tabel sensor_data
ALTER TABLE sensor_data
  ADD COLUMN IF NOT EXISTS gen_voltage_v_w DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS gen_voltage_w_u DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS gen_reactive_power DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS gen_output DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS gen_power_factor DECIMAL(5, 4),
  ADD COLUMN IF NOT EXISTS gen_frequency DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS speed_detection DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS mcv_l DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS mcv_r DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS tds DECIMAL(10, 2);

-- Hapus kolom lama yang tidak dipakai (optional - uncomment jika mau dihapus)
-- ALTER TABLE sensor_data DROP COLUMN IF EXISTS humidity;
-- ALTER TABLE sensor_data DROP COLUMN IF EXISTS voltage;
-- ALTER TABLE sensor_data DROP COLUMN IF EXISTS current;

-- Tambah comment untuk dokumentasi kolom baru
COMMENT ON COLUMN sensor_data.gen_voltage_v_w IS 'Generator Voltage V-W phase';
COMMENT ON COLUMN sensor_data.gen_voltage_w_u IS 'Generator Voltage W-U phase';
COMMENT ON COLUMN sensor_data.gen_reactive_power IS 'Generator Reactive Power';
COMMENT ON COLUMN sensor_data.gen_output IS 'Generator Output Power';
COMMENT ON COLUMN sensor_data.gen_power_factor IS 'Generator Power Factor (0-1)';
COMMENT ON COLUMN sensor_data.gen_frequency IS 'Generator Frequency (Hz)';
COMMENT ON COLUMN sensor_data.speed_detection IS 'Speed Detection value';
COMMENT ON COLUMN sensor_data.mcv_l IS 'MCV Left valve position';
COMMENT ON COLUMN sensor_data.mcv_r IS 'MCV Right valve position';
COMMENT ON COLUMN sensor_data.tds IS 'Total Dissolved Solids (TDS)';

-- Verify kolom sudah ditambahkan
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'sensor_data'
ORDER BY ordinal_position;
