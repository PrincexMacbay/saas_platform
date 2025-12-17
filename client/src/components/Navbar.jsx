import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { buildImageUrl } from '../utils/imageUtils';
import LanguageSelector from './LanguageSelector';
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

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || '';
  };

  // Show limited navbar for public pages
  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2c3e50] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center h-16 overflow-visible">
              <img 
                src={logoImage} 
                alt="Near East University - Faculty of AI and Informatics"
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link 
                to="/browse-memberships" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                  isActive('/browse-memberships') 
                    ? 'bg-[#3498db] shadow-md' 
                    : 'hover:bg-white/10'
                }`}
              >
                <i className="fas fa-search text-sm"></i>
                <span>{t('nav.browse.memberships')}</span>
              </Link>
              
              <Link 
                to="/login" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                  isActive('/login') 
                    ? 'bg-[#3498db] shadow-md' 
                    : 'hover:bg-white/10'
                }`}
              >
                <i className="fas fa-sign-in-alt text-sm"></i>
                <span>{t('nav.login')}</span>
              </Link>
              
              <Link 
                to="/register" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white font-medium hover:from-[#2980b9] hover:to-[#1f6aa5] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <i className="fas fa-user-plus text-sm"></i>
                <span>{t('nav.register')}</span>
              </Link>
              
              <div className="ml-2">
                <LanguageSelector />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/browse-memberships"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/browse-memberships')
                    ? 'bg-[#3498db] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-search w-5"></i>
                <span className="font-medium">{t('nav.browse.memberships')}</span>
              </Link>
              
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/login')
                    ? 'bg-[#3498db] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-sign-in-alt w-5"></i>
                <span className="font-medium">{t('nav.login')}</span>
              </Link>
              
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white font-medium"
              >
                <i className="fas fa-user-plus w-5"></i>
                <span>{t('nav.register')}</span>
              </Link>
              
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">{t('nav.language')}</span>
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2c3e50] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center h-16 overflow-visible">
            <img 
              src={logoImage} 
              alt="Near East University - Faculty of AI and Informatics"
              className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain"
            />
          </Link>
          
          {/* Desktop Navigation - Regular User */}
          {!location.pathname.startsWith('/admin') && (
            <div className="hidden md:flex items-center gap-2">
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                  isActive('/dashboard') 
                    ? 'bg-[#3498db] shadow-md' 
                    : 'hover:bg-white/10'
                }`}
              >
                <i className="fas fa-home text-sm"></i>
                <span>{t('nav.dashboard')}</span>
              </Link>
              
              <Link 
                to="/membership" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                  location.pathname.startsWith('/membership') 
                    ? 'bg-[#3498db] shadow-md' 
                    : 'hover:bg-white/10'
                }`}
              >
                <i className="fas fa-users text-sm"></i>
                <span>{t('nav.membership')}</span>
              </Link>
              
              <Link 
                to="/users" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                  isActive('/users') 
                    ? 'bg-[#3498db] shadow-md' 
                    : 'hover:bg-white/10'
                }`}
              >
                <i className="fas fa-user-friends text-sm"></i>
                <span>{t('nav.people')}</span>
              </Link>
              
              <Link 
                to="/career" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                  isActive('/career') 
                    ? 'bg-[#3498db] shadow-md' 
                    : 'hover:bg-white/10'
                }`}
              >
                <i className="fas fa-briefcase text-sm"></i>
                <span>{t('nav.career.center')}</span>
              </Link>
              
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                    isActive('/admin') 
                      ? 'bg-[#3498db] shadow-md' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <i className="fas fa-cog text-sm"></i>
                  <span>{t('nav.admin')}</span>
                </Link>
              )}
              
              {/* Language Selector - Desktop */}
              <div className="ml-2">
                <LanguageSelector />
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative ml-2" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:ring-offset-2 focus:ring-offset-[#2c3e50]"
                  aria-label="User menu"
                >
                  {user?.profileImage ? (
                    <img 
                      src={buildImageUrl(user.profileImage)} 
                      alt={getUserDisplayName()}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3498db] to-[#2980b9] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {getInitials(user)}
                    </div>
                  )}
                </button>
                
                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white">
                      <div className="flex items-center gap-3">
                        {user?.profileImage ? (
                          <img 
                            src={buildImageUrl(user.profileImage)} 
                            alt={getUserDisplayName()}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-lg border-2 border-white/30">
                            {getInitials(user)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-xs text-white/80 truncate">
                            @{user?.username}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={`/profile/${user?.username}`}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                      >
                        <i className="fas fa-user w-5 text-gray-400 group-hover:text-[#3498db] transition-colors"></i>
                        <span className="font-medium">{t('nav.view.profile')}</span>
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                        >
                          <i className="fas fa-cog w-5 text-gray-400 group-hover:text-[#3498db] transition-colors"></i>
                          <span className="font-medium">{t('nav.admin')}</span>
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                      >
                        <i className="fas fa-sign-out-alt w-5 group-hover:text-red-700 transition-colors"></i>
                        <span className="font-medium">{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Navigation - Admin Panel */}
          {location.pathname.startsWith('/admin') && user?.role === 'admin' && (
            <div className="hidden md:flex items-center gap-4">
              <div className="px-4 py-2 bg-[#3498db]/20 border border-[#3498db]/30 rounded-lg">
                <span className="text-[#3498db] font-semibold text-sm flex items-center gap-2">
                  <i className="fas fa-shield-alt"></i>
                  Admin Panel
                </span>
              </div>
              
              <div className="ml-2">
                <LanguageSelector />
              </div>
              
              {/* Profile Dropdown for Admin */}
              <div className="relative ml-2" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:ring-offset-2 focus:ring-offset-[#2c3e50]"
                  aria-label="User menu"
                >
                  {user?.profileImage ? (
                    <img 
                      src={buildImageUrl(user.profileImage)} 
                      alt={getUserDisplayName()}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3498db] to-[#2980b9] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {getInitials(user)}
                    </div>
                  )}
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white">
                      <div className="flex items-center gap-3">
                        {user?.profileImage ? (
                          <img 
                            src={buildImageUrl(user.profileImage)} 
                            alt={getUserDisplayName()}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-lg border-2 border-white/30">
                            {getInitials(user)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-xs text-white/80 truncate">
                            @{user?.username}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        to={`/profile/${user?.username}`}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                      >
                        <i className="fas fa-user w-5 text-gray-400 group-hover:text-[#3498db] transition-colors"></i>
                        <span className="font-medium">{t('nav.view.profile')}</span>
                      </Link>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                      >
                        <i className="fas fa-eye w-5 text-gray-400 group-hover:text-[#3498db] transition-colors"></i>
                        <span className="font-medium">{t('admin.sidebar.view.as.user')}</span>
                      </Link>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                      >
                        <i className="fas fa-sign-out-alt w-5 group-hover:text-red-700 transition-colors"></i>
                        <span className="font-medium">{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 space-y-1">
            {/* Admin Navigation */}
            {location.pathname.startsWith('/admin') && user?.role === 'admin' ? (
              <>
                {/* Admin Navigation Section */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {t('admin.mobile.navigation')}
                  </h3>
                  
                  <div className="space-y-1">
                    {[
                      { path: '/admin?section=overview', icon: 'fa-chart-pie', label: t('admin.sidebar.overview') },
                      { path: '/admin?section=users', icon: 'fa-users', label: t('admin.sidebar.users') },
                      { path: '/admin?section=memberships', icon: 'fa-credit-card', label: t('admin.sidebar.memberships') },
                      { path: '/admin?section=financial', icon: 'fa-dollar-sign', label: t('admin.sidebar.financial') },
                      { path: '/admin?section=jobs', icon: 'fa-briefcase', label: t('admin.sidebar.jobs') },
                      { path: '/admin?section=coupons', icon: 'fa-ticket-alt', label: t('admin.sidebar.coupons') },
                      { path: '/admin?section=system', icon: 'fa-cog', label: t('admin.sidebar.system') },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <i className={`fas ${item.icon} w-5 text-gray-400`}></i>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Actions Section */}
                <div className="mb-4 pt-4 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {t('admin.mobile.actions')}
                  </h3>
                  
                  {/* Language Selector */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mb-2">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-globe w-5 text-gray-400"></i>
                      <span className="text-sm font-medium text-gray-700">{t('nav.language')}</span>
                    </div>
                    <LanguageSelector />
                  </div>
                  
                  {/* View as User Button */}
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <i className="fas fa-eye w-5"></i>
                    <span className="font-medium">{t('admin.sidebar.view.as.user')}</span>
                  </button>
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors mt-2"
                  >
                    <i className="fas fa-sign-out-alt w-5"></i>
                    <span className="font-medium">{t('nav.logout')}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Regular User Navigation */}
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-[#3498db] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-home w-5"></i>
                  <span className="font-medium">{t('nav.dashboard')}</span>
                </Link>
                
                <Link
                  to="/membership"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname.startsWith('/membership')
                      ? 'bg-[#3498db] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-users w-5"></i>
                  <span className="font-medium">{t('nav.membership')}</span>
                </Link>
                
                <Link
                  to="/users"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/users')
                      ? 'bg-[#3498db] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-user-friends w-5"></i>
                  <span className="font-medium">{t('nav.people')}</span>
                </Link>
                
                <Link
                  to="/career"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive('/career')
                      ? 'bg-[#3498db] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="fas fa-briefcase w-5"></i>
                  <span className="font-medium">{t('nav.career.center')}</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/admin')
                        ? 'bg-[#3498db] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className="fas fa-cog w-5"></i>
                    <span className="font-medium">{t('nav.admin')}</span>
                  </Link>
                )}
                
                {/* Profile Section */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="px-4 py-2 mb-2">
                    <div className="flex items-center gap-3">
                      {user?.profileImage ? (
                        <img 
                          src={buildImageUrl(user.profileImage)} 
                          alt={getUserDisplayName()}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3498db] to-[#2980b9] flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(user)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{getUserDisplayName()}</div>
                        <div className="text-xs text-gray-500">@{user?.username}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/profile/${user?.username}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <i className="fas fa-user w-5 text-gray-400"></i>
                    <span className="font-medium">{t('nav.view.profile')}</span>
                  </Link>
                  
                  <Link
                    to={`/profile/${user?.username}?edit=true`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <i className="fas fa-edit w-5 text-gray-400"></i>
                    <span className="font-medium">{t('nav.edit.profile')}</span>
                  </Link>
                </div>
                
                {/* Language Selector */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-globe w-5 text-gray-400"></i>
                      <span className="text-sm font-medium text-gray-700">{t('nav.language')}</span>
                    </div>
                    <LanguageSelector />
                  </div>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors mt-4"
                >
                  <i className="fas fa-sign-out-alt w-5"></i>
                  <span className="font-medium">{t('nav.logout')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close mobile menu when clicking outside */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;