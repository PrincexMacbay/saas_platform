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
    <div className="profile-section-modern">
      <div className="profile-header">
        <div>
          <h4 className="page-title">
            <i className="fas fa-user-circle"></i>
            Career Profile
          </h4>
          <p className="page-subtitle">
            Keep your profile up to date to attract the best opportunities
          </p>
        </div>
        <button 
          className="print-button"
          onClick={() => window.print()}
        >
          <i className="fas fa-print"></i>
          Print Resume
        </button>
      </div>

      {error && (
        <div className="alert-modern error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert-modern success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-grid">
          {/* Personal Information */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-user"></i>
              <h5>Personal Information</h5>
            </div>
            <div className="form-fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="City, State, Country"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="form-section">
            <div className="section-header">
              <i className="fas fa-briefcase"></i>
              <h5>Professional Information</h5>
            </div>
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="linkedinUrl">
                  <i className="fab fa-linkedin"></i>
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolioUrl">
                  <i className="fas fa-globe"></i>
                  Portfolio URL
                </label>
                <input
                  type="url"
                  id="portfolioUrl"
                  name="portfolioUrl"
                  placeholder="https://yourportfolio.com"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="resume">
                  <i className="fas fa-file-pdf"></i>
                  Resume
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <label htmlFor="resume" className="file-label">
                    <i className="fas fa-upload"></i>
                    Choose File
                  </label>
                  <span className="file-hint">PDF, DOC, or DOCX (Max 5MB)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="form-section full-width">
          <div className="section-header">
            <i className="fas fa-quote-left"></i>
            <h5>Professional Summary</h5>
          </div>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows="5"
                placeholder="Tell employers about yourself, your career goals, and what makes you unique..."
                value={formData.bio}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="form-section full-width">
          <div className="section-header">
            <i className="fas fa-tools"></i>
            <h5>Skills</h5>
          </div>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="skills">Skills</label>
              <textarea
                id="skills"
                name="skills"
                rows="3"
                placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Node.js, Python)"
                value={formData.skills}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="form-section full-width">
          <div className="section-header">
            <i className="fas fa-history"></i>
            <h5>Work Experience</h5>
          </div>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="experience">Experience Summary</label>
              <textarea
                id="experience"
                name="experience"
                rows="6"
                placeholder="Describe your work experience, key achievements, and responsibilities..."
                value={formData.experience}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="form-section full-width">
          <div className="section-header">
            <i className="fas fa-graduation-cap"></i>
            <h5>Education</h5>
          </div>
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="education">Education</label>
              <textarea
                id="education"
                name="education"
                rows="4"
                placeholder="List your educational background, degrees, certifications, and relevant coursework..."
                value={formData.education}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .profile-section-modern {
          width: 100%;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
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

        .print-button {
          background: white;
          border: 2px solid #e2e8f0;
          color: #3498db;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .print-button:hover {
          background: #f0f8ff;
          border-color: #3498db;
          transform: translateY(-2px);
        }

        .alert-modern {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 4px solid;
        }

        .alert-modern.error {
          background: #ffebee;
          color: #e74c3c;
          border-color: #e74c3c;
        }

        .alert-modern.success {
          background: #e8f5e9;
          color: #2ecc71;
          border-color: #2ecc71;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .form-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .form-section.full-width {
          grid-column: 1 / -1;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }

        .section-header i {
          color: #3498db;
          font-size: 1.25rem;
        }

        .section-header h5 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .file-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-input {
          display: none;
        }

        .file-label {
          background: #f8f9fa;
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748b;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .file-label:hover {
          background: #f0f8ff;
          border-color: #3498db;
          color: #3498db;
        }

        .file-hint {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          margin-top: 8px;
        }

        .submit-button {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          padding: 16px 48px;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2980b9 0%, #1f6aa5 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .profile-header {
            flex-direction: column;
          }

          .print-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSection;
