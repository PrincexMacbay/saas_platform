import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MembershipNavbar.css';

const MembershipNavbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path === 'membership') {
      setActiveTab('dashboard');
    } else {
      setActiveTab(path);
    }
  }, [location]);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMobileDropdownOpen(false);
      }
    };

    if (isMobileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileDropdownOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMobileDropdownOpen) {
        setIsMobileDropdownOpen(false);
      }
    };

    if (isMobileDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileDropdownOpen]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', path: '/membership' },
    { id: 'payments', label: 'Payments', icon: 'fas fa-credit-card', path: '/membership/payments' },
    { id: 'scheduled-payments', label: 'Scheduled Payments', icon: 'fas fa-calendar-alt', path: '/membership/scheduled-payments' },
    { id: 'debts', label: 'Debts', icon: 'fas fa-exclamation-triangle', path: '/membership/debts' },
    { id: 'plans', label: 'Plans', icon: 'fas fa-layer-group', path: '/membership/plans' },
    { id: 'reminders', label: 'Reminders', icon: 'fas fa-bell', path: '/membership/reminders' },
    { id: 'applications', label: 'Applications', icon: 'fas fa-file-alt', path: '/membership/applications' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog', path: '/membership/settings' },
    { id: 'coupons', label: 'Coupons', icon: 'fas fa-ticket-alt', path: '/membership/coupons' },
    { id: 'application-forms', label: 'Application Forms', icon: 'fas fa-list', path: '/membership/application-forms' },
    { id: 'application-form', label: 'Application Form Builder', icon: 'fas fa-edit', path: '/membership/application-form' },
    { id: 'digital-card', label: 'Digital Card', icon: 'fas fa-id-card', path: '/membership/digital-card' },
    { id: 'payment-info', label: 'Payment Info', icon: 'fas fa-credit-card', path: '/membership/payment-info' }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileDropdownOpen(false);
  };

  return (
    <div className="membership-container">
      <div className="membership-header">
        <h1>
          <i className="fas fa-users" style={{ marginRight: '12px', color: '#3498db' }}></i>
          Membership Management
        </h1>
        <p>Manage subscriptions, payments, and member data</p>
      </div>

      <div className="membership-layout">
        {/* Desktop Sidebar */}
        <div className="sidebar-nav-outer desktop-sidebar">
          {tabs.map(tab => (
            <div key={tab.id} className="sidebar-nav-item">
              <button
                onClick={() => handleNavigation(tab.path)}
                className={`sidebar-nav-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="membership-content">
          {/* Mobile Navigation Dropdown */}
          <div className="mobile-nav-container">
            <div 
              className="mobile-nav-dropdown" 
              ref={dropdownRef}
              role="combobox"
              aria-expanded={isMobileDropdownOpen}
              aria-haspopup="listbox"
            >
              <button 
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className="mobile-dropdown-button"
                aria-label="Select navigation page"
              >
                <span className="dropdown-button-content">
                  <i className={activeTabData?.icon}></i>
                  <span>{activeTabData?.label || 'Select Page'}</span>
                </span>
                <i className={`fas fa-chevron-${isMobileDropdownOpen ? 'up' : 'down'} dropdown-arrow`}></i>
              </button>
              
              {isMobileDropdownOpen && (
                <div className="mobile-dropdown-menu" role="listbox">
                  {tabs.map((tab, index) => (
                    <div key={tab.id} className="dropdown-item-container">
                      {/* Add visual separator after certain items */}
                      {(index === 0 || index === 4 || index === 7) && index > 0 && (
                        <div className="dropdown-separator"></div>
                      )}
                      <button
                        onClick={() => handleNavigation(tab.path)}
                        className={`mobile-dropdown-item ${activeTab === tab.id ? 'active' : ''}`}
                        role="option"
                        aria-selected={activeTab === tab.id}
                      >
                        <i className={tab.icon}></i>
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                          <i className="fas fa-check dropdown-check"></i>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Children content (Routes) */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default MembershipNavbar;
