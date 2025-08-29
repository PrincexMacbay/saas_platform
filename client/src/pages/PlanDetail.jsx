import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const PlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch plan details
      const planResponse = await api.get(`/public/plans`);
      const plans = planResponse.data.data;
      const selectedPlan = plans.find(p => p.id === parseInt(id));
      
      if (!selectedPlan) {
        setError('Plan not found');
        return;
      }
      
      // Parse benefits if it's a JSON string
      if (selectedPlan.benefits && typeof selectedPlan.benefits === 'string') {
        try {
          selectedPlan.benefits = JSON.parse(selectedPlan.benefits);
        } catch (parseError) {
          console.log('Could not parse benefits JSON:', parseError);
          selectedPlan.benefits = [];
        }
      }
      
      // Ensure benefits is always an array
      if (!Array.isArray(selectedPlan.benefits)) {
        selectedPlan.benefits = [];
      }
      
      setPlan(selectedPlan);
      
      // Fetch organization details
      if (selectedPlan.organizationId) {
        try {
          const orgResponse = await api.get(`/public/organizations`);
          const organizations = orgResponse.data.data;
          const planOrg = organizations.find(org => org.id === selectedPlan.organizationId);
          setOrganization(planOrg);
        } catch (orgError) {
          console.log('Could not fetch organization details');
        }
      }
      
    } catch (error) {
      console.error('Error fetching plan details:', error);
      setError('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === 0 || amount === '0' || amount === null || amount === undefined) {
      return 'Free';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getRenewalText = (interval) => {
    const intervals = {
      monthly: 'per month',
      quarterly: 'per quarter',
      yearly: 'per year',
      'one-time': 'one-time'
    };
    return intervals[interval] || interval;
  };

  const handleApplyNow = () => {
    navigate(`/apply/${id}`);
  };

  if (loading) {
    return (
      <div className="plan-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading plan details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plan-detail-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Plan Not Found</h2>
          <p>{error}</p>
          <Link to="/browse-memberships" className="btn btn-primary">
            <i className="fas fa-arrow-left"></i> Back to Memberships
          </Link>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="plan-detail-error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Plan Not Found</h2>
          <p>The plan you're looking for doesn't exist.</p>
          <Link to="/browse-memberships" className="btn btn-primary">
            <i className="fas fa-arrow-left"></i> Back to Memberships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-detail">
      <div className="plan-detail-header">
        <div className="breadcrumb">
          <Link to="/browse-memberships">
            <i className="fas fa-arrow-left"></i> Back to Memberships
          </Link>
        </div>
        
        <div className="plan-header">
          <div className="plan-title">
            <h1>{plan.name}</h1>
            {organization && (
              <p className="organization-name">
                <i className="fas fa-building"></i> {organization.name}
              </p>
            )}
          </div>
          
          <div className="plan-price">
            <div className={`price-amount ${plan.fee === 0 || plan.fee === '0' ? 'free-price' : ''}`}>
              {formatCurrency(plan.fee)}
            </div>
            <div className="price-interval">
              {getRenewalText(plan.renewalInterval)}
            </div>
          </div>
        </div>
      </div>

      <div className="plan-detail-content">
        <div className="plan-main">
          <div className="plan-section">
            <h3>Description</h3>
            <p>{plan.description || 'No description available.'}</p>
          </div>

          {plan.benefits && Array.isArray(plan.benefits) && plan.benefits.length > 0 && (
            <div className="plan-section">
              <h3>Benefits</h3>
              <ul className="benefits-list">
                {plan.benefits.map((benefit, index) => (
                  <li key={index}>
                    <i className="fas fa-check"></i>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="plan-section">
            <h3>Plan Details</h3>
            <div className="plan-details-grid">
              <div className="detail-item">
                <span className="label">Renewal Interval:</span>
                <span className="value">{plan.renewalInterval}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`value status-${plan.isActive ? 'active' : 'inactive'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {plan.maxMembers && (
                <div className="detail-item">
                  <span className="label">Max Members:</span>
                  <span className="value">{plan.maxMembers}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="plan-sidebar">
          <div className="apply-card">
            <div className="apply-header">
              <h3>Ready to Join?</h3>
              <p>Start your membership application today</p>
            </div>
            
            <div className="apply-price">
              <div className="price-display">
                <span className={`amount ${plan.fee === 0 || plan.fee === '0' ? 'free-price' : ''}`}>
                  {formatCurrency(plan.fee)}
                </span>
                <span className="interval">{getRenewalText(plan.renewalInterval)}</span>
              </div>
            </div>

            <div className="apply-actions">
              {user ? (
                <button 
                  onClick={handleApplyNow}
                  className="btn btn-primary btn-large"
                  disabled={!plan.isActive}
                >
                  <i className="fas fa-arrow-right"></i>
                  Apply Now
                </button>
              ) : (
                <div className="login-prompt">
                  <p>Please log in to apply for this membership</p>
                  <Link to="/login" className="btn btn-primary">
                    <i className="fas fa-sign-in-alt"></i>
                    Login to Apply
                  </Link>
                </div>
              )}
            </div>

            {!plan.isActive && (
              <div className="plan-inactive-notice">
                <i className="fas fa-info-circle"></i>
                <p>This plan is currently inactive and not accepting applications.</p>
              </div>
            )}
          </div>

          {organization && (
            <div className="organization-card">
              <h4>About the Organization</h4>
              <div className="org-info">
                <p>{organization.description || 'No description available.'}</p>
                {organization.website && (
                  <a 
                    href={organization.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="org-website"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;
