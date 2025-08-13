import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSection = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills || '',
    experience: user?.experience || '',
    education: user?.education || '',
    resume: user?.resume || '',
    linkedinUrl: user?.linkedinUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // This would typically call an API to update the user profile
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user context
      updateUser({ ...user, ...formData });
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file.name);
    }
  };

  return (
    <div className="profile-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Career Profile</h4>
        <button 
          className="btn btn-primary"
          onClick={() => window.print()}
        >
          <i className="fas fa-print"></i> Print Resume
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Personal Information */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-user"></i> Personal Information
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-control"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-control"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
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
                    placeholder="City, State, Country"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-briefcase"></i> Professional Information
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="linkedinUrl" className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    className="form-control"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="portfolioUrl" className="form-label">Portfolio URL</label>
                  <input
                    type="url"
                    id="portfolioUrl"
                    name="portfolioUrl"
                    className="form-control"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="resume" className="form-label">Resume</label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    className="form-control"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <small className="text-muted">Upload PDF, DOC, or DOCX file</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-quote-left"></i> Professional Summary
            </h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="bio" className="form-label">Bio</label>
              <textarea
                id="bio"
                name="bio"
                className="form-control"
                rows="4"
                placeholder="Tell employers about yourself, your career goals, and what makes you unique..."
                value={formData.bio}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-tools"></i> Skills
            </h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="skills" className="form-label">Skills</label>
              <textarea
                id="skills"
                name="skills"
                className="form-control"
                rows="3"
                placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Node.js, Python)"
                value={formData.skills}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-history"></i> Work Experience
            </h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="experience" className="form-label">Experience Summary</label>
              <textarea
                id="experience"
                name="experience"
                className="form-control"
                rows="6"
                placeholder="Describe your work experience, key achievements, and responsibilities..."
                value={formData.experience}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-graduation-cap"></i> Education
            </h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="education" className="form-label">Education</label>
              <textarea
                id="education"
                name="education"
                className="form-control"
                rows="4"
                placeholder="List your educational background, degrees, certifications, and relevant coursework..."
                value={formData.education}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                  Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSection;
