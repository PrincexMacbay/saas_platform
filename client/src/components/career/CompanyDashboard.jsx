import React, { useState, useEffect } from 'react';
import { getCompanyJobs, updateJobStatus } from '../../services/careerService';
import CreateJobForm from './CreateJobForm';

// Custom Dropdown Component
const JobActionsDropdown = ({ job, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const handleStatusChange = (newStatus) => {
    onStatusChange(job.id, newStatus);
    setIsOpen(false);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit job:', job.id);
    setIsOpen(false);
  };

  const handleViewApplications = () => {
    // TODO: Implement view applications functionality
    console.log('View applications for job:', job.id);
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

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button 
        className="btn btn-outline-secondary btn-sm dropdown-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        Actions
      </button>
      {isOpen && (
        <ul className="dropdown-menu show">
          <li>
            <button 
              className="dropdown-item"
              onClick={() => handleStatusChange('active')}
              disabled={job.status === 'active'}
            >
              <i className="fas fa-play me-2"></i> Activate
            </button>
          </li>
          <li>
            <button 
              className="dropdown-item"
              onClick={() => handleStatusChange('paused')}
              disabled={job.status === 'paused'}
            >
              <i className="fas fa-pause me-2"></i> Pause
            </button>
          </li>
          <li>
            <button 
              className="dropdown-item"
              onClick={() => handleStatusChange('closed')}
              disabled={job.status === 'closed'}
            >
              <i className="fas fa-stop me-2"></i> Close
            </button>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item" onClick={handleEdit}>
              <i className="fas fa-edit me-2"></i> Edit
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={handleViewApplications}>
              <i className="fas fa-eye me-2"></i> View Applications
            </button>
          </li>
        </ul>
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
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

  useEffect(() => {
    loadCompanyJobs();
  }, []);

  const handlePageChange = (page) => {
    loadCompanyJobs(page);
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
    if (!min && !max) return 'Salary not specified';
    
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
            <h5>Create New Job Posting</h5>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              <i className="fas fa-times me-2"></i>
              Cancel
            </button>
          </div>
          <CreateJobForm onJobCreated={handleJobCreated} />
        </div>
      ) : (
        <>
          {loading && jobs.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your job postings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
              <h5>No job postings yet</h5>
              <p className="text-muted">Create your first job posting to get started.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Post a Job
              </button>
            </div>
          ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Your Job Postings ({jobs.filter(job => job.status === 'active').length} active)</h5>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Post New Job
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
                      <span>Posted: {formatDate(job.createdAt)}</span>
                    </div>
                    <div className="job-detail-item">
                      <i className="fas fa-users"></i>
                      <span>{job.applications?.length || 0} applications</span>
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
                        <i className="fas fa-home"></i> Remote
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
                    Previous
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
                    Next
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

  const renderApplicationsTab = () => (
    <div className="applications-tab">
      <div className="text-center py-5">
        <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
        <h5>Job Applications</h5>
        <p className="text-muted">View and manage applications for your job postings.</p>
        <p className="text-muted">This feature will be implemented soon.</p>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="analytics-tab">
      <div className="text-center py-5">
        <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
        <h5>Analytics</h5>
        <p className="text-muted">Track the performance of your job postings.</p>
        <p className="text-muted">This feature will be implemented soon.</p>
      </div>
    </div>
  );

  return (
    <div className="company-dashboard">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav-nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="fas fa-briefcase me-2"></i> Job Postings
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <i className="fas fa-file-alt me-2"></i> Applications
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-bar me-2"></i> Analytics
          </button>
        </li>
      </ul>

      {/* Content Area */}
      <div className="tab-content">
        {activeTab === 'jobs' && renderJobsTab()}
        {activeTab === 'applications' && renderApplicationsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
};

export default CompanyDashboard;
