import api from './api';

export const testRegistration = async (userData) => {
  try {
    const response = await api.post('/test-register', userData);
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
    const response = await api.post('/test-register-validation', userData);
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
