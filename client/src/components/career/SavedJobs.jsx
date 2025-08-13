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
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="saved-jobs">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Saved Jobs ({pagination.totalJobs})</h4>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {savedJobs.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-bookmark fa-3x text-muted mb-3"></i>
          <h5>No saved jobs yet</h5>
          <p className="text-muted">Jobs you save will appear here for easy access.</p>
        </div>
      ) : (
        <>
          <div className="jobs-list">
            {savedJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onSaveToggle={handleRemoveSavedJob}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav aria-label="Saved jobs pagination" className="mt-4">
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

export default SavedJobs;
