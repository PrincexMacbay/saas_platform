import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminSidebar.css';

const AdminSidebar = ({ activeSection, onSectionChange }) => {
  const { logout } = useAuth();

  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Dashboard statistics and system health'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: '👥',
      description: 'Manage users, roles, and permissions'
    },
    {
      id: 'memberships',
      label: 'Memberships',
      icon: '💳',
      description: 'Membership plans and subscriptions'
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: '💰',
      description: 'Payments, transactions, and revenue'
    },
    {
      id: 'jobs',
      label: 'Job Board',
      icon: '💼',
      description: 'Job postings and applications'
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: '🎫',
      description: 'Discount codes and analytics'
    },
    {
      id: 'system',
      label: 'System Config',
      icon: '⚙️',
      description: 'Platform settings and features'
    }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <span className="logo-icon">🔧</span>
          <span className="logo-text">Admin Panel</span>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
            title={item.description}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
