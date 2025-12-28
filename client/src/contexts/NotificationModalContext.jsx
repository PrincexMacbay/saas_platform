import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationModal from '../components/NotificationModal';

const NotificationModalContext = createContext();

export const useNotificationModal = () => {
  const context = useContext(NotificationModalContext);
  if (!context) {
    throw new Error('useNotificationModal must be used within NotificationModalProvider');
  }
  return context;
};

export const NotificationModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info',
    title: null,
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
  });

  const showNotification = useCallback((options) => {
    setModalState({
      isOpen: true,
      type: options.type || 'info',
      title: options.title || null,
      message: options.message || '',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: options.showCancel || false
    });
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    showNotification({ type: 'success', title, message });
  }, [showNotification]);

  const showError = useCallback((message, title = 'Error') => {
    showNotification({ type: 'error', title, message });
  }, [showNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    showNotification({ type: 'warning', title, message });
  }, [showNotification]);

  const showInfo = useCallback((message, title = 'Information') => {
    showNotification({ type: 'info', title, message });
  }, [showNotification]);

  const showConfirm = useCallback((message, onConfirm, title = 'Confirm', options = {}) => {
    showNotification({
      type: 'confirm',
      title,
      message,
      onConfirm,
      onCancel: options.onCancel || null,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      showCancel: true
    });
  }, [showNotification]);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    closeModal
  };

  return (
    <NotificationModalContext.Provider value={value}>
      {children}
      <NotificationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
    </NotificationModalContext.Provider>
  );
};
