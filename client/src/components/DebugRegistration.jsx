import React, { useState } from 'react';
import { testRegistrationEndpoint, testRegistrationValidation, testDatabaseConnection, testHealthCheck } from '../services/debugService';

const DebugRegistration = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testData = {
    username: 'testuser123',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  };

  const runTest = async (testName, testFunction) => {
    setIsLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          message: 'Test failed',
          error: error.message
        }
      }));
    }
    setIsLoading(false);
  };

  const runAllTests = async () => {
    setIsLoading(true);
    
    // Test health check
    await runTest('health', testHealthCheck);
    
    // Test database connection
    await runTest('database', testDatabaseConnection);
    
    // Test registration validation
    await runTest('validation', () => testRegistrationValidation(testData));
    
    // Test registration endpoint
    await runTest('registration', () => testRegistrationEndpoint(testData));
    
    setIsLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Registration Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests} 
          disabled={isLoading}
          style={{ marginRight: '10px' }}
          className="btn btn-primary"
        >
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button 
          onClick={() => runTest('health', testHealthCheck)}
          disabled={isLoading}
          style={{ marginRight: '10px' }}
          className="btn btn-secondary"
        >
          Health Check
        </button>
        
        <button 
          onClick={() => runTest('database', testDatabaseConnection)}
          disabled={isLoading}
          style={{ marginRight: '10px' }}
          className="btn btn-secondary"
        >
          Database Test
        </button>
        
        <button 
          onClick={() => runTest('validation', () => testRegistrationValidation(testData))}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Validation Test
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Test Data:</h4>
        <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(testData, null, 2)}
        </pre>
      </div>

      <div>
        <h4>Test Results:</h4>
        {Object.entries(testResults).map(([testName, result]) => (
          <div key={testName} style={{ marginBottom: '15px' }}>
            <h5 style={{ 
              color: result.success ? '#28a745' : '#dc3545',
              marginBottom: '5px'
            }}>
              {testName}: {result.success ? 'PASS' : 'FAIL'}
            </h5>
            <div style={{ 
              background: result.success ? '#d4edda' : '#f8d7da', 
              padding: '10px', 
              borderRadius: '5px',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <pre style={{ margin: 0, fontSize: '12px' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Running tests...</p>
        </div>
      )}
    </div>
  );
};

export default DebugRegistration;
