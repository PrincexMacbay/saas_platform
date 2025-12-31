import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CompanyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // '7', '30', '90'

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

  // Filter chart data based on time range
  const getFilteredChartData = () => {
    if (!analytics.jobsOverTime) return [];
    const days = parseInt(timeRange);
    return analytics.jobsOverTime.slice(-days);
  };

  const chartData = getFilteredChartData();

  const statCards = [
    {
      title: 'Total Jobs Posted',
      value: analytics.totalJobs || 0,
      icon: 'fas fa-briefcase',
      color: '#3498db',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Total Applications',
      value: analytics.totalApplications || 0,
      icon: 'fas fa-file-alt',
      color: '#2ecc71',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Active Job Postings',
      value: analytics.activeJobs || 0,
      icon: 'fas fa-check-circle',
      color: '#27ae60',
      bgColor: '#d5f4e6'
    },
    {
      title: 'Pending Applications',
      value: analytics.pendingApplications || 0,
      icon: 'fas fa-clock',
      color: '#f39c12',
      bgColor: '#fff3e0'
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
              </div>
              <h3 className="analytics-stat-value">{stat.value}</h3>
              <p className="analytics-stat-title">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="analytics-charts-grid">
          {/* Jobs and Applications Over Time Chart */}
          <div className="analytics-chart-card">
            <div className="analytics-chart-card-header">
              <div>
                <h3 className="analytics-chart-title">Jobs Posted & Applications Over Time</h3>
                <p className="analytics-chart-subtitle">Last {timeRange} days</p>
              </div>
              <select 
                className="analytics-chart-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={Math.floor(chartData.length / 10)}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="jobs" 
                    stroke="#3498db" 
                    strokeWidth={2}
                    name="Jobs Posted"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#2ecc71" 
                    strokeWidth={2}
                    name="Applications"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-chart-placeholder">
                <i className="fas fa-chart-line analytics-chart-placeholder-icon"></i>
                <p className="analytics-chart-placeholder-text">No data available for this period</p>
              </div>
            )}
          </div>

          {/* Applications Per Job Chart */}
          <div className="analytics-chart-card">
            <div className="analytics-chart-card-header">
              <div>
                <h3 className="analytics-chart-title">Applications Per Job</h3>
                <p className="analytics-chart-subtitle">Top 10 job postings</p>
              </div>
            </div>
            {analytics.applicationsPerJob && analytics.applicationsPerJob.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={analytics.applicationsPerJob}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="jobTitle" 
                    type="category"
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="applications" 
                    fill="#3498db"
                    name="Applications"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="analytics-chart-placeholder">
                <i className="fas fa-chart-bar analytics-chart-placeholder-icon"></i>
                <p className="analytics-chart-placeholder-text">No applications data available</p>
              </div>
            )}
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
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
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
    flex-wrap: wrap;
    gap: 12px;
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
    transition: all 0.2s ease;
  }

  .analytics-chart-select:hover {
    border-color: #3498db;
  }

  .analytics-chart-select:focus {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  .analytics-chart-placeholder {
    height: 300px;
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

    .analytics-stats-grid,
    .analytics-charts-grid {
      grid-template-columns: 1fr;
    }

    .analytics-chart-card-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

export default CompanyAnalytics;
