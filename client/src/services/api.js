import axios from 'axios';
import { logApiError } from '../utils/simpleErrorLogger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://server-1yjl0niag-prince-macbays-projects.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    // Log API errors
    logApiError(error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;