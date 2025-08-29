import React, { useState, useEffect } from 'react';
import { getUserApplications } from '../../services/careerService';

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning', text: 'Pending Review' },
      'reviewed': { class: 'bg-info', text: 'Under Review' },
      'shortlisted': { class: 'bg-primary', text: 'Shortlisted' },
      'interviewed': { class: 'bg-info', text: 'Interviewed' },
      'accepted': { class: 'bg-success', text: 'Accepted' },
      'rejected': { class: 'bg-danger', text: 'Rejected' },
      'withdrawn': { class: 'bg-secondary', text: 'Withdrawn' },
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

  if (loading && applications.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="application-history">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>My Applications</h4>
        {loading && <div className="spinner-border spinner-border-sm"></div>}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
          <h5>No applications yet</h5>
          <p className="text-muted">Start applying to jobs to see your application history here.</p>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-muted">Showing {applications.length} of {pagination.totalApplications} applications</p>
          </div>

          <div className="applications-list">
            {applications.map(application => (
              <div key={application.id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h6 className="card-title mb-1">
                        {application.job.title}
                      </h6>
                      <p className="text-muted mb-2">
                        {application.job.employer.companyProfile?.companyName || 
                         `${application.job.employer.firstName} ${application.job.employer.lastName}`}
                      </p>
                      
                      <div className="row text-muted small mb-3">
                        <div className="col-md-4">
                          <i className="fas fa-calendar"></i> Applied: {formatDate(application.createdAt)}
                        </div>
                        <div className="col-md-4">
                          <i className="fas fa-map-marker-alt"></i> {application.job.location}
                        </div>
                        <div className="col-md-4">
                          <i className="fas fa-clock"></i> {application.job.jobType}
                        </div>
                      </div>

                      {application.coverLetter && (
                        <div className="mb-3">
                          <strong>Cover Letter:</strong>
                          <p className="text-muted mt-1">
                            {application.coverLetter.length > 200 
                              ? `${application.coverLetter.substring(0, 200)}...` 
                              : application.coverLetter
                            }
                          </p>
                        </div>
                      )}

                      {application.notes && (
                        <div className="mb-3">
                          <strong>Employer Notes:</strong>
                          <p className="text-muted mt-1">{application.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ms-3">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav aria-label="Applications pagination" className="mt-4">
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
    </div>
  );
};

export default ApplicationHistory;
