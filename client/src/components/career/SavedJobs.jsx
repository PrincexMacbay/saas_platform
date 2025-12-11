import React, { useState, useEffect } from 'react';
import { getSavedJobs, toggleSavedJob } from '../../services/careerService';
import JobCard from './JobCard';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
  });

  const loadSavedJobs = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getSavedJobs(page);
      setSavedJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      setError('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const handlePageChange = (page) => {
    loadSavedJobs(page);
  };

  const handleRemoveSavedJob = async (jobId) => {
    try {
      await toggleSavedJob(jobId);
      // Remove the job from the list
      setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  if (loading && savedJobs.length === 0) {
    return (
      <div className="saved-jobs-loading">
        <div className="loading-spinner"></div>
        <p>Loading saved jobs...</p>
        <style jsx>{`
          .saved-jobs-loading {
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
    <div className="saved-jobs-modern">
      <div className="saved-jobs-header">
        <div>
          <h4 className="page-title">
            <i className="fas fa-bookmark"></i>
            Saved Jobs
          </h4>
          <p className="page-subtitle">
            {pagination.totalJobs > 0 
              ? `${pagination.totalJobs} job${pagination.totalJobs !== 1 ? 's' : ''} saved for later`
              : 'Jobs you save will appear here for easy access'
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {savedJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-bookmark"></i>
          </div>
          <h5>No saved jobs yet</h5>
          <p>Jobs you save will appear here for easy access.</p>
          <a href="/career" className="browse-jobs-button">
            <i className="fas fa-search"></i>
            Browse Jobs
          </a>
        </div>
      ) : (
        <>
          <div className="jobs-list">
            {savedJobs.map(job => (
              <JobCard
                key={job.id}
                job={{ ...job, isSaved: true }}
                onSaveToggle={handleRemoveSavedJob}
              />
            ))}
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
        .saved-jobs-modern {
          width: 100%;
        }

        .saved-jobs-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-title i {
          color: #3498db;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
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

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
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

export default SavedJobs;
