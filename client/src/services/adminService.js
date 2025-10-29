import api from './api';

const adminService = {
  // Dashboard Statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    console.log('🔍 AdminService: Starting getUsers request...');
    console.log('🔍 AdminService: Params:', params);
    console.log('🔍 AdminService: API base URL:', api.defaults.baseURL);
    console.log('🔍 AdminService: Full URL:', `${api.defaults.baseURL}/admin/users`);
    console.log('🔍 AdminService: Request headers:', api.defaults.headers);
    console.log('🔍 AdminService: Auth token in headers:', api.defaults.headers.Authorization?.substring(0, 20) + '...');
    
    try {
      const response = await api.get('/admin/users', { params });
      console.log('✅ AdminService: Request successful');
      console.log('✅ AdminService: Response status:', response.status);
      console.log('✅ AdminService: Response headers:', response.headers);
      console.log('✅ AdminService: Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AdminService: Request failed');
      console.error('❌ AdminService: Error type:', error.name);
      console.error('❌ AdminService: Error message:', error.message);
      console.error('❌ AdminService: Error code:', error.code);
      console.error('❌ AdminService: Error response status:', error.response?.status);
      console.error('❌ AdminService: Error response statusText:', error.response?.statusText);
      console.error('❌ AdminService: Error response data:', error.response?.data);
      console.error('❌ AdminService: Error config:', error.config);
      throw error;
    }
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  getUserActivity: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/activity`);
    return response.data;
  },

  getUserLoginHistory: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/login-history`);
    return response.data;
  },

  getUserSubscriptions: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/subscriptions`);
    return response.data;
  },

  getUserPayments: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/payments`);
    return response.data;
  },

  updateUserStatus: async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}/status`, data);
    return response.data;
  },

  bulkUpdateUsers: async (userIds, data) => {
    const response = await api.put('/admin/users/bulk-update', { userIds, data });
    return response.data;
  },

  // Financial Management
  getFinancialData: async (period = 'month') => {
    const response = await api.get('/admin/financial', { 
      params: { period } 
    });
    return response.data;
  },

  // Job Management
  getJobManagementData: async (params = {}) => {
    const response = await api.get('/admin/jobs', { params });
    return response.data;
  },

  // Coupon Management
  getCouponData: async () => {
    const response = await api.get('/admin/coupons');
    return response.data;
  },

  // Bulk Actions
  exportUsers: async (format = 'csv') => {
    const response = await api.get('/admin/users/export', {
      params: { format },
      responseType: 'blob'
    });
    return response;
  },

  sendMassEmail: async (emailData) => {
    const response = await api.post('/admin/users/mass-email', emailData);
    return response.data;
  },

  // System Configuration
  updateSystemSettings: async (settings) => {
    const response = await api.put('/admin/system/settings', settings);
    return response.data;
  },

  getSystemSettings: async () => {
    const response = await api.get('/admin/system/settings');
    return response.data;
  },

  // Feature Flags
  updateFeatureFlags: async (flags) => {
    const response = await api.put('/admin/system/features', flags);
    return response.data;
  },

  getFeatureFlags: async () => {
    const response = await api.get('/admin/system/features');
    return response.data;
  }
};

export default adminService;
