import React, { useState } from 'react';

const JobFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onFilterChange({});
  };

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

  return (
    <div className="job-filters">
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-filter"></i> Filters
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Search */}
            <div className="form-group mb-3">
              <label htmlFor="search" className="form-label">Search</label>
              <input
                type="text"
                id="search"
                name="search"
                className="form-control"
                placeholder="Job title, company, or keywords..."
                value={localFilters.search || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Location */}
            <div className="form-group mb-3">
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-control"
                placeholder="City, state, or remote"
                value={localFilters.location || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Job Type */}
            <div className="form-group mb-3">
              <label htmlFor="jobType" className="form-label">Job Type</label>
              <select
                id="jobType"
                name="jobType"
                className="form-control"
                value={localFilters.jobType || ''}
                onChange={handleInputChange}
              >
                <option value="">All Types</option>
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="form-group mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={localFilters.category || ''}
                onChange={handleInputChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div className="form-group mb-3">
              <label htmlFor="experienceLevel" className="form-label">Experience Level</label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                className="form-control"
                value={localFilters.experienceLevel || ''}
                onChange={handleInputChange}
              >
                <option value="">All Levels</option>
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Remote Work */}
            <div className="form-group mb-3">
              <label htmlFor="remoteWork" className="form-label">Remote Work</label>
              <select
                id="remoteWork"
                name="remoteWork"
                className="form-control"
                value={localFilters.remoteWork || ''}
                onChange={handleInputChange}
              >
                <option value="">All</option>
                <option value="true">Remote Only</option>
                <option value="false">On-site Only</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="form-group mb-3">
              <label className="form-label">Salary Range</label>
              <div className="row">
                <div className="col-6">
                  <input
                    type="number"
                    name="salaryMin"
                    className="form-control"
                    placeholder="Min"
                    value={localFilters.salaryMin || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    name="salaryMax"
                    className="form-control"
                    placeholder="Max"
                    value={localFilters.salaryMax || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-group d-grid gap-2">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-search"></i> Apply Filters
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={handleClear}
              >
                <i className="fas fa-times"></i> Clear All
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
