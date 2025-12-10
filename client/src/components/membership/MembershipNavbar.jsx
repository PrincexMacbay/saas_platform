import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMembershipData } from '../../contexts/MembershipDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import MembershipDashboard from './MembershipDashboard';
import Payments from './Payments';
import ScheduledPayments from './ScheduledPayments';
import Debts from './Debts';
import Plans from './Plans';
import Reminders from './Reminders';
import Applications from './Applications';
import MembershipSettings from './MembershipSettings';
import Coupons from './Coupons';
import ApplicationFormBuilder from './ApplicationFormBuilder';
import ApplicationForms from './ApplicationForms';
import DigitalCard from './DigitalCard';
import PaymentInfo from './PaymentInfo';

const MembershipNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  
  const { preloadAllData, isLoadingAll } = useMembershipData();
  const { t } = useLanguage();

  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path === 'membership') {
      setActiveTab('dashboard');
    } else {
      setActiveTab(path);
    }
  }, [location]);

  useEffect(() => {
    console.log('🚀 MembershipNavbar mounted - starting data preload');
    try {
      preloadAllData();
    } catch (error) {
      console.error('🚨 Error in MembershipNavbar preload:', error);
    }
  }, [preloadAllData]);

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
    { id: 'dashboard', label: t('membership.dashboard'), icon: 'chart-pie', path: '/membership' },
    { id: 'payments', label: t('membership.payments'), icon: 'credit-card', path: '/membership/payments' },
    { id: 'scheduled-payments', label: t('membership.scheduled.payments'), icon: 'calendar-alt', path: '/membership/scheduled-payments' },
    { id: 'debts', label: t('membership.debts'), icon: 'exclamation-triangle', path: '/membership/debts' },
    { id: 'plans', label: t('membership.plans'), icon: 'layer-group', path: '/membership/plans' },
    { id: 'reminders', label: t('membership.reminders'), icon: 'bell', path: '/membership/reminders' },
    { id: 'applications', label: t('membership.applications'), icon: 'file-alt', path: '/membership/applications' },
    { id: 'settings', label: t('membership.settings'), icon: 'cog', path: '/membership/settings' },
    { id: 'coupons', label: t('membership.coupons'), icon: 'ticket-alt', path: '/membership/coupons' },
    { id: 'application-forms', label: t('membership.application.forms'), icon: 'list', path: '/membership/application-forms' },
    { id: 'application-form', label: t('membership.application.form.builder'), icon: 'edit', path: '/membership/application-form' },
    { id: 'digital-card', label: t('membership.digital.card'), icon: 'id-card', path: '/membership/digital-card' },
    { id: 'payment-info', label: t('membership.payment.info'), icon: 'credit-card', path: '/membership/payment-info' }
  ];

  const getIcon = (iconName) => {
    const icons = {
      'chart-pie': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      'credit-card': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      'calendar-alt': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'exclamation-triangle': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      'layer-group': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      'bell': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      'file-alt': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'cog': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'ticket-alt': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      'list': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      'edit': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      'id-card': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      )
    };
    return icons[iconName] || icons['chart-pie'];
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const handleNavigation = (tabId) => {
    console.log('🚀 Switching to tab:', tabId);
    setActiveTab(tabId);
    setIsMobileDropdownOpen(false);
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MembershipDashboard />;
      case 'payments':
        return <Payments />;
      case 'scheduled-payments':
        return <ScheduledPayments />;
      case 'debts':
        return <Debts />;
      case 'plans':
        return <Plans />;
      case 'reminders':
        return <Reminders />;
      case 'applications':
        return <Applications />;
      case 'settings':
        return <MembershipSettings />;
      case 'coupons':
        return <Coupons />;
      case 'application-forms':
        return <ApplicationForms />;
      case 'application-form':
        return <ApplicationFormBuilder />;
      case 'digital-card':
        return <DigitalCard />;
      case 'payment-info':
        return <PaymentInfo />;
      default:
        return <MembershipDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {t('membership.title') || 'Membership Management'}
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {t('membership.manage.subtitle') || 'Manage subscriptions, payments, and member data'}
              </p>
            </div>
            {isLoadingAll && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                <span className="text-sm hidden sm:inline">{t('common.loading')}</span>
              </div>
            )}
          </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <div
          className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
            isSidebarExpanded ? 'w-64' : 'w-20'
          }`}
          ref={sidebarRef}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
        >
          <div className="flex-1 overflow-y-auto py-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleNavigation(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 mx-2 mb-1 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`flex-shrink-0 ${isSidebarExpanded ? '' : 'mx-auto'}`}>
                  {getIcon(tab.icon)}
                </div>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                {activeTabData && getIcon(activeTabData.icon)}
                <span className="font-semibold text-gray-900">{activeTabData?.label || 'Select Page'}</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isMobileDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {tabs.map((tab, index) => (
                  <React.Fragment key={tab.id}>
                    {(index === 0 || index === 4 || index === 7) && index > 0 && (
                      <div className="border-t border-gray-200 my-1"></div>
                    )}
                    <button
                      onClick={() => handleNavigation(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {getIcon(tab.icon)}
                      <span className="font-medium">{tab.label}</span>
                      {activeTab === tab.id && (
                        <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderActiveContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipNavbar;
