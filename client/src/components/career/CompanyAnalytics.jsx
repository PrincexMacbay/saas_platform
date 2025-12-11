import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompanyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🚀 CompanyAnalytics component mounted');
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      console.log('🚀 CompanyAnalytics: Starting fetchAnalytics');
      console.log('🚀 API URL:', apiUrl);
      console.log('🚀 Full endpoint:', `${apiUrl}/career/company/analytics`);
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(
        `${apiUrl}/career/company/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('🚀 Analytics response:', response.data);
      setAnalytics(response.data.data);
    } catch (err) {
      console.error('🚨 Error fetching analytics:', err);
      console.error('🚨 Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading-container">
        <div className="analytics-spinner"></div>
        <p className="analytics-loading-text">Loading analytics...</p>
        <style>{getStyles()}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error-container">
        <i className="fas fa-exclamation-circle analytics-error-icon"></i>
        <h3 className="analytics-error-title">Oops! Something went wrong</h3>
        <p className="analytics-error-text">{error}</p>
        <button className="analytics-retry-button" onClick={fetchAnalytics}>
          <i className="fas fa-redo" style={{ marginRight: '8px' }}></i>
          Try Again
        </button>
        <style>{getStyles()}</style>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-empty-container">
        <i className="fas fa-chart-line analytics-empty-icon"></i>
        <h3 className="analytics-empty-title">No Analytics Data</h3>
        <p className="analytics-empty-text">There's no analytics data available for this company yet.</p>
        <style>{getStyles()}</style>
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
    <>
      <style>{getStyles()}</style>
      <div className="analytics-container">
        {/* Stats Grid */}
        <div className="analytics-stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="analytics-stat-card">
              <div className="analytics-stat-card-header">
                <div className="analytics-stat-icon-container" style={{ backgroundColor: stat.bgColor }}>
                  <i className={stat.icon} style={{ color: stat.color, fontSize: '1.5rem' }}></i>
                </div>
                <span className="analytics-stat-change" style={{
                  color: stat.changeType === 'positive' ? '#2ecc71' : '#e74c3c'
                }}>
                  {stat.change}
                </span>
              </div>
              <h3 className="analytics-stat-value">{stat.value}</h3>
              <p className="analytics-stat-title">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="analytics-charts-grid">
          {/* User Activity Chart */}
          <div className="analytics-chart-card">
            <div className="analytics-chart-card-header">
              <div>
                <h3 className="analytics-chart-title">User Activity</h3>
                <p className="analytics-chart-subtitle">Last 30 days</p>
              </div>
              <select className="analytics-chart-select">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="analytics-chart-placeholder">
              <i className="fas fa-chart-area analytics-chart-placeholder-icon"></i>
              <p className="analytics-chart-placeholder-text">Chart visualization coming soon</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="analytics-chart-card">
            <div className="analytics-chart-card-header">
              <div>
                <h3 className="analytics-chart-title">Revenue Trends</h3>
                <p className="analytics-chart-subtitle">Monthly breakdown</p>
              </div>
              <select className="analytics-chart-select">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="analytics-chart-placeholder">
              <i className="fas fa-chart-line analytics-chart-placeholder-icon"></i>
              <p className="analytics-chart-placeholder-text">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        {/* Additional Info Grid */}
        <div className="analytics-info-grid">
          {/* Recent Activities */}
          <div className="analytics-info-card">
            <div className="analytics-info-card-header">
              <h3 className="analytics-info-card-title">
                <i className="fas fa-history analytics-info-card-icon"></i>
                Recent Activities
              </h3>
            </div>
            <div className="analytics-activity-list">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="analytics-activity-item">
                  <div className="analytics-activity-dot"></div>
                  <div className="analytics-activity-content">
                    <p className="analytics-activity-text">New user registration</p>
                    <span className="analytics-activity-time">2 hours ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="analytics-info-card">
            <div className="analytics-info-card-header">
              <h3 className="analytics-info-card-title">
                <i className="fas fa-trophy analytics-info-card-icon"></i>
                Top Performers
              </h3>
            </div>
            <div className="analytics-performer-list">
              {[1, 2, 3, 4].map((rank, index) => (
                <div key={index} className="analytics-performer-item">
                  <div className="analytics-performer-rank">{rank}</div>
                  <div className="analytics-performer-info">
                    <p className="analytics-performer-name">Team Member {rank}</p>
                    <div className="analytics-performer-progress">
                      <div className="analytics-performer-progress-bar" style={{
                        width: `${100 - (rank * 15)}%`
                      }}></div>
                    </div>
                  </div>
                  <span className="analytics-performer-score">{100 - (rank * 10)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Move styles to a function that returns CSS string
const getStyles = () => `
  @keyframes analytics-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .analytics-container {
    padding: 0;
    background: transparent;
    min-height: auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 20px;
  }

  .analytics-page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .analytics-page-title-icon {
    color: #3498db;
    font-size: 1.8rem;
  }

  .analytics-page-subtitle {
    color: #7f8c8d;
    font-size: 1rem;
    margin: 0;
  }

  .analytics-refresh-button {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 24px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    transition: all 0.3s ease;
  }

  .analytics-refresh-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
  }

  .analytics-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 30px;
  }

  .analytics-stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #e2e8f0;
    cursor: pointer;
  }

  .analytics-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #3498db;
  }

  .analytics-stat-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .analytics-stat-icon-container {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .analytics-stat-change {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .analytics-stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 8px 0;
  }

  .analytics-stat-title {
    font-size: 0.95rem;
    color: #7f8c8d;
    margin: 0;
    font-weight: 500;
  }

  .analytics-charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 30px;
  }

  .analytics-chart-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .analytics-chart-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .analytics-chart-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .analytics-chart-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 4px 0;
  }

  .analytics-chart-subtitle {
    font-size: 0.85rem;
    color: #7f8c8d;
    margin: 0;
  }

  .analytics-chart-select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background: white;
    font-size: 0.9rem;
    color: #2c3e50;
    cursor: pointer;
    outline: none;
  }

  .analytics-chart-placeholder {
    height: 250px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .analytics-chart-placeholder-icon {
    font-size: 3rem;
    color: #bdc3c7;
  }

  .analytics-chart-placeholder-text {
    color: #95a5a6;
    font-size: 0.95rem;
    margin: 0;
  }

  .analytics-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
  }

  .analytics-info-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
  }

  .analytics-info-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .analytics-info-card-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e2e8f0;
  }

  .analytics-info-card-title {
    font-size: 1.15rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .analytics-info-card-icon {
    color: #3498db;
  }

  .analytics-activity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .analytics-activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .analytics-activity-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #3498db;
    margin-top: 6px;
    flex-shrink: 0;
  }

  .analytics-activity-content {
    flex: 1;
  }

  .analytics-activity-text {
    color: #2c3e50;
    font-size: 0.95rem;
    margin: 0 0 4px 0;
    font-weight: 500;
  }

  .analytics-activity-time {
    color: #95a5a6;
    font-size: 0.85rem;
  }

  .analytics-performer-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .analytics-performer-item {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .analytics-performer-rank {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  .analytics-performer-info {
    flex: 1;
  }

  .analytics-performer-name {
    color: #2c3e50;
    font-size: 0.95rem;
    margin: 0 0 6px 0;
    font-weight: 500;
  }

  .analytics-performer-progress {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
  }

  .analytics-performer-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #3498db 0%, #2ecc71 100%);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .analytics-performer-score {
    color: #2c3e50;
    font-size: 0.9rem;
    font-weight: 600;
    min-width: 50px;
    text-align: right;
  }

  .analytics-loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 20px;
  }

  .analytics-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: analytics-spin 1s linear infinite;
  }

  .analytics-loading-text {
    color: #7f8c8d;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .analytics-error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 16px;
    text-align: center;
    padding: 20px;
  }

  .analytics-error-icon {
    font-size: 4rem;
    color: #e74c3c;
  }

  .analytics-error-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .analytics-error-text {
    font-size: 1rem;
    color: #7f8c8d;
    margin: 0;
  }

  .analytics-retry-button {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 28px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
    transition: all 0.3s ease;
    margin-top: 8px;
  }

  .analytics-retry-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
  }

  .analytics-empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 16px;
    text-align: center;
    padding: 20px;
  }

  .analytics-empty-icon {
    font-size: 4rem;
    color: #bdc3c7;
  }

  .analytics-empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .analytics-empty-text {
    font-size: 1rem;
    color: #7f8c8d;
    margin: 0;
  }

  @media (max-width: 768px) {
    .analytics-container {
      padding: 15px;
    }

    .analytics-page-title {
      font-size: 1.5rem;
    }

    .analytics-stats-grid,
    .analytics-charts-grid,
    .analytics-info-grid {
      grid-template-columns: 1fr;
    }

    .analytics-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

export default CompanyAnalytics;