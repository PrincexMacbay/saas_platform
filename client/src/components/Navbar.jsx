import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { buildImageUrl } from '../utils/imageUtils';
import logoImage from '../Logo/Faculty_of_AI_and_Informatics.jpg';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
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
          
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link 
                to="/browse-memberships" 
                className={`nav-link ${isActive('/browse-memberships') ? 'active' : ''}`}
              >
                <i className="fas fa-search"></i> Browse Memberships
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/register" 
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
              >
                <i className="fas fa-user-plus"></i> Register
              </Link>
            </li>
          </ul>
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
        
        <ul className={`navbar-nav ${isMenuOpen ? 'show' : ''}`}>
          <li className="nav-item">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <i className="fas fa-home"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/membership" 
              className={`nav-link ${location.pathname.startsWith('/membership') ? 'active' : ''}`}
            >
              <i className="fas fa-users"></i> Membership
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/users" 
              className={`nav-link ${isActive('/users') ? 'active' : ''}`}
            >
              <i className="fas fa-user-friends"></i> People
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/career" 
              className={`nav-link ${isActive('/career') ? 'active' : ''}`}
            >
              <i className="fas fa-briefcase"></i> Career Center
            </Link>
          </li>
        </ul>

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
                  <div style={{ fontSize: '12px', color: '#666' }}>Followers</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {user?.followingCount || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Following</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {user?.subscriptions?.length || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Memberships</div>
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
                  View Profile
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
                  Edit Profile
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
                  Career Center
                </Link>
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
                  Logout
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
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>

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