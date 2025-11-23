// Utility to get limit data from localStorage or fall back to defaults
import defaultLimitData from '../data/Limit.json';

export const getLimitData = () => {
  try {
    const saved = localStorage.getItem('limitData');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error reading limit data from localStorage:', error);
  }
  return defaultLimitData;
};

export default getLimitData;
