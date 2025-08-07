import api from './api';

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  const response = await api.post('/upload/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const uploadPostAttachment = async (file) => {
  const formData = new FormData();
  formData.append('attachment', file);
  
  const response = await api.post('/upload/post-attachment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const deleteFile = async (filename) => {
  const response = await api.delete(`/upload/${filename}`);
  return response.data;
};