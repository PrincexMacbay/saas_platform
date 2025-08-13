import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, applyForJob, toggleSavedJob } from '../../services/careerService';
import { useAuth } from '../../contexts/AuthContext';

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
    <div className="job-detail">
      <div className="row">
        {/* Job Details */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="card-title mb-2">{job.title}</h2>
                  <p className="text-muted mb-0">
                    {job.employer.companyName || `${job.employer.firstName} ${job.employer.lastName}`}
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className={`btn ${job.isSaved ? 'btn-danger' : 'btn-outline-primary'}`}
                    onClick={handleSaveJob}
                    disabled={user?.userType !== 'individual'}
                  >
                    <i className={`fas ${job.isSaved ? 'fa-heart' : 'fa-heart'}`}></i>
                    {job.isSaved ? ' Saved' : ' Save'}
                  </button>
                  {user?.userType === 'individual' && (
                    <button
                      className="btn btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#applyModal"
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Apply Now
                    </button>
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className={`badge bg-${getJobTypeColor(job.jobType)}`}>
                  {job.jobType.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`badge bg-${getExperienceLevelColor(job.experienceLevel)}`}>
                  {job.experienceLevel.toUpperCase()}
                </span>
                {job.remoteWork && (
                  <span className="badge bg-info">
                    <i className="fas fa-home"></i> Remote
                  </span>
                )}
                {job.employer.industry && (
                  <span className="badge bg-secondary">
                    {job.employer.industry}
                  </span>
                )}
              </div>

              <div className="row text-muted mb-4">
                <div className="col-md-4">
                  <i className="fas fa-map-marker-alt"></i> {job.location}
                </div>
                <div className="col-md-4">
                  <i className="fas fa-money-bill-wave"></i> {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </div>
                <div className="col-md-4">
                  <i className="fas fa-calendar"></i> Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mb-4">
                <h5>Job Description</h5>
                <p className="text-muted">{job.description}</p>
              </div>

              {job.requirements && (
                <div className="mb-4">
                  <h5>Requirements</h5>
                  <p className="text-muted">{job.requirements}</p>
                </div>
              )}

              {job.benefits && (
                <div className="mb-4">
                  <h5>Benefits</h5>
                  <p className="text-muted">{job.benefits}</p>
                </div>
              )}

              {job.applicationDeadline && (
                <div className="alert alert-info">
                  <i className="fas fa-clock me-2"></i>
                  Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">About the Company</h6>
            </div>
            <div className="card-body">
              {job.employer.companyLogo && (
                <div className="text-center mb-3">
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${job.employer.companyLogo}`}
                    alt={job.employer.companyName || job.employer.firstName}
                    className="img-fluid"
                    style={{ maxHeight: '100px', borderRadius: '8px' }}
                  />
                </div>
              )}
              
              <h6>{job.employer.companyName || `${job.employer.firstName} ${job.employer.lastName}`}</h6>
              
              {job.employer.industry && (
                <p className="text-muted mb-2">
                  <i className="fas fa-industry me-2"></i>
                  {job.employer.industry}
                </p>
              )}
              
              {job.employer.location && (
                <p className="text-muted mb-2">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {job.employer.location}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {user?.userType === 'individual' && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Quick Actions</h6>
              </div>
              <div className="card-body">
                <button
                  className="btn btn-primary w-100 mb-2"
                  data-bs-toggle="modal"
                  data-bs-target="#applyModal"
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Apply for this position
                </button>
                <button
                  className={`btn ${job.isSaved ? 'btn-danger' : 'btn-outline-primary'} w-100`}
                  onClick={handleSaveJob}
                >
                  <i className={`fas ${job.isSaved ? 'fa-heart' : 'fa-heart'}`}></i>
                  {job.isSaved ? ' Remove from Saved' : ' Save for Later'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {user?.userType === 'individual' && (
        <div className="modal fade" id="applyModal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Apply for {job.title}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form onSubmit={handleApply}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="coverLetter" className="form-label">Cover Letter</label>
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

                  <div className="mb-3">
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={applying}
                  >
                    {applying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
