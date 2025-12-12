-- Add new columns to the sensor_data table for Honeywell data
ALTER TABLE sensor_data
ADD COLUMN main_steam_pressure DOUBLE PRECISION,
ADD COLUMN main_steam_flow DOUBLE PRECISION,
ADD COLUMN main_steam_temp DOUBLE PRECISION,
ADD COLUMN gen_reactive_power_net DOUBLE PRECISION,
ADD COLUMN gen_output_mw DOUBLE PRECISION,
ADD COLUMN gen_freq DOUBLE PRECISION,
ADD COLUMN turbine_speed DOUBLE PRECISION,
ADD COLUMN mcv_l_position DOUBLE PRECISION,
ADD COLUMN mcv_r_position DOUBLE PRECISION,
ADD COLUMN voltage_u_v DOUBLE PRECISION,
ADD COLUMN voltage_v_w DOUBLE PRECISION,
ADD COLUMN voltage_u_w DOUBLE PRECISION;
