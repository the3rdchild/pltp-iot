import dayjs from 'dayjs';

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const ONE_YEAR_MS = 365 * ONE_DAY_MS;

/**
 * Turn the two DatePicker values into a real fetch window.
 *
 * A DatePicker keeps the time-of-day of the value it replaced, so picking the
 * same day for start and end used to produce an (almost) zero-length window.
 * Snap to whole days instead, and never reach past "now".
 */
export const resolveCustomWindow = (startDate, endDate) => {
  const now = dayjs();
  const start = dayjs(startDate).startOf('day');
  let end = dayjs(endDate).endOf('day');
  if (end.isAfter(now)) end = now;
  return { start: start.toDate(), end: end.toDate() };
};

/**
 * X-axis label for a timestamp, with the granularity picked from how wide the
 * visible window is (for custom ranges, whose width is not known up front).
 */
export const formatTimestampForSpan = (ts, spanMs) => {
  if (!ts) return '';
  const d = new Date(ts);
  if (spanMs <= 2 * ONE_DAY_MS) {
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  if (spanMs <= 180 * ONE_DAY_MS) {
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  }
  return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
};

/** Max-2-decimal number for chart axes/tooltips; blank for missing values. */
export const formatChartNumber = (value, suffix = '') =>
  value === null || value === undefined || !Number.isFinite(value) ? '' : `${value.toFixed(2)}${suffix}`;
