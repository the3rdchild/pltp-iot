SELECT
    COUNT(*) as total_records,
    MIN(timestamp) as earliest_record,
    MAX(timestamp) as latest_record,
    COUNT(DISTINCT device_id) as unique_devices
FROM sensor_data;

-- Show device_id distribution
SELECT
    device_id,
    COUNT(*) as count,
    MIN(timestamp) as first_record,
    MAX(timestamp) as last_record
FROM sensor_data
GROUP BY device_id
ORDER BY count DESC;

-- Backup testing data to temporary table (optional, for safety)
CREATE TABLE IF NOT EXISTS sensor_data_backup_testing AS
SELECT * FROM sensor_data WHERE device_id = 'SIMULASI-API-001';

-- Check how many will be deleted
SELECT COUNT(*) as will_be_deleted
FROM sensor_data
WHERE device_id = 'SIMULASI-API-001';

-- Delete testing data (from SIMULASI-API-001)
DELETE FROM sensor_data WHERE device_id = 'SIMULASI-API-001';

-- If you want to delete ALL data (use with caution!)
-- TRUNCATE TABLE sensor_data;

-- Verify deletion
SELECT
    COUNT(*) as remaining_records,
    MIN(timestamp) as earliest_record,
    MAX(timestamp) as latest_record
FROM sensor_data;

-- Optimize table after deletion
VACUUM ANALYZE sensor_data;

-- Show final state
SELECT
    'Cleanup completed!' as status,
    COUNT(*) as total_records,
    pg_size_pretty(pg_total_relation_size('sensor_data')) as table_size
FROM sensor_data;
