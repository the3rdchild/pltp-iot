/**
 * Align sparse lab samples to a chart's timestamp buckets.
 *
 * Charts here use a category x-axis built from a `timestamps` array (ISO
 * strings) aligned index-by-index with the value arrays. Lab samples only
 * exist at their sampling time, so each sample is placed at the index of the
 * nearest bucket, provided the distance is within half the median bucket gap.
 * If several samples land on one index, the last one wins.
 *
 * @param {string[]} timestamps - chart bucket timestamps (ISO strings)
 * @param {Array<{sampled_at: string, lab_value: number|null}>} samples
 * @returns {Array<number|null>} same length as `timestamps`, null where no sample
 */
export const alignLabSamplesToTimestamps = (timestamps, samples) => {
  const result = new Array(timestamps.length).fill(null);
  if (!timestamps.length || !Array.isArray(samples) || samples.length === 0) return result;

  const times = timestamps.map((ts) => new Date(ts).getTime());
  // Not real timestamps (e.g. generated '1','2',... buckets) — nothing to align to
  if (times.some((t) => Number.isNaN(t))) return result;

  const sorted = [...times].sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] > sorted[i - 1]) gaps.push(sorted[i] - sorted[i - 1]);
  }
  gaps.sort((a, b) => a - b);
  const medianGap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0;
  const maxDist = medianGap / 2;

  samples.forEach((sample) => {
    const value = sample?.lab_value;
    const t = new Date(sample?.sampled_at).getTime();
    if (value == null || Number.isNaN(t)) return;

    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < times.length; i++) {
      const d = Math.abs(times[i] - t);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0 && (maxDist === 0 ? bestDist === 0 : bestDist <= maxDist)) {
      result[bestIdx] = value;
    }
  });

  return result;
};

/**
 * Render a stored lab timestamp exactly as it was stored.
 *
 * sampled_at is a naive `timestamp without time zone` holding wall-clock
 * digits, but it reaches the browser as an ISO string ending in 'Z'. Handing
 * that to `new Date()` makes the browser add its own UTC offset — a sample
 * stored at 00:00 renders as 07.00 in Jakarta, and one stored at 20:00 renders
 * as 03:00 on the FOLLOWING day, showing the wrong date outright.
 *
 * Reading the characters instead of parsing them keeps the displayed value
 * identical to the stored one in every timezone.
 *
 * @param {string} value - ISO-ish timestamp from the API
 * @param {object} [options]
 * @param {boolean} [options.short] - `05/01` instead of `05/01/2022`
 */
export const formatStoredTimestamp = (value, { short = false } = {}) => {
  if (!value) return '-';

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!match) return String(value);

  const [, year, month, day, hour, minute] = match;
  const date = short ? `${day}/${month}/${year.slice(2)}` : `${day}/${month}/${year}`;

  // Midnight on a date-only sample is an artefact of storage, not a reading
  // time — showing "00.00" would imply a precision the lab never gave.
  if (hour === undefined || (hour === '00' && minute === '00')) return date;
  return `${date}, ${hour}.${minute}`;
};
