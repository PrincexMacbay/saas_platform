import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, applyForJob, toggleSavedJob, getCompanyApplications } from '../../services/careerService';
import { useAuth } from '../../contexts/AuthContext';
import { buildImageUrl } from '../../utils/imageUtils';
import './JobDetail.css';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotificationModal();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null,
  });
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'apply', 'applications'

  const isJobOwner = user && job && job.userId === user.id;
  const isCompany = user?.profile?.userType === 'company';
  const isIndividual = user?.profile?.userType === 'individual';

  useEffect(() => {
    loadJob();
  }, [jobId]);

  useEffect(() => {
    if (isJobOwner && isCompany) {
      loadApplications();
    }
  }, [jobId, isJobOwner, isCompany]);

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

  const loadApplications = async () => {
    setLoadingApplications(true);
    try {
      const response = await getCompanyApplications(1, null, jobId, 100);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoadingApplications(false);
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
      
      showSuccess('Application submitted successfully!', 'Application Submitted');
      setApplicationData({ coverLetter: '', resume: null });
      setActiveTab('details');
    } catch (error) {
      console.error('Error applying for job:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      setError(errorMessage);
      showError(errorMessage, 'Application Error');
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

  const getStatusBadge = (status) => {
    const badges = {
      applied: { class: 'status-pending', label: 'Applied' },
      pending: { class: 'status-pending', label: 'Pending' },
      reviewing: { class: 'status-reviewed', label: 'Reviewing' },
      reviewed: { class: 'status-reviewed', label: 'Reviewed' },
      shortlisted: { class: 'status-shortlisted', label: 'Shortlisted' },
      interviewed: { class: 'status-reviewed', label: 'Interviewed' },
      rejected: { class: 'status-rejected', label: 'Rejected' },
      accepted: { class: 'status-accepted', label: 'Accepted' },
      hired: { class: 'status-accepted', label: 'Hired' }
    };
    const badge = badges[status?.toLowerCase()] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  const handleViewResume = (resumeUrl) => {
    if (!resumeUrl) return;
    const fullUrl = buildImageUrl(resumeUrl);
    window.open(fullUrl, '_blank');
  };

  const handleDownloadResume = (resumeUrl) => {
    if (!resumeUrl) return;
    const link = document.createElement('a');
    const fullUrl = buildImageUrl(resumeUrl);
    link.href = fullUrl;
    link.download = resumeUrl.split('/').pop() || resumeUrl.split('\\').pop() || 'resume.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="job-detail-loading">
        <div className="spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="job-detail-error">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-error">
        <div className="alert alert-warning">Job not found</div>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      {/* Header Section */}
      <div className="job-header">
        <div className="job-header-content">
          <div className="job-header-main">
            <div className="company-logo-section">
              {job.employer.companyProfile?.companyLogo ? (
                <img
                  src={buildImageUrl(job.employer.companyProfile.companyLogo)}
                  alt={job.employer.companyProfile?.companyName || job.employer.firstName}
                  className="company-logo"
                />
              ) : (
                <div className="company-logo-placeholder">
                  <i className="fas fa-building"></i>
                </div>
              )}
            </div>
            
            <div className="job-title-section">
              <h1 className="job-title">{job.title}</h1>
              <h2 className="company-name">
                {job.employer.companyProfile?.companyName || `${job.employer.firstName} ${job.employer.lastName}`}
              </h2>
              
              <div className="job-key-info">
                <div className="info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{job.location}</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-dollar-sign"></i>
                  <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-briefcase"></i>
                  <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                </div>
                <div className="info-item">
                  <i className="fas fa-user-tie"></i>
                  <span className="capitalize">{job.experienceLevel}</span>
                </div>
                {job.remoteWork && (
                  <div className="info-item remote-badge">
                    <i className="fas fa-home"></i>
                    <span>Remote</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="job-header-actions">
            {isIndividual && !isJobOwner && (
              <button
                className={`btn-save ${job.isSaved ? 'saved' : ''}`}
                onClick={handleSaveJob}
                title={job.isSaved ? 'Unsave job' : 'Save job'}
              >
                <i className={`fas fa-heart`}></i>
                {job.isSaved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {job.applicationDeadline && (
          <div className="deadline-banner">
            <i className="fas fa-clock"></i>
            <span>Application deadline: {new Date(job.applicationDeadline).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="job-tabs">
        <button
          className={`job-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <i className="fas fa-info-circle"></i>
          Job Details
        </button>
        {isIndividual && !isJobOwner && (
          <button
            className={`job-tab ${activeTab === 'apply' ? 'active' : ''}`}
            onClick={() => setActiveTab('apply')}
          >
            <i className="fas fa-paper-plane"></i>
            Apply Now
          </button>
        )}
        {isJobOwner && isCompany && (
          <button
            className={`job-tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <i className="fas fa-users"></i>
            Applications ({applications.length})
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="job-content">
        {activeTab === 'details' && (
          <div className="job-details-content">
            <div className="details-main">
              {/* Job Description */}
              <section className="detail-section">
                <div className="section-header">
                  <i className="fas fa-align-left"></i>
                  <h3>Job Description</h3>
                </div>
                <div className="section-body">
                  <p className="description-text">{job.description}</p>
                </div>
              </section>

              {/* Requirements */}
              {job.requirements && (
                <section className="detail-section">
                  <div className="section-header">
                    <i className="fas fa-list-check"></i>
                    <h3>Requirements</h3>
                  </div>
                  <div className="section-body">
                    <p className="description-text">{job.requirements}</p>
                  </div>
                </section>
              )}

              {/* Benefits */}
              {job.benefits && (
                <section className="detail-section">
                  <div className="section-header">
                    <i className="fas fa-gift"></i>
                    <h3>Benefits & Perks</h3>
                  </div>
                  <div className="section-body">
                    <p className="description-text">{job.benefits}</p>
                  </div>
                </section>
              )}

              {/* Additional Info */}
              <section className="detail-section">
                <div className="section-header">
                  <i className="fas fa-info-circle"></i>
                  <h3>Additional Information</h3>
                </div>
                <div className="section-body">
                  <div className="info-grid">
                    <div className="info-card">
                      <div className="info-label">Category</div>
                      <div className="info-value">{job.category}</div>
                    </div>
                    {job.employer.companyProfile?.industry && (
                      <div className="info-card">
                        <div className="info-label">Industry</div>
                        <div className="info-value">{job.employer.companyProfile.industry}</div>
                      </div>
                    )}
                    <div className="info-card">
                      <div className="info-label">Posted</div>
                      <div className="info-value">{new Date(job.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</div>
                    </div>
                    {job.updatedAt && job.updatedAt !== job.createdAt && (
                      <div className="info-card">
                        <div className="info-label">Last Updated</div>
                        <div className="info-value">{new Date(job.updatedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="details-sidebar">
              <div className="sidebar-card company-card">
                <h4>About the Company</h4>
                {job.employer.companyProfile?.companyLogo && (
                  <div className="company-logo-large">
                    <img
                      src={buildImageUrl(job.employer.companyProfile.companyLogo)}
                      alt={job.employer.companyProfile?.companyName}
                    />
                  </div>
                )}
                <h5>{job.employer.companyProfile?.companyName || `${job.employer.firstName} ${job.employer.lastName}`}</h5>
                
                <div className="company-details">
                  {job.employer.companyProfile?.industry && (
                    <div className="detail-row">
                      <i className="fas fa-industry"></i>
                      <span>{job.employer.companyProfile.industry}</span>
                    </div>
                  )}
                  {job.employer.companyProfile?.location && (
                    <div className="detail-row">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{job.employer.companyProfile.location}</span>
                    </div>
                  )}
                  {job.employer.companyProfile?.companySize && (
                    <div className="detail-row">
                      <i className="fas fa-users"></i>
                      <span>{job.employer.companyProfile.companySize}</span>
                    </div>
                  )}
                </div>
              </div>

              {isIndividual && !isJobOwner && (
                <div className="sidebar-card quick-apply">
                  <h4>Quick Apply</h4>
                  <p>Ready to apply? Click the "Apply Now" tab to submit your application.</p>
                  <button
                    className="btn-quick-apply"
                    onClick={() => setActiveTab('apply')}
                  >
                    <i className="fas fa-paper-plane"></i>
                    Go to Application
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'apply' && isIndividual && !isJobOwner && (
          <div className="job-apply-content">
            <div className="apply-container">
              <div className="apply-header">
                <h2>Apply for {job.title}</h2>
                <p>Submit your application to {job.employer.companyProfile?.companyName || `${job.employer.firstName} ${job.employer.lastName}`}</p>
              </div>

              <form onSubmit={handleApply} className="application-form">
                {error && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="coverLetter" className="form-label">
                    Cover Letter <span className="required">*</span>
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    className="form-control"
                    rows="8"
                    placeholder="Tell us why you're interested in this position and why you'd be a great fit. Include relevant experience and skills..."
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    required
                  ></textarea>
                  <small className="form-hint">Minimum 50 characters recommended</small>
                </div>

                <div className="form-group">
                  <label htmlFor="resume" className="form-label">
                    Resume <span className="optional"></span>
                  </label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      className="form-control file-input"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setApplicationData(prev => ({ ...prev, resume: e.target.files[0] }))}
                    />
                    {applicationData.resume && (
                      <div className="file-preview">
                        <i className="fas fa-file-pdf"></i>
                        <span>{applicationData.resume.name}</span>
                        <button
                          type="button"
                          className="btn-remove-file"
                          onClick={() => setApplicationData(prev => ({ ...prev, resume: null }))}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <small className="form-hint">Upload PDF, DOC, or DOCX file (Max 5MB)</small>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setActiveTab('details')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={applying}
                  >
                    {applying ? (
                      <>
                        <span className="spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'applications' && isJobOwner && isCompany && (
          <div className="job-applications-content">
            <div className="applications-header">
              <h2>Applications for {job.title}</h2>
              <p>{applications.length} {applications.length === 1 ? 'application' : 'applications'} received</p>
            </div>

            {loadingApplications ? (
              <div className="applications-loading">
                <div className="spinner"></div>
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="applications-empty">
                <i className="fas fa-inbox"></i>
                <h3>No applications yet</h3>
                <p>Applications for this job will appear here once candidates apply.</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map((application) => (
                  <div key={application.id} className="application-card">
                    <div className="application-card-header">
                      <div className="applicant-profile-section">
                        <div className="applicant-avatar-large">
                          {application.applicant?.firstName?.[0] || application.applicant?.username?.[0] || 'U'}
                        </div>
                        <div className="applicant-main-info">
                          <h3 className="applicant-name">
                            {application.applicant?.firstName} {application.applicant?.lastName}
                          </h3>
                          <div className="applicant-meta">
                            <span className="applicant-email">
                              <i className="fas fa-envelope"></i>
                              {application.applicant?.email}
                            </span>
                            <span className="application-date">
                              <i className="fas fa-calendar-alt"></i>
                              Applied {new Date(application.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="application-status-wrapper">
                        {getStatusBadge(application.status)}
                      </div>
                    </div>

                    <div className="application-card-body">
                      {application.coverLetter && (
                        <div className="application-section">
                          <div className="section-header">
                            <i className="fas fa-file-alt"></i>
                            <h4>Cover Letter</h4>
                          </div>
                          <div className="section-content">
                            <p>{application.coverLetter}</p>
                          </div>
                        </div>
                      )}

                      <div className="application-section">
                        <div className="section-header">
                          <i className="fas fa-file-pdf"></i>
                          <h4>Resume</h4>
                        </div>
                        <div className="section-content">
                          {application.resume ? (
                            <div className="resume-actions">
                              <button
                                className="btn-view-resume"
                                onClick={() => handleViewResume(application.resume)}
                                title="View Resume"
                              >
                                <i className="fas fa-eye"></i>
                                View Resume
                              </button>
                              <button
                                className="btn-download-resume"
                                onClick={() => handleDownloadResume(application.resume)}
                                title="Download Resume"
                              >
                                <i className="fas fa-download"></i>
                                Download Resume
                              </button>
                            </div>
                          ) : (
                            <div className="no-resume">
                              <i className="fas fa-file-slash"></i>
                              <span>No resume uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {application.notes && (
                        <div className="application-section application-notes-section">
                          <div className="section-header">
                            <i className="fas fa-sticky-note"></i>
                            <h4>Your Notes</h4>
                          </div>
                          <div className="section-content">
                            <p>{application.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
