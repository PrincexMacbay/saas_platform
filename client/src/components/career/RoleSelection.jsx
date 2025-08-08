import React, { useState } from 'react';

const RoleSelection = ({ onRoleSelect, loading }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({});

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRoleSelect(selectedRole, formData);
  };

  const renderIndividualForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="workExperience" className="form-label">Work Experience</label>
        <textarea
          id="workExperience"
          name="workExperience"
          className="form-control"
          rows="4"
          placeholder="Describe your work experience..."
          value={formData.workExperience || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="jobPreferences" className="form-label">Job Preferences</label>
        <textarea
          id="jobPreferences"
          name="jobPreferences"
          className="form-control"
          rows="3"
          placeholder="Describe your job preferences (location, salary, etc.)..."
          value={formData.jobPreferences || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Setting up...' : 'Continue as Job Seeker'}
      </button>
    </form>
  );

  const renderCompanyForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="companyName" className="form-label">Company Name *</label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          className="form-control"
          placeholder="Enter your company name"
          value={formData.companyName || ''}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="industry" className="form-label">Industry</label>
        <input
          type="text"
          id="industry"
          name="industry"
          className="form-control"
          placeholder="e.g., Technology, Healthcare, Finance"
          value={formData.industry || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="companySize" className="form-label">Company Size</label>
        <select
          id="companySize"
          name="companySize"
          className="form-control"
          value={formData.companySize || ''}
          onChange={handleInputChange}
        >
          <option value="">Select company size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="501-1000">501-1000 employees</option>
          <option value="1000+">1000+ employees</option>
        </select>
      </div>
      
      <div className="mb-3">
        <label htmlFor="website" className="form-label">Website</label>
        <input
          type="url"
          id="website"
          name="website"
          className="form-control"
          placeholder="https://yourcompany.com"
          value={formData.website || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="location" className="form-label">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          className="form-control"
          placeholder="City, State/Country"
          value={formData.location || ''}
          onChange={handleInputChange}
        />
      </div>
      
      <button type="submit" className="btn btn-success" disabled={loading}>
        {loading ? 'Setting up...' : 'Continue as Employer'}
      </button>
    </form>
  );

  return (
    <div className="role-selection">
      {!selectedRole ? (
        <div className="row">
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="fas fa-user-tie fa-3x text-primary"></i>
                </div>
                <h5 className="card-title">I am looking for a job</h5>
                <p className="card-text">
                  Browse job listings, apply for positions, and track your applications.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => handleRoleSelect('individual')}
                >
                  Continue as Job Seeker
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="fas fa-building fa-3x text-success"></i>
                </div>
                <h5 className="card-title">I want to hire</h5>
                <p className="card-text">
                  Post job openings, manage applications, and find the perfect candidates.
                </p>
                <button
                  className="btn btn-success btn-lg"
                  onClick={() => handleRoleSelect('company')}
                >
                  Continue as Employer
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              {selectedRole === 'individual' ? 'Job Seeker Setup' : 'Company Setup'}
            </h5>
          </div>
          <div className="card-body">
            {selectedRole === 'individual' ? renderIndividualForm() : renderCompanyForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
