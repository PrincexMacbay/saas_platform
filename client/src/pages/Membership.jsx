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
import DigitalCard from '../components/membership/DigitalCard';
import ErrorBoundary from '../components/ErrorBoundary';

const Membership = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path === 'membership') {
      setActiveTab('dashboard');
    } else {
      setActiveTab(path);
    }
  }, [location]);

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
    { id: 'application-form', label: 'Application Form', icon: 'fas fa-edit', path: '/membership/application-form' },
    { id: 'digital-card', label: 'Digital Card', icon: 'fas fa-id-card', path: '/membership/digital-card' }
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

      <div className="membership-tabs">
        {/* Mobile Dropdown Menu */}
        <div className="mobile-tab-dropdown">
          <button 
            className="mobile-tab-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={activeTabData?.icon}></i>
            <span>{activeTabData?.label}</span>
            <i className={`fas fa-chevron-${isMobileMenuOpen ? 'up' : 'down'}`}></i>
          </button>
          
          {isMobileMenuOpen && (
            <div className="mobile-tab-menu">
              {tabs.map(tab => (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`mobile-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tab List */}
        <div className="tab-list">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="membership-content">
        <Routes>
          <Route path="/" element={<MembershipDashboard />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/scheduled-payments" element={<ScheduledPayments />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/plans" element={<ErrorBoundary><Plans /></ErrorBoundary>} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/settings" element={<MembershipSettings />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/application-form" element={<ApplicationFormBuilder />} />
          <Route path="/digital-card" element={<DigitalCard />} />
        </Routes>
      </div>

      <style jsx>{`
        .membership-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .membership-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .membership-header h1 {
          margin: 0;
          font-size: 2.5rem;
          color: #2c3e50;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .membership-header p {
          margin: 10px 0 0 0;
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .membership-tabs {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
          overflow: hidden;
        }

        /* Mobile Tab Styles */
        .mobile-tab-dropdown {
          display: none;
        }

        .mobile-tab-toggle {
          width: 100%;
          padding: 15px 20px;
          background: white;
          border: none;
          border-bottom: 1px solid #ecf0f1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #2c3e50;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-tab-toggle:hover {
          background-color: #f8f9fa;
        }

        .mobile-tab-menu {
          background: white;
          border-top: 1px solid #ecf0f1;
        }

        .mobile-tab-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          text-decoration: none;
          color: #7f8c8d;
          transition: all 0.3s ease;
          border-bottom: 1px solid #f8f9fa;
        }

        .mobile-tab-item:hover {
          background-color: #f8f9fa;
          color: #3498db;
        }

        .mobile-tab-item.active {
          color: #3498db;
          background-color: #f8f9fa;
          border-left: 3px solid #3498db;
        }

        .mobile-tab-item i {
          margin-right: 10px;
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
        }

        /* Desktop Tab Styles */
        .tab-list {
          display: flex;
          flex-wrap: wrap;
          border-bottom: 1px solid #ecf0f1;
        }

        .tab-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          text-decoration: none;
          color: #7f8c8d;
          transition: all 0.3s ease;
          min-width: 0;
          flex: 1;
          justify-content: center;
          border-bottom: 3px solid transparent;
        }

        .tab-item:hover {
          background-color: #f8f9fa;
          color: #3498db;
        }

        .tab-item.active {
          color: #3498db;
          background-color: #f8f9fa;
          border-bottom-color: #3498db;
        }

        .tab-item i {
          margin-right: 8px;
          font-size: 1.1rem;
        }

        .tab-item span {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .membership-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          min-height: 500px;
        }

        /* Responsive Design */
        @media (max-width: 991px) {
          .mobile-tab-dropdown {
            display: block;
          }
          
          .tab-list {
            display: none !important;
          }
        }

        @media (min-width: 992px) {
          .mobile-tab-dropdown {
            display: none !important;
          }
          
          .tab-list {
            display: flex !important;
          }
        }

        @media (max-width: 768px) {
          .membership-container {
            padding: 10px;
          }

          .membership-header h1 {
            font-size: 2rem;
            flex-direction: column;
          }
        }

        @media (max-width: 576px) {
          .membership-container {
            padding: 8px;
          }

          .membership-header h1 {
            font-size: 1.8rem;
          }

          .mobile-tab-toggle {
            padding: 12px 15px;
            font-size: 0.9rem;
          }

          .mobile-tab-item {
            padding: 12px 15px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Membership;
