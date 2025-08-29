import React, { useState, useEffect } from 'react';
import { getJobs, toggleSavedJob } from '../../services/careerService';
import JobCard from './JobCard';

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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' },
  ];

  const categories = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Design',
    'Engineering',
    'Administration',
    'Customer Service',
    'Other',
  ];

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

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    loadJobs(1, newFilters);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadJobs(1, filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    loadJobs(1, {});
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
    <div className="job-board-linkedin-style">
      {/* Search and Filters Section */}
      <div className="search-filters-section mb-4">
        {/* Search Bar */}
        <div className="search-section">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-container">
              <div className="search-input-group">
                <span className="search-icon">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for jobs, companies, or keywords..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mobile-filter-toggle d-lg-none">
          <button 
            className="btn btn-outline-primary w-100"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <i className="fas fa-filter me-2"></i>
            {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            <i className={`fas fa-chevron-${isMobileFiltersOpen ? 'up' : 'down'} ms-2`}></i>
          </button>
        </div>

        {/* Desktop Filters */}
        <div className="filters-section d-none d-lg-block">
          <div className="filters-container">
            <div className="row g-4">
            {/* Location Filter */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="filter-item">
                <label className="form-label small text-muted">Location</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="City, state, or remote"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>

            {/* Job Type Filter */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="filter-item">
                <label className="form-label small text-muted">Job Type</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.jobType || ''}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="filter-item">
                <label className="form-label small text-muted">Category</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience Level Filter */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="filter-item">
                <label className="form-label small text-muted">Experience</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.experienceLevel || ''}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                >
                  <option value="">All Levels</option>
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remote Work Filter */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="filter-item">
                <label className="form-label small text-muted">Remote</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.remoteWork || ''}
                  onChange={(e) => handleFilterChange('remoteWork', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="true">Remote Only</option>
                  <option value="false">On-site Only</option>
                </select>
              </div>
            </div>

            {/* Salary Min Filter */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="filter-item">
                <label className="form-label small text-muted">Min Salary</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Min $"
                  value={filters.salaryMin || ''}
                  onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                />
              </div>
            </div>

            {/* Salary Max Filter */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="filter-item">
                <label className="form-label small text-muted">Max Salary</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Max $"
                  value={filters.salaryMax || ''}
                  onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="col-lg-2 col-md-3 col-sm-6">
              <div className="filter-item">
                <label className="form-label small text-muted">&nbsp;</label>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm w-100 clear-button"
                  onClick={handleClearFilters}
                >
                  <i className="fas fa-times me-1"></i>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {isMobileFiltersOpen && (
          <div className="mobile-filters-dropdown d-lg-none">
            <div className="mobile-filters-content">
              <div className="row g-3">
                {/* Location Filter */}
                <div className="col-12">
                  <div className="filter-item">
                    <label className="form-label small text-muted">Location</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="City, state, or remote"
                      value={filters.location || ''}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </div>
                </div>

                {/* Job Type Filter */}
                <div className="col-6">
                  <div className="filter-item">
                    <label className="form-label small text-muted">Job Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.jobType || ''}
                      onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      {jobTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="col-6">
                  <div className="filter-item">
                    <label className="form-label small text-muted">Category</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience Level Filter */}
                <div className="col-6">
                  <div className="filter-item">
                    <label className="form-label small text-muted">Experience</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.experienceLevel || ''}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    >
                      <option value="">All Levels</option>
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Remote Work Filter */}
                <div className="col-6">
                  <div className="filter-item">
                    <label className="form-label small text-muted">Remote</label>
                    <select
                      className="form-select form-select-sm"
                      value={filters.remoteWork || ''}
                      onChange={(e) => handleFilterChange('remoteWork', e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="true">Remote Only</option>
                      <option value="false">On-site Only</option>
                    </select>
                  </div>
                </div>

                {/* Salary Min Filter */}
                <div className="col-6">
                  <div className="filter-item">
                    <label className="form-label small text-muted">Min Salary</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Min $"
                      value={filters.salaryMin || ''}
                      onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                    />
                  </div>
                </div>

                {/* Salary Max Filter */}
                <div className="col-6">
                  <div className="filter-item">
                    <label className="form-label small text-muted">Max Salary</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Max $"
                      value={filters.salaryMax || ''}
                      onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                    />
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="col-12">
                  <div className="filter-item">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm w-100 clear-button"
                      onClick={handleClearFilters}
                    >
                      <i className="fas fa-times me-1"></i>
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List - Center */}
      <div className="jobs-section">
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
              <h5 className="mb-0">Found {pagination.totalJobs} jobs</h5>
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

      <style jsx>{`
        .job-board-linkedin-style {
          max-width: 100%;
          background: #f3f2ef;
          min-height: 100vh;
          padding: 20px 0;
        }

        .search-filters-section {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #e0e0e0;
          margin-bottom: 24px;
        }

        .search-section {
          margin-bottom: 20px;
        }

        .search-container {
          display: flex;
          gap: 12px;
          align-items: stretch;
        }

        .search-input-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .search-icon {
          padding: 16px 20px;
          color: #666;
          background: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-input {
          flex: 1;
          border: none;
          padding: 16px 20px;
          font-size: 16px;
          background: #fff;
          outline: none;
        }

        .search-input:focus {
          box-shadow: none;
          border: none;
        }

        .search-button {
          border: none;
          padding: 16px 32px;
          font-weight: 600;
          background: #0073b1;
          color: #fff;
          border-radius: 12px;
          transition: background-color 0.2s ease;
          white-space: nowrap;
        }

        .search-button:hover {
          background: #005885;
        }

        .filters-section {
          margin-top: 20px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          border-top: 1px solid #e0e0e0;
        }

        /* Ensure mobile filter toggle is hidden on desktop */
        .mobile-filter-toggle.d-lg-none {
          display: none;
        }

        /* Ensure desktop filters are hidden on mobile */
        .filters-section.d-none.d-lg-block {
          display: none;
        }

        /* Responsive overrides */
        @media (max-width: 991px) {
          .mobile-filter-toggle.d-lg-none {
            display: block !important;
          }
          
          .filters-section.d-none.d-lg-block {
            display: none !important;
          }
        }

        @media (min-width: 992px) {
          .mobile-filter-toggle.d-lg-none {
            display: none !important;
          }
          
          .filters-section.d-none.d-lg-block {
            display: block !important;
          }
        }

        .filters-container {
          width: 100%;
        }

        .filter-item {
          height: 100%;
        }

        .filter-item .form-label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          font-size: 14px;
        }

                 .filter-item .form-control,
         .filter-item .form-select {
           border: 1px solid #ddd;
           border-radius: 8px;
           font-size: 14px;
           padding: 8px 12px;
           background: #fff;
           transition: border-color 0.2s ease, box-shadow 0.2s ease;
         }

        .filter-item .form-control:focus,
        .filter-item .form-select:focus {
          border-color: #0073b1;
          box-shadow: 0 0 0 3px rgba(0, 115, 177, 0.1);
          outline: none;
        }

        .filter-item .btn {
          border-radius: 8px;
          font-size: 14px;
          padding: 8px 16px;
          transition: all 0.2s ease;
        }

        .filter-item .btn:hover {
          transform: translateY(-1px);
        }

        .clear-button {
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Mobile Filter Styles */
        .mobile-filter-toggle {
          margin-bottom: 15px;
        }

        .mobile-filters-dropdown {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-top: 15px;
          border: 1px solid #e9ecef;
        }

        .mobile-filters-content {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .mobile-filters-content .filter-item {
          margin-bottom: 15px;
        }

        .mobile-filters-content .filter-item:last-child {
          margin-bottom: 0;
        }

        /* Add spacing between filter items */
        .filter-item {
          margin-bottom: 8px;
        }

        .filter-item:last-child {
          margin-bottom: 0;
        }

        .jobs-section {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #e0e0e0;
        }

        .jobs-section h5 {
          color: #333;
          font-weight: 600;
          font-size: 18px;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pagination {
          margin-top: 32px;
        }

        .pagination .page-link {
          border: 1px solid #e0e0e0;
          color: #0073b1;
          padding: 8px 16px;
          margin: 0 2px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .pagination .page-link:hover {
          background: #0073b1;
          color: #fff;
          border-color: #0073b1;
        }

        .pagination .page-item.active .page-link {
          background: #0073b1;
          border-color: #0073b1;
        }

        .pagination .page-item.disabled .page-link {
          color: #6c757d;
          background: #f8f9fa;
          border-color: #e0e0e0;
        }

        

         /* Responsive Design */
         @media (max-width: 992px) {
           .filters-section .row > div {
             margin-bottom: 16px;
           }
         }

                 @media (max-width: 768px) {
           .job-board-linkedin-style {
             padding: 16px 0;
           }

           .search-section,
           .filters-section,
           .jobs-section {
             padding: 20px;
             margin-bottom: 16px;
           }

           .search-form .form-control,
           .search-form .input-group-text {
             padding: 12px 16px;
           }

           .search-form .btn {
             padding: 12px 24px;
           }

           .filters-section .row {
             row-gap: 1rem !important;
           }
           
           .filter-item {
             margin-bottom: 0;
           }

           .filter-item .form-control,
           .filter-item .form-select {
             font-size: 16px; /* Prevent zoom on iOS */
           }
         }

        @media (max-width: 576px) {
          .search-container {
            flex-direction: column;
            gap: 8px;
          }

          .search-input-group {
            border-radius: 8px;
          }

          .search-button {
            width: 100%;
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default JobBoard;
