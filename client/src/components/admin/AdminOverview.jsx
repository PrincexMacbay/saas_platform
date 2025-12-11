import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import './AdminOverview.css';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { t } = useLanguage();

  useEffect(() => {
    fetchDashboardStats(selectedPeriod);
  }, [selectedPeriod]);

  const fetchDashboardStats = async (period) => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats(period);
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(t('admin.dashboard.failed.load'));
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db] mb-4"></div>
          <p className="text-gray-600">{t('admin.dashboard.loading.stats') || 'Loading dashboard statistics...'}</p>
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
        <p className="text-red-800 font-medium mb-4">{t('admin.dashboard.failed.load') || 'Failed to load dashboard statistics'}</p>
        <button 
          onClick={() => fetchDashboardStats(selectedPeriod)} 
          className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {t('admin.dashboard.retry') || 'Retry'}
        </button>
      </div>
    );
  }

  const { overview, changes, systemHealth, recentActivity } = stats;

  const formatChange = (change) => {
    if (change === undefined || change === null) return '0%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const statCards = [
    {
      title: t('admin.stats.total.users') || 'Total Users',
      value: overview.totalUsers,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      change: formatChange(changes?.totalUsers),
      changeType: (changes?.totalUsers || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: t('admin.stats.active.users') || 'Active Users',
      value: overview.activeUsers,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      change: formatChange(changes?.activeUsers),
      changeType: (changes?.activeUsers || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: t('admin.stats.total.plans') || 'Total Plans',
      value: overview.totalPlans,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      change: formatChange(changes?.totalPlans),
      changeType: (changes?.totalPlans || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: t('admin.stats.active.subscriptions') || 'Active Subscriptions',
      value: overview.activeSubscriptions,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      change: formatChange(changes?.activeSubscriptions),
      changeType: (changes?.activeSubscriptions || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: t('admin.stats.total.jobs') || 'Total Jobs',
      value: overview.totalJobs,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-indigo-600',
      change: formatChange(changes?.totalJobs),
      changeType: (changes?.totalJobs || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: t('admin.stats.job.applications') || 'Job Applications',
      value: overview.totalApplications,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'teal',
      bgGradient: 'from-teal-500 to-teal-600',
      change: formatChange(changes?.totalApplications),
      changeType: (changes?.totalApplications || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: t('admin.stats.total.revenue') || 'Total Revenue',
      value: `$${overview.totalRevenue?.toLocaleString() || '0'}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-emerald-600',
      change: formatChange(changes?.totalRevenue),
      changeType: (changes?.totalRevenue || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: t('admin.stats.monthly.revenue') || 'Monthly Revenue',
      value: `$${overview.monthlyRevenue?.toLocaleString() || '0'}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      change: formatChange(changes?.monthlyRevenue),
      changeType: (changes?.monthlyRevenue || 0) >= 0 ? 'positive' : 'negative'
    }
  ];

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemoryUsage = (bytes) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="admin-overview">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('admin.dashboard.overview') || 'Dashboard Overview'}
            </h1>
            <p className="text-gray-600">
              {t('admin.dashboard.description') || 'Monitor your platform performance and key metrics'}
            </p>
          </div>
          
          {/* Period Selection */}
          <div className="flex items-center gap-3">
            <label htmlFor="period-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {t('admin.dashboard.select.period') || 'Time Period:'}
            </label>
            <select 
              id="period-select" 
              value={selectedPeriod} 
              onChange={handlePeriodChange}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent transition-all cursor-pointer"
            >
              <option value="week">{t('admin.dashboard.period.week') || 'Last Week'}</option>
              <option value="month">{t('admin.dashboard.period.month') || 'Last Month'}</option>
              <option value="quarter">{t('admin.dashboard.period.quarter') || 'Last Quarter'}</option>
              <option value="year">{t('admin.dashboard.period.year') || 'Last Year'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.bgGradient} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                {stat.icon}
              </div>
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.changeType === 'positive' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span>{stat.change}</span>
              <span className="text-gray-500 text-xs font-normal">vs previous period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-[#3498db]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {t('admin.system.health') || 'System Health'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {t('admin.system.server.uptime') || 'Server Uptime'}
              </div>
              <div className="text-lg font-bold text-gray-900">{formatUptime(systemHealth.serverUptime)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {t('admin.system.memory.usage') || 'Memory Usage'}
              </div>
              <div className="text-lg font-bold text-gray-900">{formatMemoryUsage(systemHealth.memoryUsage.heapUsed)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {t('admin.system.node.version') || 'Node Version'}
              </div>
              <div className="text-lg font-bold text-gray-900">{systemHealth.nodeVersion}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {t('admin.system.platform') || 'Platform'}
              </div>
              <div className="text-lg font-bold text-gray-900 capitalize">{systemHealth.platform}</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {t('admin.recent.activity') || 'Recent Activity'}
            </h3>
          </div>
          
          <div className="space-y-6">
            {/* Latest Users */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                {t('admin.latest.users') || 'Latest Users'}
              </h4>
              <div className="space-y-3">
                {recentActivity.recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3498db] to-[#2980b9] flex items-center justify-center text-white font-semibold text-sm">
                      {user.firstName ? user.firstName[0] : user.username[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        }
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Jobs */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                {t('admin.latest.jobs') || 'Latest Jobs'}
              </h4>
              <div className="space-y-3">
                {recentActivity.recentJobs.map((job, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{job.title}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {job.category} • {job.employer?.username || t('admin.unknown') || 'Unknown'} • {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
