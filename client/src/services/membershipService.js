import api from './api';

// Scheduled Payments
export const getScheduledPayments = async () => {
  const response = await api.get('/membership/scheduled-payments');
  return response;
};

export const createScheduledPayment = async (paymentData) => {
  const response = await api.post('/membership/scheduled-payments', paymentData);
  return response;
};

export const deleteScheduledPayment = async (id) => {
  const response = await api.delete(`/membership/scheduled-payments/${id}`);
  return response;
};

// Debts
export const getDebts = async () => {
  const response = await api.get('/membership/debts');
  return response;
};

export const createDebt = async (debtData) => {
  const response = await api.post('/membership/debts', debtData);
  return response;
};

export const deleteDebt = async (id) => {
  const response = await api.delete(`/membership/debts/${id}`);
  return response;
};

export const updateDebtStatus = async (id, status) => {
  const response = await api.patch(`/membership/debts/${id}/status`, { status });
  return response;
};

// Reminders
export const getReminders = async () => {
  const response = await api.get('/membership/reminders');
  return response;
};

export const createReminder = async (reminderData) => {
  const response = await api.post('/membership/reminders', reminderData);
  return response;
};

export const deleteReminder = async (id) => {
  const response = await api.delete(`/membership/reminders/${id}`);
  return response;
};

export const sendReminder = async (id) => {
  const response = await api.post(`/membership/reminders/${id}/send`, {});
  return response;
};

// Coupons
export const getCoupons = async () => {
  const response = await api.get('/membership/coupons');
  return response;
};

export const createCoupon = async (couponData) => {
  const response = await api.post('/membership/coupons', couponData);
  return response;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/membership/coupons/${id}`);
  return response;
};

export const updateCoupon = async (id, updateData) => {
  const response = await api.patch(`/membership/coupons/${id}`, updateData);
  return response;
};

// Plans
export const getPlans = async () => {
  const response = await api.get('/membership/plans');
  return response;
};

// Subscriptions
export const getSubscriptions = async () => {
  const response = await api.get('/membership/subscriptions');
  return response;
};

// Payments
export const getPayments = async () => {
  const response = await api.get('/membership/payments');
  return response;
};

// Applications
export const getApplications = async () => {
  const response = await api.get('/membership/applications');
  return response;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await api.patch(`/membership/applications/${id}/status`, { status });
  return response;
};

// User Memberships
export const getUserMemberships = async () => {
  const response = await api.get('/membership/subscriptions/user');
  return response;
};

// Digital Cards
export const getDigitalCards = async () => {
  const response = await api.get('/membership/digital-cards');
  return response;
};

export const getDigitalCard = async (subscriptionId) => {
  const response = await api.get(`/membership/digital-cards/${subscriptionId}`);
  return response;
};

// Dashboard
export const getDashboard = async () => {
  const response = await api.get('/membership/dashboard');
  return response;
};

// Settings
export const getSettings = async () => {
  const response = await api.get('/membership/settings');
  return response;
};

export const updateSettings = async (settingsData) => {
  const response = await api.put('/membership/settings', settingsData);
  return response;
};