import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth header
const createAuthRequest = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Get user's memberships/subscriptions
export const getUserMemberships = async () => {
  const authRequest = createAuthRequest();
  const response = await authRequest.get('/membership/subscriptions/my');
  return response.data;
};

// Get public membership plans (for browsing)
export const getPublicPlans = async (params = {}) => {
  const response = await axios.get(`${API_URL}/public/plans`, { params });
  return response.data;
};

// Get public organizations
export const getPublicOrganizations = async () => {
  const response = await axios.get(`${API_URL}/public/organizations`);
  return response.data;
};

// Submit membership application
export const submitApplication = async (applicationData) => {
  const response = await axios.post(`${API_URL}/public/apply`, applicationData);
  return response.data;
};

// Get membership dashboard data (admin)
export const getMembershipDashboard = async () => {
  const authRequest = createAuthRequest();
  const response = await authRequest.get('/membership/dashboard');
  return response.data;
};

export default {
  getUserMemberships,
  getPublicPlans,
  getPublicOrganizations,
  submitApplication,
  getMembershipDashboard,
};
