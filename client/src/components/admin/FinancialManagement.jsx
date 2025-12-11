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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db] mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
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
          onClick={fetchFinancialData} 
          className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = financialData.stats || {};
  const chartData = getChartData();

  return (
    <div className="financial-management">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('admin.financial.title') || 'Financial Management'}
            </h1>
            <p className="text-gray-600">
              {t('admin.financial.description') || 'Monitor revenue, transactions, and payment analytics'}
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="period-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {t('admin.financial.time.period') || 'Time Period:'}
            </label>
            <select
              id="period-select"
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3498db] focus:border-transparent transition-all cursor-pointer"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="week">{t('admin.financial.last.7.days') || 'Last 7 Days'}</option>
              <option value="month">{t('admin.financial.last.30.days') || 'Last 30 Days'}</option>
              <option value="year">{t('admin.financial.last.year') || 'Last Year'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('admin.financial.revenue.analytics') || 'Revenue Analytics'}
          </h3>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCount || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Average Transaction</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.averageAmount)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h4>
          <div className="flex items-end justify-between gap-2 h-64">
            {chartData.map(({ label, heightPercentage }, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                  <div 
                    className="w-full bg-gradient-to-t from-[#3498db] to-[#2980b9] rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('admin.financial.payment.methods') || 'Payment Methods'}
          </h3>
        </div>
        <div className="space-y-3">
          {financialData.paymentMethods && financialData.paymentMethods.length > 0 ? (
            financialData.paymentMethods.map((method, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{method.paymentMethod}</div>
                  <div className="text-sm text-gray-600">
                    {method.count} transactions · {formatCurrency(method.total)}
                  </div>
                </div>
                <div className="text-lg font-bold text-[#3498db]">
                  {getPercentage(method.total, stats.totalAmount)}%
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No payment method data available</div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-teal-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('admin.financial.transaction.history') || 'Transaction History'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          {financialData.recentTransactions && financialData.recentTransactions.length > 0 ? (
            <>
              <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg border-b-2 border-gray-200 font-semibold text-gray-700 text-sm">
                <div>Date</div>
                <div>User</div>
                <div>Amount</div>
                <div>Method</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-gray-200">
                {financialData.recentTransactions.map(transaction => (
                  <div key={transaction.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.user.firstName || transaction.user.username}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.amount)}</div>
                    <div className="text-sm text-gray-600">{transaction.paymentMethod}</div>
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">No recent transactions</div>
          )}
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('admin.financial.revenue.by.plan') || 'Revenue by Plan'}
          </h3>
        </div>
        <div className="space-y-4">
          {financialData.revenueByPlan && financialData.revenueByPlan.length > 0 ? (
            financialData.revenueByPlan.map((plan, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{plan.planName}</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(plan.total)} ({plan.count} transactions)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#3498db] to-[#2980b9] h-full rounded-full transition-all"
                    style={{ width: `${getPercentage(plan.total, stats.totalAmount)}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No plan revenue data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
