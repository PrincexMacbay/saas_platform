import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileSelect, accept = "image/*", maxSize = 10485760, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return 'Invalid file type';
    }
    
    return null;
  };

  const handleFileSelect = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        style={{
          border: `2px dashed ${isDragging ? '#3498db' : '#ddd'}`,
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#f8f9fa' : 'transparent',
          transition: 'all 0.2s ease',
        }}
      >
        {children || (
          <div>
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '24px', color: '#7f8c8d', marginBottom: '10px' }}></i>
            <p style={{ margin: 0, color: '#7f8c8d' }}>
              Click to select or drag and drop a file here
            </p>
            <small style={{ color: '#95a5a6' }}>
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </small>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      
      {error && (
        <div className="error-message" style={{ marginTop: '10px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;