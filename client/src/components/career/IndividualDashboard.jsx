import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import JobBoard from './JobBoard';
import ApplicationHistory from './ApplicationHistory';
import SavedJobs from './SavedJobs';
import ProfileSection from './ProfileSection';

const IndividualDashboard = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

  const tabs = [
    { id: 'jobs', label: t('career.individual.browse.jobs'), icon: 'fas fa-search' },
    { id: 'applications', label: t('career.individual.my.applications'), icon: 'fas fa-file-alt' },
    { id: 'saved', label: t('career.individual.saved.jobs'), icon: 'fas fa-bookmark' },
    { id: 'profile', label: t('career.individual.career.profile'), icon: 'fas fa-user' },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  // Close dropdown when clicking outside
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

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileDropdownOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return <JobBoard />;
      case 'applications':
        return <ApplicationHistory />;
      case 'saved':
        return <SavedJobs />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <JobBoard />;
    }
  };

  return (
    <div className="individual-dashboard">
      {/* Desktop Navigation Tabs */}
      <ul className="nav nav-tabs mb-4 desktop-tabs">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`${tab.icon} me-2`}></i> {tab.label}
            </button>
          </li>
        ))}
      </ul>

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
              <span>{activeTabData?.label || t('career.individual.select.page')}</span>
            </span>
            <i className={`fas fa-chevron-${isMobileDropdownOpen ? 'up' : 'down'} dropdown-arrow`}></i>
          </button>
          
          {isMobileDropdownOpen && (
            <div className="mobile-dropdown-menu" role="listbox">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`mobile-dropdown-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                  role="option"
                  aria-selected={activeTab === tab.id}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <i className="fas fa-check dropdown-check"></i>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="tab-content">
        {renderContent()}
      </div>

      <style jsx>{`
        .individual-dashboard {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        /* Desktop Navigation */
        .desktop-tabs {
          display: flex;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e9ecef;
          list-style: none;
          padding: 0;
        }

        .nav-item {
          margin-right: 5px;
        }

        .nav-link {
          background: none;
          border: none;
          padding: 12px 24px;
          color: #6c757d;
          text-decoration: none;
          border-radius: 8px 8px 0 0;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          position: relative;
        }

        .nav-link:hover {
          color: rgb(17 24 39);
          background: rgba(52, 152, 219, 0.1);
        }

        .nav-link.active {
          color: rgb(17 24 39);
          background: white;
          border: 2px solid #e9ecef;
          border-bottom: 2px solid white;
          margin-bottom: -2px;
          font-weight: 600;
        }

        .nav-link i {
          margin-right: 8px;
        }

        /* Mobile Navigation */
        .mobile-nav-container {
          display: none;
          margin-bottom: 20px;
          position: relative;
        }

        .mobile-nav-dropdown {
          position: relative;
          width: 100%;
        }

        .mobile-dropdown-button {
          width: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-dropdown-button:hover {
          border-color: rgb(17 24 39);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
          transform: translateY(-1px);
        }

        .mobile-dropdown-button:focus {
          outline: none;
          border-color: rgb(17 24 39);
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        .dropdown-button-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-button-content i {
          color: rgb(17 24 39);
          font-size: 1.1rem;
        }

        .dropdown-arrow {
          color: #7f8c8d;
          font-size: 0.9rem;
          transition: transform 0.3s ease;
        }

        .mobile-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
          animation: dropdownSlideDown 0.3s ease-out;
          padding: 8px 0;
        }

        @keyframes dropdownSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .mobile-dropdown-item {
          width: 100%;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          padding: 14px 20px;
          margin: 2px 8px;
          color: #2c3e50;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          gap: 12px;
        }

        .mobile-dropdown-item:hover {
          background: linear-gradient(135deg, #f0f8ff 0%, #e3f2fd 100%);
          color: #2980b9;
          transform: translateX(4px);
        }

        .mobile-dropdown-item:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
        }

        .mobile-dropdown-item.active {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1565c0;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
        }

        .mobile-dropdown-item.active:hover {
          background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
        }

        .mobile-dropdown-item i {
          color: rgb(17 24 39);
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }

        .mobile-dropdown-item.active i {
          color: #1565c0;
        }

        .mobile-dropdown-item span {
          flex: 1;
        }

        .dropdown-check {
          color: #1565c0 !important;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        /* Content area */
        .tab-content {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Responsive breakpoints */
        @media (max-width: 768px) {
          .desktop-tabs {
            display: none;
          }

          .mobile-nav-container {
            display: block;
          }

          .individual-dashboard {
            padding: 15px;
          }

          .tab-content {
            padding: 15px;
          }
        }

        @media (min-width: 769px) {
          .mobile-nav-container {
            display: none;
          }

          .desktop-tabs {
            display: flex;
          }
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
      `}</style>
    </div>
  );
};

export default IndividualDashboard;


// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import JobBoard from './JobBoard';
// import ApplicationHistory from './ApplicationHistory';
// import SavedJobs from './SavedJobs';
// import ProfileSection from './ProfileSection';

// const IndividualDashboard = () => {
//   const [activeTab, setActiveTab] = useState('jobs');

//   const tabs = [
//     { id: 'jobs', label: 'Browse Jobs', icon: 'fas fa-search' },
//     { id: 'applications', label: 'My Applications', icon: 'fas fa-file-alt' },
//     { id: 'saved', label: 'Saved Jobs', icon: 'fas fa-bookmark' },
//     { id: 'profile', label: 'Career Profile', icon: 'fas fa-user' },
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'jobs':
//         return <JobBoard />;
//       case 'applications':
//         return <ApplicationHistory />;
//       case 'saved':
//         return <SavedJobs />;
//       case 'profile':
//         return <ProfileSection />;
//       default:
//         return <JobBoard />;
//     }
//   };

//   return (
//     <div className="individual-dashboard">
//       {/* Navigation Tabs */}
//       <ul className="nav nav-tabs mb-4">
//         {tabs.map(tab => (
//           <li className="nav-item" key={tab.id}>
//             <button
//               className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
//               onClick={() => setActiveTab(tab.id)}
//             >
//               <i className={`${tab.icon} me-2`}></i> {tab.label}
//             </button>
//           </li>
//         ))}
//       </ul>

//       {/* Content Area */}
//       <div className="tab-content">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default IndividualDashboard;
