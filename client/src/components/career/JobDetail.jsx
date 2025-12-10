import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, applyForJob, toggleSavedJob } from '../../services/careerService';
import { useAuth } from '../../contexts/AuthContext';
import { buildImageUrl } from '../../utils/imageUtils';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null,
  });

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getJob(jobId);
      setJob(response.data.job);
    } catch (error) {
      console.error('Error loading job:', error);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('coverLetter', applicationData.coverLetter);
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      await applyForJob(jobId, formData);
      
      // Show success message and redirect
      alert('Application submitted successfully!');
      navigate('/career');
    } catch (error) {
      console.error('Error applying for job:', error);
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      await toggleSavedJob(jobId);
      setJob(prev => ({ ...prev, isSaved: !prev.isSaved }));
    } catch (error) {
      console.error('Error toggling saved job:', error);
    }
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    
    const formatNumber = (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toLocaleString();
    };
    
    if (min && max) {
      return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
    } else if (min) {
      return `${currency} ${formatNumber(min)}+`;
    } else {
      return `${currency} Up to ${formatNumber(max)}`;
    }
  };

  const getExperienceLevelColor = (level) => {
    const colors = {
      entry: 'success',
      mid: 'primary',
      senior: 'warning',
      executive: 'danger',
    };
    return colors[level] || 'secondary';
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'success',
      'part-time': 'info',
      'contract': 'warning',
      'internship': 'primary',
      'freelance': 'secondary',
    };
    return colors[type] || 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="alert alert-warning" role="alert">
        Job not found
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      {/* Header Section */}
      <div className="job-header">
        <div className="header-content">
          <div className="job-title-section">
            <div className="company-logo">
              {job.employer.companyProfile?.companyLogo ? (
                <img
                  src={buildImageUrl(job.employer.companyProfile.companyLogo)}
                  alt={job.employer.companyProfile?.companyName || job.employer.firstName}
                />
              ) : (
                <div className="logo-placeholder">
                  <i className="fas fa-building"></i>
                </div>
              )}
            </div>
            <div className="job-info">
              <h1 className="job-title">{job.title}</h1>
              <h2 className="company-name">
                {job.employer.companyProfile?.companyName || `${job.employer.firstName} ${job.employer.lastName}`}
              </h2>
              <div className="job-meta">
                <span className="location">
                  <i className="fas fa-map-marker-alt"></i>
                  {job.location}
                </span>
                <span className="salary">
                  <i className="fas fa-dollar-sign"></i>
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
                <span className="posted-date">
                  <i className="fas fa-calendar"></i>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="action-buttons">
            {user?.profile?.userType === 'individual' && (
              <button
                className={`btn-save ${job.isSaved ? 'saved' : ''}`}
                onClick={handleSaveJob}
              >
                <i className={`fas fa-heart`}></i>
                {job.isSaved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>
        
        <div className="job-badges">
          <span className={`badge job-type ${job.jobType}`}>
            {job.jobType.replace('-', ' ')}
          </span>
          <span className={`badge experience ${job.experienceLevel}`}>
            {job.experienceLevel}
          </span>
          {job.remoteWork && (
            <span className="badge remote">
              <i className="fas fa-home"></i>
              Remote
            </span>
          )}
          {job.employer.companyProfile?.industry && (
            <span className="badge industry">
              {job.employer.companyProfile.industry}
            </span>
          )}
        </div>
        
        {job.applicationDeadline && (
          <div className="deadline-alert">
            <i className="fas fa-clock"></i>
            Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="job-content">
        <div className="main-content">
          <section className="job-section">
            <h3>
              <i className="fas fa-align-left"></i>
              Job Description
            </h3>
            <div className="section-content">
              <p>{job.description}</p>
            </div>
          </section>

          {job.requirements && (
            <section className="job-section">
              <h3>
                <i className="fas fa-list-check"></i>
                Requirements
              </h3>
              <div className="section-content">
                <p>{job.requirements}</p>
              </div>
            </section>
          )}

          {job.benefits && (
            <section className="job-section">
              <h3>
                <i className="fas fa-gift"></i>
                Benefits & Perks
              </h3>
              <div className="section-content">
                <p>{job.benefits}</p>
              </div>
            </section>
          )}
        </div>

        <div className="sidebar">
          <div className="company-card">
            <h3>About the Company</h3>
            <div className="company-info">
              {job.employer.companyProfile?.companyLogo && (
                <div className="company-logo-large">
                  <img
                    src={buildImageUrl(job.employer.companyProfile.companyLogo)}
                    alt={job.employer.companyProfile?.companyName || job.employer.firstName}
                  />
                </div>
              )}
              <h4>{job.employer.companyProfile?.companyName || `${job.employer.firstName} ${job.employer.lastName}`}</h4>
              
              <div className="company-details">
                {job.employer.companyProfile?.industry && (
                  <div className="detail-item">
                    <i className="fas fa-industry"></i>
                    <span>{job.employer.companyProfile.industry}</span>
                  </div>
                )}
                
                {job.employer.companyProfile?.location && (
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{job.employer.companyProfile.location}</span>
                  </div>
                )}
                
                {job.employer.companyProfile?.companySize && (
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>{job.employer.companyProfile.companySize}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user?.profile?.userType === 'individual' && (
            <div className="application-section">
              <h3>Apply for this Position</h3>
              <div className="application-form-container">
                <form onSubmit={handleApply}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="coverLetter" className="form-label">Cover Letter *</label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      className="form-control"
                      rows="6"
                      placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="resume" className="form-label">Resume (Optional)</label>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      className="form-control"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setApplicationData(prev => ({ ...prev, resume: e.target.files[0] }))}
                    />
                    <small className="text-muted">Upload PDF, DOC, or DOCX file</small>
                  </div>

                  <button
                    type="submit"
                    className="apply-submit-btn"
                    disabled={applying}
                  >
                    {applying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit Application
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>



      <style jsx>{`
        .job-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f6fa;
          min-height: 100vh;
        }

        /* Header Section */
        .job-header {
          background: linear-gradient(135deg, #2c3e50 0%, rgb(17 24 39) 100%);
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
          color: white;
          box-shadow: 0 4px 20px rgba(44, 62, 80, 0.15);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .job-title-section {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          flex: 1;
        }

        .company-logo {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .logo-placeholder {
          color: white;
          font-size: 24px;
        }

        .job-info {
          flex: 1;
        }

        .job-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .company-name {
          font-size: 1.5rem;
          font-weight: 500;
          margin: 0 0 16px 0;
          opacity: 0.9;
        }

        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          font-size: 1rem;
        }

        .job-meta span {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0.9;
        }

        .job-meta i {
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .btn-apply {
          background: #27ae60;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(39, 174, 96, 0.2);
        }

        .btn-apply:hover {
          background: #219a52;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
        }

        .btn-save {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.4);
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-save:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .btn-save.saved {
          background: #e74c3c;
          border-color: #e74c3c;
          color: white;
        }

        .btn-save.saved:hover {
          background: #c0392b;
          border-color: #c0392b;
        }

        .job-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 0.85rem;
          text-transform: capitalize;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .badge.job-type {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .badge.experience {
          background: rgba(255, 255, 255, 0.2);
          color: #f39c12;
          border-color: rgba(243, 156, 18, 0.3);
        }

        .badge.remote {
          background: rgba(255, 255, 255, 0.2);
          color: rgb(17 24 39);
          border-color: rgba(52, 152, 219, 0.3);
        }

        .badge.industry {
          background: rgba(255, 255, 255, 0.2);
          color: #95a5a6;
          border-color: rgba(149, 165, 166, 0.3);
        }

        .deadline-alert {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #f39c12;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        /* Main Content */
        .job-content {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 32px;
        }

        .main-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          max-height: 70vh;
          overflow-y: auto;
        }

        .job-section {
          padding: 24px;
          border-bottom: 1px solid #e9ecef;
        }

        .job-section:last-child {
          border-bottom: none;
        }

        .job-section h3 {
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .job-section h3 i {
          color: rgb(17 24 39);
          font-size: 1.2rem;
        }

        .section-content {
          color: #2c3e50;
          line-height: 1.6;
          font-size: 0.95rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .section-content p {
          margin: 0;
          white-space: pre-line;
        }

        /* Sidebar */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .company-card,
        .quick-actions {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .company-card h3,
        .quick-actions h3 {
          color: #2c3e50;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 20px 0;
        }

        .company-logo-large {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .company-logo-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .company-info h4 {
          color: #2c3e50;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 16px 0;
        }

        .company-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #2c3e50;
          font-size: 0.95rem;
        }

        .detail-item i {
          color: rgb(17 24 39);
          width: 16px;
          text-align: center;
        }

        .action-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
          text-decoration: none;
        }

        .action-btn.primary {
          background: rgb(17 24 39);
          color: white;
          border: none;
        }

        .action-btn.primary:hover {
          background: #2980b9;
          transform: translateY(-1px);
        }

        .action-btn.outline {
          background: transparent;
          color: rgb(17 24 39);
          border: 2px solid rgb(17 24 39);
        }

        .action-btn.outline:hover {
          background: rgb(17 24 39);
          color: white;
        }

        .action-btn.danger {
          background: #e74c3c;
          color: white;
          border: none;
        }

        .action-btn.danger:hover {
          background: #c0392b;
        }

        /* Application Section */
        .application-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #27ae60;
        }

        .application-section h3 {
          color: #2c3e50;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 20px 0;
          text-align: center;
        }

        .application-form-container {
          width: 100%;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #2c3e50;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-control {
          width: 100%;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.3s ease;
          font-family: inherit;
        }

        .form-control:focus {
          outline: none;
          border-color: rgb(17 24 39);
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-control::placeholder {
          color: #95a5a6;
        }

        .text-muted {
          color: #7f8c8d;
          font-size: 0.85rem;
          margin-top: 4px;
          display: block;
        }

        .apply-submit-btn {
          width: 100%;
          background: #27ae60;
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .apply-submit-btn:hover {
          background: #219a52;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
        }

        .apply-submit-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          border: 1px solid transparent;
        }

        .alert-danger {
          background-color: #f8d7da;
          border-color: #f5c6cb;
          color: #721c24;
        }

        .spinner-border {
          width: 1rem;
          height: 1rem;
          border-width: 0.125em;
        }

        .spinner-border-sm {
          width: 0.875rem;
          height: 0.875rem;
          border-width: 0.1em;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .job-content {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            order: -1;
          }

          .main-content {
            max-height: 50vh;
          }
        }

        @media (max-width: 768px) {
          .job-detail-container {
            padding: 16px;
          }

          .job-header {
            padding: 24px;
          }

          .header-content {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .job-title-section {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .job-title {
            font-size: 2rem;
          }

          .company-name {
            font-size: 1.2rem;
          }

          .job-meta {
            flex-direction: column;
            gap: 12px;
          }

          .action-buttons {
            justify-content: center;
          }

          .job-section {
            padding: 24px;
          }

          .company-card,
          .application-section {
            padding: 20px;
          }

          .main-content {
            max-height: 40vh;
          }
        }

        @media (max-width: 480px) {
          .job-title {
            font-size: 1.5rem;
          }

          .company-name {
            font-size: 1.1rem;
          }

          .action-buttons {
            flex-direction: column;
            width: 100%;
          }

          .btn-apply,
          .btn-save {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default JobDetail;
