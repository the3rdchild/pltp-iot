const {
  fetchAndStoreLiveData,
  testConnection,
  fetchHoneywellData,
  transformHoneywellData,
  insertSensorData,
  formatToHoneywellTimestamp
} = require('../services/honeywellService');

// Minimum gap between two syncs, across all callers.
//
// Every call reaches out to the production PIMS, so this endpoint must not be
// usable as an amplifier: without a floor, a handful of open dashboards each
// finding an empty window would fan out into a burst of PIMS requests for data
// that has not changed. fetchAndStoreLiveData pulls the last five minutes, so
// syncing more often than this cannot surface anything new anyway.
const SYNC_MIN_INTERVAL_MS = parseInt(process.env.HONEYWELL_SYNC_MIN_INTERVAL_MS, 10) || 30000;

// Process-local, deliberately. It throttles this instance, which is what
// protects PIMS from this instance; a shared limiter across replicas would need
// coordination that is not worth it for a fallback path.
let lastSyncAt = 0;
let inFlightSync = null;

/**
 * POST /api/honeywell/sync-live
 * Fetch latest data from Honeywell and store in database.
 *
 * Doubles as the fallback the dashboard uses when the database has no recent
 * readings -- see the 'now' seed in PTFChart. Requires a signed-in session:
 * it both spends production PIMS capacity and writes to sensor_data.
 */
const syncLiveData = async (req, res) => {
  try {
    const sinceLast = Date.now() - lastSyncAt;

    if (sinceLast < SYNC_MIN_INTERVAL_MS && !inFlightSync) {
      // Not an error: the caller asked for fresh data and fresh data is what is
      // already there. Reported so the client can tell this apart from a sync
      // that genuinely ran and found nothing.
      return res.json({
        success: true,
        throttled: true,
        message: 'Sync skipped: a sync ran recently',
        data: { retry_after_ms: SYNC_MIN_INTERVAL_MS - sinceLast }
      });
    }

    console.log('Starting Honeywell live data sync...');

    // Concurrent callers share one upstream request rather than each opening
    // their own -- the whole point is to spare PIMS, and they all want the
    // same five-minute window.
    if (!inFlightSync) {
      inFlightSync = fetchAndStoreLiveData().finally(() => {
        lastSyncAt = Date.now();
        inFlightSync = null;
      });
    }

    const result = await inFlightSync;

    res.json({
      success: true,
      throttled: false,
      message: 'Live data synced successfully',
      data: result
    });

  } catch (error) {
    console.error('Error syncing live data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync live data from Honeywell',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/honeywell/receive
 * Receive data pushed from Honeywell server
 * Expected body format matches Honeywell API response
 */
const receiveHoneywellData = async (req, res) => {
  try {
    const honeywellData = req.body;

    // Validate request body
    if (!honeywellData || !honeywellData.data) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body. Expected Honeywell data format.'
      });
    }

    console.log('Receiving Honeywell data push...');

    // Transform and insert data
    const records = transformHoneywellData(honeywellData);
    const result = await insertSensorData(records);

    res.json({
      success: true,
      message: 'Data received and stored successfully',
      data: result
    });

  } catch (error) {
    console.error('Error receiving Honeywell data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Honeywell data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/honeywell/test-connection
 * Test connection to Honeywell API
 */
const testHoneywellConnection = async (req, res) => {
  try {
    const { tagName } = req.query;

    console.log('Testing Honeywell API connection...');

    const result = await testConnection(tagName);

    res.json(result);

  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test connection',
      error: error.message
    });
  }
};

/**
 * POST /api/honeywell/fetch-custom
 * Fetch custom data from Honeywell with custom parameters
 */
const fetchCustomData = async (req, res) => {
  try {
    const {
      TagName,
      StartTime,
      EndTime,
      MaxRows,
      ReductionData,
      SampleInterval
    } = req.body;

    // Validate required fields
    if (!TagName || !StartTime || !EndTime) {
      return res.status(400).json({
        success: false,
        message: 'TagName, StartTime, and EndTime are required'
      });
    }

    console.log(`Fetching custom data for ${TagName}...`);

    const response = await fetchHoneywellData({
      TagName,
      StartTime,
      EndTime,
      MaxRows: MaxRows || 100,
      ReductionData: ReductionData || 'now',
      SampleInterval: SampleInterval || 1000
    });

    // Optionally store in database
    const shouldStore = req.body.storeInDatabase !== false;

    if (shouldStore) {
      const records = transformHoneywellData(response);
      const result = await insertSensorData(records);

      res.json({
        success: true,
        message: 'Data fetched and stored successfully',
        honeywellResponse: response,
        databaseResult: result
      });
    } else {
      res.json({
        success: true,
        message: 'Data fetched successfully (not stored)',
        data: response
      });
    }

  } catch (error) {
    console.error('Error fetching custom data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/honeywell/status
 * Get Honeywell integration status
 */
const getHoneywellStatus = async (req, res) => {
  try {
    const { query } = require('../config/database');

    // Get latest data timestamp from database
    const latestData = await query(
      `SELECT MAX(timestamp) as latest_timestamp, COUNT(*) as total_records
       FROM sensor_data
       WHERE device_id = $1`,
      [process.env.HONEYWELL_DEVICE_ID || 'honeywell-phd-01']
    );

    // Get record count for today
    const todayRecords = await query(
      `SELECT COUNT(*) as count
       FROM sensor_data
       WHERE device_id = $1 AND DATE(timestamp) = CURRENT_DATE`,
      [process.env.HONEYWELL_DEVICE_ID || 'honeywell-phd-01']
    );

    res.json({
      success: true,
      data: {
        configured: !!process.env.HONEYWELL_API_URL,
        apiUrl: process.env.HONEYWELL_API_URL,
        deviceId: process.env.HONEYWELL_DEVICE_ID || 'honeywell-phd-01',
        latestDataTimestamp: latestData.rows[0]?.latest_timestamp,
        totalRecords: parseInt(latestData.rows[0]?.total_records || 0),
        recordsToday: parseInt(todayRecords.rows[0]?.count || 0),
        sampleInterval: process.env.HONEYWELL_API_SAMPLE_INTERVAL || 1000
      }
    });

  } catch (error) {
    console.error('Error getting Honeywell status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Honeywell status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  syncLiveData,
  receiveHoneywellData,
  testHoneywellConnection,
  fetchCustomData,
  getHoneywellStatus
};
