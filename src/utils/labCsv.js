/**
 * CSV parsing for the lab-sample importer on /admin/dataInput.
 *
 * Parsing happens in the browser so the user sees a preview of exactly what
 * will be written before confirming. The server re-validates every row anyway —
 * this is a convenience, never the authority on what is acceptable.
 */

// Header aliases. Lab exports rename columns between spreadsheets, so a handful
// of spellings map to each field rather than demanding one exact header.
const COLUMN_ALIASES = {
  sampled_at: ['date', 'tanggal', 'tgl', 'sample_date', 'sampled_at', 'tanggal_sampling', 'tgl_sample'],
  pressure: ['pressure', 'tekanan', 'p', 'press'],
  temperature: ['temperature', 'temperatur', 'suhu', 'temp', 't'],
  flow_rate: ['flow_rate', 'flow', 'laju', 'debit'],
  tds: ['tds'],
  dryness: ['dryness', 'dryness_fraction', 'kekeringan'],
  ncg: ['ncg']
};

const NUMERIC_FIELDS = ['pressure', 'temperature', 'flow_rate', 'tds', 'dryness', 'ncg'];

const normaliseHeader = (header) => header.trim().toLowerCase().replace(/[\s\-.]+/g, '_').replace(/[()]/g, '');

/**
 * Split one CSV line, honouring quoted fields.
 *
 * Written out rather than using `line.split(',')` because a quoted note
 * containing a comma would otherwise shift every column after it — silently
 * loading numbers into the wrong fields, which is worse than failing.
 */
const splitCsvLine = (line) => {
  const out = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // A doubled quote inside a quoted field is a literal quote.
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      out.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  out.push(current);
  return out.map((v) => v.trim());
};

const pad = (n) => String(n).padStart(2, '0');

/**
 * Parse a sampling date.
 *
 * Returns `{ value, dateOnly }` where `value` is what gets sent to the API:
 * `YYYY-MM-DD` when the source gave no clock time, a full ISO string when it
 * did. The server keys its comparison window off exactly that distinction, so
 * the two must not be conflated here.
 *
 * Day-first is the assumption for slash and dot formats. The sample data
 * settles it beyond guesswork: values like `16/02/22` and `28/09/22` have a
 * first component above 12, which can only be a day.
 */
export const parseSampleDate = (raw) => {
  if (!raw) return null;

  const text = String(raw).trim();
  if (!text) return null;

  // Split off a time component if one is present.
  const [datePart, ...timeParts] = text.split(/[T\s]+/);
  const timePart = timeParts.join(' ').trim();

  let year;
  let month;
  let day;

  const slash = datePart.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  const iso = datePart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  if (iso) {
    year = parseInt(iso[1], 10);
    month = parseInt(iso[2], 10);
    day = parseInt(iso[3], 10);
  } else if (slash) {
    day = parseInt(slash[1], 10);
    month = parseInt(slash[2], 10);
    const rawYear = slash[3];
    year = rawYear.length === 2 ? 2000 + parseInt(rawYear, 10) : parseInt(rawYear, 10);
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // Round-trip through Date to reject impossible calendar dates such as 31/02.
  const probe = new Date(year, month - 1, day);
  if (probe.getFullYear() !== year || probe.getMonth() !== month - 1 || probe.getDate() !== day) {
    return null;
  }

  const dateOnly = `${year}-${pad(month)}-${pad(day)}`;

  if (!timePart) return { value: dateOnly, dateOnly: true };

  const time = timePart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!time) return { value: dateOnly, dateOnly: true };

  const hh = parseInt(time[1], 10);
  const mm = parseInt(time[2], 10);
  const ss = time[3] ? parseInt(time[3], 10) : 0;
  if (hh > 23 || mm > 59 || ss > 59) return { value: dateOnly, dateOnly: true };

  const stamp = new Date(year, month - 1, day, hh, mm, ss);
  return { value: stamp.toISOString(), dateOnly: false };
};

/** Accepts `1,23` as well as `1.23` — Indonesian exports use either. */
export const parseNumber = (raw) => {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const n = parseFloat(text.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/**
 * Parse CSV text into rows ready for POST /api/data/lab-samples/import.
 *
 * @returns {{rows: Array, errors: Array, mapped: Object, ignored: Array}}
 *   `rows` are valid and importable; `errors` carry a line number so the user
 *   can go fix the file. Both are surfaced in the preview — a partially valid
 *   file should show what will land AND what will not, before anything is sent.
 */
export const parseLabCsv = (text) => {
  const result = { rows: [], errors: [], mapped: {}, ignored: [] };

  if (!text || !text.trim()) {
    result.errors.push({ line: 0, message: 'File kosong' });
    return result;
  }

  // Tolerates CRLF, and drops a UTF-8 BOM that would otherwise corrupt the
  // first header name.
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');

  if (lines.length < 2) {
    result.errors.push({ line: 0, message: 'File hanya berisi header, tidak ada baris data' });
    return result;
  }

  const headers = splitCsvLine(lines[0]).map(normaliseHeader);

  // Resolve each known field to a column index.
  const index = {};
  Object.entries(COLUMN_ALIASES).forEach(([field, aliases]) => {
    const found = headers.findIndex((h) => aliases.includes(h));
    if (found !== -1) {
      index[field] = found;
      result.mapped[field] = splitCsvLine(lines[0])[found].trim();
    }
  });

  result.ignored = headers.filter((h) => !Object.values(index).some((i) => headers[i] === h));

  if (index.sampled_at === undefined) {
    result.errors.push({
      line: 1,
      message: `Kolom tanggal tidak ditemukan. Header yang dikenali: ${COLUMN_ALIASES.sampled_at.join(', ')}`
    });
    return result;
  }

  if (!NUMERIC_FIELDS.some((f) => index[f] !== undefined)) {
    result.errors.push({ line: 1, message: 'Tidak ada satu pun kolom nilai yang dikenali' });
    return result;
  }

  for (let i = 1; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const cells = splitCsvLine(lines[i]);

    const date = parseSampleDate(cells[index.sampled_at]);
    if (!date) {
      result.errors.push({
        line: lineNumber,
        message: `Tanggal tidak terbaca: "${cells[index.sampled_at] ?? ''}"`
      });
      continue;
    }

    const row = { sampled_at: date.value, _dateOnly: date.dateOnly, _line: lineNumber };
    let hasValue = false;

    NUMERIC_FIELDS.forEach((field) => {
      if (index[field] === undefined) return;
      const value = parseNumber(cells[index[field]]);
      row[field] = value;
      if (value !== null) hasValue = true;
    });

    if (!hasValue) {
      result.errors.push({ line: lineNumber, message: 'Semua kolom nilai kosong atau bukan angka' });
      continue;
    }

    result.rows.push(row);
  }

  // Same sampling time twice means the importer's upsert would apply them one
  // after another and only the last would survive. Better to say so up front
  // than to let the user wonder why the row count dropped.
  const seen = new Map();
  result.rows.forEach((row) => {
    if (seen.has(row.sampled_at)) {
      result.errors.push({
        line: row._line,
        message: `Tanggal ${row.sampled_at} duplikat dengan baris ${seen.get(row.sampled_at)} — hanya yang terakhir yang tersimpan`
      });
    } else {
      seen.set(row.sampled_at, row._line);
    }
  });

  return result;
};

export default parseLabCsv;
