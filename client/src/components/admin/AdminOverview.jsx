import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import './AdminOverview.css';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(t('admin.dashboard.failed.load'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t('admin.dashboard.loading.stats')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{t('admin.dashboard.failed.load')}</p>
        <button onClick={fetchDashboardStats} className="btn btn-primary">
          {t('admin.dashboard.retry')}
        </button>
      </div>
    );
  }

  const { overview, systemHealth, recentActivity } = stats;

  const statCards = [
    {
      title: t('admin.stats.total.users'),
      value: overview.totalUsers,
      icon: '👥',
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: t('admin.stats.active.users'),
      value: overview.activeUsers,
      icon: '✅',
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: t('admin.stats.total.plans'),
      value: overview.totalPlans,
      icon: '💳',
      color: 'purple',
      change: '+3',
      changeType: 'positive'
    },
    {
      title: t('admin.stats.active.subscriptions'),
      value: overview.activeSubscriptions,
      icon: '🔄',
      color: 'orange',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: t('admin.stats.total.jobs'),
      value: overview.totalJobs,
      icon: '💼',
      color: 'indigo',
      change: '+7',
      changeType: 'positive'
    },
    {
      title: t('admin.stats.job.applications'),
      value: overview.totalApplications,
      icon: '📝',
      color: 'teal',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: t('admin.stats.total.revenue'),
      value: `$${overview.totalRevenue?.toLocaleString() || '0'}`,
      icon: '💰',
      color: 'emerald',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: t('admin.stats.monthly.revenue'),
      value: `$${overview.monthlyRevenue?.toLocaleString() || '0'}`,
      icon: '📈',
      color: 'green',
      change: '+12%',
      changeType: 'positive'
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
      <div className="overview-header">
        <h2>{t('admin.dashboard.overview')}</h2>
        <p>{t('admin.dashboard.description')}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">{stat.title}</span>
              <div className={`stat-card-icon stat-card-icon-${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className={`stat-card-change ${stat.changeType}`}>
              <span>{stat.change}</span>
              <span>{t('admin.stats.from.last.month')}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-content">
        <div className="overview-section">
          {/* System Health */}
          <div className="chart-container">
            <h3 className="chart-title">{t('admin.system.health')}</h3>
            <div className="system-health-grid">
              <div className="health-metric">
                <div className="health-metric-label">{t('admin.system.server.uptime')}</div>
                <div className="health-metric-value">{formatUptime(systemHealth.serverUptime)}</div>
              </div>
              <div className="health-metric">
                <div className="health-metric-label">{t('admin.system.memory.usage')}</div>
                <div className="health-metric-value">{formatMemoryUsage(systemHealth.memoryUsage.heapUsed)}</div>
              </div>
              <div className="health-metric">
                <div className="health-metric-label">{t('admin.system.node.version')}</div>
                <div className="health-metric-value">{systemHealth.nodeVersion}</div>
              </div>
              <div className="health-metric">
                <div className="health-metric-label">{t('admin.system.platform')}</div>
                <div className="health-metric-value">{systemHealth.platform}</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="chart-container">
            <h3 className="chart-title">{t('admin.recent.activity')}</h3>
            <div className="recent-activity">
              <div className="activity-section">
                <h4>{t('admin.latest.users')}</h4>
                <div className="activity-list">
                  {recentActivity.recentUsers.map((user, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-avatar">
                        {user.firstName ? user.firstName[0] : user.username[0]}
                      </div>
                      <div className="activity-details">
                        <div className="activity-name">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.username
                          }
                        </div>
                        <div className="activity-meta">
                          {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-section">
                <h4>{t('admin.latest.jobs')}</h4>
                <div className="activity-list">
                  {recentActivity.recentJobs.map((job, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">💼</div>
                      <div className="activity-details">
                        <div className="activity-name">{job.title}</div>
                        <div className="activity-meta">
                          {job.category} • {job.employer?.username || t('admin.unknown')} • {new Date(job.createdAt).toLocaleDateString()}
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
    </div>
  );
};

export default AdminOverview;
