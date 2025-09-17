import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import MembershipDashboard from '../components/membership/MembershipDashboard';
import Payments from '../components/membership/Payments';
import ScheduledPayments from '../components/membership/ScheduledPayments';
import Debts from '../components/membership/Debts';
import Plans from '../components/membership/Plans';
import Reminders from '../components/membership/Reminders';
import Applications from '../components/membership/Applications';
import MembershipSettings from '../components/membership/MembershipSettings';
import Coupons from '../components/membership/Coupons';
import ApplicationFormBuilder from '../components/membership/ApplicationFormBuilder';
import ApplicationForms from '../components/membership/ApplicationForms';
import DigitalCard from '../components/membership/DigitalCard';
import PaymentInfo from '../components/membership/PaymentInfo';
import ErrorBoundary from '../components/ErrorBoundary';

const Membership = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path === 'membership') {
      setActiveTab('dashboard');
    } else {
      setActiveTab(path);
    }
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileDropdownOpen && !event.target.closest('.mobile-nav-dropdown')) {
        setIsMobileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
        <ul className="sidebar-nav-outer desktop-sidebar">
          {tabs.map(tab => (
            <li key={tab.id} className="sidebar-nav-item">
              <Link
                to={tab.path}
                className={activeTab === tab.id ? 'active' : ''}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Main Content */}
        <div className="membership-content">
          {/* Mobile Navigation Dropdown */}
          <div className="mobile-nav-container">
            <div className="mobile-nav-dropdown">
              <button 
                onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                className="mobile-dropdown-button"
              >
                <i className={activeTabData?.icon}></i>
                <span>{activeTabData?.label || 'Select Page'}</span>
                <i className={`fas fa-chevron-${isMobileDropdownOpen ? 'up' : 'down'}`}></i>
              </button>
              
              {isMobileDropdownOpen && (
                <div className="mobile-dropdown-menu">
                  {tabs.map((tab, index) => (
                    <div key={tab.id} className="dropdown-item-container">
                      {/* Add visual separator after certain items */}
                      {(index === 0 || index === 4 || index === 7) && index > 0 && (
                        <div className="dropdown-separator"></div>
                      )}
                      <Link
                        to={tab.path}
                        className={`mobile-dropdown-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setIsMobileDropdownOpen(false)}
                      >
                        <i className={tab.icon}></i>
                        <span>{tab.label}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Routes>
            <Route path="/" element={<MembershipDashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/scheduled-payments" element={<ScheduledPayments />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/settings" element={<MembershipSettings />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/application-forms" element={<ApplicationForms />} />
            <Route path="/application-form" element={<ApplicationFormBuilder />} />
            <Route path="/digital-card" element={<DigitalCard />} />
            <Route path="/payment-info" element={<PaymentInfo />} />
          </Routes>
        </div>
      </div>

      <style jsx>{`
        .membership-container {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .membership-header {
          background: white;
          padding: 30px;
          border-bottom: 1px solid #ecf0f1;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .membership-header h1 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 2rem;
          display: flex;
          align-items: center;
        }

        i{
      margin-right: 5px;
          }

        .membership-header p {
          margin: 0;
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .membership-layout {
          display: flex;
          min-height: calc(100vh - 120px);
        }

        /* Mobile Navigation Dropdown */
        .mobile-nav-container {
          display: none;
          margin-bottom: 20px;
        }

        .mobile-nav-dropdown {
          position: relative;
          width: 100%;
        }

        .mobile-dropdown-button {
          width: 100%;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          color: #2c3e50;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
        }

        .mobile-dropdown-button:hover {
          border-color: #3498db;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
          transform: translateY(-1px);
        }

        .mobile-dropdown-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .mobile-dropdown-button i:first-child {
          margin-right: 12px;
          color: #3498db;
          font-size: 1.1rem;
        }

        .mobile-dropdown-button i:last-child {
          color: #7f8c8d;
          font-size: 0.9rem;
          transition: transform 0.3s ease;
        }

        .mobile-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #e9ecef;
          border-top: none;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 60vh;
          overflow-y: auto;
          animation: dropdownSlideDown 0.3s ease-out;
          padding: 8px 0 12px 0;
        }

        /* Custom scrollbar for dropdown */
        .mobile-dropdown-menu::-webkit-scrollbar {
          width: 6px;
        }

        .mobile-dropdown-menu::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .mobile-dropdown-menu::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .mobile-dropdown-menu::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        @keyframes dropdownSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-dropdown-item {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          margin: 2px 8px;
          color: #2c3e50;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.95rem;
          position: relative;
          width: calc(100% - 16px);
          box-sizing: border-box;
        }

        .mobile-dropdown-item:hover {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #3498db;
          text-decoration: none;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
        }

        .mobile-dropdown-item.active {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1976d2;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
        }

        .mobile-dropdown-item.active:hover {
          background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
          transform: translateX(4px);
        }

        .mobile-dropdown-item i {
          margin-right: 12px;
          color: #3498db;
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }

        .mobile-dropdown-item.active i {
          color: #1976d2;
        }

        .mobile-dropdown-item span {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-item-container {
          display: block;
          width: 100%;
        }

        .dropdown-separator {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #e9ecef 50%, transparent 100%);
          margin: 8px 20px;
        }

        /* Sidebar */
        .sidebar-nav-outer {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          width: 280px;
          background: white;
          border-right: 1px solid #ecf0f1;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
          transition: transform 0.3s ease;
          position: relative;
          flex-shrink: 0;
          height: 130vh;
          min-height: calc(100vh - 120px);
        }

        .sidebar-nav-outer.open {
          transform: translateX(280px);
        }

        .sidebar-nav-item {
          margin: 0;
          padding: 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .sidebar-nav-item:last-child {
          border-bottom: none;
        }

        .sidebar-nav-item a {
          display: block;
          color: black;
          padding: 12px 16px;
          text-decoration: none;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
          margin: 0;
          font-weight: 500;
          font-size: 0.95rem;
          width: 100%;
          text-align: left;
          box-sizing: border-box;
          border-radius: 0 8px 8px 0;
          line-height: 1.4;
        }

        .sidebar-nav-item a:hover {
          background-color: #3498db;
          color: white;
          border-left-color: #3498db;
          transform: translateX(5px);
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
          border-radius: 0 8px 8px 0;
        }

        .sidebar-nav-item a.active {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1976d2;
          border-left-color: #1976d2;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
          text-decoration: none;
          border-radius: 0 8px 8px 0;
        }

        .sidebar-nav-item a i {
          width: 20px;
          margin-right: 15px;
          font-size: 1.1rem;
          text-align: center;
          display: inline-block;
        }



        /* Main Content */
        .membership-content {
          flex: 1;
          background: #f8f9fa;
          overflow-y: auto;
          padding: 20px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none;
          }

          .mobile-nav-container {
            display: block;
          }

          .membership-content {
            margin-left: 0;
            padding: 15px;
          }

          .membership-layout {
            flex-direction: column;
          }
        }

        @media (min-width: 769px) {
          .membership-sidebar {
            position: relative;
            transform: none !important;
          }
        }

        /* Scrollbar Styling */
        .membership-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .membership-sidebar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .membership-sidebar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .membership-sidebar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default Membership;
