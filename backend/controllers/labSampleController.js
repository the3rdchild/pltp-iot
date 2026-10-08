const { query } = require('../config/database');

/**
 * Lab samples: readings produced in a laboratory, entered by hand on
 * /admin/dataInput or imported in bulk from CSV.
 *
 * The point of storing them is comparison. A lab reading is ground truth; the
 * sensors and the AI models are the things being checked against it. So every
 * comparison is anchored to `sampled_at` -- when the steam was actually
 * sampled -- and never to when the row happened to be typed in.
 */

// Which series each lab metric is compared against.
//
// Not all of them come from sensor_data: dryness and ncg have no sensor at all,
// they are model output living in the ai2 table. Comparing lab dryness against
// ai2.dryness_predict is the whole point -- it is how you find out whether the
// model is right.
const COMPARISON_SOURCE = {
  pressure:    { table: 'sensor_data', column: 'pressure',        timeColumn: 'timestamp' },
  temperature: { table: 'sensor_data', column: 'temperature',     timeColumn: 'timestamp' },
  flow_rate:   { table: 'sensor_data', column: 'flow_rate',       timeColumn: 'timestamp' },
  tds:         { table: 'sensor_data', column: 'tds',             timeColumn: 'timestamp' },
  dryness:     { table: 'ai2',         column: 'dryness_predict', timeColumn: 'processed_at' },
  ncg:         { table: 'ai2',         column: 'ncg_predict',     timeColumn: 'processed_at' }
};

const LAB_METRICS = Object.keys(COMPARISON_SOURCE);

// Half-width of the window used when a sample DOES carry a clock time. Sensor
// rows land about once a second, so matching an exact instant would usually
// find nothing; a short window around the moment is the honest reading of
// "at that time". Date-only samples ignore this and use the whole day instead.
const TIMED_SAMPLE_WINDOW = '15 minutes';

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/**
 * result_at is a plain DATE: no clock, no timezone. Accepts 'YYYY-MM-DD' (what
 * the date inputs send) or a full ISO string, of which only the date part is
 * kept. Empty means "no result date"; anything non-empty that cannot be parsed
 * throws, so the caller reports it instead of silently storing a wrong date.
 */
const normalizeResultDate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid result_at: ${JSON.stringify(value)}`);
  }
  return parsed.toISOString().slice(0, 10);
};

/**
 * Accepts a wall-clock sampling time and reports whether it carried a clock.
 * That flag decides the comparison window later, so it has to be derived here
 * while the original string is still visible -- once stored, midnight from a
 * date-only value is indistinguishable from a sample truly taken at 00:00.
 *
 * Wall clock, deliberately, and never routed through `new Date()`.
 * sampled_at is `timestamp without time zone`, and everything it is compared
 * against stores wall-clock digits too: parseHoneywellTimestamp pins the PIMS
 * reading's own clock face with a literal 'Z', so sensor_data holds local
 * readings. Parsing '2022-01-05T09:30:00' with `new Date()` would interpret it
 * in the server's zone and re-emit it as UTC, storing 02:30 for a sample taken
 * at 09:30 -- a seven-hour miss against a fifteen-minute comparison window,
 * which fails silently as "no sensor data that day". Reading the digits out
 * directly keeps 09:30 meaning 09:30.
 */
const SAMPLED_AT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

const parseSampledAt = (value) => {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  // An explicit zone is refused rather than guessed at. Converting it would
  // mean assuming which zone the rest of the data is in, and getting that
  // wrong is exactly the silent failure this function exists to prevent.
  if (/[Zz]$/.test(raw) || /[+-]\d{2}:?\d{2}$/.test(raw)) {
    throw new Error(
      `sampled_at must be a wall-clock time without a timezone offset, got ${JSON.stringify(raw)}`
    );
  }

  const match = raw.match(SAMPLED_AT_PATTERN);
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match;

  // Reject impossible calendar dates (31 February and friends) without letting
  // Date's timezone handling anywhere near the value.
  const probe = new Date(Date.UTC(+year, +month - 1, +day));
  if (probe.getUTCFullYear() !== +year || probe.getUTCMonth() !== +month - 1 || probe.getUTCDate() !== +day) {
    return null;
  }
  if (hour !== undefined && (+hour > 23 || +minute > 59 || (second !== undefined && +second > 59))) {
    return null;
  }

  const dateOnly = hour === undefined;
  const time = dateOnly ? '00:00:00' : `${hour}:${minute}:${second ?? '00'}`;

  // Handed to Postgres as a plain string; a `timestamp without time zone`
  // column stores these digits verbatim.
  return { value: `${year}-${month}-${day} ${time}`, dateOnly };
};

/**
 * GET /api/data/lab-samples
 * Query params: limit, offset, start_date, end_date
 */
const getLabSamples = async (req, res) => {
  try {
    const { limit = 100, offset = 0, start_date, end_date } = req.query;

    // Clamped rather than passed through: an unbounded ?limit would hand back
    // the whole table, and a non-numeric one reached Postgres as `LIMIT NaN`
    // and came back as a 500.
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 1000);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

    let sql = `
      SELECT l.*, u.name AS created_by_name
      FROM lab_samples l
      LEFT JOIN users u ON u.id = l.created_by
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      params.push(start_date);
      sql += ` AND l.sampled_at >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND l.sampled_at <= $${params.length}`;
    }

    sql += ' ORDER BY l.sampled_at DESC';
    params.push(safeLimit, safeOffset);
    sql += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(sql, params);
    const total = await query('SELECT COUNT(*)::int AS n FROM lab_samples');

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      total: total.rows[0].n
    });
  } catch (error) {
    console.error('Error fetching lab samples:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lab samples', error: error.message });
  }
};

/**
 * Upsert one row. Shared by the manual form and the CSV importer so both paths
 * validate identically -- a CSV row and a typed row are the same thing and must
 * not be able to drift apart.
 */
// Columns written on every upsert, in the order their values are supplied.
// The metric columns come from LAB_METRICS rather than a second hand-written
// list: the values are built by mapping over that same array, so a column list
// maintained separately could fall out of step with it and load pressure into
// temperature -- a corruption with no error attached to it. One list, one
// order, no way for them to disagree.
const UPSERT_COLUMNS = [
  'sampled_at',
  'sampled_at_is_date_only',
  'result_at',
  ...LAB_METRICS,
  'notes',
  'source',
  'source_file',
  'created_by'
];

// Everything except the conflict key gets overwritten on re-import.
const UPSERT_ASSIGNMENTS = UPSERT_COLUMNS.filter((c) => c !== 'sampled_at')
  .map((c) => `${c} = EXCLUDED.${c}`)
  .join(',\n       ');

const UPSERT_SQL = `
  INSERT INTO lab_samples (${UPSERT_COLUMNS.join(', ')}, updated_at)
  VALUES (${UPSERT_COLUMNS.map((_, i) => `$${i + 1}`).join(', ')}, NOW())
  ON CONFLICT (sampled_at) DO UPDATE SET
       ${UPSERT_ASSIGNMENTS},
       updated_at = NOW()
  RETURNING id, (xmax = 0) AS inserted
`;

const upsertSample = async (sample, { source, sourceFile, userId }) => {
  const parsed = parseSampledAt(sample.sampled_at);
  if (!parsed) throw new Error(`Invalid or missing sampled_at: ${JSON.stringify(sample.sampled_at)}`);

  const values = LAB_METRICS.map((m) => toNumberOrNull(sample[m]));
  if (values.every((v) => v === null)) {
    throw new Error(`Row for ${parsed.value} has no numeric readings at all`);
  }

  const result = await query(UPSERT_SQL, [
    parsed.value,
    parsed.dateOnly,
    normalizeResultDate(sample.result_at),
    ...values,
    sample.notes || null,
    source,
    sourceFile || null,
    userId
  ]);

  return result.rows[0];
};

/**
 * POST /api/data/lab-samples
 * Single reading from the manual form.
 */
const createLabSample = async (req, res) => {
  try {
    const row = await upsertSample(req.body, {
      source: 'manual',
      sourceFile: null,
      userId: req.user?.userId ?? null
    });

    res.status(row.inserted ? 201 : 200).json({
      success: true,
      message: row.inserted
        ? 'Lab sample saved'
        : 'A sample already existed for that time — it has been updated',
      data: { id: row.id, inserted: row.inserted }
    });
  } catch (error) {
    // A bad row is the caller's problem to fix, not a server fault.
    console.error('Error saving lab sample:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/data/lab-samples/import
 * Body: { rows: [...], source_file?: string }
 *
 * Each row may carry result_at ('YYYY-MM-DD'). Rows without one came from a
 * CSV that has no result column; the browser fills the fallback date picked
 * in the import UI before sending.
 *
 * Rows arrive already parsed by the browser, which is also what drives the
 * preview the user confirms before importing. They are re-validated here
 * regardless: the client is a convenience, never the authority.
 */
const importLabSamples = async (req, res) => {
  try {
    const { rows, source_file } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'rows must be a non-empty array' });
    }

    const MAX_ROWS = 5000;
    if (rows.length > MAX_ROWS) {
      return res.status(400).json({
        success: false,
        message: `Too many rows in one import (${rows.length}); the limit is ${MAX_ROWS}`
      });
    }

    const userId = req.user?.userId ?? null;
    let inserted = 0;
    let updated = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i += 1) {
      try {
        const result = await upsertSample(rows[i], {
          source: 'csv',
          sourceFile: source_file,
          userId
        });
        if (result.inserted) inserted += 1;
        else updated += 1;
      } catch (rowError) {
        // Import as much as is valid and report the rest by line number, rather
        // than rejecting a 40-row file over one malformed date.
        errors.push({ row: i + 1, message: rowError.message });
      }
    }

    res.json({
      success: true,
      message: `${inserted} new, ${updated} updated, ${errors.length} skipped`,
      data: { inserted, updated, skipped: errors.length, errors: errors.slice(0, 50) }
    });
  } catch (error) {
    console.error('Error importing lab samples:', error);
    res.status(500).json({ success: false, message: 'Import failed', error: error.message });
  }
};

/**
 * GET /api/data/lab-samples/comparison?metric=<metric>
 *
 * Each lab reading paired with what the sensors (or the model) were reporting
 * at the moment it was sampled.
 *
 * Computed on read rather than stored at import time on purpose: sensor history
 * is backfilled by scripts/importHistoricalData*.js, so the readings covering a
 * given sampling day may not arrive until well after the lab row does. A value
 * frozen at import would quietly stay wrong; recomputing means a late backfill
 * corrects the comparison by itself.
 */
const getLabComparison = async (req, res) => {
  try {
    const { metric, start_date, end_date } = req.query;

    const source = COMPARISON_SOURCE[metric];
    if (!source) {
      return res.status(400).json({
        success: false,
        message: `Invalid metric. Valid metrics: ${LAB_METRICS.join(', ')}`
      });
    }

    const { table, column, timeColumn } = source;

    // Window per row: the whole calendar day for a date-only sample, a short
    // span around the instant for a timed one. See TIMED_SAMPLE_WINDOW.
    const windowStart = `CASE WHEN l.sampled_at_is_date_only
                              THEN DATE_TRUNC('day', l.sampled_at)
                              ELSE l.sampled_at - INTERVAL '${TIMED_SAMPLE_WINDOW}' END`;
    const windowEnd = `CASE WHEN l.sampled_at_is_date_only
                            THEN DATE_TRUNC('day', l.sampled_at) + INTERVAL '1 day'
                            ELSE l.sampled_at + INTERVAL '${TIMED_SAMPLE_WINDOW}' END`;

    const params = [];
    let dateFilter = '';
    if (start_date) {
      params.push(start_date);
      dateFilter += ` AND l.sampled_at >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      dateFilter += ` AND l.sampled_at <= $${params.length}`;
    }

    const sql = `
      SELECT
        l.id,
        l.sampled_at,
        l.sampled_at_is_date_only,
        l.${metric} AS lab_value,
        l.source,
        c.avg_value,
        c.min_value,
        c.max_value,
        c.data_points
      FROM lab_samples l
      LEFT JOIN LATERAL (
        SELECT
          AVG(src.${column})    AS avg_value,
          MIN(src.${column})    AS min_value,
          MAX(src.${column})    AS max_value,
          COUNT(*)::int         AS data_points
        FROM ${table} src
        WHERE src.${timeColumn} >= ${windowStart}
          AND src.${timeColumn} <  ${windowEnd}
          AND src.${column} IS NOT NULL
      ) c ON TRUE
      WHERE l.${metric} IS NOT NULL${dateFilter}
      ORDER BY l.sampled_at ASC
    `;

    const result = await query(sql, params);

    const data = result.rows.map((row) => {
      const labValue = row.lab_value !== null ? parseFloat(row.lab_value) : null;
      const avgValue = row.avg_value !== null ? parseFloat(row.avg_value) : null;

      return {
        id: row.id,
        sampled_at: row.sampled_at,
        date_only: row.sampled_at_is_date_only,
        source: row.source,
        lab_value: labValue,
        // Null whenever no rows covered the window -- distinct from a real zero,
        // and the reason data_points travels with it.
        comparison_avg: avgValue,
        comparison_min: row.min_value !== null ? parseFloat(row.min_value) : null,
        comparison_max: row.max_value !== null ? parseFloat(row.max_value) : null,
        comparison_points: row.data_points ?? 0,
        difference: labValue !== null && avgValue !== null ? parseFloat((labValue - avgValue).toFixed(4)) : null
      };
    });

    res.json({
      success: true,
      data: {
        metric,
        compared_against: `${table}.${column}`,
        points: data.length,
        samples: data
      }
    });
  } catch (error) {
    console.error('Error building lab comparison:', error);
    res.status(500).json({ success: false, message: 'Failed to build comparison', error: error.message });
  }
};

/**
 * DELETE /api/data/lab-samples/:id
 */
const deleteLabSample = async (req, res) => {
  try {
    const result = await query('DELETE FROM lab_samples WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lab sample not found' });
    }
    res.json({ success: true, message: 'Lab sample deleted', data: { id: result.rows[0].id } });
  } catch (error) {
    console.error('Error deleting lab sample:', error);
    res.status(500).json({ success: false, message: 'Failed to delete lab sample', error: error.message });
  }
};

module.exports = {
  getLabSamples,
  createLabSample,
  importLabSamples,
  getLabComparison,
  deleteLabSample,
  LAB_METRICS,
  COMPARISON_SOURCE
};
