// Utility to get limit data from localStorage or fall back to defaults
import defaultLimitData from '../data/Limit.json';
import { normalizeLimit } from './limitZones';

// Saved limits can predate the current Limit.json: they may use the old
// six-threshold shape, miss metrics added since, or carry metrics that were
// removed (the TDS components). Normalise each saved entry and keep only the
// metrics Limit.json still defines.
export const mergeLimitData = (saved) => {
  const merged = {};
  Object.keys(defaultLimitData).forEach((key) => {
    merged[key] = saved?.[key] ? normalizeLimit({ ...defaultLimitData[key], ...saved[key] }) : defaultLimitData[key];
  });
  return merged;
};

export const getLimitData = () => {
  try {
    const saved = localStorage.getItem('limitData');
    if (saved) {
      return mergeLimitData(JSON.parse(saved));
    }
  } catch (error) {
    console.error('Error reading limit data from localStorage:', error);
  }
  return defaultLimitData;
};

export default getLimitData;
