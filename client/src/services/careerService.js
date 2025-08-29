import api from './api';

// Update user type (individual/company)
export const updateUserType = async (userData) => {
  const response = await api.put('/career/user-type', userData);
  return response.data;
};

// Get all jobs with filters
export const getJobs = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });
  
  const response = await api.get(`/career/jobs?${params.toString()}`);
  return response.data;
};

// Get single job
export const getJob = async (jobId) => {
  const response = await api.get(`/career/jobs/${jobId}`);
  return response.data;
};

// Create new job posting
export const createJob = async (jobData) => {
  const response = await api.post('/career/jobs', jobData);
  return response.data;
};

// Update existing job posting
export const updateJob = async (jobId, jobData) => {
  const response = await api.put(`/career/jobs/${jobId}`, jobData);
  return response.data;
};

// Apply for a job
export const applyForJob = async (jobId, applicationData) => {
  const response = await api.post(`/career/jobs/${jobId}/apply`, applicationData);
  return response.data;
};

// Get user's job applications
export const getUserApplications = async (page = 1) => {
  const response = await api.get(`/career/applications?page=${page}`);
  return response.data;
};

// Save/unsave a job
export const toggleSavedJob = async (jobId) => {
  const response = await api.post(`/career/jobs/${jobId}/save`);
  return response.data;
};

// Get user's saved jobs
export const getSavedJobs = async (page = 1) => {
  const response = await api.get(`/career/saved-jobs?page=${page}`);
  return response.data;
};

// Get company's posted jobs
export const getCompanyJobs = async (page = 1, limit = null) => {
  const params = new URLSearchParams({ page: page.toString() });
  if (limit) params.append('limit', limit.toString());
  
  const response = await api.get(`/career/company/jobs?${params}`);
  return response.data;
};

// Update job status
export const updateJobStatus = async (jobId, status) => {
  const response = await api.put(`/career/jobs/${jobId}/status`, { status });
  return response.data;
};

// Update application status
export const updateApplicationStatus = async (applicationId, status, notes) => {
  const response = await api.put(`/career/applications/${applicationId}/status`, { status, notes });
  return response.data;
};

// Get applications for company's jobs
export const getCompanyApplications = async (page = 1, status = null, jobId = null, limit = null) => {
  const params = new URLSearchParams({ page: page.toString() });
  if (status) params.append('status', status);
  if (jobId) params.append('jobId', jobId.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await api.get(`/career/company/applications?${params}`);
  return response.data;
};