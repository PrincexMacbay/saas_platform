import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MembershipDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'https://social-network-backend-w91a.onrender.com/api';
      console.log('Fetching from:', `${apiUrl}/membership/dashboard`);
      
      const response = await fetch(`${apiUrl}/membership/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Dashboard data received:', data);
      setDashboardData(data.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>Error loading dashboard: {error}</p>
        <button onClick={fetchDashboardData} className="retry-button">
          <i className="fas fa-redo"></i> Retry
        </button>
      </div>
    );
  }

  const { stats, recentPayments, chartData } = dashboardData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="membership-dashboard">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#3498db' }}>
            <i className="fas fa-users"></i>
          </div>
          <div className="kpi-content">
            <h3>{stats.totalSubscriptions}</h3>
            <p>Total Subscriptions</p>
            <span className="kpi-change positive">
              +{stats.newSubscriptions} this month
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#27ae60' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="kpi-content">
            <h3>{stats.activeSubscriptions}</h3>
            <p>Active Subscriptions</p>
            <span className="kpi-percentage">
              {stats.totalSubscriptions > 0 
                ? Math.round((stats.activeSubscriptions / stats.totalSubscriptions) * 100)
                : 0}% of total
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e74c3c' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="kpi-content">
            <h3>{stats.pastDueSubscriptions}</h3>
            <p>Past Due</p>
            <span className="kpi-percentage">
              {stats.totalSubscriptions > 0 
                ? Math.round((stats.pastDueSubscriptions / stats.totalSubscriptions) * 100)
                : 0}% of total
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#f39c12' }}>
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="kpi-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <span className="kpi-change positive">
              {formatCurrency(stats.monthlyRevenue)} this month
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Subscription Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="subscriptions" 
                stroke="#3498db" 
                strokeWidth={2}
                name="New Subscriptions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#27ae60" 
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="recent-payments">
        <h3>Recent Payments</h3>
        <div className="payments-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map(payment => (
                <tr key={payment.id}>
                  <td>
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td>
                    {payment.user 
                      ? `${payment.user.firstName || ''} ${payment.user.lastName || ''}`.trim() || payment.user.username
                      : 'N/A'
                    }
                  </td>
                  <td>{payment.plan?.name || 'N/A'}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentPayments.length === 0 && (
            <div className="no-data">
              <i className="fas fa-inbox"></i>
              <p>No recent payments</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .membership-dashboard {
          padding: 30px;
        }





        .dashboard-loading, .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          text-align: center;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .retry-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 15px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .kpi-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .kpi-card:hover {
          transform: translateY(-5px);
        }

        .kpi-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          margin-bottom: 35px;
          align-items: center;
          justify-content: center;
          margin-right: 20px;
          color: white;
          font-size: 1.5rem;
        }

        .kpi-content h3 {
          margin: 0;
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .kpi-content p {
          margin: 5px 0;
          color: #7f8c8d;
          font-weight: 500;
        }

        .kpi-change {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .kpi-change.positive {
          color: #27ae60;
        }

        .kpi-percentage {
          font-size: 0.9rem;
          color: #7f8c8d;
          font-weight: 500;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        .chart-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .chart-container h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2rem;
        }

        .recent-payments {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .recent-payments h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2rem;
        }

        .payments-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .payments-table th,
        .payments-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .payments-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.completed {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.failed {
          background: #f8d7da;
          color: #721c24;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
        }

        .no-data i {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        @media (max-width: 768px) {
          .membership-dashboard {
            padding: 20px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .charts-section {
            grid-template-columns: 1fr;
          }

          .kpi-card {
            flex-direction: column;
            text-align: center;
          }

          .kpi-icon {
            margin-right: 0;
            margin-bottom: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default MembershipDashboard;
