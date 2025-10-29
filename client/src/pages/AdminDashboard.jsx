import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminOverview from '../components/admin/AdminOverview';
import UserManagement from '../components/admin/UserManagement';
import MembershipManagement from '../components/admin/MembershipManagement';
import FinancialManagement from '../components/admin/FinancialManagement';
import JobManagement from '../components/admin/JobManagement';
import CouponManagement from '../components/admin/CouponManagement';
import SystemConfiguration from '../components/admin/SystemConfiguration';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role === 'admin') {
      setLoading(false);
    } else {
      // Redirect non-admin users
      window.location.href = '/dashboard';
    }
  }, [user]);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('admin.dashboard.loading')}</p>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <UserManagement />;
      case 'memberships':
        return <MembershipManagement />;
      case 'financial':
        return <FinancialManagement />;
      case 'jobs':
        return <JobManagement />;
      case 'coupons':
        return <CouponManagement />;
      case 'system':
        return <SystemConfiguration />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onSidebarToggle={setSidebarExpanded}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className={`admin-main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="admin-header">
          <div className="admin-header-left">
            <button 
              className="admin-mobile-menu-btn"
              aria-label="Open admin menu"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </button>
            <h1>{t('admin.dashboard.title')}</h1>
          </div>
          <div className="admin-user-info">
            <span>{t('admin.dashboard.welcome', { name: `${user?.firstName} ${user?.lastName}` })}</span>
            <span className="admin-badge">{t('admin.badge')}</span>
          </div>
        </div>

        {/* Mobile Admin Dropdown Menu */}
        {mobileSidebarOpen && (
          <div className="admin-mobile-dropdown">
            <div className="admin-mobile-dropdown-content">
              {/* Admin Navigation Options */}
              <div className="admin-mobile-nav-section">
                <h3 className="admin-mobile-section-title">{t('admin.mobile.navigation')}</h3>
                <button 
                  className={`admin-mobile-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('overview');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">📊</span>
                  <span className="nav-label">{t('admin.sidebar.overview')}</span>
                </button>
                <button 
                  className={`admin-mobile-nav-item ${activeSection === 'users' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('users');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">👥</span>
                  <span className="nav-label">{t('admin.sidebar.users')}</span>
                </button>
                <button 
                  className={`admin-mobile-nav-item ${activeSection === 'memberships' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('memberships');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">💳</span>
                  <span className="nav-label">{t('admin.sidebar.memberships')}</span>
                </button>
                <button 
                  className={`admin-mobile-nav-item ${activeSection === 'financial' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('financial');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">💰</span>
                  <span className="nav-label">{t('admin.sidebar.financial')}</span>
                </button>
                <button 
                  className={`admin-mobile-nav-item ${activeSection === 'jobs' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('jobs');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">💼</span>
                  <span className="nav-label">{t('admin.sidebar.jobs')}</span>
                </button>
                <button 
                  className={`admin-mobile-nav-item ${activeSection === 'coupons' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('coupons');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">🎫</span>
                  <span className="nav-label">{t('admin.sidebar.coupons')}</span>
                </button>
                <button 
                  className={`admin-mobile-nav-item ${activeSection === 'system' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection('system');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-label">{t('admin.sidebar.system')}</span>
                </button>
              </div>

              {/* Admin Actions Section */}
              <div className="admin-mobile-actions-section">
                <h3 className="admin-mobile-section-title">{t('admin.mobile.actions')}</h3>
                
                {/* Language Selector */}
                <div className="admin-mobile-language-selector">
                  <label className="admin-mobile-language-label">
                    <span className="language-icon">🌐</span>
                    <span className="language-text">{t('language.selector')}</span>
                  </label>
                  <select 
                    value={language} 
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="admin-mobile-language-select"
                  >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                  </select>
                </div>

                {/* View as User Button */}
                <button 
                  className="admin-mobile-view-as-user-btn"
                  onClick={() => {
                    window.open('/dashboard', '_blank');
                    setMobileSidebarOpen(false);
                  }}
                >
                  <span className="view-icon">👁️</span>
                  <span className="btn-text">{t('admin.sidebar.view.as.user')}</span>
                </button>

                {/* Logout Button */}
                <button 
                  className="admin-mobile-logout-btn"
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                >
                  <span className="logout-icon">🚪</span>
                  <span className="btn-text">{t('admin.sidebar.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="admin-content">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
