import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getDashboardPath } from '../hooks/useAdminRedirect';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardPath(user));
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      // Redirect to appropriate dashboard based on user role
      const { user } = result;
      navigate(getDashboardPath(user));
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{t('auth.login.title')}</h2>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login" className="form-label">
              {t('auth.username')} / {t('auth.email')}
            </label>
            <input
              type="text"
              id="login"
              name="login"
              className="form-control"
              value={formData.login}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('auth.login.button')}
          </button>
        </form>

        <div className="auth-links">
          <div className="auth-link">
            <Link to="/forgot-password" className="forgot-password-link">
              <i className="fas fa-key"></i> {t('auth.forgot.password.link')}
            </Link>
          </div>
          <div className="auth-link">
            <p>{t('auth.dont.have.account')} <Link to="/register">{t('auth.register.button')}</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-links {
          margin-top: 20px;
        }

        .auth-link {
          text-align: center;
          margin: 10px 0;
        }

        .forgot-password-link {
          color: #3498db;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.3s ease;
          font-size: 0.95rem;
        }

        .forgot-password-link:hover {
          color: #2980b9;
          text-decoration: underline;
        }

        .auth-link p {
          margin: 0;
          color: #7f8c8d;
        }

        .auth-link a {
          color: #3498db;
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link a:hover {
          color: #2980b9;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;