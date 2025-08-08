import React, { useState, useEffect } from 'react';
import { getJobs, toggleSavedJob } from '../../services/careerService';
import JobCard from './JobCard';
import JobFilters from './JobFilters';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
  });

  const loadJobs = async (page = 1, newFilters = filters) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getJobs({ ...newFilters, page });
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadJobs(1, newFilters);
  };

  const handlePageChange = (page) => {
    loadJobs(page, filters);
  };

  const handleSaveJob = async (jobId) => {
    try {
      await toggleSavedJob(jobId);
      // Update the job's saved status in the list
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, isSaved: !job.isSaved }
            : job
        )
      );
    } catch (error) {
      console.error('Error toggling saved job:', error);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="job-board">
      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-md-3">
          <JobFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Jobs List */}
        <div className="col-md-9">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h5>No jobs found</h5>
              <p className="text-muted">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Found {pagination.totalJobs} jobs</h5>
                {loading && <div className="spinner-border spinner-border-sm"></div>}
              </div>

              <div className="jobs-list">
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSaveToggle={handleSaveJob}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav aria-label="Jobs pagination" className="mt-4">
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
      </div>
    </div>
  );
};

export default JobBoard;
