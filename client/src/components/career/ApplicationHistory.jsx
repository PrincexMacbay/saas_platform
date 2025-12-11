import React, { useState, useEffect } from 'react';
import { getUserApplications } from '../../services/careerService';
import { Link } from 'react-router-dom';
import { buildImageUrl } from '../../utils/imageUtils';

const ApplicationHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
  });

  const loadApplications = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getUserApplications(page);
      setApplications(response.data.applications);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handlePageChange = (page) => {
    loadApplications(page);
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        color: '#f39c12', 
        bgColor: '#fff3e0', 
        text: 'Pending Review',
        icon: 'fa-clock'
      },
      'reviewed': { 
        color: '#3498db', 
        bgColor: '#e3f2fd', 
        text: 'Under Review',
        icon: 'fa-eye'
      },
      'shortlisted': { 
        color: '#9b59b6', 
        bgColor: '#f3e5f5', 
        text: 'Shortlisted',
        icon: 'fa-star'
      },
      'interviewed': { 
        color: '#3498db', 
        bgColor: '#e3f2fd', 
        text: 'Interviewed',
        icon: 'fa-video'
      },
      'accepted': { 
        color: '#2ecc71', 
        bgColor: '#e8f5e9', 
        text: 'Accepted',
        icon: 'fa-check-circle'
      },
      'rejected': { 
        color: '#e74c3c', 
        bgColor: '#ffebee', 
        text: 'Rejected',
        icon: 'fa-times-circle'
      },
      'withdrawn': { 
        color: '#95a5a6', 
        bgColor: '#f5f5f5', 
        text: 'Withdrawn',
        icon: 'fa-undo'
      },
    };
    
    return configs[status] || { 
      color: '#95a5a6', 
      bgColor: '#f5f5f5', 
      text: status,
      icon: 'fa-circle'
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && applications.length === 0) {
    return (
      <div className="applications-loading">
        <div className="loading-spinner"></div>
        <p>Loading your applications...</p>
        <style jsx>{`
          .applications-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            gap: 20px;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="application-history-modern">
      <div className="applications-header">
        <div>
          <h4 className="page-title">My Applications</h4>
          <p className="page-subtitle">
            Track the status of all your job applications
          </p>
        </div>
        {loading && <div className="loading-indicator"></div>}
      </div>

      {error && (
        <div className="error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <h5>No applications yet</h5>
          <p>Start applying to jobs to see your application history here.</p>
          <Link to="/career" className="browse-jobs-button">
            <i className="fas fa-search"></i>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <>
          <div className="applications-stats">
            <span className="stats-text">
              Showing {applications.length} of {pagination.totalApplications} applications
            </span>
          </div>

          <div className="applications-list">
            {applications.map(application => {
              const statusConfig = getStatusConfig(application.status);
              return (
                <div key={application.id} className="application-card">
                  <div className="application-card-header">
                    <div className="application-main-info">
                      <h5 className="job-title">
                        <Link to={`/career/job/${application.job.id}`}>
                          {application.job.title}
                        </Link>
                      </h5>
                      <p className="company-name">
                        {application.job.employer.companyProfile?.companyName || 
                         `${application.job.employer.firstName} ${application.job.employer.lastName}`}
                      </p>
                    </div>
                    <div 
                      className="status-badge"
                      style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                        borderColor: statusConfig.color
                      }}
                    >
                      <i className={`fas ${statusConfig.icon}`}></i>
                      {statusConfig.text}
                    </div>
                  </div>

                  <div className="application-details">
                    <div className="detail-item">
                      <i className="fas fa-calendar"></i>
                      <span>Applied: {formatDate(application.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{application.job.location}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <span>{application.job.jobType}</span>
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="cover-letter-section">
                      <strong>Cover Letter:</strong>
                      <p>
                        {application.coverLetter.length > 200 
                          ? `${application.coverLetter.substring(0, 200)}...` 
                          : application.coverLetter
                        }
                      </p>
                    </div>
                  )}

                  {application.notes && (
                    <div className="employer-notes-section">
                      <strong>
                        <i className="fas fa-comment"></i> Employer Notes:
                      </strong>
                      <p>{application.notes}</p>
                    </div>
                  )}

                  <div className="application-card-footer">
                    <Link 
                      to={`/career/job/${application.job.id}`}
                      className="view-job-button"
                    >
                      <i className="fas fa-eye"></i>
                      View Job Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="pagination-modern">
              <button
                className="page-button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-number ${page === pagination.currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                className="page-button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </nav>
          )}
        </>
      )}

      <style jsx>{`
        .application-history-modern {
          width: 100%;
        }

        .applications-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .loading-indicator {
          width: 24px;
          height: 24px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-alert {
          background: #ffebee;
          color: #e74c3c;
          padding: 16px 20px;
          border-radius: 12px;
          border-left: 4px solid #e74c3c;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .empty-icon i {
          font-size: 3rem;
          color: #95a5a6;
        }

        .empty-state h5 {
          color: #2c3e50;
          font-size: 1.5rem;
          margin: 0 0 12px 0;
        }

        .empty-state p {
          color: #64748b;
          margin: 0 0 24px 0;
        }

        .browse-jobs-button {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .browse-jobs-button:hover {
          background: linear-gradient(135deg, #2980b9 0%, #1f6aa5 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
          color: white;
        }

        .applications-stats {
          margin-bottom: 20px;
        }

        .stats-text {
          color: #64748b;
          font-size: 0.9rem;
        }

        .applications-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .application-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .application-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .application-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 16px;
        }

        .application-main-info {
          flex: 1;
        }

        .job-title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 600;
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
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 2px solid;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .application-details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding: 16px 0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.9rem;
        }

        .detail-item i {
          color: #3498db;
          width: 18px;
        }

        .cover-letter-section,
        .employer-notes-section {
          margin-bottom: 16px;
        }

        .cover-letter-section strong,
        .employer-notes-section strong {
          color: #2c3e50;
          font-size: 0.95rem;
          display: block;
          margin-bottom: 8px;
        }

        .employer-notes-section strong {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cover-letter-section p,
        .employer-notes-section p {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }

        .application-card-footer {
          margin-top: 20px;
        }

        .view-job-button {
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

        .view-job-button:hover {
          background: linear-gradient(135deg, #2980b9 0%, #1f6aa5 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
          color: white;
        }

        .pagination-modern {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 32px;
          flex-wrap: wrap;
        }

        .page-button {
          background: white;
          border: 2px solid #e2e8f0;
          color: #3498db;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-button:hover:not(:disabled) {
          background: #3498db;
          color: white;
          border-color: #3498db;
          transform: translateY(-2px);
        }

        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-numbers {
          display: flex;
          gap: 8px;
        }

        .page-number {
          background: white;
          border: 2px solid #e2e8f0;
          color: #64748b;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .page-number:hover {
          border-color: #3498db;
          color: #3498db;
        }

        .page-number.active {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          border-color: #3498db;
          color: white;
        }

        @media (max-width: 768px) {
          .application-card-header {
            flex-direction: column;
          }

          .status-badge {
            align-self: flex-start;
          }

          .application-details {
            flex-direction: column;
            gap: 12px;
          }

          .pagination-modern {
            flex-direction: column;
          }

          .page-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ApplicationHistory;
