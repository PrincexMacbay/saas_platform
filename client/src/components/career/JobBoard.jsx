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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db] mb-4"></div>
        <p className="text-gray-600 text-lg">Loading jobs...</p>
      </div>
    );
  }

  const hasActiveFilters = Object.keys(filters).some(key => filters[key] && filters[key] !== '');

  return (
    <div className="w-full bg-[#f3f2ef] min-h-screen py-5">
      {/* Search and Filters Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative flex items-center bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden focus-within:border-[#3498db] focus-within:ring-2 focus-within:ring-[#3498db]/20 transition-all">
              <span className="px-5 text-gray-500 flex items-center">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="flex-1 py-4 px-2 border-none outline-none text-base bg-transparent placeholder-gray-400"
                placeholder="Search for jobs, companies, or keywords..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="px-8 py-4 font-semibold text-white bg-gradient-to-r from-[#3498db] to-[#2980b9] rounded-xl transition-all duration-300 hover:from-[#2980b9] hover:to-[#1f6aa5] hover:-translate-y-0.5 shadow-lg shadow-[#3498db]/30 hover:shadow-xl hover:shadow-[#3498db]/40 whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </form>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button 
            className="w-full px-4 py-3 bg-white border-2 border-[#3498db] text-[#3498db] rounded-lg font-medium hover:bg-[#3498db]/5 transition-all flex items-center justify-center gap-2"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <i className="fas fa-filter"></i>
            {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            <i className={`fas fa-chevron-${isMobileFiltersOpen ? 'up' : 'down'}`}></i>
          </button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
            {/* Location Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all"
                placeholder="City, state..."
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Job Type Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Job Type</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all cursor-pointer"
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

            {/* Category Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all cursor-pointer"
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

            {/* Experience Level Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Experience</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all cursor-pointer"
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

            {/* Remote Work Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Remote</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all cursor-pointer"
                value={filters.remoteWork || ''}
                onChange={(e) => handleFilterChange('remoteWork', e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Remote Only</option>
                <option value="false">On-site Only</option>
              </select>
            </div>

            {/* Salary Min Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Min Salary</label>
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all"
                placeholder="Min $"
                value={filters.salaryMin || ''}
                onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
              />
            </div>

            {/* Salary Max Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Max Salary</label>
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all"
                placeholder="Max $"
                value={filters.salaryMax || ''}
                onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
              />
            </div>

            {/* Clear Filters Button */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                  hasActiveFilters 
                    ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:-translate-y-0.5' 
                    : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                <i className="fas fa-times"></i>
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {isMobileFiltersOpen && (
          <div className="lg:hidden mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
              {/* Location Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all"
                  placeholder="City, state, or remote"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Job Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                  <select
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all cursor-pointer"
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

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all cursor-pointer"
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

                {/* Experience Level Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
                  <select
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all cursor-pointer"
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

                {/* Remote Work Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remote</label>
                  <select
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all cursor-pointer"
                    value={filters.remoteWork || ''}
                    onChange={(e) => handleFilterChange('remoteWork', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Remote Only</option>
                    <option value="false">On-site Only</option>
                  </select>
                </div>

                {/* Salary Min Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Salary</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all"
                    placeholder="Min $"
                    value={filters.salaryMin || ''}
                    onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                  />
                </div>

                {/* Salary Max Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Salary</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all"
                    placeholder="Max $"
                    value={filters.salaryMax || ''}
                    onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div>
                <button
                  type="button"
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    hasActiveFilters 
                      ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200' 
                      : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                  }`}
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                >
                  <i className="fas fa-times"></i>
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
            {error}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h5 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h5>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h5 className="text-lg font-semibold text-gray-800">
                Found <span className="text-[#3498db]">{pagination.totalJobs}</span> jobs
              </h5>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3498db]"></div>
              )}
            </div>

            <div className="space-y-4">
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
              <nav aria-label="Jobs pagination" className="mt-8">
                <ul className="flex justify-center items-center gap-2 flex-wrap">
                  <li>
                    <button
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        pagination.currentPage === 1
                          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-300 text-[#3498db] bg-white hover:bg-[#3498db] hover:text-white hover:border-[#3498db]'
                      }`}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page}>
                      <button
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          page === pagination.currentPage
                            ? 'bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white border-[#3498db] shadow-lg shadow-[#3498db]/30'
                            : 'border-gray-300 text-[#3498db] bg-white hover:bg-[#3498db] hover:text-white hover:border-[#3498db]'
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li>
                    <button
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        pagination.currentPage === pagination.totalPages
                          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-300 text-[#3498db] bg-white hover:bg-[#3498db] hover:text-white hover:border-[#3498db]'
                      }`}
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
  );
};

export default JobBoard;
