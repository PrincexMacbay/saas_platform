import React, { createContext, useContext, useState, useCallback } from 'react';

const ErrorLoggerContext = createContext();

export const useErrorLogger = () => {
  const context = useContext(ErrorLoggerContext);
  if (!context) {
    throw new Error('useErrorLogger must be used within an ErrorLoggerProvider');
  }
  return context;
};

export const ErrorLoggerProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Add error to the list
  const addError = useCallback((error, type = 'frontend', context = {}) => {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type,
      message: error.message || error.toString(),
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    setErrors(prev => {
      const newErrors = [errorEntry, ...prev].slice(0, 100); // Keep last 100 errors
      return newErrors;
    });

    // Show the error logger if it's minimized
    if (!isVisible) {
      setIsVisible(true);
    }
  }, [isVisible]);

  // Log frontend errors
  const logFrontendError = useCallback((error, context = {}) => {
    addError(error, 'frontend', context);
  }, [addError]);

  // Log backend errors
  const logBackendError = useCallback((error, context = {}) => {
    addError(error, 'backend', context);
  }, [addError]);

  // Log network errors
  const logNetworkError = useCallback((error, context = {}) => {
    addError(error, 'network', context);
  }, [addError]);

  // Log API errors
  const logApiError = useCallback((error, context = {}) => {
    addError(error, 'api', context);
  }, [addError]);

  // Log validation errors
  const logValidationError = useCallback((error, context = {}) => {
    addError(error, 'validation', context);
  }, [addError]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Clear errors by type
  const clearErrorsByType = useCallback((type) => {
    setErrors(prev => prev.filter(error => error.type !== type));
  }, []);

  // Get error count by type
  const getErrorCount = useCallback((type) => {
    return errors.filter(error => type === 'all' || error.type === type).length;
  }, [errors]);

  // Toggle visibility
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  // Set visibility
  const setVisibility = useCallback((visible) => {
    setIsVisible(visible);
  }, []);

  const value = {
    errors,
    isVisible,
    addError,
    logFrontendError,
    logBackendError,
    logNetworkError,
    logApiError,
    logValidationError,
    clearErrors,
    clearErrorsByType,
    getErrorCount,
    toggleVisibility,
    setVisibility
  };

  return (
    <ErrorLoggerContext.Provider value={value}>
      {children}
    </ErrorLoggerContext.Provider>
  );
};
