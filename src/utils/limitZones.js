// Status zones derived from a metric's lower/upper limit.
//
// A metric stores only its scale (min, max) and the two limits an operator
// sets. Everything else is derived, so the gauge colours, the dashboard status
// and the anomaly counters can never disagree:
//
//   min ── red ── redLow ── amber ── lowerLimit ── green ── upperLimit ── amber ── redHigh ── red ── max
//
// redLow sits halfway between min and lowerLimit (redHigh likewise between
// upperLimit and max). A limit at or beyond the scale edge switches that side
// off: lowerLimit = min means "no low alarm", and lowerLimit = min together
// with upperLimit = max makes the whole scale normal.
//
// backend/utils/limits.js carries a CommonJS copy of getLimitZones and
// getLimitStatus; keep the two in step.

export const LIMIT_COLORS = {
  normal: '#2CB34A',
  warning: '#ffc14d',
  abnormal: '#ff4d4d'
};

const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);

export const getLimitZones = (limit) => {
  if (!limit || !isNum(limit.min) || !isNum(limit.max)) return null;
  const { min, max } = limit;
  const lower = isNum(limit.lowerLimit) ? limit.lowerLimit : min;
  const upper = isNum(limit.upperLimit) ? limit.upperLimit : max;
  const hasLow = lower > min;
  const hasHigh = upper < max;
  return {
    min,
    max,
    lower,
    upper,
    hasLow,
    hasHigh,
    redLow: hasLow ? lower - (lower - min) / 2 : null,
    redHigh: hasHigh ? upper + (max - upper) / 2 : null
  };
};

// 'normal' | 'warning' | 'abnormal', or null when there is no reading/limit.
// `side` says which way a non-normal value left the normal band.
export const getLimitStatus = (value, limit) => {
  const z = getLimitZones(limit);
  if (!z || !isNum(value)) return { status: null, side: null };
  if (z.hasLow && value < z.lower) {
    return { status: value < z.redLow ? 'abnormal' : 'warning', side: 'low' };
  }
  if (z.hasHigh && value > z.upper) {
    return { status: value > z.redHigh ? 'abnormal' : 'warning', side: 'high' };
  }
  return { status: 'normal', side: null };
};

// Limits saved before the lower/upper model carried six thresholds. The
// warning pair was the edge of the normal band, so it becomes the new limit
// pair; everything else is dropped.
const LEGACY_FIELDS = ['abnormalLow', 'warningLow', 'idealLow', 'idealHigh', 'warningHigh', 'abnormalHigh'];

export const normalizeLimit = (limit) => {
  if (!limit) return limit;
  const out = { ...limit };
  if (out.lowerLimit === undefined) out.lowerLimit = isNum(limit.warningLow) ? limit.warningLow : limit.min;
  if (out.upperLimit === undefined) out.upperLimit = isNum(limit.warningHigh) ? Math.min(limit.warningHigh, limit.max) : limit.max;
  LEGACY_FIELDS.forEach((f) => delete out[f]);
  return out;
};
