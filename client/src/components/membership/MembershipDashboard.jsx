import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMembershipData } from '../../contexts/MembershipDataContext';
import { useLanguage } from '../../contexts/LanguageContext';

const MembershipDashboard = () => {
  const { data, loading, errors, refreshData, isLoadingAll } = useMembershipData();
  const { t } = useLanguage();
  const dashboardData = data.dashboard;
  const isLoading = loading.dashboard;
  const error = errors.dashboard;

  useEffect(() => {
    // If data is not preloaded, fetch it
    if (!dashboardData && !isLoading) {
      refreshData('dashboard');
    }
  }, [dashboardData, isLoading, refreshData]);

  // Data fetching is now handled by the context

  // Only show loading if no data is available at all and we're not in the middle of preloading
  if (!dashboardData && isLoading && !data.dashboard && !isLoadingAll) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>{t('membership.dashboard.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>{t('membership.dashboard.error', { error })}</p>
        <button onClick={() => refreshData('dashboard')} className="retry-button">
          <i className="fas fa-redo"></i> {t('membership.dashboard.retry')}
        </button>
      </div>
    );
  }

  // Additional safety check - show simple loading if no data
  if (!dashboardData || !dashboardData.stats) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>{t('membership.dashboard.loading.data')}</p>
      </div>
    );
  }

  // Safely destructure with fallbacks to prevent null destructuring errors
  const { 
    stats = {}, 
    recentPayments = [], 
    chartData = [] 
  } = dashboardData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="membership-dashboard px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* KPI Cards */}
      <div className="kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#3498db' }}>
            <i className="fas fa-users"></i>
          </div>
          <div className="kpi-content">
            <h3>{stats.totalSubscriptions || 0}</h3>
            <p>{t('membership.dashboard.total.subscriptions')}</p>
            <span className="kpi-change positive">
              +{stats.newSubscriptions || 0} {t('membership.dashboard.this.month')}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#27ae60' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="kpi-content">
            <h3>{stats.activeSubscriptions || 0}</h3>
            <p>{t('membership.dashboard.active.subscriptions')}</p>
            <span className="kpi-percentage">
              {(stats.totalSubscriptions || 0) > 0 
                ? Math.round(((stats.activeSubscriptions || 0) / (stats.totalSubscriptions || 1)) * 100)
                : 0}% {t('membership.dashboard.of.total')}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#e74c3c' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="kpi-content">
            <h3>{stats.pastDueSubscriptions || 0}</h3>
            <p>{t('membership.dashboard.past.due')}</p>
            <span className="kpi-percentage">
              {(stats.totalSubscriptions || 0) > 0 
                ? Math.round(((stats.pastDueSubscriptions || 0) / (stats.totalSubscriptions || 1)) * 100)
                : 0}% {t('membership.dashboard.of.total')}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#f39c12' }}>
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="kpi-content">
            <h3>{formatCurrency(stats.totalRevenue || 0)}</h3>
            <p>{t('membership.dashboard.total.revenue')}</p>
            <span className="kpi-change positive">
              {formatCurrency(stats.monthlyRevenue || 0)} {t('membership.dashboard.this.month')}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="chart-container bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">{t('membership.dashboard.subscription.trends')}</h3>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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
                name={t('membership.dashboard.new.subscriptions')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">{t('membership.dashboard.revenue.trends')}</h3>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#27ae60" 
                name={t('membership.dashboard.revenue')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="recent-payments">
        <h3>{t('membership.dashboard.recent.payments')}</h3>
        <div className="payments-table">
          <table>
            <thead>
              <tr>
                <th>{t('membership.dashboard.date')}</th>
                <th>{t('membership.dashboard.member')}</th>
                <th>{t('membership.dashboard.plan')}</th>
                <th>{t('membership.dashboard.amount')}</th>
                <th>{t('membership.dashboard.status')}</th>
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
              <p>{t('membership.dashboard.no.recent.payments')}</p>
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
          /* Grid layout handled by Tailwind classes */
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
          /* Grid layout handled by Tailwind classes */
        }

        .chart-container {
          /* Styling handled by Tailwind classes */
        }

        .chart-container h3 {
          /* Styling handled by Tailwind classes */
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
