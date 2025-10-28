import React, { useState, useRef, useEffect } from 'react';
import { getCompanyJobs, updateJobStatus, getCompanyApplications, updateApplicationStatus } from '../../services/careerService';
import { useLanguage } from '../../contexts/LanguageContext';
import CreateJobForm from './CreateJobForm';
import CompanyAnalytics from './CompanyAnalytics';
import EnhancedApplicationDropdown from './EnhancedApplicationDropdown';
import { buildImageUrl } from '../../utils/imageUtils';
import './CareerSelectStyles.css';

// Custom Dropdown Component
const JobActionsDropdown = ({ job, onStatusChange, onEdit, onViewApplications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const { t } = useLanguage();

  const handleStatusChange = (newStatus) => {
    onStatusChange(job.id, newStatus);
    setIsOpen(false);
  };

  const handleEdit = () => {
    onEdit(job);
    setIsOpen(false);
  };

  const handleViewApplications = () => {
    onViewApplications(job.id);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getStatusIcon = (status) => {
    const icons = {
      'active': 'fas fa-play-circle',
      'paused': 'fas fa-pause-circle',
      'closed': 'fas fa-stop-circle'
    };
    return icons[status] || 'fas fa-circle';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': '#28a745',
      'paused': '#ffc107',
      'closed': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button 
        className="btn btn-outline-primary btn-sm dropdown-toggle d-flex align-items-center gap-2 enhanced-job-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-cog"></i>
        {t('career.company.actions')}
      </button>
      {isOpen && (
        <div className="dropdown-menu show p-0 border-0 shadow-lg enhanced-job-dropdown" style={{ minWidth: '260px' }}>
          {/* Current Status Header */}
          <div className="dropdown-header bg-light py-3 px-3 border-bottom">
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  backgroundColor: `${getStatusColor(job.status)}20` 
                }}
              >
                <i 
                  className={getStatusIcon(job.status)} 
                  style={{ color: getStatusColor(job.status) }}
                ></i>
              </div>
              <div>
                <div className="fw-bold">{t('career.company.job.status')}</div>
                <div className="text-capitalize text-muted">{job.status}</div>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="py-2">
            <button 
              className={`dropdown-item d-flex align-items-center py-3 px-3 border-0 enhanced-job-item ${job.status === 'active' ? 'active' : ''}`}
              onClick={() => handleStatusChange('active')}
              disabled={job.status === 'active'}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#28a74520' 
                }}
              >
                <i className="fas fa-play-circle" style={{ color: '#28a745' }}></i>
              </div>
              <div className="flex-grow-1 text-start">
                <div className="fw-medium">{t('career.company.activate.job')}</div>
                <div className="small text-muted">{t('career.company.activate.job.desc')}</div>
              </div>
              {job.status === 'active' && (
                <i className="fas fa-check text-success"></i>
              )}
            </button>

            <button 
              className={`dropdown-item d-flex align-items-center py-3 px-3 border-0 enhanced-job-item ${job.status === 'paused' ? 'active' : ''}`}
              onClick={() => handleStatusChange('paused')}
              disabled={job.status === 'paused'}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#ffc10720' 
                }}
              >
                <i className="fas fa-pause-circle" style={{ color: '#ffc107' }}></i>
              </div>
              <div className="flex-grow-1 text-start">
                <div className="fw-medium">{t('career.company.pause.job')}</div>
                <div className="small text-muted">{t('career.company.pause.job.desc')}</div>
              </div>
              {job.status === 'paused' && (
                <i className="fas fa-check text-success"></i>
              )}
            </button>

            <button 
              className={`dropdown-item d-flex align-items-center py-3 px-3 border-0 enhanced-job-item ${job.status === 'closed' ? 'active' : ''}`}
              onClick={() => handleStatusChange('closed')}
              disabled={job.status === 'closed'}
            >
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: '#dc354520' 
                }}
              >
                <i className="fas fa-stop-circle" style={{ color: '#dc3545' }}></i>
              </div>
              <div className="flex-grow-1 text-start">
                <div className="fw-medium">{t('career.company.close.job')}</div>
                <div className="small text-muted">{t('career.company.close.job.desc')}</div>
              </div>
              {job.status === 'closed' && (
                <i className="fas fa-check text-success"></i>
              )}
            </button>
          </div>

          {/* Additional Actions */}
          <div className="dropdown-divider"></div>
          <div className="py-2">
            <button 
              className="dropdown-item d-flex align-items-center py-2 px-3 enhanced-job-item"
              onClick={handleEdit}
            >
              <i className="fas fa-edit me-3 text-muted"></i>
              <span>{t('career.company.edit.job.details')}</span>
            </button>
            <button 
              className="dropdown-item d-flex align-items-center py-2 px-3 enhanced-job-item"
              onClick={handleViewApplications}
            >
              <i className="fas fa-eye me-3 text-muted"></i>
              <span>{t('career.company.view.applications')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
  });
  const [applicationsPagination, setApplicationsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
  });
  const [applicationFilters, setApplicationFilters] = useState({
    status: '',
    jobId: '',
  });

  const loadCompanyJobs = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getCompanyJobs(page);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading company jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyApplications = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getCompanyApplications(
        page, 
        applicationFilters.status || null, 
        applicationFilters.jobId || null
      );
      setApplications(response.data.applications);
      setApplicationsPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading company applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyJobs();
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') {
      loadCompanyApplications();
    } else if (activeTab === 'analytics') {
      // Load both jobs and applications for analytics
      if (applications.length === 0) {
        loadCompanyApplications();
      }
    }
  }, [activeTab, applicationFilters]);

  const handlePageChange = (page) => {
    loadCompanyJobs(page);
  };

  const handleApplicationPageChange = (page) => {
    loadCompanyApplications(page);
  };

  const handleApplicationStatusChange = async (applicationId, newStatus, notes = '') => {
    try {
      await updateApplicationStatus(applicationId, newStatus, notes);
      // Update the application status in the list
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, notes }
            : app
        )
      );
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status');
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      // Update the job status in the list
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, status: newStatus }
            : job
        )
      );
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleJobCreated = (newJob) => {
    setJobs(prevJobs => [newJob, ...prevJobs]);
    setShowCreateForm(false);
    setActiveTab('jobs');
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowCreateForm(true);
  };

  const handleViewApplications = (jobId) => {
    setApplicationFilters(prev => ({ ...prev, jobId: jobId.toString() }));
    setActiveTab('applications');
  };

  const handleJobUpdated = (updatedJob) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? updatedJob : job
      )
    );
    setEditingJob(null);
    setShowCreateForm(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { class: 'bg-success', text: 'Active' },
      'paused': { class: 'bg-warning', text: 'Paused' },
      'closed': { class: 'bg-secondary', text: 'Closed' },
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return t('career.company.salary.not.specified');
    
    const formatNumber = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toLocaleString();
    };
    
    if (min && max) {
      return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
    } else if (min) {
      return `${currency} ${formatNumber(min)}+`;
    } else {
      return `${currency} Up to ${formatNumber(max)}`;
    }
  };

  const renderJobsTab = () => (
    <div className="jobs-tab">
      {showCreateForm ? (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>{editingJob ? t('career.company.edit.job.posting') : t('career.company.create.new.job.posting')}</h5>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setEditingJob(null);
              }}
            >
              <i className="fas fa-times me-2"></i>
              {t('career.company.cancel')}
            </button>
          </div>
          <CreateJobForm 
            onJobCreated={handleJobCreated} 
            onJobUpdated={handleJobUpdated}
            editingJob={editingJob}
          />
        </div>
      ) : (
        <>
          {loading && jobs.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">{t('career.company.loading.jobs')}</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
              <h5>{t('career.company.no.job.postings')}</h5>
              <p className="text-muted">{t('career.company.create.first.job')}</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                              <i className="fas fa-plus me-2"></i> {t('career.company.post.job')}
              </button>
            </div>
          ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{t('career.company.your.job.postings', { count: jobs.filter(job => job.status === 'active').length })}</h5>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="fas fa-plus me-2"></i> {t('career.company.post.new.job')}
            </button>
          </div>

          <div className="jobs-list">
            {jobs.map(job => (
              <div key={job.id} className="card mb-3 job-posting-card">
                <div className="card-body">
                  <div className="job-posting-header">
                    <div className="job-title-section">
                      <h5 className="job-title">{job.title}</h5>
                      <div className="job-status">
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                    
                    <div className="job-actions">
                      <JobActionsDropdown 
                        job={job} 
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditJob}
                        onViewApplications={handleViewApplications}
                      />
                    </div>
                  </div>
                  
                  <div className="job-details-grid">
                    <div className="job-detail-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{job.location}</span>
                    </div>
                    <div className="job-detail-item">
                      <i className="fas fa-clock"></i>
                      <span>{job.jobType}</span>
                    </div>
                    <div className="job-detail-item">
                      <i className="fas fa-calendar"></i>
                      <span>{t('career.company.posted')}: {formatDate(job.createdAt)}</span>
                    </div>
                    <div className="job-detail-item">
                      <i className="fas fa-users"></i>
                      <span>{job.applications?.length || 0} {t('career.company.applications')}</span>
                    </div>
                  </div>

                  <div className="job-description">
                    <p className="text-muted">
                      {job.description.length > 150 
                        ? `${job.description.substring(0, 150)}...` 
                        : job.description
                      }
                    </p>
                  </div>

                  <div className="job-tags">
                    <span className="badge bg-primary">{job.category}</span>
                    <span className="badge bg-info">{job.experienceLevel}</span>
                    {job.remoteWork && (
                      <span className="badge bg-success">
                        <i className="fas fa-home"></i> {t('career.company.remote')}
                      </span>
                    )}
                    {job.salaryMin && (
                      <span className="badge bg-secondary">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav aria-label="Company jobs pagination" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    {t('career.company.previous')}
                  </button>
                </li>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    {t('career.company.next')}
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
        </>
      )}
    </div>
  );

  const getApplicationStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning', text: 'Pending' },
      'reviewing': { class: 'bg-info', text: 'Reviewing' },
      'interview': { class: 'bg-primary', text: 'Interview' },
      'accepted': { class: 'bg-success', text: 'Accepted' },
      'rejected': { class: 'bg-danger', text: 'Rejected' },
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const renderApplicationsTab = () => (
    <div className="applications-tab">
      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="career-select career-select-primary">
            <label className="career-select-label">{t('career.company.filter.by.status')}</label>
            <select
              value={applicationFilters.status}
              onChange={(e) => setApplicationFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">{t('career.company.all.status')}</option>
              <option value="pending">{t('career.company.pending')}</option>
              <option value="reviewing">{t('career.company.reviewing')}</option>
              <option value="interview">{t('career.company.interview')}</option>
              <option value="accepted">{t('career.company.accepted')}</option>
              <option value="rejected">{t('career.company.rejected')}</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="career-select career-select-primary">
            <label className="career-select-label">{t('career.company.filter.by.job')}</label>
            <select
              value={applicationFilters.jobId}
              onChange={(e) => setApplicationFilters(prev => ({ ...prev, jobId: e.target.value }))}
            >
              <option value="">{t('career.company.all.jobs')}</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && applications.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">{t('career.company.loading.applications')}</p>
        </div>
      ) : applications.length === 0 ? (
      <div className="text-center py-5">
        <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
          <h5>{t('career.company.no.applications')}</h5>
          <p className="text-muted">{t('career.company.applications.desc')}</p>
        </div>
      ) : (
        <>
          <div className="applications-list">
            {applications.map(application => (
              <div key={application.id} className="card mb-3">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <h5 className="card-title">
                        {application.applicant.firstName} {application.applicant.lastName}
                      </h5>
                      <h6 className="card-subtitle mb-2 text-muted">
                        {t('career.company.applied.for')}: {application.job.title}
                      </h6>
                      <p className="card-text">
                        <strong>{t('career.company.email')}:</strong> {application.applicant.email}<br/>
                        <strong>{t('career.company')}:</strong> {application.job.employer?.companyProfile?.companyName || 'N/A'}<br/>
                        <strong>{t('career.location')}:</strong> {application.job.location}<br/>
                        <strong>{t('career.type')}:</strong> {application.job.jobType}<br/>
                        <strong>{t('career.company.applied')}:</strong> {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                      
                      {application.coverLetter && (
                        <div className="mt-3">
                          <strong>{t('career.company.cover.letter')}:</strong>
                          <p className="mt-1 text-muted">{application.coverLetter}</p>
                        </div>
                      )}
                      
                      {application.notes && (
                        <div className="mt-3">
                          <strong>{t('career.company.notes')}:</strong>
                          <p className="mt-1 text-muted">{application.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="col-md-4 text-end">
                      <div className="mb-3">
                        {getApplicationStatusBadge(application.status)}
                      </div>
                      
                      {application.resume && (
                        <div className="mb-3">
                          <a 
                            href={buildImageUrl(application.resume)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                          >
                            <i className="fas fa-download me-2"></i> {t('career.company.view.resume')}
                          </a>
                        </div>
                      )}
                      
                      <EnhancedApplicationDropdown 
                        application={application}
                        onStatusChange={handleApplicationStatusChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

          {/* Pagination */}
          {applicationsPagination.totalPages > 1 && (
            <nav aria-label="Applications pagination" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${applicationsPagination.currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handleApplicationPageChange(applicationsPagination.currentPage - 1)}
                    disabled={applicationsPagination.currentPage === 1}
                  >
                    {t('career.company.previous')}
                  </button>
                </li>
                
                {Array.from({ length: applicationsPagination.totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${page === applicationsPagination.currentPage ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handleApplicationPageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${applicationsPagination.currentPage === applicationsPagination.totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handleApplicationPageChange(applicationsPagination.currentPage + 1)}
                    disabled={applicationsPagination.currentPage === applicationsPagination.totalPages}
                  >
                    {t('career.company.next')}
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );

  const renderAnalyticsTab = () => {
    return <CompanyAnalytics />;
  };

  const tabs = [
    { id: 'jobs', label: t('career.company.job.postings'), icon: 'fas fa-briefcase' },
    { id: 'applications', label: t('career.company.applications'), icon: 'fas fa-file-alt' },
    { id: 'analytics', label: t('career.company.analytics'), icon: 'fas fa-chart-bar' },
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
        return renderJobsTab();
      case 'applications':
        return renderApplicationsTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderJobsTab();
    }
  };

  return (
    <div className="company-dashboard">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

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
              <span>{activeTabData?.label || t('career.company.select.page')}</span>
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
        .company-dashboard {
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
          color: #3498db;
          background: rgba(52, 152, 219, 0.1);
        }

        .nav-link.active {
          color: #3498db;
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
          border-color: #3498db;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
          transform: translateY(-1px);
        }

        .mobile-dropdown-button:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        .dropdown-button-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-button-content i {
          color: #3498db;
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
          color: #3498db;
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

          .company-dashboard {
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

// Add CSS styles for enhanced dropdowns
const styles = `
  .enhanced-job-dropdown {
    border-radius: 12px !important;
    overflow: hidden;
    animation: dropdownSlideIn 0.2s ease-out;
    backdrop-filter: blur(10px);
  }

  @keyframes dropdownSlideIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .enhanced-job-item {
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .enhanced-job-item:hover:not(:disabled) {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    transform: translateX(4px);
    border-left: 4px solid #007bff;
  }

  .enhanced-job-item.active {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
    border-left: 4px solid #2196f3;
  }

  .enhanced-job-item:not(:disabled):active {
    transform: translateX(2px) scale(0.98);
  }

  .enhanced-job-item:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .enhanced-job-btn {
    transition: all 0.2s ease;
  }

  .enhanced-job-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .enhanced-job-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .job-posting-card {
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
  }

  .job-posting-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }

  .job-posting-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .job-title-section {
    flex: 1;
  }

  .job-title {
    margin: 0 0 8px 0;
    color: #2c3e50;
  }

  .job-actions {
    margin-left: 15px;
  }

  .job-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 15px;
  }

  .job-detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6c757d;
    font-size: 0.9rem;
  }

  .job-detail-item i {
    width: 16px;
    text-align: center;
  }

  .job-description {
    margin-bottom: 15px;
  }

  .job-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .job-tags .badge {
    font-size: 0.8rem;
    padding: 6px 12px;
  }

  @media (max-width: 768px) {
    .job-posting-header {
      flex-direction: column;
      gap: 15px;
    }

    .job-actions {
      margin-left: 0;
      align-self: stretch;
    }

    .job-details-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default CompanyDashboard;
