import api from './api';

export const getPosts = async (params = {}) => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getPost = async (postId) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const createComment = async (postId, commentData) => {
  const response = await api.post(`/posts/${postId}/comments`, commentData);
  return response.data;
};

export const updatePost = async (postId, postData) => {
  const response = await api.put(`/posts/${postId}`, postData);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const toggleLike = async (objectModel, objectId) => {
  const response = await api.post(`/posts/${objectModel}/${objectId}/like`);
  return response.data;
};