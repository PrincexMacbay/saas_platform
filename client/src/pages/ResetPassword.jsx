import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ResetPasswordPage Component
 * 
 * This component handles password reset completion by:
 * 1. Reading reset token from URL query parameters
 * 2. Validating new password requirements
 * 3. Calling the backend reset password API
 * 4. Showing success/error feedback
 * 5. Redirecting to login on success
 * 
 * Security features:
 * - Password strength validation
 * - Token validation on frontend
 * - Loading states to prevent double submissions
 * - Clear user feedback
 * - Responsive design
 */
const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Extract token from URL parameters
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [searchParams]);

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
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result with score and requirements
   */
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    const isValid = score >= 3; // At least 3 requirements met
    
    return {
      isValid,
      score,
      requirements,
      strength: score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong'
    };
  };

  /**
   * Validate form data
   * @returns {Object} - Validation errors object
   */
  const validateForm = () => {
    const errors = {};
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = 'Password must meet at least 3 of these requirements: 6+ characters, uppercase, lowercase, number';
      }
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  /**
   * Handle form submission
   * Sends password reset request to backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }
    
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
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        console.log('Password reset successfully');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successfully! Please log in with your new password.',
              type: 'success'
            }
          });
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get password strength indicator
   */
  const getPasswordStrength = () => {
    if (!formData.password) return null;
    return validatePassword(formData.password);
  };

  const passwordStrength = getPasswordStrength();

  // Show success state
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          
          <h2 className="auth-title">Password Reset Successfully!</h2>
          <p className="auth-subtitle">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          
          <div className="success-message">
            <p>
              <i className="fas fa-info-circle"></i>
              You will be automatically redirected to the login page in a few seconds.
            </p>
          </div>

          <div className="auth-actions">
            <Link to="/login" className="btn btn-primary">
              <i className="fas fa-sign-in-alt"></i> Go to Login
            </Link>
          </div>
        </div>

        <style jsx>{`
          .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            text-decoration: none;
          }

          .btn-primary {
            background: linear-gradient(135deg, #27ae60, #229954);
            color: white;
          }

          .btn-primary:hover {
            background: linear-gradient(135deg, #229954, #1e8449);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
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
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="auth-title">Set New Password</h2>
          <p className="auth-subtitle">
            Please enter your new password below. Make sure it's strong and secure.
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
            <label htmlFor="password" className="form-label">
              <i className="fas fa-key"></i>
              New Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${validationErrors.password ? 'error' : ''}`}
                placeholder="Enter your new password"
                disabled={isLoading}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            
            {/* Password strength indicator */}
            {formData.password && passwordStrength && (
              <div className="password-strength">
                <div className="strength-label">
                  Password Strength: 
                  <span className={`strength-text ${passwordStrength.strength}`}>
                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </span>
                </div>
                <div className="strength-bar">
                  <div 
                    className={`strength-fill ${passwordStrength.strength}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="strength-requirements">
                  <div className={`requirement ${passwordStrength.requirements.length ? 'met' : ''}`}>
                    <i className="fas fa-check-circle"></i>
                    At least 6 characters
                  </div>
                  <div className={`requirement ${passwordStrength.requirements.lowercase ? 'met' : ''}`}>
                    <i className="fas fa-check-circle"></i>
                    Lowercase letter
                  </div>
                  <div className={`requirement ${passwordStrength.requirements.uppercase ? 'met' : ''}`}>
                    <i className="fas fa-check-circle"></i>
                    Uppercase letter
                  </div>
                  <div className={`requirement ${passwordStrength.requirements.number ? 'met' : ''}`}>
                    <i className="fas fa-check-circle"></i>
                    Number
                  </div>
                </div>
              </div>
            )}
            
            {validationErrors.password && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {validationErrors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <i className="fas fa-check-double"></i>
              Confirm New Password
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="password-match">
                <i className="fas fa-check-circle"></i>
                Passwords match
              </div>
            )}
            
            {validationErrors.confirmPassword && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {validationErrors.confirmPassword}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading || !formData.password.trim() || !formData.confirmPassword.trim()}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Updating Password...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Update Password
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">
            <i className="fas fa-key"></i> Request New Reset Link
          </Link>
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

        .password-input-container {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 12px 45px 12px 16px;
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

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s ease;
        }

        .password-toggle:hover:not(:disabled) {
          color: #495057;
        }

        .password-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .password-strength {
          margin-top: 10px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .strength-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .strength-text {
          text-transform: capitalize;
          font-weight: 700;
        }

        .strength-text.weak { color: #e74c3c; }
        .strength-text.fair { color: #f39c12; }
        .strength-text.good { color: #3498db; }
        .strength-text.strong { color: #27ae60; }

        .strength-bar {
          height: 4px;
          background: #e9ecef;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
        }

        .strength-fill.weak { background: #e74c3c; }
        .strength-fill.fair { background: #f39c12; }
        .strength-fill.good { background: #3498db; }
        .strength-fill.strong { background: #27ae60; }

        .strength-requirements {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          font-size: 0.8rem;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6c757d;
        }

        .requirement.met {
          color: #27ae60;
        }

        .requirement i {
          font-size: 0.7rem;
        }

        .password-match {
          margin-top: 5px;
          color: #27ae60;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 5px;
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

        .btn-primary {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2980b9, #1f618d);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-links {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }

        .auth-link {
          color: #3498db;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.3s ease;
          font-size: 0.9rem;
        }

        .auth-link:hover {
          color: #2980b9;
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

          .strength-requirements {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
