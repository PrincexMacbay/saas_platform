import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './AdminSidebar.css';

const AdminSidebar = ({ activeSection, onSectionChange, onSidebarToggle }) => {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const sidebarRef = useRef(null);

  const menuItems = [
    {
      id: 'overview',
      label: t('admin.sidebar.overview'),
      icon: '📊',
      description: t('admin.sidebar.overview.description')
    },
    {
      id: 'users',
      label: t('admin.sidebar.users'),
      icon: '👥',
      description: t('admin.sidebar.users.description')
    },
    {
      id: 'memberships',
      label: t('admin.sidebar.memberships'),
      icon: '💳',
      description: t('admin.sidebar.memberships.description')
    },
    {
      id: 'financial',
      label: t('admin.sidebar.financial'),
      icon: '💰',
      description: t('admin.sidebar.financial.description')
    },
    {
      id: 'jobs',
      label: t('admin.sidebar.jobs'),
      icon: '💼',
      description: t('admin.sidebar.jobs.description')
    },
    {
      id: 'coupons',
      label: t('admin.sidebar.coupons'),
      icon: '🎫',
      description: t('admin.sidebar.coupons.description')
    },
    {
      id: 'system',
      label: t('admin.sidebar.system'),
      icon: '⚙️',
      description: t('admin.sidebar.system.description')
    },
    {
      id: 'view-as-user',
      label: t('admin.sidebar.view.as.user'),
      icon: '👁️',
      description: t('admin.sidebar.view.as.user.description'),
      isSpecial: true
    }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleViewAsUser = () => {
    // Open user dashboard in new tab
    window.open('/dashboard', '_blank');
  };

  // Hover handlers for expand/collapse functionality
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsExpanded(true);
    onSidebarToggle && onSidebarToggle(true);
  };

  const handleMouseLeave = () => {
    // Delay collapse to prevent flickering when moving between elements
    const timeout = setTimeout(() => {
      setIsExpanded(false);
      onSidebarToggle && onSidebarToggle(false);
    }, 150);
    setHoverTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div 
      ref={sidebarRef}
      className={`admin-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <span className="logo-icon">🔧</span>
          <span className={`logo-text ${isExpanded ? 'visible' : 'hidden'}`}>
            {t('admin.sidebar.version')}
          </span>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${activeSection === item.id ? 'active' : ''} ${item.isSpecial ? 'special' : ''}`}
            onClick={() => {
              if (item.id === 'view-as-user') {
                handleViewAsUser();
              } else {
                onSectionChange(item.id);
              }
            }}
            title={isExpanded ? item.description : item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className={`nav-label ${isExpanded ? 'visible' : 'hidden'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span className={`${isExpanded ? 'visible' : 'hidden'}`}>
            {t('admin.sidebar.logout')}
          </span>
        </button>
        <div className={`admin-footer-info ${isExpanded ? 'visible' : 'hidden'}`}>
          <small>{t('admin.sidebar.version')}</small>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
