import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
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
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role === 'admin') {
      setLoading(false);
    } else {
      // Redirect non-admin users
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Handle URL section parameter
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['overview', 'users', 'memberships', 'financial', 'jobs', 'coupons', 'system'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

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
      />
      <div className={`admin-main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="admin-content">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
