import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CompanyAnalytics = () => {
  const { companyId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('CompanyAnalytics component rendered with companyId:', companyId);

  useEffect(() => {
    fetchAnalytics();
  }, [companyId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      console.log('Fetching analytics for company:', companyId);
      console.log('API URL:', apiUrl);
      
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(
        `${apiUrl}/companies/${companyId}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Analytics response:', response.data);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <i className="fas fa-exclamation-circle" style={styles.errorIcon}></i>
        <h3 style={styles.errorTitle}>Oops! Something went wrong</h3>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryButton} onClick={fetchAnalytics}>
          <i className="fas fa-redo" style={{ marginRight: '8px' }}></i>
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={styles.emptyContainer}>
        <i className="fas fa-chart-line" style={styles.emptyIcon}></i>
        <h3 style={styles.emptyTitle}>No Analytics Data</h3>
        <p style={styles.emptyText}>There's no analytics data available for this company yet.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: analytics.totalUsers || 0,
      icon: 'fas fa-users',
      color: '#3498db',
      bgColor: '#e3f2fd',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Projects',
      value: analytics.activeProjects || 0,
      icon: 'fas fa-project-diagram',
      color: '#2ecc71',
      bgColor: '#e8f5e9',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics.totalRevenue || 0).toLocaleString()}`,
      icon: 'fas fa-dollar-sign',
      color: '#f39c12',
      bgColor: '#fff3e0',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Pending Tasks',
      value: analytics.pendingTasks || 0,
      icon: 'fas fa-tasks',
      color: '#e74c3c',
      bgColor: '#ffebee',
      change: '-3%',
      changeType: 'negative'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>
            <i className="fas fa-chart-bar" style={styles.pageTitleIcon}></i>
            Company Analytics
          </h1>
          <p style={styles.pageSubtitle}>Real-time insights and performance metrics</p>
        </div>
        <button style={styles.refreshButton} onClick={fetchAnalytics}>
          <i className="fas fa-sync-alt" style={{ marginRight: '8px' }}></i>
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statCardHeader}>
              <div style={{ ...styles.statIconContainer, backgroundColor: stat.bgColor }}>
                <i className={stat.icon} style={{ ...styles.statIcon, color: stat.color }}></i>
              </div>
              <span style={{
                ...styles.statChange,
                color: stat.changeType === 'positive' ? '#2ecc71' : '#e74c3c'
              }}>
                {stat.change}
              </span>
            </div>
            <h3 style={styles.statValue}>{stat.value}</h3>
            <p style={styles.statTitle}>{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        {/* User Activity Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartCardHeader}>
            <div>
              <h3 style={styles.chartTitle}>User Activity</h3>
              <p style={styles.chartSubtitle}>Last 30 days</p>
            </div>
            <select style={styles.chartSelect}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div style={styles.chartPlaceholder}>
            <i className="fas fa-chart-area" style={styles.chartPlaceholderIcon}></i>
            <p style={styles.chartPlaceholderText}>Chart visualization coming soon</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartCardHeader}>
            <div>
              <h3 style={styles.chartTitle}>Revenue Trends</h3>
              <p style={styles.chartSubtitle}>Monthly breakdown</p>
            </div>
            <select style={styles.chartSelect}>
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div style={styles.chartPlaceholder}>
            <i className="fas fa-chart-line" style={styles.chartPlaceholderIcon}></i>
            <p style={styles.chartPlaceholderText}>Chart visualization coming soon</p>
          </div>
        </div>
      </div>

      {/* Additional Info Grid */}
      <div style={styles.infoGrid}>
        {/* Recent Activities */}
        <div style={styles.infoCard}>
          <div style={styles.infoCardHeader}>
            <h3 style={styles.infoCardTitle}>
              <i className="fas fa-history" style={styles.infoCardIcon}></i>
              Recent Activities
            </h3>
          </div>
          <div style={styles.activityList}>
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} style={styles.activityItem}>
                <div style={styles.activityDot}></div>
                <div style={styles.activityContent}>
                  <p style={styles.activityText}>New user registration</p>
                  <span style={styles.activityTime}>2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div style={styles.infoCard}>
          <div style={styles.infoCardHeader}>
            <h3 style={styles.infoCardTitle}>
              <i className="fas fa-trophy" style={styles.infoCardIcon}></i>
              Top Performers
            </h3>
          </div>
          <div style={styles.performerList}>
            {[1, 2, 3, 4].map((rank, index) => (
              <div key={index} style={styles.performerItem}>
                <div style={styles.performerRank}>{rank}</div>
                <div style={styles.performerInfo}>
                  <p style={styles.performerName}>Team Member {rank}</p>
                  <div style={styles.performerProgress}>
                    <div style={{
                      ...styles.performerProgressBar,
                      width: `${100 - (rank * 15)}%`
                    }}></div>
                  </div>
                </div>
                <span style={styles.performerScore}>{100 - (rank * 10)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    background: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  pageTitleIcon: {
    color: '#3498db',
    fontSize: '1.8rem'
  },
  pageSubtitle: {
    color: '#7f8c8d',
    fontSize: '1rem',
    margin: 0
  },
  refreshButton: {
    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(52, 152, 219, 0.4)'
    }
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    border: '1px solid #ecf0f1',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
    }
  },
  statCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  statIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statIcon: {
    fontSize: '1.5rem'
  },
  statChange: {
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '8px 0'
  },
  statTitle: {
    fontSize: '0.95rem',
    color: '#7f8c8d',
    margin: 0,
    fontWeight: '500'
  },

  // Charts Grid
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '30px'
  },
  chartCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: '1px solid #ecf0f1'
  },
  chartCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  chartTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: '0 0 4px 0'
  },
  chartSubtitle: {
    fontSize: '0.85rem',
    color: '#7f8c8d',
    margin: 0
  },
  chartSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    background: 'white',
    fontSize: '0.9rem',
    color: '#2c3e50',
    cursor: 'pointer',
    outline: 'none'
  },
  chartPlaceholder: {
    height: '250px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  chartPlaceholderIcon: {
    fontSize: '3rem',
    color: '#bdc3c7'
  },
  chartPlaceholderText: {
    color: '#95a5a6',
    fontSize: '0.95rem',
    margin: 0
  },

  // Info Grid
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },
  infoCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: '1px solid #ecf0f1'
  },
  infoCardHeader: {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #ecf0f1'
  },
  infoCardTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  infoCardIcon: {
    color: '#3498db'
  },

  // Activity List
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  activityDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#3498db',
    marginTop: '6px',
    flexShrink: 0
  },
  activityContent: {
    flex: 1
  },
  activityText: {
    color: '#2c3e50',
    fontSize: '0.95rem',
    margin: '0 0 4px 0',
    fontWeight: '500'
  },
  activityTime: {
    color: '#95a5a6',
    fontSize: '0.85rem'
  },

  // Performer List
  performerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  performerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  performerRank: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.95rem',
    flexShrink: 0
  },
  performerInfo: {
    flex: 1
  },
  performerName: {
    color: '#2c3e50',
    fontSize: '0.95rem',
    margin: '0 0 6px 0',
    fontWeight: '500'
  },
  performerProgress: {
    height: '6px',
    background: '#ecf0f1',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  performerProgressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #3498db 0%, #2ecc71 100%)',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  performerScore: {
    color: '#2c3e50',
    fontSize: '0.9rem',
    fontWeight: '600',
    minWidth: '50px',
    textAlign: 'right'
  },

  // Loading State
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px'
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid #ecf0f1',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: '1.1rem',
    fontWeight: '500'
  },

  // Error State
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
    textAlign: 'center',
    padding: '20px'
  },
  errorIcon: {
    fontSize: '4rem',
    color: '#e74c3c'
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: 0
  },
  errorText: {
    fontSize: '1rem',
    color: '#7f8c8d',
    margin: 0
  },
  retryButton: {
    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 28px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
    transition: 'all 0.3s ease',
    marginTop: '8px'
  },

  // Empty State
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
    textAlign: 'center',
    padding: '20px'
  },
  emptyIcon: {
    fontSize: '4rem',
    color: '#bdc3c7'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2c3e50',
    margin: 0
  },
  emptyText: {
    fontSize: '1rem',
    color: '#7f8c8d',
    margin: 0
  }
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default CompanyAnalytics;