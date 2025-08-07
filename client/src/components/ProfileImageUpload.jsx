import React, { useState } from 'react';
import { uploadProfileImage } from '../services/uploadService';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from './FileUpload';

const ProfileImageUpload = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user, updateUser } = useAuth();

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await uploadProfileImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update user context with new profile image
      updateUser({ profileImage: response.data.imageUrl });
      
      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      // You could show an error message here
    }
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  return (
    <div className="profile-image-upload">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div 
          className="user-avatar-lg" 
          style={{ 
            margin: '0 auto 15px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {user.profileImage ? (
            <img 
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profileImage}`}
              alt={user.username}
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            getInitials(user)
          )}
          
          {isUploading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>
              {uploadProgress}%
            </div>
          )}
        </div>
        
        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username}
        </p>
      </div>

      <FileUpload
        onFileSelect={handleFileSelect}
        accept="image/*"
        maxSize={5242880} // 5MB for profile images
      >
        <div>
          <i className="fas fa-camera" style={{ fontSize: '24px', color: '#3498db', marginBottom: '10px' }}></i>
          <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Change Profile Picture'}
          </p>
          <small style={{ color: '#7f8c8d' }}>
            Click to select or drag and drop an image
          </small>
        </div>
      </FileUpload>
    </div>
  );
};

export default ProfileImageUpload;