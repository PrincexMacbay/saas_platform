import React from 'react';
import { Link } from 'react-router-dom';
import { buildImageUrl } from '../../utils/imageUtils';

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
      entry: '#2ecc71',
      mid: '#3498db',
      senior: '#f39c12',
      executive: '#e74c3c',
    };
    return colors[level] || '#95a5a6';
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': '#2ecc71',
      'part-time': '#3498db',
      'contract': '#f39c12',
      'internship': '#9b59b6',
      'freelance': '#95a5a6',
    };
    return colors[type] || '#95a5a6';
  };

  return (
    <>
      <div className="modern-job-card">
        <div className="job-card-header">
          <div className="job-card-company">
            {job.employer.companyProfile?.companyLogo && (
              <img
                src={buildImageUrl(job.employer.companyProfile.companyLogo)}
                alt={job.employer.companyProfile?.companyName || job.employer.firstName}
                className="company-logo"
              />
            )}
            <div className="company-info">
              <h5 className="job-title">
                <Link to={`/career/job/${job.id}`}>
                  {job.title}
                </Link>
              </h5>
              <p className="company-name">
                {job.employer.companyProfile?.companyName || `${job.employer.firstName} ${job.employer.lastName}`}
              </p>
            </div>
          </div>
          <button
            className={`save-button ${job.isSaved ? 'saved' : ''}`}
            onClick={() => onSaveToggle(job.id)}
            title={job.isSaved ? 'Remove from saved' : 'Save job'}
          >
            <i className={`fas fa-bookmark ${job.isSaved ? 'fas' : 'far'}`}></i>
          </button>
        </div>

        <p className="job-description">
          {job.description.length > 200 
            ? `${job.description.substring(0, 200)}...` 
            : job.description
          }
        </p>

        <div className="job-tags">
          <span 
            className="job-tag" 
            style={{ 
              backgroundColor: `${getJobTypeColor(job.jobType)}20`,
              color: getJobTypeColor(job.jobType),
              borderColor: getJobTypeColor(job.jobType)
            }}
          >
            {job.jobType.replace('-', ' ').toUpperCase()}
          </span>
          <span 
            className="job-tag" 
            style={{ 
              backgroundColor: `${getExperienceLevelColor(job.experienceLevel)}20`,
              color: getExperienceLevelColor(job.experienceLevel),
              borderColor: getExperienceLevelColor(job.experienceLevel)
            }}
          >
            {job.experienceLevel.toUpperCase()}
          </span>
          {job.remoteWork && (
            <span className="job-tag remote-tag">
              <i className="fas fa-home"></i> Remote
            </span>
          )}
          {job.employer.companyProfile?.industry && (
            <span className="job-tag industry-tag">
              {job.employer.companyProfile.industry}
            </span>
          )}
        </div>

        <div className="job-details">
          <div className="job-detail-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{job.location}</span>
          </div>
          <div className="job-detail-item">
            <i className="fas fa-money-bill-wave"></i>
            <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
          </div>
          <div className="job-detail-item">
            <i className="fas fa-clock"></i>
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="job-card-footer">
          <Link 
            to={`/career/job/${job.id}`} 
            className="view-details-button"
          >
            View Details
            <i className="fas fa-arrow-right"></i>
          </Link>
          <span className="applications-count">
            <i className="fas fa-users"></i>
            {job.applications?.length || 0} applications
          </span>
        </div>
      </div>

      <style jsx>{`
        .modern-job-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 20px;
        }

        .modern-job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: #3498db;
        }

        .job-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .job-card-company {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .company-logo {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid #e2e8f0;
          flex-shrink: 0;
        }

        .company-info {
          flex: 1;
        }

        .job-title {
          margin: 0 0 6px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .job-title a {
          color: #2c3e50;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .job-title a:hover {
          color: #3498db;
        }

        .company-name {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .save-button {
          background: #f8f9fa;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
          flex-shrink: 0;
        }

        .save-button:hover {
          background: #f0f8ff;
          border-color: #3498db;
          color: #3498db;
          transform: scale(1.1);
        }

        .save-button.saved {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          border-color: #3498db;
          color: white;
        }

        .save-button.saved:hover {
          background: linear-gradient(135deg, #2980b9 0%, #1f6aa5 100%);
        }

        .job-description {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .job-tag {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1.5px solid;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .remote-tag {
          background: #e8f5e920;
          color: #2ecc71;
          border-color: #2ecc71;
        }

        .industry-tag {
          background: #f1f5f9;
          color: #64748b;
          border-color: #cbd5e1;
        }

        .job-details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding: 16px 0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }

        .job-detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.9rem;
        }

        .job-detail-item i {
          color: #3498db;
          width: 18px;
        }

        .job-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .view-details-button {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .view-details-button:hover {
          background: linear-gradient(135deg, #2980b9 0%, #1f6aa5 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
          color: white;
        }

        .applications-count {
          color: #64748b;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .applications-count i {
          color: #3498db;
        }

        @media (max-width: 768px) {
          .modern-job-card {
            padding: 20px;
          }

          .job-card-header {
            flex-direction: column;
            gap: 12px;
          }

          .save-button {
            align-self: flex-end;
          }

          .job-details {
            flex-direction: column;
            gap: 12px;
          }

          .job-card-footer {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .view-details-button {
            width: 100%;
            justify-content: center;
          }

          .applications-count {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default JobCard;
