import React from 'react';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, type = 'info', title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', showCancel = false }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle"></i>;
      case 'confirm':
        return <i className="fas fa-question-circle"></i>;
      default:
        return <i className="fas fa-info-circle"></i>;
    }
  };

  return (
    <div className="notification-modal-overlay" onClick={handleBackdropClick}>
      <div className={`notification-modal notification-modal-${type}`}>
        <div className="notification-modal-header">
          <div className="notification-modal-icon">
            {getIcon()}
          </div>
          {title && (
            <h3 className="notification-modal-title">{title}</h3>
          )}
          <button 
            className="notification-modal-close" 
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="notification-modal-body">
          <p className="notification-modal-message">{message}</p>
        </div>
        <div className="notification-modal-footer">
          {showCancel && (
            <button 
              className="notification-modal-button notification-modal-button-cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`notification-modal-button notification-modal-button-${type}`}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
