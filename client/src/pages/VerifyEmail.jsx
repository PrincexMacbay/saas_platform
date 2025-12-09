import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error, resending
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailFromState = location.state?.email || '';
    
    if (emailFromState) {
      setEmail(emailFromState);
    }

    if (token) {
      verifyEmail(token);
    } else {
      // No token provided - show form to enter email for resend
      setStatus('no-token');
      setMessage('No verification token found. Please check your email for the verification link, or request a new one below.');
    }
  }, [searchParams, location]);

  const verifyEmail = async (token) => {
    try {
      setStatus('verifying');
      setMessage('Verifying your email address...');
      
      const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully! You can now log in.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Email verified successfully! Please log in.',
              verified: true 
            } 
          });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Failed to verify email. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error.response?.data?.message || 
                          'An error occurred while verifying your email. Please try again.';
      setMessage(errorMessage);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!resendEmail) {
      setResendStatus('Please enter your email address');
      return;
    }

    try {
      setResendStatus('Sending...');
      
      const response = await api.post('/auth/resend-verification', {
        email: resendEmail
      });
      
      if (response.data.success) {
        setResendStatus('Verification email sent! Please check your inbox.');
        setEmail(resendEmail);
        setTimeout(() => {
          setResendStatus('');
        }, 5000);
      } else {
        setResendStatus(response.data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Failed to send verification email. Please try again.';
      setResendStatus(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Email Verification</h2>
        
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner" style={{ margin: '20px auto' }}></div>
            <p>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', color: '#27ae60', marginBottom: '20px' }}>✅</div>
            <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>Email Verified!</h3>
            <p>{message}</p>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '20px' }}>
              Redirecting to login page...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', color: '#e74c3c', marginBottom: '20px' }}>❌</div>
            <h3 style={{ color: '#e74c3c', marginBottom: '10px' }}>Verification Failed</h3>
            <p style={{ marginBottom: '20px' }}>{message}</p>
            
            <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '15px' }}>Need a new verification email?</h4>
              <form onSubmit={handleResendVerification}>
                <div className="form-group">
                  <label htmlFor="resendEmail" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="resendEmail"
                    className="form-control"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Resend Verification Email
                </button>
                {resendStatus && (
                  <div className={`${resendStatus.includes('sent') ? 'success-message' : 'error-message'}`} 
                       style={{ marginTop: '10px', textAlign: 'center' }}>
                    {resendStatus}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {status === 'no-token' && (
          <div style={{ padding: '20px' }}>
            <p style={{ marginBottom: '20px' }}>{message}</p>
            
            <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '15px' }}>Request Verification Email</h4>
              <form onSubmit={handleResendVerification}>
                <div className="form-group">
                  <label htmlFor="resendEmail" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="resendEmail"
                    className="form-control"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Send Verification Email
                </button>
                {resendStatus && (
                  <div className={`${resendStatus.includes('sent') ? 'success-message' : 'error-message'}`} 
                       style={{ marginTop: '10px', textAlign: 'center' }}>
                    {resendStatus}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        <div className="auth-link" style={{ marginTop: '20px' }}>
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

