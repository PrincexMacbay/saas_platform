import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import './FinancialManagement.css';

const FinancialManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [financialData, setFinancialData] = useState({
    stats: null,
    paymentMethods: [],
    revenueByPlan: [],
    recentTransactions: []
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchFinancialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      console.log('Fetching financial data for period:', period);
      const response = await adminService.getFinancialData(period);
      console.log('Financial data response:', response);
      setFinancialData(response.data || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const getChartData = () => {
    const stats = financialData.stats;
    if (!stats) return [];
    
    const totalAmount = parseFloat(stats.totalAmount) || 0;
    const periodLabel = period === 'week' ? 'Days' : period === 'month' ? 'Days' : 'Months';
    const periods = period === 'week' ? 7 : period === 'month' ? 30 : 12;
    
    return Array.from({ length: periods }, (_, i) => {
      const randomRevenue = totalAmount * (0.5 + Math.random() * 1); // Simulated data
      return {
        label: `${periodLabel.charAt(0)}${i + 1}`,
        revenue: randomRevenue,
        heightPercentage: Math.min(100, (randomRevenue / totalAmount) * 100)
      };
    });
  };

  if (loading) {
    return (
      <div className="financial-management">
        <div className="loading">Loading financial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="financial-management">
        <div className="error">{error}</div>
      </div>
    );
  }

  const stats = financialData.stats || {};
  const chartData = getChartData();

  return (
    <div className="financial-management">

      {/* Period Selector */}
      <div className="admin-filters">
        <div className="filter-group">
          <label className="filter-label">{t('admin.financial.time.period')}</label>
          <select
            className="filter-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">{t('admin.financial.last.7.days')}</option>
            <option value="month">{t('admin.financial.last.30.days')}</option>
            <option value="year">{t('admin.financial.last.year')}</option>
          </select>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.financial.revenue.analytics')}</h3>
        
        {/* Stats Cards */}
        <div className="financial-stats">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">{formatCurrency(stats.totalAmount)}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Transactions</div>
              <div className="stat-value">{stats.totalCount || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">Average Transaction</div>
              <div className="stat-value">{formatCurrency(stats.averageAmount)}</div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="revenue-chart">
          <h4>Revenue Trend</h4>
          <div className="chart-bars">
            {chartData.map(({ label, heightPercentage }, idx) => (
              <div key={idx} className="chart-bar">
                <div 
                  className="bar" 
                  style={{ height: `${heightPercentage}%` }}
                ></div>
                <span className="bar-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.financial.payment.methods')}</h3>
        <div className="payment-methods-list">
          {financialData.paymentMethods && financialData.paymentMethods.length > 0 ? (
            financialData.paymentMethods.map((method, idx) => (
              <div key={idx} className="payment-method-item">
                <div className="method-info">
                  <div className="method-name">{method.paymentMethod}</div>
                  <div className="method-stats">
                    {method.count} transactions · {formatCurrency(method.total)}
                  </div>
                </div>
                <div className="method-percentage">
                  {getPercentage(method.total, stats.totalAmount)}%
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No payment method data available</div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.financial.transaction.history')}</h3>
        <div className="transactions-list">
          {financialData.recentTransactions && financialData.recentTransactions.length > 0 ? (
            <>
              <div className="table-header">
                <div className="col-date">Date</div>
                <div className="col-user">User</div>
                <div className="col-amount">Amount</div>
                <div className="col-method">Method</div>
                <div className="col-status">Status</div>
              </div>
              {financialData.recentTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-row">
                  <div className="col-date">{formatDate(transaction.createdAt)}</div>
                  <div className="col-user">
                    {transaction.user.firstName || transaction.user.username}
                  </div>
                  <div className="col-amount">{formatCurrency(transaction.amount)}</div>
                  <div className="col-method">{transaction.paymentMethod}</div>
                  <div className="col-status">
                    <span className={`status-badge ${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="empty-state">No recent transactions</div>
          )}
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.financial.revenue.by.plan')}</h3>
        <div className="revenue-by-plan">
          {financialData.revenueByPlan && financialData.revenueByPlan.length > 0 ? (
            financialData.revenueByPlan.map((plan, idx) => (
              <div key={idx} className="plan-revenue-item">
                <div className="plan-name">{plan.planName}</div>
                <div className="plan-revenue-bar">
                  <div 
                    className="revenue-fill"
                    style={{ width: `${getPercentage(plan.total, stats.totalAmount)}%` }}
                  ></div>
                </div>
                <div className="plan-revenue-amount">
                  {formatCurrency(plan.total)} ({plan.count} transactions)
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No plan revenue data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
