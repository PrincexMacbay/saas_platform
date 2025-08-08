import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return null; // Don't show navbar on login/register pages
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          HumHub Clone
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
              to="/spaces" 
              className={`nav-link ${isActive('/spaces') ? 'active' : ''}`}
            >
              <i className="fas fa-users"></i> Spaces
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
          <li className="nav-item">
            <Link 
              to={`/profile/${user?.username}`}
              className={`nav-link ${location.pathname.includes('/profile/') ? 'active' : ''}`}
            >
              <i className="fas fa-user"></i> Profile
            </Link>
          </li>
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none' }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </ul>

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
    </nav>
  );
};

export default Navbar;