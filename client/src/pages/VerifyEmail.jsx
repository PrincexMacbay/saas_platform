import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import logoImage from '../Logo/neu2.png';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setUser } = useAuth();
  
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailFromState = location.state?.email || '';
    const messageFromState = location.state?.message || '';
    
    if (emailFromState) {
      setEmail(emailFromState);
    }
    
    if (messageFromState) {
      setMessage(messageFromState);
    }

    if (token) {
      verifyEmail(token);
    } else {
      setStatus('no-token');
      if (!messageFromState) {
        setMessage(t('auth.verify.email.check.inbox') || 'Please check your email inbox (and spam folder) for the verification link. Click the link in the email to verify your account.');
      }
    }
  }, [searchParams, location, t]);

  const verifyEmail = async (token) => {
    try {
      setStatus('verifying');
      setMessage(t('auth.verify.email.verifying') || 'Verifying your email address...');
      
      const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || t('auth.verify.email.success') || 'Email verified successfully! Logging you in...');
        
        if (response.data.data.token && response.data.data.user) {
          try {
            setUser({
              token: response.data.data.token,
              user: response.data.data.user
            });
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } catch (error) {
            console.error('Auto-login error:', error);
            setTimeout(() => {
              navigate('/login', { 
                state: { 
                  message: t('auth.verify.email.login.required') || 'Email verified successfully! Please log in.',
                  verified: true 
                } 
              });
            }, 2000);
          }
        } else {
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: t('auth.verify.email.login.required') || 'Email verified successfully! Please log in.',
                verified: true 
              } 
            });
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage(response.data.message || t('auth.verify.email.failed') || 'Failed to verify email. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      const errorMessage = error.response?.data?.message || 
                          t('auth.verify.email.error') || 'An error occurred while verifying your email. Please try again.';
      setMessage(errorMessage);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!resendEmail) {
      setResendStatus(t('auth.verify.email.enter.email') || 'Please enter your email address');
      return;
    }

    try {
      setResendStatus(t('auth.verify.email.sending') || 'Sending...');
      
      const response = await api.post('/auth/resend-verification', {
        email: resendEmail
      });
      
      if (response.data.success) {
        setResendStatus(t('auth.verify.email.sent') || 'Verification email sent! Please check your inbox.');
        setEmail(resendEmail);
        setTimeout(() => {
          setResendStatus('');
        }, 5000);
      } else {
        setResendStatus(response.data.message || t('auth.verify.email.send.failed') || 'Failed to send verification email.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          t('auth.verify.email.send.error') || 'Failed to send verification email. Please try again.';
      setResendStatus(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Logo */}
            <div className="text-center mb-8">
              <img 
                src={logoImage} 
                alt="Near East University" 
                className="h-12 mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-900">
                {t('auth.verify.email.title') || 'Email Verification'}
              </h2>
            </div>

            {/* Verifying State */}
            {status === 'verifying' && (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
                  <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-lg text-gray-600">{message}</p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-bounce">
                  <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  {t('auth.verify.email.verified') || 'Email Verified!'}
                </h3>
                <p className="text-gray-600 mb-2">{message}</p>
                <p className="text-sm text-gray-500 mt-4">
                  {t('auth.verify.email.logging.in') || 'Logging you in...'}
                </p>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                  <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-4">
                  {t('auth.verify.email.failed.title') || 'Verification Failed'}
                </h3>
                <p className="text-gray-600 mb-8">{message}</p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('auth.verify.email.need.new') || "Need a new verification email?"}
                  </h4>
                  <form onSubmit={handleResendVerification} className="space-y-4">
                    <div>
                      <label htmlFor="resendEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          id="resendEmail"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder={t('auth.email.placeholder') || 'Enter your email address'}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold text-base transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t('auth.verify.email.resend') || 'Resend Verification Email'}
                    </button>
                    {resendStatus && (
                      <div className={`p-3 rounded-lg text-sm text-center ${
                        resendStatus.includes('sent') || resendStatus.includes('Sending')
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {resendStatus}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* No Token State */}
            {status === 'no-token' && (
              <div className="py-8">
                <div className="text-center mb-8">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
                    <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('auth.verify.email.check.email') || 'Check Your Email'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {message || t('auth.verify.email.check.inbox') || 'Please check your email inbox (and spam folder) for the verification link. Click the link in the email to verify your account.'}
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('auth.verify.email.didnt.receive') || "Didn't receive the email?"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('auth.verify.email.check.spam') || "Check your spam folder, or request a new verification email below:"}
                  </p>
                  <form onSubmit={handleResendVerification} className="space-y-4">
                    <div>
                      <label htmlFor="resendEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t('auth.email')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          id="resendEmail"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder={t('auth.email.placeholder') || 'Enter your email address'}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold text-base transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t('auth.verify.email.send') || 'Send Verification Email'}
                    </button>
                    {resendStatus && (
                      <div className={`p-3 rounded-lg text-sm text-center ${
                        resendStatus.includes('sent') || resendStatus.includes('Sending')
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {resendStatus}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('auth.verify.email.back.to.login') || 'Back to Login'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
