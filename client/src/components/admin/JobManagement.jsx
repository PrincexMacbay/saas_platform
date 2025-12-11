import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import './JobManagement.css';

const JobManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    limit: 10
  });
  const [jobData, setJobData] = useState({
    stats: null,
    jobs: [],
    pagination: {}
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchJobData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category, filters.page]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      console.log('Fetching job management data with filters:', filters);
      const response = await adminService.getJobManagementData(filters);
      console.log('Job management data response:', response);
      setJobData(response.data || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching job management data:', err);
      setError('Failed to load job management data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateSuccessRate = () => {
    const stats = jobData.stats || {};
    const totalApps = parseInt(stats.totalApplications) || 0;
    const acceptedApps = parseInt(stats.acceptedApplications) || 0;
    if (totalApps === 0) return 0;
    return ((acceptedApps / totalApps) * 100).toFixed(1);
  };

  const calculateAvgApplicationsPerJob = () => {
    const stats = jobData.stats || {};
    const totalJobs = parseInt(stats.totalJobs) || 0;
    const totalApps = parseInt(stats.totalApplications) || 0;
    if (totalJobs === 0) return 0;
    return (totalApps / totalJobs).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db] mb-4"></div>
          <p className="text-gray-600">Loading job management data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-800 font-medium mb-4">{error}</p>
        <button 
          onClick={fetchJobData} 
          className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = jobData.stats || {};

  return (
    <div className="job-management">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('admin.job.title') || 'Job Management'}
            </h1>
            <p className="text-gray-600">
              {t('admin.job.description') || 'Manage job postings, applications, and career center analytics'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{t('admin.job.status') || 'Status:'}</label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent transition-all cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            >
              <option value="">{t('admin.job.all.statuses') || 'All Statuses'}</option>
              <option value="active">{t('admin.job.active') || 'Active'}</option>
              <option value="paused">{t('admin.job.paused') || 'Paused'}</option>
              <option value="closed">{t('admin.job.closed') || 'Closed'}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{t('admin.job.category') || 'Category:'}</label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent transition-all cursor-pointer"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            >
              <option value="">{t('admin.job.all.categories') || 'All Categories'}</option>
              <option value="technology">{t('admin.job.technology') || 'Technology'}</option>
              <option value="marketing">{t('admin.job.marketing') || 'Marketing'}</option>
              <option value="sales">{t('admin.job.sales') || 'Sales'}</option>
              <option value="design">{t('admin.job.design') || 'Design'}</option>
              <option value="other">{t('admin.job.other') || 'Other'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('admin.job.statistics') || 'Job Statistics'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalJobs || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeJobs || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Closed Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.closedJobs || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Accepted Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.acceptedApplications || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="text-sm font-medium text-blue-700 mb-1">Success Rate</div>
            <div className="text-4xl font-bold text-blue-900 mb-2">{calculateSuccessRate()}%</div>
            <div className="text-sm text-blue-600">Acceptance rate of applications</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="text-sm font-medium text-purple-700 mb-1">Avg Applications/Job</div>
            <div className="text-4xl font-bold text-purple-900 mb-2">{calculateAvgApplicationsPerJob()}</div>
            <div className="text-sm text-purple-600">Average applications per job posting</div>
          </div>
        </div>
      </div>

      {/* Recent Job Postings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('admin.job.recent.postings') || 'Recent Job Postings'}
          </h3>
        </div>
        <div className="space-y-4">
          {jobData.jobs && jobData.jobs.length > 0 ? (
            <>
              {jobData.jobs.map(job => (
                <div key={job.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">
                          {job.employer.firstName ? `${job.employer.firstName} ${job.employer.lastName}` : job.employer.username}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{job.category}</span>
                        <span>•</span>
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">
                        {job.applications ? job.applications.length : 0} applications
                      </span>
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-[#3498db] border border-[#3498db] rounded-lg hover:bg-[#3498db] hover:text-white transition-colors">View</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">{t('admin.job.edit') || 'Edit'}</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Manage</button>
                  </div>
                </div>
              ))}
              {/* Pagination */}
              {jobData.pagination && jobData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Page {filters.page} of {jobData.pagination.totalPages}
                  </span>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={filters.page >= jobData.pagination.totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">No jobs found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
