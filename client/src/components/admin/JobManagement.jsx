import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import './JobManagement.css';

const JobManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    limit: 10
  });
  const [jobData, setJobData] = useState({
    stats: null,
    jobs: [],
    pagination: {}
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchJobData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category, filters.page]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      console.log('Fetching job management data with filters:', filters);
      const response = await adminService.getJobManagementData(filters);
      console.log('Job management data response:', response);
      setJobData(response.data || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching job management data:', err);
      setError('Failed to load job management data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateSuccessRate = () => {
    const stats = jobData.stats || {};
    const totalApps = parseInt(stats.totalApplications) || 0;
    const acceptedApps = parseInt(stats.acceptedApplications) || 0;
    if (totalApps === 0) return 0;
    return ((acceptedApps / totalApps) * 100).toFixed(1);
  };

  const calculateAvgApplicationsPerJob = () => {
    const stats = jobData.stats || {};
    const totalJobs = parseInt(stats.totalJobs) || 0;
    const totalApps = parseInt(stats.totalApplications) || 0;
    if (totalJobs === 0) return 0;
    return (totalApps / totalJobs).toFixed(1);
  };

  if (loading) {
    return (
      <div className="job-management">
        <div className="loading">Loading job management data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-management">
        <div className="error">{error}</div>
      </div>
    );
  }

  const stats = jobData.stats || {};

  return (
    <div className="job-management">

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label className="filter-label">{t('admin.job.status')}</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <option value="">{t('admin.job.all.statuses')}</option>
            <option value="active">{t('admin.job.active')}</option>
            <option value="paused">{t('admin.job.paused')}</option>
            <option value="closed">{t('admin.job.closed')}</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">{t('admin.job.category')}</label>
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
          >
            <option value="">{t('admin.job.all.categories')}</option>
            <option value="technology">{t('admin.job.technology')}</option>
            <option value="marketing">{t('admin.job.marketing')}</option>
            <option value="sales">{t('admin.job.sales')}</option>
            <option value="design">{t('admin.job.design')}</option>
            <option value="other">{t('admin.job.other')}</option>
          </select>
        </div>
      </div>

      {/* Job Statistics */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.job.statistics')}</h3>
        
        <div className="job-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <div className="stat-label">Total Jobs</div>
              <div className="stat-value">{stats.totalJobs || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">Active Jobs</div>
              <div className="stat-value">{stats.activeJobs || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <div className="stat-label">Closed Jobs</div>
              <div className="stat-value">{stats.closedJobs || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-label">Total Applications</div>
              <div className="stat-value">{stats.totalApplications || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-label">Pending Applications</div>
              <div className="stat-value">{stats.pendingApplications || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-content">
              <div className="stat-label">Accepted Applications</div>
              <div className="stat-value">{stats.acceptedApplications || 0}</div>
            </div>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Success Rate</div>
            <div className="metric-value">{calculateSuccessRate()}%</div>
            <div className="metric-description">Acceptance rate of applications</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Avg Applications/Job</div>
            <div className="metric-value">{calculateAvgApplicationsPerJob()}</div>
            <div className="metric-description">Average applications per job posting</div>
          </div>
        </div>
      </div>

      {/* Recent Job Postings */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.job.recent.postings')}</h3>
        <div className="jobs-list">
          {jobData.jobs && jobData.jobs.length > 0 ? (
            <>
              {jobData.jobs.map(job => (
                <div key={job.id} className="job-item">
                  <div className="job-header">
                    <div className="job-info">
                      <h4 className="job-title">{job.title}</h4>
                      <div className="job-meta">
                        <span className="job-company">
                          {job.employer.firstName ? `${job.employer.firstName} ${job.employer.lastName}` : job.employer.username}
                        </span>
                        <span className="job-separator">•</span>
                        <span className="job-category">{job.category}</span>
                        <span className="job-separator">•</span>
                        <span className="job-date">{formatDate(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="job-badges">
                      <span className={`status-badge ${job.status}`}>
                        {job.status}
                      </span>
                      <span className="applications-count">
                        {job.applications ? job.applications.length : 0} applications
                      </span>
                    </div>
                  </div>
                  {job.description && (
                    <p className="job-description">{job.description}</p>
                  )}
                  <div className="job-actions">
                    <button className="btn btn-sm btn-outline">View</button>
                    <button className="btn btn-sm btn-outline">{t('admin.job.edit')}</button>
                    <button className="btn btn-sm btn-outline">Manage</button>
                  </div>
                </div>
              ))}
              {/* Pagination */}
              {jobData.pagination && jobData.pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="btn btn-sm btn-outline"
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {filters.page} of {jobData.pagination.totalPages}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline"
                    disabled={filters.page >= jobData.pagination.totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">No jobs found</div>
          )}
        </div>
      </div>

      {/* Application Analytics */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.job.application.analytics')}</h3>
        
        <div className="application-metrics">
          <div className="metric-row">
            <div className="metric-item">
              <div className="metric-icon">📊</div>
              <div className="metric-info">
                <div className="metric-title">Total Applications</div>
                <div className="metric-number">{stats.totalApplications || 0}</div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">⏳</div>
              <div className="metric-info">
                <div className="metric-title">Pending Reviews</div>
                <div className="metric-number">{stats.pendingApplications || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="metric-row">
            <div className="metric-item">
              <div className="metric-icon">✅</div>
              <div className="metric-info">
                <div className="metric-title">Accepted</div>
                <div className="metric-number">{stats.acceptedApplications || 0}</div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">📈</div>
              <div className="metric-info">
                <div className="metric-title">Success Rate</div>
                <div className="metric-number">{calculateSuccessRate()}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
