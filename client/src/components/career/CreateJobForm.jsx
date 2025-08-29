import React, { useState, useEffect } from 'react';
import { createJob, updateJob } from '../../services/careerService';
import { useNavigate } from 'react-router-dom';

const CreateJobForm = ({ onJobCreated, onJobUpdated, editingJob }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    category: '',
    jobType: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    experienceLevel: '',
    remoteWork: false,
    applicationDeadline: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || '',
        description: editingJob.description || '',
        requirements: editingJob.requirements || '',
        benefits: editingJob.benefits || '',
        category: editingJob.category || '',
        jobType: editingJob.jobType || '',
        location: editingJob.location || '',
        salaryMin: editingJob.salaryMin || '',
        salaryMax: editingJob.salaryMax || '',
        salaryCurrency: editingJob.salaryCurrency || 'USD',
        experienceLevel: editingJob.experienceLevel || '',
        remoteWork: editingJob.remoteWork || false,
        applicationDeadline: editingJob.applicationDeadline || '',
      });
    }
  }, [editingJob]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (editingJob) {
        response = await updateJob(editingJob.id, formData);
        if (onJobUpdated) {
          onJobUpdated(response.data.job);
        }
      } else {
        response = await createJob(formData);
        if (onJobCreated) {
          onJobCreated(response.data.job);
        } else {
          navigate('/career');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      setError(error.response?.data?.message || `Failed to ${editingJob ? 'update' : 'create'} job posting`);
    } finally {
      setLoading(false);
    }
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

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'AUD', label: 'AUD (A$)' },
  ];

  return (
    <div className="create-job-form">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className={`fas ${editingJob ? 'fa-edit' : 'fa-plus'} me-2`}></i>
            {editingJob ? 'Edit Job Posting' : 'Post a New Job'}
          </h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Basic Information */}
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="title" className="form-label">Job Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="category" className="form-label">Category *</label>
                  <select
                    id="category"
                    name="category"
                    className="form-control"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="jobType" className="form-label">Job Type *</label>
                  <select
                    id="jobType"
                    name="jobType"
                    className="form-control"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select job type</option>
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="location" className="form-label">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-control"
                    placeholder="e.g., New York, NY or Remote"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="experienceLevel" className="form-label">Experience Level *</label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    className="form-control"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select experience level</option>
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="applicationDeadline" className="form-label">Application Deadline</label>
                  <input
                    type="date"
                    id="applicationDeadline"
                    name="applicationDeadline"
                    className="form-control"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="remoteWork"
                      name="remoteWork"
                      className="form-check-input"
                      checked={formData.remoteWork}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="remoteWork">
                      Remote work available
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="row">
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="salaryMin" className="form-label">Minimum Salary</label>
                  <input
                    type="number"
                    id="salaryMin"
                    name="salaryMin"
                    className="form-control"
                    placeholder="e.g., 50000"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="salaryMax" className="form-label">Maximum Salary</label>
                  <input
                    type="number"
                    id="salaryMax"
                    name="salaryMax"
                    className="form-control"
                    placeholder="e.g., 80000"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="salaryCurrency" className="form-label">Currency</label>
                  <select
                    id="salaryCurrency"
                    name="salaryCurrency"
                    className="form-control"
                    value={formData.salaryCurrency}
                    onChange={handleInputChange}
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="form-group mb-3">
              <label htmlFor="description" className="form-label">Job Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="8"
                placeholder="Provide a detailed description of the role, responsibilities, and what the ideal candidate should expect..."
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            {/* Requirements */}
            <div className="form-group mb-3">
              <label htmlFor="requirements" className="form-label">Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                className="form-control"
                rows="6"
                placeholder="List the key requirements, skills, and qualifications needed for this position..."
                value={formData.requirements}
                onChange={handleInputChange}
              ></textarea>
            </div>

            {/* Benefits */}
            <div className="form-group mb-3">
              <label htmlFor="benefits" className="form-label">Benefits</label>
              <textarea
                id="benefits"
                name="benefits"
                className="form-control"
                rows="4"
                placeholder="Describe the benefits and perks that come with this position..."
                value={formData.benefits}
                onChange={handleInputChange}
              ></textarea>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/career')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {editingJob ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className={`fas ${editingJob ? 'fa-save' : 'fa-paper-plane'} me-2`}></i>
                    {editingJob ? 'Update Job' : 'Post Job'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJobForm;
