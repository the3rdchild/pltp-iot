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
/**
 * Median distance between consecutive entries of a time array.
 * Zero-length gaps are ignored so repeated timestamps don't collapse it to 0.
 */
const medianGap = (times) => {
  const sorted = [...times].sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] > sorted[i - 1]) gaps.push(sorted[i] - sorted[i - 1]);
  }
  if (!gaps.length) return 0;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
};

export const alignLabSamplesToTimestamps = (timestamps, samples) => {
  const result = new Array(timestamps.length).fill(null);
  if (!timestamps.length || !Array.isArray(samples) || samples.length === 0) return result;

  const times = timestamps.map((ts) => new Date(ts).getTime());
  // Not real timestamps (e.g. generated '1','2',... buckets) — nothing to align to
  if (times.some((t) => Number.isNaN(t))) return result;

  const maxDist = medianGap(times) / 2;

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
 * Align a sparse model prediction onto a chart's timestamp buckets.
 *
 * Unlike lab samples -- which are isolated ground-truth points and are meant
 * to render as markers -- a prediction series is drawn as a LINE, and a line
 * cannot survive gaps here: ApexCharts 5.x has no `connectNulls`, so a value
 * whose neighbours are both null draws nothing at all.
 *
 * That is exactly what happened to the AI2 TDS overlay at range=1h. The
 * backend buckets both series on the same 12s grid, but sensor_data lands
 * every few seconds while ai2_tds writes about once every two minutes -- 119
 * sensor buckets against 29 prediction buckets over the same hour. Padding
 * the prediction to the sensor's grid left ~76% nulls with the survivors
 * isolated, so the overlay was invisible at 1h/now while still fine at 1d+
 * (wider buckets, every bucket populated). See PROJECT_NOTES / commit dcdc42f
 * for the earlier, separate anchor-alignment fix.
 *
 * The fix is to hold each prediction until the next one arrives, which is
 * what a nowcast actually means: the model's latest estimate stands until it
 * publishes a new one. The hold is capped (default: twice the median interval
 * between predictions) so a model that STOPS publishing leaves a visible gap
 * instead of a flat line implying fresh output.
 *
 * @param {string[]} timestamps - chart bucket timestamps (ISO strings)
 * @param {Array<{sampled_at: string, lab_value: number|null}>} samples
 * @param {object} [options]
 * @param {number} [options.maxHoldMs] - override the staleness cap
 * @returns {Array<number|null>} same length as `timestamps`
 */
export const alignPredictionToTimestamps = (timestamps, samples, { maxHoldMs } = {}) => {
  const result = new Array(timestamps.length).fill(null);
  if (!timestamps.length || !Array.isArray(samples) || samples.length === 0) return result;

  const times = timestamps.map((ts) => new Date(ts).getTime());
  // Not real timestamps (e.g. generated '1','2',... buckets) — nothing to align to
  if (times.some((t) => Number.isNaN(t))) return result;

  const points = samples
    .map((s) => ({ t: new Date(s?.sampled_at).getTime(), v: s?.lab_value }))
    .filter((p) => p.v != null && !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);
  if (points.length === 0) return result;

  const hold = maxHoldMs ?? 2 * (medianGap(points.map((p) => p.t)) || medianGap(times) || 0);
  if (hold <= 0) return result;

  // Single forward walk: both arrays are sorted, so each bucket just carries
  // the most recent prediction at or before it.
  let next = 0;
  for (let i = 0; i < times.length; i++) {
    while (next < points.length && points[next].t <= times[i]) next++;
    const last = points[next - 1];
    if (last && times[i] - last.t <= hold) result[i] = last.v;
  }

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
