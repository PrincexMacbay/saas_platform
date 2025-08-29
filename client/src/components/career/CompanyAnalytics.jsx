import React, { useState, useEffect } from 'react';
import { getCompanyJobs, getCompanyApplications } from '../../services/careerService';

const CompanyAnalytics = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedJob, setSelectedJob] = useState('all');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        getCompanyJobs(1, 1000), // Get all jobs with high limit
        getCompanyApplications(1, null, null, 1000) // Get all applications with high limit
      ]);
      
      setJobs(jobsResponse.data.jobs || []);
      setApplications(applicationsResponse.data.applications || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));
    
    const filteredJobs = jobs.filter(job => new Date(job.createdAt) >= daysAgo);
    const filteredApplications = applications.filter(app => new Date(app.createdAt) >= daysAgo);
    
    const jobStats = filteredJobs.map(job => {
      const jobApplications = filteredApplications.filter(app => app.job?.id === job.id);
      return {
        ...job,
        applicationCount: jobApplications.length,
        acceptedCount: jobApplications.filter(app => app.status === 'accepted').length,
        rejectedCount: jobApplications.filter(app => app.status === 'rejected').length,
        pendingCount: jobApplications.filter(app => app.status === 'pending').length,
        reviewingCount: jobApplications.filter(app => app.status === 'reviewing').length,
        interviewCount: jobApplications.filter(app => app.status === 'interview').length,
      };
    });

    const totalJobs = filteredJobs.length;
    const activeJobs = filteredJobs.filter(job => job.status === 'active').length;
    const totalApplications = filteredApplications.length;
    const pendingApplications = filteredApplications.filter(app => app.status === 'pending').length;
    const acceptedApplications = filteredApplications.filter(app => app.status === 'accepted').length;
    const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected').length;
    
    // Calculate conversion rates
    const applicationRate = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;
    const acceptanceRate = totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(1) : 0;
    const rejectionRate = totalApplications > 0 ? ((rejectedApplications / totalApplications) * 100).toFixed(1) : 0;

    // Monthly trends
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthJobs = jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= month && jobDate <= monthEnd;
      });
      
      const monthApplications = applications.filter(app => {
        const appDate = new Date(app.createdAt);
        return appDate >= month && appDate <= monthEnd;
      });

      monthlyData.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        jobs: monthJobs.length,
        applications: monthApplications.length,
        accepted: monthApplications.filter(app => app.status === 'accepted').length
      });
    }

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      applicationRate,
      acceptanceRate,
      rejectionRate,
      jobStats,
      monthlyData
    };
  };

  const analytics = calculateAnalytics();

  const renderMetricCard = (title, value, icon, color, subtitle = '') => (
    <div className="col-lg-3 col-md-6 mb-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body text-center">
          <div className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-3`} 
               style={{ width: '60px', height: '60px', backgroundColor: `${color}15` }}>
            <i className={`${icon} fa-2x`} style={{ color }}></i>
          </div>
          <h3 className="fw-bold mb-1">{value}</h3>
          <h6 className="text-muted mb-1">{title}</h6>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      </div>
    </div>
  );

  const renderProgressBar = (percentage, color, label) => (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="small fw-medium">{label}</span>
        <span className="small fw-bold">{percentage}%</span>
      </div>
      <div className="progress" style={{ height: '8px' }}>
        <div 
          className="progress-bar" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );

  const renderMonthlyChart = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-transparent border-0">
        <h5 className="mb-0">
          <i className="fas fa-chart-line me-2 text-primary"></i>
          Monthly Trends
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          {analytics.monthlyData.map((data, index) => (
            <div key={index} className="col-md-2 col-4 mb-3">
              <div className="text-center">
                <div className="small text-muted mb-1">{data.month}</div>
                <div className="d-flex flex-column">
                  <div className="mb-2">
                    <div className="fw-bold text-primary">{data.jobs}</div>
                    <small className="text-muted">Jobs</small>
                  </div>
                  <div className="mb-2">
                    <div className="fw-bold text-success">{data.applications}</div>
                    <small className="text-muted">Applications</small>
                  </div>
                  <div>
                    <div className="fw-bold text-info">{data.accepted}</div>
                    <small className="text-muted">Accepted</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJobPerformanceTable = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-transparent border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-table me-2 text-primary"></i>
            Job Performance
          </h5>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="all">All Jobs</option>
            {analytics.jobStats.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Job Title</th>
                <th>Status</th>
                <th>Applications</th>
                <th>Status Distribution</th>
                <th>Success Rate</th>
                <th>Posted</th>
              </tr>
            </thead>
            <tbody>
              {analytics.jobStats
                .filter(job => selectedJob === 'all' || job.id === parseInt(selectedJob))
                .map(job => {
                  const successRate = job.applicationCount > 0 
                    ? ((job.acceptedCount / job.applicationCount) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <tr key={job.id}>
                      <td>
                        <div>
                          <strong>{job.title}</strong>
                          <br />
                          <small className="text-muted">{job.location}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          job.status === 'active' ? 'bg-success' :
                          job.status === 'paused' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary fs-6">{job.applicationCount}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {job.pendingCount > 0 && (
                            <span className="badge bg-warning" title={`${job.pendingCount} pending`}>
                              {job.pendingCount}
                            </span>
                          )}
                          {job.reviewingCount > 0 && (
                            <span className="badge bg-info" title={`${job.reviewingCount} reviewing`}>
                              {job.reviewingCount}
                            </span>
                          )}
                          {job.interviewCount > 0 && (
                            <span className="badge bg-primary" title={`${job.interviewCount} interview`}>
                              {job.interviewCount}
                            </span>
                          )}
                          {job.acceptedCount > 0 && (
                            <span className="badge bg-success" title={`${job.acceptedCount} accepted`}>
                              {job.acceptedCount}
                            </span>
                          )}
                          {job.rejectedCount > 0 && (
                            <span className="badge bg-danger" title={`${job.rejectedCount} rejected`}>
                              {job.rejectedCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${successRate}%` }}
                            ></div>
                          </div>
                          <small className="fw-bold">{successRate}%</small>
                        </div>
                      </td>
                      <td>
                        <small>{new Date(job.createdAt).toLocaleDateString()}</small>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApplicationInsights = () => (
    <div className="row">
      <div className="col-lg-6 mb-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-transparent border-0">
            <h6 className="mb-0">
              <i className="fas fa-chart-pie me-2 text-primary"></i>
              Application Status Distribution
            </h6>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-6 mb-3">
                <div className="badge bg-warning fs-5 p-2">{analytics.pendingApplications}</div>
                <div className="mt-1"><small className="text-muted">Pending</small></div>
              </div>
              <div className="col-6 mb-3">
                <div className="badge bg-info fs-5 p-2">
                  {analytics.totalApplications - analytics.pendingApplications - analytics.acceptedApplications - analytics.rejectedApplications}
                </div>
                <div className="mt-1"><small className="text-muted">In Progress</small></div>
              </div>
              <div className="col-6 mb-3">
                <div className="badge bg-success fs-5 p-2">{analytics.acceptedApplications}</div>
                <div className="mt-1"><small className="text-muted">Accepted</small></div>
              </div>
              <div className="col-6 mb-3">
                <div className="badge bg-danger fs-5 p-2">{analytics.rejectedApplications}</div>
                <div className="mt-1"><small className="text-muted">Rejected</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-lg-6 mb-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-transparent border-0">
            <h6 className="mb-0">
              <i className="fas fa-percentage me-2 text-primary"></i>
              Key Metrics
            </h6>
          </div>
          <div className="card-body">
            {renderProgressBar(parseFloat(analytics.acceptanceRate), '#28a745', 'Acceptance Rate')}
            {renderProgressBar(parseFloat(analytics.rejectionRate), '#dc3545', 'Rejection Rate')}
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="small fw-medium">Applications per Job</span>
                <span className="small fw-bold">{analytics.applicationRate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="company-analytics">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Career Center Analytics</h4>
          <p className="text-muted mb-0">Comprehensive insights into your job postings and applications</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <label className="form-label mb-0">Time Range:</label>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row mb-4">
        {renderMetricCard('Total Jobs', analytics.totalJobs, 'fas fa-briefcase', '#007bff')}
        {renderMetricCard('Active Jobs', analytics.activeJobs, 'fas fa-play', '#28a745')}
        {renderMetricCard('Total Applications', analytics.totalApplications, 'fas fa-file-alt', '#ffc107')}
        {renderMetricCard('Pending Review', analytics.pendingApplications, 'fas fa-clock', '#17a2b8')}
      </div>

      {/* Monthly Trends */}
      {renderMonthlyChart()}

      {/* Application Insights */}
      {renderApplicationInsights()}

      {/* Job Performance Table */}
      {renderJobPerformanceTable()}

      {/* Empty State */}
      {analytics.totalJobs === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
          <h5>No analytics data available</h5>
          <p className="text-muted">Post your first job to start seeing analytics insights.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyAnalytics;
