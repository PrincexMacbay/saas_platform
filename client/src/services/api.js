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
    
    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📎 FormData detected - Content-Type header removed for multipart/form-data');
    }
    
    console.log('🔍 API Interceptor: Processing request...');
    console.log('🔍 API Interceptor: URL:', config.url);
    console.log('🔍 API Interceptor: Method:', config.method);
    console.log('🔍 API Interceptor: Token exists:', !!token);
    console.log('🔍 API Interceptor: Token value:', token?.substring(0, 20) + '...');
    console.log('🔍 API Interceptor: Data type:', config.data instanceof FormData ? 'FormData' : typeof config.data);
    
    // Always send token if it exists - let backend middleware decide if it's required
    // Only exclude token from specific auth endpoints that should never have tokens
    const shouldExcludeToken = config.url && (
      config.url.includes('/auth/register') || 
      config.url.includes('/auth/login')
    );
    
    console.log('🔍 API Interceptor: Should exclude token:', shouldExcludeToken);
    
    if (token && !shouldExcludeToken) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ API Interceptor: Authorization header added');
    } else if (!token) {
      console.log('⚠️ API Interceptor: No token available');
    } else {
      console.log('ℹ️ API Interceptor: Token excluded for auth endpoint');
    }
    
    console.log('🔍 API Interceptor: Final headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ API Interceptor: Request error:', error);
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
      const errorMessage = error.response?.data?.message || '';
      
      // Only clear token if it's actually invalid/expired, not just missing
      // "Access token required" means token wasn't sent, which might be a bug
      // "Invalid token" or "Invalid or expired token" means token is bad
      if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
        const token = localStorage.getItem('token');
        if (token) {
          console.warn('⚠️ Token is invalid/expired, clearing from storage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else if (errorMessage.includes('Access token required')) {
        // Token wasn't sent - this might be a bug in the interceptor
        console.error('❌ Access token required but not sent. Check API interceptor.');
        const token = localStorage.getItem('token');
        if (token) {
          console.warn('⚠️ Token exists in localStorage but wasn\'t sent. This is a bug.');
        }
      }
      // Don't use window.location.href - let React Router handle navigation
      // The AuthContext will detect the missing token and update state accordingly
    }
    return Promise.reject(error);
  }
);

export default api;