import api from './api';

export const testRegistrationEndpoint = async (userData) => {
  try {
    console.log('Testing registration endpoint with data:', userData);
    const response = await api.post('/test-register', userData);
    console.log('Test registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Test registration error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Test failed',
      error: error.message
    };
  }
};

export const testRegistrationValidation = async (userData) => {
  try {
    console.log('Testing registration validation with data:', userData);
    const response = await api.post('/test-register-validation', userData);
    console.log('Test validation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Test validation error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Validation test failed',
      errors: error.response?.data?.errors || []
    };
  }
};

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    const response = await api.get('/db-test');
    console.log('Database test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Database test error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Database test failed',
      error: error.message
    };
  }
};

export const testHealthCheck = async () => {
  try {
    console.log('Testing health check...');
    const response = await api.get('/health');
    console.log('Health check response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Health check failed',
      error: error.message
    };
  }
};
