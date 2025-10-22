import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { buildImageUrl } from '../utils/imageUtils';
import LanguageSelector from './LanguageSelector';
import logoImage from '../Logo/Faculty_of_AI_and_Informatics.jpg';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain'
              }}
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
            style={{
              height: '40px',
              width: 'auto',
              objectFit: 'contain'
            }}
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
          </div>
        )}

        {/* Profile Dropdown */}
        <div className="profile-dropdown">
          <button 
            className="profile-dropdown-toggle"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '20px',
              transition: 'background-color 0.3s'
            }}
          >
            <div className="user-avatar-sm" style={{ marginRight: '8px' }}>
              {user?.profileImage ? (
                <img 
                  src={buildImageUrl(user.profileImage)}
                  alt={user.username}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#3498db',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {getInitials(user)}
                </div>
              )}
            </div>
            <span style={{ marginRight: '8px' }}>
              {user?.firstName ? `${user.firstName}` : user?.username}
            </span>
            <i className={`fas fa-chevron-down ${isProfileDropdownOpen ? 'rotate' : ''}`} 
               style={{ fontSize: '12px', transition: 'transform 0.3s' }}></i>
          </button>

          {isProfileDropdownOpen && (
            <div className="profile-dropdown-menu" style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '250px',
              zIndex: 1000,
              marginTop: '8px'
            }}>
              {/* User Info Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="user-avatar-sm" style={{ marginRight: '12px' }}>
                    {user?.profileImage ? (
                      <img 
                        src={buildImageUrl(user.profileImage)}
                        alt={user.username}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#3498db',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        {getInitials(user)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.username}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      @{user?.username}
                    </div>
                    {user?.profile?.userType && (
                      <div style={{ color: '#3498db', fontSize: '12px', textTransform: 'capitalize' }}>
                        {user.profile.userType}
                      </div>
                    )}
                  </div>
                </div>
                {user?.about && (
                  <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                    {user.about.length > 100 ? `${user.about.substring(0, 100)}...` : user.about}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {user?.followersCount || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{t('nav.followers')}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {user?.followingCount || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{t('nav.following')}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {user?.subscriptions?.length || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{t('nav.memberships')}</div>
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '8px 0' }}>
                <Link 
                  to={`/profile/${user?.username}`}
                  className="dropdown-item"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-user" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.view.profile')}
                </Link>
                <Link 
                  to={`/profile/${user.username}?edit=true`}
                  className="dropdown-item"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-edit" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.edit.profile')}
                </Link>

                <Link 
                  to="/career"
                  className="dropdown-item"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-briefcase" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.career.center')}
                </Link>
                
                {/* Language Selector - Mobile Only */}
                <div className="mobile-language-selector" style={{ 
                  padding: '12px 16px', 
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-globe" style={{ marginRight: '12px', width: '16px', color: '#666' }}></i>
                    <span style={{ color: '#333', fontSize: '14px' }}>{t('nav.language')}</span>
                  </div>
                  <LanguageSelector />
                </div>
                
                <div style={{ borderTop: '1px solid #eee', margin: '8px 0' }}></div>
                <button 
                  onClick={handleLogout}
                  className="dropdown-item"
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
                    transition: 'background-color 0.2s'
                  }}
                >
                  <i className="fas fa-sign-out-alt" style={{ marginRight: '12px', width: '16px' }}></i>
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          )}
        </div>

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
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isProfileDropdownOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;