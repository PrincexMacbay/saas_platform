import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Scheduled Payments
export const getScheduledPayments = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/scheduled-payments`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const createScheduledPayment = async (paymentData) => {
  const response = await axios.post(`${API_BASE_URL}/membership/scheduled-payments`, paymentData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const deleteScheduledPayment = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/membership/scheduled-payments/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Debts
export const getDebts = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/debts`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const createDebt = async (debtData) => {
  const response = await axios.post(`${API_BASE_URL}/membership/debts`, debtData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const deleteDebt = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/membership/debts/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const updateDebtStatus = async (id, status) => {
  const response = await axios.patch(`${API_BASE_URL}/membership/debts/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Reminders
export const getReminders = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/reminders`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const createReminder = async (reminderData) => {
  const response = await axios.post(`${API_BASE_URL}/membership/reminders`, reminderData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const deleteReminder = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/membership/reminders/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const sendReminder = async (id) => {
  const response = await axios.post(`${API_BASE_URL}/membership/reminders/${id}/send`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Coupons
export const getCoupons = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/coupons`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const createCoupon = async (couponData) => {
  const response = await axios.post(`${API_BASE_URL}/membership/coupons`, couponData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const deleteCoupon = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/membership/coupons/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const updateCoupon = async (id, updateData) => {
  const response = await axios.patch(`${API_BASE_URL}/membership/coupons/${id}`, updateData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Plans
export const getPlans = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/plans`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Subscriptions
export const getSubscriptions = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/subscriptions`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Payments
export const getPayments = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/payments`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Applications
export const getApplications = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/applications`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await axios.patch(`${API_BASE_URL}/membership/applications/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// User Memberships
export const getUserMemberships = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/subscriptions/user`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Digital Cards
export const getDigitalCards = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/digital-cards`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const getDigitalCard = async (subscriptionId) => {
  const response = await axios.get(`${API_BASE_URL}/membership/digital-cards/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Dashboard
export const getDashboard = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/dashboard`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

// Settings
export const getSettings = async () => {
  const response = await axios.get(`${API_BASE_URL}/membership/settings`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};

export const updateSettings = async (settingsData) => {
  const response = await axios.put(`${API_BASE_URL}/membership/settings`, settingsData, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return response;
};
