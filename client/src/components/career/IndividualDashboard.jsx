import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import JobBoard from './JobBoard';
import ApplicationHistory from './ApplicationHistory';
import SavedJobs from './SavedJobs';
import ProfileSection from './ProfileSection';

const IndividualDashboard = () => {
  const [activeTab, setActiveTab] = useState('jobs');

  const tabs = [
    { id: 'jobs', label: 'Browse Jobs', icon: 'fas fa-search' },
    { id: 'applications', label: 'My Applications', icon: 'fas fa-file-alt' },
    { id: 'saved', label: 'Saved Jobs', icon: 'fas fa-bookmark' },
    { id: 'profile', label: 'Career Profile', icon: 'fas fa-user' },
  ];

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
      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
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

      {/* Content Area */}
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default IndividualDashboard;
