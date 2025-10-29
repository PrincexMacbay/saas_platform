import axios from 'axios';
import { logApiError } from '../utils/simpleErrorLogger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug API configuration
console.log('🔍 API Configuration Debug:');
console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- API_BASE_URL (used):', API_BASE_URL);
console.log('- Environment:', import.meta.env.MODE);

if (!API_BASE_URL) {
  console.error('❌ VITE_API_URL is not set! Please check your environment variables.');
  throw new Error('VITE_API_URL environment variable is required');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});
// BTCPAY_URL=https://your-btcpay-server.com
// BTCPAY_API_KEY=your_api_key
// BTCPAY_STORE_ID=your_store_id
// BTCPAY_WEBHOOK_SECRET=your_webhook_secret

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Don't add Authorization header to public endpoints
    const isPublicEndpoint = config.url && (
      config.url.includes('/auth/register') || 
      config.url.includes('/auth/login') ||
      config.url.includes('/public/')
    );
    
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('🚨 API Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Log API errors
    logApiError(error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    // Handle specific error types
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('❌ Network Error - Check if backend is running and accessible');
      console.error('Backend URL should be:', API_BASE_URL);
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;