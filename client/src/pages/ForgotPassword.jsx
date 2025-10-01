import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ForgotPasswordPage Component
 * 
 * This component handles password reset requests by:
 * 1. Collecting user email address
 * 2. Validating email format
 * 3. Calling the backend forgot password API
 * 4. Showing success/error feedback
 * 5. Providing navigation back to login
 * 
 * Security features:
 * - Email validation on frontend
 * - Loading states to prevent double submissions
 * - Clear user feedback
 * - Responsive design
 */
const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handle form input changes
   * Clears errors and updates form data
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear specific field error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form data
   * @returns {Object} - Validation errors object
   */
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return errors;
  };

  /**
   * Handle form submission
   * Sends password reset request to backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setValidationErrors({});
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        console.log('Password reset email sent successfully');
        
        // In development, log the debug token
        if (data.data?.debugToken) {
          console.log('🔑 Debug reset token:', data.data.debugToken);
          console.log('⏰ Token expires at:', data.data.expiresAt);
        }
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle resend email (if user wants to try again)
   */
  const handleResend = () => {
    setSuccess(false);
    setError('');
    setFormData({ email: '' });
  };

  // Show success state
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-icon">
            <i className="fas fa-envelope-open-text"></i>
          </div>
          
          <h2 className="auth-title">Check Your Email</h2>
          <p className="auth-subtitle">
            We've sent a password reset link to <strong>{formData.email}</strong>
          </p>
          
          <div className="success-message">
            <p>
              <i className="fas fa-info-circle"></i>
              If you don't see the email in your inbox, please check your spam folder.
            </p>
            <p>
              <i className="fas fa-clock"></i>
              The reset link will expire in 15 minutes for security.
            </p>
          </div>

          <div className="auth-actions">
            <button 
              type="button" 
              onClick={handleResend}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <i className="fas fa-redo"></i> Send Another Email
            </button>
          </div>

          <div className="auth-links">
            <Link to="/login" className="auth-link">
              <i className="fas fa-arrow-left"></i> Back to Login
            </Link>
          </div>
        </div>

        <style jsx>{`
          .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .auth-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 450px;
            text-align: center;
          }

          .success-icon {
            font-size: 4rem;
            color: #27ae60;
            margin-bottom: 20px;
            animation: bounce 1s ease-in-out;
          }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }

          .auth-title {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 1.8rem;
            font-weight: 700;
          }

          .auth-subtitle {
            color: #7f8c8d;
            margin-bottom: 30px;
            font-size: 1.1rem;
            line-height: 1.5;
          }

          .success-message {
            background: #e8f5e8;
            border: 1px solid #c3e6c3;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: left;
          }

          .success-message p {
            margin: 10px 0;
            color: #155724;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .success-message i {
            color: #27ae60;
            width: 16px;
          }

          .auth-actions {
            margin: 30px 0;
          }

          .btn {
            width: 100%;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .btn-secondary {
            background: #6c757d;
            color: white;
          }

          .btn-secondary:hover:not(:disabled) {
            background: #5a6268;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .auth-links {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
          }

          .auth-link {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s ease;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #3498db;
            background: transparent;
            position: relative;
            overflow: hidden;
          }

          .auth-link:hover {
            color: white;
            background: #3498db;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
          }

          .auth-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }

          .auth-link:hover::before {
            left: 100%;
          }

          @media (max-width: 480px) {
            .auth-card {
              padding: 30px 20px;
              margin: 10px;
            }
            
            .success-icon {
              font-size: 3rem;
            }
            
            .auth-title {
              font-size: 1.5rem;
            }
          }
        `}</style>
      </div>
    );
  }

  // Show form state
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <i className="fas fa-key"></i>
          </div>
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${validationErrors.email ? 'error' : ''}`}
              placeholder="Enter your email address"
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
            {validationErrors.email && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {validationErrors.email}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading || !formData.email.trim()}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Sending Reset Link...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="auth-link">
            <i className="fas fa-arrow-left"></i> Back to Login
          </Link>
          <Link to="/register" className="auth-link">
            <i className="fas fa-user-plus"></i> Create Account
          </Link>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .auth-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 450px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-icon {
          font-size: 3rem;
          color: #3498db;
          margin-bottom: 20px;
        }

        .auth-title {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .auth-subtitle {
          color: #7f8c8d;
          margin-bottom: 0;
          font-size: 1rem;
          line-height: 1.5;
        }

        .error-message {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }

        .auth-form {
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #2c3e50;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-input.error {
          border-color: #e74c3c;
        }

        .form-input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .field-error {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .btn {
          width: 100%;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
        }

        .btn-primary {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #ecf0f1 0%, #d5dbdb 100%);
          color: #2c3e50;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid #bdc3c7;
        }

        .btn-secondary:hover:not(:disabled) {
          background: linear-gradient(135deg, #d5dbdb 0%, #bdc3c7 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .auth-links {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }


        @media (max-width: 480px) {
          .auth-card {
            padding: 30px 20px;
            margin: 10px;
          }
          
          .auth-links {
            flex-direction: column;
            gap: 10px;
          }
          
          .auth-link {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
