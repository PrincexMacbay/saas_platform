import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { buildImageUrl } from '../utils/imageUtils';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';
import logoImage from '../Logo/neu2.png';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  // Show limited navbar for public pages
  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <img 
              src={logoImage} 
              alt="Near East University - Faculty of AI and Informatics" 
            />
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link 
                  to="/browse-memberships" 
                  className={`nav-link ${isActive('/browse-memberships') ? 'active' : ''}`}
                >
                  <i className="fas fa-search"></i> {t('nav.browse.memberships')}
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  <i className="fas fa-sign-in-alt"></i> {t('nav.login')}
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/register" 
                  className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                >
                  <i className="fas fa-user-plus"></i> {t('nav.register')}
                </Link>
              </li>
            </ul>
            <LanguageSelector />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <img 
            src={logoImage} 
            alt="Near East University - Faculty of AI and Informatics" 
          />
        </Link>
        
        {/* Hide regular navigation when on admin dashboard */}
        {!location.pathname.startsWith('/admin') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ul className={`navbar-nav ${isMenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  <i className="fas fa-home"></i> {t('nav.dashboard')}
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/membership" 
                  className={`nav-link ${location.pathname.startsWith('/membership') ? 'active' : ''}`}
                >
                  <i className="fas fa-users"></i> {t('nav.membership')}
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/users" 
                  className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                >
                  <i className="fas fa-user-friends"></i> {t('nav.people')}
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/career" 
                  className={`nav-link ${isActive('/career') ? 'active' : ''}`}
                >
                  <i className="fas fa-briefcase"></i> {t('nav.career.center')}
                </Link>
              </li>
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <Link 
                    to="/admin" 
                    className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    <i className="fas fa-cog"></i> {t('nav.admin')}
                  </Link>
                </li>
              )}
            </ul>
            {/* Language selector only visible on desktop */}
            <div className="desktop-language-selector">
              <LanguageSelector />
            </div>
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* Profile Dropdown */}
            <div className="profile-dropdown-container" ref={profileDropdownRef} style={{ position: 'relative' }}>
              <button
                className="profile-icon-button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                style={{
                  background: user?.profileImage ? 'none' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  overflow: 'hidden',
                  transition: 'background-color 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!user?.profileImage) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  if (!user?.profileImage) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {user?.profileImage ? (
                  <img 
                    src={buildImageUrl(user.profileImage)}
                    alt={user.username}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>
                    {getInitials(user)}
                  </span>
                )}
              </button>
              
              {isProfileDropdownOpen && (
                <div className="profile-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: '200px',
                  marginTop: '8px'
                }}>
                  <div className="dropdown-header" style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {user.profileImage ? (
                        <img 
                          src={buildImageUrl(user.profileImage)}
                          alt={user.username}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        getInitials(user)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '2px' }}>
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => setIsProfileDropdownOpen(false)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      color: '#3498db',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s',
                      textDecoration: 'none',
                      borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-user"></i>
                    {t('nav.view.profile')}
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="dropdown-logout-button"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin navigation - only show when on admin dashboard */}
        {location.pathname.startsWith('/admin') && user?.role === 'admin' && (
          <div className="" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="admin-nav-text">
              {/* <i className="fas fa-cog"></i> Admin Panel */}
            </span>
            {/* Language selector only visible on desktop */}
            <div className="desktop-language-selector">
              <LanguageSelector />
            </div>
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* Profile Dropdown for Admin */}
            <div className="profile-dropdown-container" ref={profileDropdownRef} style={{ position: 'relative' }}>
              <button
                className="profile-icon-button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                style={{
                  background: user?.profileImage ? 'none' : 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  overflow: 'hidden',
                  transition: 'background-color 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!user?.profileImage) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  }
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  if (!user?.profileImage) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {user?.profileImage ? (
                  <img 
                    src={buildImageUrl(user.profileImage)}
                    alt={user.username}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>
                    {getInitials(user)}
                  </span>
                )}
              </button>
              
              {isProfileDropdownOpen && (
                <div className="profile-dropdown" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: '200px',
                  marginTop: '8px'
                }}>
                  <div className="dropdown-header" style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {user.profileImage ? (
                        <img 
                          src={buildImageUrl(user.profileImage)}
                          alt={user.username}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        getInitials(user)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '2px' }}>
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={() => setIsProfileDropdownOpen(false)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      color: '#3498db',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s',
                      textDecoration: 'none',
                      borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f8ff'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-user"></i>
                    {t('nav.view.profile')}
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="dropdown-logout-button"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      color: '#e74c3c',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}


        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ 
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderTop: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          <div style={{ padding: '16px' }}>
            {/* Show admin navigation when on admin dashboard */}
            {location.pathname.startsWith('/admin') && user?.role === 'admin' ? (
              <>
                {/* Admin Navigation Section */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#64748b', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                    padding: '0 4px'
                  }}>
                    {t('admin.mobile.navigation')}
                  </h3>
                  
                  <button 
                    onClick={() => {
                      navigate('/admin?section=overview');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #eee',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    <i className="fas fa-chart-pie" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('admin.sidebar.overview')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/admin?section=users');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #eee',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    <i className="fas fa-users" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('admin.sidebar.users')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/admin?section=memberships');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #eee',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    <i className="fas fa-credit-card" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('admin.sidebar.memberships')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/admin?section=financial');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #eee',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    <i className="fas fa-dollar-sign" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('admin.sidebar.financial')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/admin?section=jobs');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #eee',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    <i className="fas fa-briefcase" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('admin.sidebar.jobs')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/admin?section=coupons');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #eee',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    <i className="fas fa-ticket-alt" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('admin.sidebar.coupons')}
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/admin?section=system');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid #eee',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    <i className="fas fa-cog" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('admin.sidebar.system')}
                  </button>
                </div>

                {/* Admin Actions Section */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#64748b', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                    padding: '0 4px'
                  }}>
                    {t('admin.mobile.actions')}
                  </h3>
                  
                  {/* Language Selector */}
                  <div className="
                    flex items-center justify-between
                    px-4 py-3
                    border-b border-gray-200
                    rounded-lg
                    mb-2
                    bg-gray-50/50
                  ">
                    <div className="flex items-center gap-3">
                      <svg 
                        className="w-4 h-4 text-gray-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{t('nav.language')}</span>
                    </div>
                    <LanguageSelector />
                  </div>
                  
                  {/* View as User Button */}
                  <button 
                    onClick={() => {
                      window.open('/dashboard', '_blank');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#16a34a',
                      textDecoration: 'none',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}
                  >
                    <i className="fas fa-eye" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('admin.sidebar.view.as.user')}
                  </button>
                  
                  {/* Logout Button */}
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="mobile-nav-link"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#e74c3c',
                      textDecoration: 'none',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderRadius: '6px'
                    }}
                  >
                    <i className="fas fa-sign-out-alt" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Regular User Navigation */}
                <Link 
                  to="/dashboard" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-home" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.dashboard')}
                </Link>
                <Link 
                  to="/membership" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-users" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.membership')}
                </Link>
                <Link 
                  to="/users" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-user-friends" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.people')}
                </Link>
                <Link 
                  to="/career" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-briefcase" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.career.center')}
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      borderBottom: '1px solid #eee',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <i className="fas fa-cog" style={{ marginRight: '12px', width: '16px' }}></i>
                    {t('nav.admin')}
                  </Link>
                )}
                
                {/* Profile Section */}
                <Link 
                  to={`/profile/${user?.username}`}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-user" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.view.profile')}
                </Link>
                
                <Link 
                  to={`/profile/${user.username}?edit=true`}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    borderBottom: '1px solid #eee',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-edit" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.edit.profile')}
                </Link>
                
                {/* Language Selector */}
                <div className="
                  flex items-center justify-between
                  px-4 py-3
                  border-b border-gray-200
                  bg-gray-50/50
                ">
                  <div className="flex items-center gap-3">
                    <svg 
                      className="w-4 h-4 text-gray-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{t('nav.language')}</span>
                  </div>
                  <LanguageSelector />
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="mobile-nav-link"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 16px',
                    color: '#e74c3c',
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <i className="fas fa-sign-out-alt" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close mobile menu when clicking outside */}
      {isMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
