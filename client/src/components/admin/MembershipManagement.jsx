import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmDialog from '../ConfirmDialog';
import './MembershipManagement.css';

const MembershipManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membershipData, setMembershipData] = useState({
    plans: [],
    subscriptions: [],
    applications: [],
    stats: {
      totalPlans: 0,
      activeSubscriptions: 0,
      pendingApplications: 0,
      monthlyRevenue: 0,
      renewalRate: 0
    }
  });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: 'monthly',
    features: [],
    isActive: true
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchMembershipData();
  }, []);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      console.log('🔍 MembershipManagement: Fetching membership data...');
      
      // Fetch all data in parallel, but handle individual failures
      const [plansResponse, subscriptionsResponse, applicationsResponse] = await Promise.allSettled([
        adminService.getMembershipPlans(),
        adminService.getActiveSubscriptions({ limit: 10 }),
        adminService.getMembershipApplications({ limit: 10 })
      ]);

      console.log('✅ MembershipManagement: All data fetch attempts completed');
      
      // Handle plans response
      const plans = plansResponse.status === 'fulfilled' 
        ? (plansResponse.value.data?.plans || [])
        : [];
      
      if (plansResponse.status === 'rejected') {
        console.error('❌ Failed to fetch plans:', plansResponse.reason);
      }
      
      // Handle subscriptions response
      const subscriptions = subscriptionsResponse.status === 'fulfilled'
        ? (subscriptionsResponse.value.data?.subscriptions || [])
        : [];
      
      if (subscriptionsResponse.status === 'rejected') {
        console.error('❌ Failed to fetch subscriptions:', subscriptionsResponse.reason);
      }
      
      // Handle applications response
      const applications = applicationsResponse.status === 'fulfilled'
        ? (applicationsResponse.value.data?.applications || [])
        : [];
      
      if (applicationsResponse.status === 'rejected') {
        console.error('❌ Failed to fetch applications:', applicationsResponse.reason);
      }
      
      // Calculate overall stats
      const totalPlans = plans.length;
      const activeSubscriptions = subscriptionsResponse.status === 'fulfilled'
        ? (subscriptionsResponse.value.data.stats?.totalActive || 0)
        : 0;
      const pendingApplications = applicationsResponse.status === 'fulfilled'
        ? (applicationsResponse.value.data.stats?.pendingApplications || 0)
        : 0;
      const monthlyRevenue = subscriptionsResponse.status === 'fulfilled'
        ? (subscriptionsResponse.value.data.stats?.monthlyRevenue || 0)
        : 0;
      const renewalRate = subscriptionsResponse.status === 'fulfilled'
        ? (subscriptionsResponse.value.data.stats?.renewalRate || 0)
        : 0;
      const approvedToday = applicationsResponse.status === 'fulfilled'
        ? (applicationsResponse.value.data.stats?.approvedToday || 0)
        : 0;
      const rejectedToday = applicationsResponse.status === 'fulfilled'
        ? (applicationsResponse.value.data.stats?.rejectedToday || 0)
        : 0;
      const averageProcessingTime = applicationsResponse.status === 'fulfilled'
        ? (applicationsResponse.value.data.stats?.averageProcessingTime || '0h')
        : '0h';

      setMembershipData({
        plans,
        subscriptions,
        applications,
        stats: {
          totalPlans,
          activeSubscriptions,
          pendingApplications,
          monthlyRevenue,
          renewalRate,
          approvedToday,
          rejectedToday,
          averageProcessingTime
        }
      });
      setError(null);
    } catch (err) {
      console.error('❌ MembershipManagement: Error fetching data:', err);
      setError('Failed to load membership data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setPlanForm({
      name: '',
      description: '',
      price: '',
      duration: 'monthly',
      features: [],
      isActive: true
    });
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration,
      features: plan.features,
      isActive: plan.isActive
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async () => {
    try {
      console.log('Saving plan:', planForm);
      
      if (selectedPlan) {
        // Update existing plan
        await adminService.updateMembershipPlan(selectedPlan.id, planForm);
        console.log('✅ Plan updated successfully');
      } else {
        // Create new plan
        await adminService.createMembershipPlan(planForm);
        console.log('✅ Plan created successfully');
      }
      
      setShowPlanModal(false);
      fetchMembershipData(); // Refresh data
    } catch (err) {
      console.error('❌ Error saving plan:', err);
      setError('Failed to save plan. Please try again.');
    }
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      console.log('Approving application:', applicationId);
      await adminService.approveMembershipApplication(applicationId);
      console.log('✅ Application approved successfully');
      
      // Update local state
      setMembershipData(prev => ({
        ...prev,
        applications: prev.applications.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'approved' }
            : app
        )
      }));
      
      // Refresh data to get updated stats
      fetchMembershipData();
    } catch (err) {
      console.error('❌ Error approving application:', err);
      setError('Failed to approve application. Please try again.');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      console.log('Rejecting application:', applicationId);
      await adminService.rejectMembershipApplication(applicationId);
      console.log('✅ Application rejected successfully');
      
      // Update local state
      setMembershipData(prev => ({
        ...prev,
        applications: prev.applications.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'rejected' }
            : app
        )
      }));
      
      // Refresh data to get updated stats
      fetchMembershipData();
    } catch (err) {
      console.error('❌ Error rejecting application:', err);
      setError('Failed to reject application. Please try again.');
    }
  };

  const handleDeletePlan = async (planId) => {
    setConfirmDialog({
      isOpen: true,
      message: t('membership.plans.confirm.delete'),
      onConfirm: () => deletePlan(planId)
    });
  };

  const deletePlan = async (planId) => {
    try {
      console.log('Deleting plan:', planId);
      await adminService.deleteMembershipPlan(planId);
      console.log('✅ Plan deleted successfully');
      
      // Refresh data
      fetchMembershipData();
    } catch (err) {
      console.error('❌ Error deleting plan:', err);
      setError(err.response?.data?.message || t('plans.error.deleting', { error: err.message }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilRenewal = (renewalDate) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const generateRevenueTrendData = () => {
    // Generate revenue trend for the last 6 months
    const months = [];
    const revenueData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      months.push(monthName);
      
      // Calculate revenue for this month based on active subscriptions
      const monthRevenue = membershipData.subscriptions.reduce((sum, sub) => {
        const subDate = new Date(sub.startDate || sub.createdAt);
        if (subDate.getMonth() === date.getMonth() && subDate.getFullYear() === date.getFullYear()) {
          return sum + (sub.plan ? parseFloat(sub.plan.fee || sub.plan.price || 0) : 0);
        }
        return sum;
      }, 0);
      
      revenueData.push(monthRevenue);
    }
    
    return { months, revenueData };
  };

  const getChartData = () => {
    const { months, revenueData } = generateRevenueTrendData();
    const maxRevenue = Math.max(...revenueData, 1); // Avoid division by zero
    
    return months.map((month, index) => {
      const revenue = revenueData[index];
      const heightPercentage = (revenue / maxRevenue) * 100;
      
      return {
        month,
        revenue,
        heightPercentage
      };
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading membership data...</p>
      </div>
    );
  }

  return (
    <div className="membership-management">
      <div className="management-header">
        <h2>Membership Management</h2>
        <p>View and manage membership plans, active subscriptions, and member applications</p>
        <button className="btn btn-primary" onClick={handleCreatePlan}>
          + Create New Plan
        </button>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchMembershipData} className="btn btn-primary">
            Retry
          </button>
        </div>
      )}

      {/* Chart Container 1: Membership Overview */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Membership Overview</h3>
          <p className="chart-subtitle">View and manage membership plans, active subscriptions, and member applications</p>
        </div>
        
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{membershipData.stats.totalPlans}</h3>
              <p>Total Plans</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{membershipData.stats.activeSubscriptions}</h3>
              <p>Active Subscriptions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{membershipData.stats.pendingApplications}</h3>
              <p>Pending Applications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{formatCurrency(membershipData.stats.monthlyRevenue)}</h3>
              <p>Monthly Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h3>{membershipData.stats.renewalRate}%</h3>
              <p>Renewal Rate</p>
            </div>
          </div>
        </div>

        {/* Membership Plans */}
        <div className="plans-section">
          <div className="section-header">
            <h4>Membership Plans</h4>
            <button className="btn btn-outline" onClick={handleCreatePlan}>
              + Add Plan
            </button>
          </div>
          <div className="plans-grid">
            {membershipData.plans.map(plan => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h5>{plan.name}</h5>
                  <span className={`plan-status ${plan.isActive ? 'active' : 'inactive'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-price">
                  <span className="price">{formatCurrency(plan.price)}</span>
                  <span className="duration">/{plan.duration}</span>
                </div>
                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      ✓ {feature}
                    </div>
                  ))}
                </div>
                <div className="plan-stats">
                  <div className="stat">
                    <span className="stat-value">{plan.subscribers}</span>
                    <span className="stat-label">Subscribers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{formatCurrency(plan.revenue)}</span>
                    <span className="stat-label">Revenue</span>
                  </div>
                </div>
                <div className="plan-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditPlan(plan)}
                  >
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline">
                    View Details
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container 2: Active Subscriptions */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Active Subscriptions</h3>
          <p className="chart-subtitle">Monitor subscription statuses, renewal rates, and member engagement metrics</p>
        </div>
        
        {/* Subscription Analytics */}
        <div className="subscription-analytics">
          <div className="analytics-chart">
            <h4>Revenue Trend</h4>
            <div className="chart-placeholder">
              <div className="chart-bars">
                {getChartData().length > 0 ? (
                  getChartData().map(({ month, revenue, heightPercentage }) => (
                    <div key={month} className="chart-bar">
                      <div 
                        className="bar" 
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                      <span className="bar-label">{month}</span>
                      <span className="bar-value">{formatCurrency(revenue)}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-data-message">
                    <p>No revenue data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="subscription-list">
            <h4>Recent Subscriptions</h4>
            <div className="subscriptions-table">
              <div className="table-header">
                <span>User</span>
                <span>Plan</span>
                <span>Status</span>
                <span>Next Billing</span>
                <span>Actions</span>
              </div>
              {membershipData.subscriptions.map(subscription => (
                <div key={subscription.id} className="table-row">
                  <div className="user-info">
                    <div className="user-avatar">
                      {subscription.user.firstName ? subscription.user.firstName[0] : subscription.user.username[0]}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {subscription.user.firstName && subscription.user.lastName 
                          ? `${subscription.user.firstName} ${subscription.user.lastName}`
                          : subscription.user.username
                        }
                      </div>
                      <div className="user-email">{subscription.user.email}</div>
                    </div>
                  </div>
                  <div className="plan-info">
                    <div className="plan-name">{subscription.plan.name}</div>
                    <div className="plan-price">{formatCurrency(subscription.plan.fee || subscription.plan.price)}/{subscription.plan.renewalInterval || subscription.plan.duration}</div>
                  </div>
                  <span className="status-badge active">Active</span>
                  <div className="billing-info">
                    <div>{subscription.renewalDate ? formatDate(subscription.renewalDate) : 'N/A'}</div>
                    <div className={`days-remaining ${subscription.renewalDate && getDaysUntilRenewal(subscription.renewalDate) < 7 ? 'urgent' : ''}`}>
                      {subscription.renewalDate ? `${getDaysUntilRenewal(subscription.renewalDate)} days` : 'N/A'}
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-outline">View</button>
                    <button className="btn btn-sm btn-outline">Remind</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container 3: Pending Applications */}
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Pending Applications</h3>
          <p className="chart-subtitle">Review and approve membership applications from potential members</p>
        </div>
        
        {/* Application Stats */}
        <div className="application-stats">
          <div className="stat-item">
            <span className="stat-number">{membershipData.stats.pendingApplications}</span>
            <span className="stat-label">Pending Review</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{membershipData.stats.approvedToday || 0}</span>
            <span className="stat-label">Approved Today</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{membershipData.stats.rejectedToday || 0}</span>
            <span className="stat-label">Rejected Today</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{membershipData.stats.averageProcessingTime || '2.5h'}</span>
            <span className="stat-label">Avg Processing Time</span>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-section">
          <div className="section-header">
            <h4>Application Details</h4>
            <div className="bulk-actions">
              <button className="btn btn-outline">Bulk Approve</button>
              <button className="btn btn-outline">Export Data</button>
            </div>
          </div>
          
          <div className="applications-list">
            {membershipData.applications.map(application => (
              <div key={application.id} className="application-item">
                <div className="application-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {application.user.firstName ? application.user.firstName[0] : application.user.username[0]}
                    </div>
                    <div className="user-details">
                      <h5>
                        {application.user.firstName && application.user.lastName 
                          ? `${application.user.firstName} ${application.user.lastName}`
                          : application.user.username
                        }
                      </h5>
                      <p>{application.user.email}</p>
                    </div>
                  </div>
                  <div className="application-meta">
                    <span className="status-badge pending">Pending</span>
                    <span className="applied-date">{formatDate(application.appliedAt)}</span>
                  </div>
                </div>
                
                <div className="application-content">
                  <div className="plan-info">
                    <h6>{application.plan.name}</h6>
                  </div>
                  <div className="application-message">
                    <p>{application.message}</p>
                  </div>
                </div>

                <div className="application-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => setSelectedApplication(application)}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleApproveApplication(application.id)}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleRejectApplication(application.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowPlanModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Plan Name</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter plan name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter plan description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={planForm.duration}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, duration: e.target.value }))}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Features (one per line)</label>
                <textarea
                  value={planForm.features.join('\n')}
                  onChange={(e) => setPlanForm(prev => ({ 
                    ...prev, 
                    features: e.target.value.split('\n').filter(f => f.trim()) 
                  }))}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active Plan
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowPlanModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSavePlan}
              >
                {selectedPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
        confirmText={t('membership.plans.delete')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
};

export default MembershipManagement;
