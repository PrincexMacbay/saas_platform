import React, { useState } from 'react';
import api from '../services/api';

const ApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing API connection...');
      console.log('API Base URL:', import.meta.env.VITE_API_URL);
      
      // Test health endpoint
      const response = await api.get('/health');
      setTestResult({
        success: true,
        data: response.data,
        status: response.status
      });
    } catch (error) {
      console.error('API Test Error:', error);
      setTestResult({
        success: false,
        error: error.message,
        code: error.code,
        details: error.response?.data || error.config
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegisterEndpoint = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing register endpoint...');
      
      const testData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await api.post('/auth/register', testData);
      setTestResult({
        success: true,
        data: response.data,
        status: response.status
      });
    } catch (error) {
      console.error('Register Test Error:', error);
      setTestResult({
        success: false,
        error: error.message,
        code: error.code,
        status: error.response?.status,
        details: error.response?.data || error.config
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🔧 API Connection Test</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Environment Variables:</strong></p>
        <ul>
          <li>VITE_API_URL: {import.meta.env.VITE_API_URL || 'NOT SET'}</li>
          <li>Environment: {import.meta.env.MODE}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testApiConnection}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          {loading ? 'Testing...' : 'Test Health Endpoint'}
        </button>
        
        <button 
          onClick={testRegisterEndpoint}
          disabled={loading}
          style={{ padding: '10px' }}
        >
          {loading ? 'Testing...' : 'Test Register Endpoint'}
        </button>
      </div>

      {testResult && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          <h4>{testResult.success ? '✅ Success' : '❌ Error'}</h4>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
