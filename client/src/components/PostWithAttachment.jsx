import React, { useState } from 'react';
import { uploadPostAttachment } from '../services/uploadService';
import { createPost } from '../services/postService';
import FileUpload from './FileUpload';
import { useAuth } from '../contexts/AuthContext';
import { buildImageUrl } from '../utils/imageUtils';

const PostWithAttachment = ({ onPostCreated, spaceId = null }) => {
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const { user } = useAuth();

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    try {
      const response = await uploadPostAttachment(file);
      setAttachmentUrl(response.data.imageUrl);
      setShowAttachmentUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const postData = {
        message,
        visibility: 1,
      };

      if (spaceId) {
        postData.spaceId = spaceId;
      }

      if (attachmentUrl) {
        postData.attachmentUrl = attachmentUrl;
      }

      console.log('Sending post data:', postData);
      await createPost(postData);
      
      // Reset form
      setMessage('');
      setAttachmentUrl('');
      setShowAttachmentUpload(false);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setIsPosting(false);
  };

  const removeAttachment = () => {
    setAttachmentUrl('');
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <div className="d-flex align-items-center mb-3">
          <div className="post-avatar" style={{ marginRight: '12px' }}>
            {user.profileImage ? (
              <img 
                src={buildImageUrl(user.profileImage)}
                alt={user.username}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(user)
            )}
          </div>
          <div>
            <strong>
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username}
            </strong>
          </div>
        </div>
        
        <textarea
          placeholder={spaceId ? "Share something with this space..." : "What's on your mind?"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isPosting || isUploading}
          rows="3"
        />

        {/* Attachment Preview */}
        {attachmentUrl && (
          <div style={{ marginTop: '15px', position: 'relative' }}>
            <img 
              src={buildImageUrl(attachmentUrl)}
              alt="Attachment preview"
              style={{
                maxWidth: '200px',
                height: 'auto',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}
            />
            <button
              type="button"
              onClick={removeAttachment}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* File Upload */}
        {showAttachmentUpload && (
          <div style={{ marginTop: '15px' }}>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept="image/*"
              maxSize={10485760} // 10MB
            />
            {isUploading && (
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                <p style={{ margin: 0, fontSize: '14px', color: '#7f8c8d' }}>Uploading...</p>
              </div>
            )}
          </div>
        )}
        
        <div className="create-post-actions">
          <div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
              disabled={isPosting || isUploading}
              style={{ marginRight: '10px' }}
            >
              <i className="fas fa-image"></i> {attachmentUrl ? 'Change Image' : 'Add Image'}
            </button>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!message.trim() || isPosting || isUploading}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostWithAttachment;
