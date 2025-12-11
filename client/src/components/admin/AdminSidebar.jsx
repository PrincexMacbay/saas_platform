import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import logoImage from '../../Logo/neu2.png';
import './AdminSidebar.css';

const AdminSidebar = ({ activeSection, onSectionChange, onSidebarToggle, onMobileClose }) => {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const sidebarRef = useRef(null);

  const getIcon = (id) => {
    const iconClass = "w-5 h-5";
    switch(id) {
      case 'overview':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'users':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'memberships':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'financial':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'jobs':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'coupons':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        );
      case 'system':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'view-as-user':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    {
      id: 'overview',
      label: t('admin.sidebar.overview'),
      description: t('admin.sidebar.overview.description')
    },
    {
      id: 'users',
      label: t('admin.sidebar.users'),
      description: t('admin.sidebar.users.description')
    },
    {
      id: 'memberships',
      label: t('admin.sidebar.memberships'),
      description: t('admin.sidebar.memberships.description')
    },
    {
      id: 'financial',
      label: t('admin.sidebar.financial'),
      description: t('admin.sidebar.financial.description')
    },
    {
      id: 'jobs',
      label: t('admin.sidebar.jobs'),
      description: t('admin.sidebar.jobs.description')
    },
    {
      id: 'coupons',
      label: t('admin.sidebar.coupons'),
      description: t('admin.sidebar.coupons.description')
    },
    {
      id: 'system',
      label: t('admin.sidebar.system'),
      description: t('admin.sidebar.system.description')
    },
    {
      id: 'view-as-user',
      label: t('admin.sidebar.view.as.user'),
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
              if (onMobileClose) onMobileClose();
            }}
            title={isExpanded ? item.description : item.label}
          >
            <span className="nav-icon flex items-center justify-center">{getIcon(item.id)}</span>
            <span className={`nav-label ${isExpanded ? 'visible' : 'hidden'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className={`admin-footer-info ${isExpanded ? 'visible' : 'hidden'}`}>
          <small>{t('admin.sidebar.version')}</small>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
