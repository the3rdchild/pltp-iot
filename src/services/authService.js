import axios from 'axios';

// API Base URL - adjust sesuai environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pertasmart.unpad.ac.id/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired or invalid - force logout
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      const message = error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Cannot connect to server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An error occurred');
    }
  }
);

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      const { token, user } = response.data.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        token,
        user
      };
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Verify token with backend
 * Does NOT auto-logout - caller should handle the error
 * @returns {Promise<Object>}
 */
export const verifyToken = async () => {
  const response = await api.get('/auth/verify');
  return response.data;
};

/**
 * Get current user from localStorage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export default api;