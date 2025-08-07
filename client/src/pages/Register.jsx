import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      if (result.errors && result.errors.length > 0) {
        const fieldErrors = {};
        result.errors.forEach(error => {
          fieldErrors[error.field] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: result.message });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        
        {errors.general && (
          <div className="error-message" style={{ marginBottom: '20px', textAlign: 'center' }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-2">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={`form-control ${errors.firstName ? 'error' : ''}`}
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <div className="error-message">{errors.firstName}</div>
                )}
              </div>
            </div>
            <div className="col-2">
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={`form-control ${errors.lastName ? 'error' : ''}`}
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <div className="error-message">{errors.lastName}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-control ${errors.username ? 'error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength="6"
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;