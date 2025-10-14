import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import './AdminOverview.css';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchDashboardStats} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const { overview, systemHealth, recentActivity } = stats;

  const statCards = [
    {
      title: 'Total Users',
      value: overview.totalUsers,
      icon: '👥',
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Users',
      value: overview.activeUsers,
      icon: '✅',
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Plans',
      value: overview.totalPlans,
      icon: '💳',
      color: 'purple',
      change: '+3',
      changeType: 'positive'
    },
    {
      title: 'Active Subscriptions',
      value: overview.activeSubscriptions,
      icon: '🔄',
      color: 'orange',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Jobs',
      value: overview.totalJobs,
      icon: '💼',
      color: 'indigo',
      change: '+7',
      changeType: 'positive'
    },
    {
      title: 'Job Applications',
      value: overview.totalApplications,
      icon: '📝',
      color: 'teal',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `$${overview.totalRevenue?.toLocaleString() || '0'}`,
      icon: '💰',
      color: 'emerald',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Monthly Revenue',
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
        <h2>Dashboard Overview</h2>
        <p>System statistics and health monitoring</p>
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
              <span>from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-content">
        <div className="overview-section">
          {/* System Health */}
          <div className="chart-container">
            <h3 className="chart-title">System Health</h3>
            <div className="system-health-grid">
              <div className="health-metric">
                <div className="health-metric-label">Server Uptime</div>
                <div className="health-metric-value">{formatUptime(systemHealth.serverUptime)}</div>
              </div>
              <div className="health-metric">
                <div className="health-metric-label">Memory Usage</div>
                <div className="health-metric-value">{formatMemoryUsage(systemHealth.memoryUsage.heapUsed)}</div>
              </div>
              <div className="health-metric">
                <div className="health-metric-label">Node Version</div>
                <div className="health-metric-value">{systemHealth.nodeVersion}</div>
              </div>
              <div className="health-metric">
                <div className="health-metric-label">Platform</div>
                <div className="health-metric-value">{systemHealth.platform}</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="chart-container">
            <h3 className="chart-title">Recent Activity</h3>
            <div className="recent-activity">
              <div className="activity-section">
                <h4>Latest Users</h4>
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
                <h4>Latest Jobs</h4>
                <div className="activity-list">
                  {recentActivity.recentJobs.map((job, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">💼</div>
                      <div className="activity-details">
                        <div className="activity-name">{job.title}</div>
                        <div className="activity-meta">
                          {job.category} • {job.user?.username || 'Unknown'} • {new Date(job.createdAt).toLocaleDateString()}
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
