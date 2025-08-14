import api from './api';

export const getSpaces = async (params = {}) => {
  const response = await api.get('/spaces', { params });
  return response.data;
};

export const getSpace = async (identifier) => {
  const response = await api.get(`/spaces/${identifier}`);
  return response.data;
};

export const createSpace = async (spaceData) => {
  const response = await api.post('/spaces', spaceData);
  return response.data;
};

export const joinSpace = async (spaceId) => {
  const response = await api.post(`/spaces/${spaceId}/join`);
  return response.data;
};

export const leaveSpace = async (spaceId) => {
  const response = await api.post(`/spaces/${spaceId}/leave`);
  return response.data;
};

export const toggleFollowSpace = async (spaceId) => {
  const response = await api.post(`/spaces/${spaceId}/follow`);
  return response.data;
};

// New functions for space management
export const getSpaceMembers = async (identifier, params = {}) => {
  const response = await api.get(`/spaces/${identifier}/members`, { params });
  return response.data;
};

export const getPendingRequests = async (identifier) => {
  const response = await api.get(`/spaces/${identifier}/pending-requests`);
  return response.data;
};

export const handleMembershipRequest = async (identifier, userId, action) => {
  const response = await api.post(`/spaces/${identifier}/requests/${userId}`, { action });
  return response.data;
};

export const removeMember = async (identifier, userId) => {
  const response = await api.delete(`/spaces/${identifier}/members/${userId}`);
  return response.data;
};