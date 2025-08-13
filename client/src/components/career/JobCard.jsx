import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, onSaveToggle }) => {
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

  const getExperienceLevelColor = (level) => {
    const colors = {
      entry: 'success',
      mid: 'primary',
      senior: 'warning',
      executive: 'danger',
    };
    return colors[level] || 'secondary';
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'success',
      'part-time': 'info',
      'contract': 'warning',
      'internship': 'primary',
      'freelance': 'secondary',
    };
    return colors[type] || 'secondary';
  };

  return (
    <div className="card mb-3 job-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              {job.employer.companyLogo && (
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${job.employer.companyLogo}`}
                  alt={job.employer.companyName || job.employer.firstName}
                  className="me-3"
                  style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                />
              )}
              <div>
                <h5 className="card-title mb-1">
                  <Link to={`/career/job/${job.id}`} className="text-decoration-none">
                    {job.title}
                  </Link>
                </h5>
                <p className="text-muted mb-0">
                  {job.employer.companyName || `${job.employer.firstName} ${job.employer.lastName}`}
                </p>
              </div>
            </div>

            <div className="mb-3">
              <p className="card-text text-muted">
                {job.description.length > 200 
                  ? `${job.description.substring(0, 200)}...` 
                  : job.description
                }
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className={`badge bg-${getJobTypeColor(job.jobType)}`}>
                {job.jobType.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`badge bg-${getExperienceLevelColor(job.experienceLevel)}`}>
                {job.experienceLevel.toUpperCase()}
              </span>
              {job.remoteWork && (
                <span className="badge bg-info">
                  <i className="fas fa-home"></i> Remote
                </span>
              )}
              {job.employer.industry && (
                <span className="badge bg-secondary">
                  {job.employer.industry}
                </span>
              )}
            </div>

            <div className="row text-muted small">
              <div className="col-md-4">
                <i className="fas fa-map-marker-alt"></i> {job.location}
              </div>
              <div className="col-md-4">
                <i className="fas fa-money-bill-wave"></i> {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              </div>
              <div className="col-md-4">
                <i className="fas fa-clock"></i> Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="ms-3">
            <button
              className={`btn btn-sm ${job.isSaved ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onSaveToggle(job.id)}
              title={job.isSaved ? 'Remove from saved' : 'Save job'}
            >
              <i className={`fas fa-bookmark ${job.isSaved ? 'fas' : 'far'}`}></i>
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <Link 
              to={`/career/job/${job.id}`} 
              className="btn btn-primary btn-sm"
            >
              View Details
            </Link>
            <small className="text-muted">
              {job.applications?.length || 0} applications
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
