import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';

const BrowseMemberships = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPlans();
    fetchOrganizations();
  }, [selectedOrganization, searchTerm]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedOrganization) params.append('organizationId', selectedOrganization);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/public/plans?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      console.log('Browse memberships data:', data);
      setPlans(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/public/organizations`);
      if (response.ok) {
        const data = await response.json();
        console.log('Organizations data:', data);
        setOrganizations(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
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

  return (
    <ErrorBoundary>
      <style>{`
        .apply-button,
        .details-button {
          flex: 1;
          padding: 16px 20px;
          border-radius: 12px;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .apply-button {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }
        
        .apply-button:hover {
          background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }
        
        .details-button {
          background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
        }
        
        .details-button:hover {
          background: linear-gradient(135deg, #8e44ad 0%, #7d3c98 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
        }
        
        .apply-button::before, 
        .details-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .apply-button:hover::before, 
        .details-button:hover::before {
          left: 100%;
        }
      `}</style>
    <div className="browse-memberships">
      <div className="browse-header">
        <h1>{t('nav.browse.memberships')}</h1>
        <p>Find and join organizations that match your interests</p>
      </div>

      <div className="browse-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search plans and organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedOrganization}
          onChange={(e) => setSelectedOrganization(e.target.value)}
          className="org-filter"
        >
          <option value="">All Organizations</option>
          {organizations.map(org => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {loading && plans.length === 0 ? (
        <div className="browse-loading">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="plans-grid">
          {Array.isArray(plans) && plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <div className="plan-header">
              {plan.organization?.logo && (
                <img 
                  src={plan.organization.logo} 
                  alt={plan.organization.name}
                  className="org-logo"
                />
              )}
              <div className="org-info">
                <h4>{plan.organization?.name || 'Independent'}</h4>
                {plan.organization?.website && (
                  <a 
                    href={plan.organization.website} 
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

            <div className="plan-content">
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span className={`price ${plan.fee === 0 || plan.fee === '0' ? 'free-price' : ''}`}>
                  {formatCurrency(plan.fee)}
                </span>
                <span className="interval">{getRenewalText(plan.renewalInterval)}</span>
              </div>

              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}

              {(() => {
                try {
                  const benefits = typeof plan.benefits === 'string' ? JSON.parse(plan.benefits) : plan.benefits;
                  return Array.isArray(benefits) && benefits.length > 0 && benefits.some(b => b && b.trim()) ? (
                    <div className="plan-benefits">
                      <h5>What's included:</h5>
                      <ul>
                        {benefits.filter(b => b && b.trim()).map((benefit, index) => (
                          <li key={index}>
                            <i className="fas fa-check"></i>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                } catch (e) {
                  console.warn('Invalid benefits data for plan:', plan.id, plan.benefits);
                  return null;
                }
              })()}

              {plan.maxMembers && (
                <div className="plan-limit">
                  <i className="fas fa-users"></i>
                  Limited to {plan.maxMembers} members
                </div>
              )}
            </div>

            <div className="plan-actions">
              {isAuthenticated ? (
                // Check if the current user is the creator of the plan
                user && plan.createdBy === user.id ? (
                  <div 
                    className="apply-button" 
                    style={{ 
                      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)', 
                      cursor: 'not-allowed',
                      opacity: 0.7
                    }}
                    title="You cannot apply for your own plan"
                  >
                    <i className="fas fa-user-check"></i>
                    Plan Creator
                  </div>
                ) : (
                  <Link 
                    to={`/apply/${plan.id}`}
                    className="apply-button"
                  >
                    <i className="fas fa-rocket"></i>
                    Apply Now
                  </Link>
                )
              ) : (
                <Link 
                  to="/login"
                  className="apply-button"
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Login to Apply
                </Link>
              )}
              <Link 
                to={`/plan/${plan.id}`}
                className="details-button"
              >
                <i className="fas fa-info-circle"></i>
                View Details
              </Link>
            </div>
          </div>
        ))}
        </div>
      )}

      {plans.length === 0 && !loading && (
        <div className="no-plans">
          <i className="fas fa-search"></i>
          <h3>No membership plans found</h3>
          <p>Try adjusting your search criteria or check back later for new opportunities.</p>
        </div>
      )}

      <style jsx>{`
        .browse-memberships {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .browse-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .browse-header h1 {
          font-size: 3rem;
          color: #2c3e50;
          margin: 0 0 15px 0;
        }

        .browse-header p {
          font-size: 1.2rem;
          color: #7f8c8d;
          margin: 0;
        }

        .browse-filters {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          align-items: center;
          justify-content: center;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        .search-box input {
          width: 100%;
          padding: 15px 15px 15px 45px;
          border: 2px solid #ecf0f1;
          border-radius: 25px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3498db;
        }

        .org-filter {
          padding: 15px 20px;
          border: 2px solid #ecf0f1;
          border-radius: 25px;
          font-size: 1rem;
          min-width: 200px;
          background: white;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .plan-card {
          background: white;
          border-radius: 15px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
          border: 1px solid #f1f3f4;
        }

        .plan-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .plan-header {
          display: flex;
          align-items: center;
          padding: 25px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-bottom: 1px solid #dee2e6;
        }

        .org-logo {
          width: 50px;
          height: 50px;
          object-fit: contain;
          margin-right: 15px;
          border-radius: 8px;
        }

        .org-info h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .org-website {
          color: #3498db;
          text-decoration: none;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: color 0.3s ease;
        }

        .org-website:hover {
          color: #2980b9;
        }

        .plan-content {
          padding: 30px 25px;
        }

        .plan-content h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .plan-price {
          margin-bottom: 20px;
        }

        .plan-price .price {
          font-size: 2.5rem;
          font-weight: bold;
          color: #27ae60;
        }

        .plan-price .price.free-price {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        .plan-price .interval {
          font-size: 1rem;
          color: #7f8c8d;
          margin-left: 8px;
        }

        .plan-description {
          color: #5d6d7e;
          line-height: 1.6;
          margin-bottom: 25px;
        }

        .plan-benefits h5 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .plan-benefits ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .plan-benefits li {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: #34495e;
          font-size: 0.95rem;
        }

        .plan-benefits li i {
          color: #27ae60;
          font-size: 0.9rem;
        }

        .plan-limit {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #e67e22;
          font-size: 0.9rem;
          margin-top: 20px;
          padding: 10px;
          background: #fef9e7;
          border-radius: 6px;
        }

        .plan-actions {
          display: flex;
          gap: 15px;
          padding: 0 25px 25px 25px;
        }

        .apply-button,
        .details-button {
          flex: 1;
          padding: 16px 20px;
          border-radius: 12px;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .apply-button {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }

        .apply-button:hover {
          background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }

        .apply-button:active {
          transform: translateY(-1px);
        }

        .details-button {
          background: linear-gradient(135deg, #ecf0f1 0%, #d5dbdb 100%);
          color: #2c3e50;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid #bdc3c7;
        }

        .details-button:hover {
          background: linear-gradient(135deg, #d5dbdb 0%, #bdc3c7 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .details-button:active {
          transform: translateY(0);
        }

        .apply-button::before,
        .details-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .apply-button:hover::before,
        .details-button:hover::before {
          left: 100%;
        }

        .no-plans {
          text-align: center;
          padding: 80px 20px;
          color: #7f8c8d;
        }

        .no-plans i {
          font-size: 4rem;
          margin-bottom: 25px;
        }

        .no-plans h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .browse-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          width: 100%;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .browse-memberships {
            padding: 20px 15px;
          }

          .browse-header h1 {
            font-size: 2rem;
          }

          .browse-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .plans-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .plan-header {
            flex-direction: column;
            text-align: center;
          }

          .org-logo {
            margin-right: 0;
            margin-bottom: 15px;
          }

          .plan-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
    </ErrorBoundary>
  );
};

export default BrowseMemberships;
