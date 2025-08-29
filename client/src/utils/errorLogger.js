// Utility functions for manual error logging
// This can be used anywhere in the app to log errors manually

let errorLoggerContext = null;

// Set the error logger context (called from ErrorLogger component)
export const setErrorLoggerContext = (context) => {
  errorLoggerContext = context;
};

// Manual error logging functions
export const logError = (error, type = 'frontend', context = {}) => {
  if (errorLoggerContext) {
    errorLoggerContext.addError(error, type, context);
  } else {
    console.error('ErrorLogger context not available:', error);
  }
};

export const logFrontendError = (error, context = {}) => {
  logError(error, 'frontend', context);
};

export const logBackendError = (error, context = {}) => {
  logError(error, 'backend', context);
};

export const logNetworkError = (error, context = {}) => {
  logError(error, 'network', context);
};

export const logApiError = (error, context = {}) => {
  logError(error, 'api', context);
};

export const logValidationError = (error, context = {}) => {
  logError(error, 'validation', context);
};

// Utility function to wrap async functions with error logging
export const withErrorLogging = (asyncFn, errorType = 'frontend') => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      logError(error, errorType, {
        functionName: asyncFn.name || 'anonymous',
        args: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
      });
      throw error;
    }
  };
};

// Utility function to create error objects with context
export const createError = (message, type = 'frontend', context = {}) => {
  const error = new Error(message);
  error.errorType = type;
  error.context = context;
  return error;
};

// Utility function to log API errors with response details
export const logApiResponseError = (response, requestData = {}) => {
  const error = new Error(`API Error: ${response.status} ${response.statusText}`);
  logError(error, 'api', {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    requestData,
    responseHeaders: Object.fromEntries(response.headers.entries())
  });
};

// Utility function to log validation errors
export const logValidationErrors = (errors, formData = {}) => {
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      logError(new Error(error.message || error), 'validation', {
        field: error.field,
        formData: Object.keys(formData)
      });
    });
  } else if (typeof errors === 'object') {
    Object.entries(errors).forEach(([field, message]) => {
      logError(new Error(message), 'validation', {
        field,
        formData: Object.keys(formData)
      });
    });
  }
};
