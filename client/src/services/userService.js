import api from './api';

export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUser = async (identifier) => {
  const response = await api.get(`/users/${identifier}`);
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const toggleFollowUser = async (userId) => {
  const response = await api.post(`/users/${userId}/follow`);
  return response.data;
};

export const getFollowers = async (userId) => {
  const response = await api.get(`/users/${userId}/followers`);
  return response.data;
};

export const getFollowing = async (userId) => {
  const response = await api.get(`/users/${userId}/following`);
  return response.data;
};

export const blockUser = async (userId, reason) => {
  const response = await api.post(`/users/${userId}/block`, { reason });
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.delete(`/users/${userId}/block`);
  return response.data;
};

export const getBlockedUsers = async () => {
  const response = await api.get('/users/blocked/list');
  return response.data;
};

export const checkBlockStatus = async (userId) => {
  const response = await api.get(`/users/${userId}/block-status`);
  return response.data;
};