import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, [currentPage, searchTerm, activeFilter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(activeFilter && { isActive: activeFilter })
      };

      const response = await api.get('/membership/plans', { params });
      const plans = response.data?.data?.plans || [];
      const pagination = response.data?.data?.pagination || { totalPages: 1 };
      
      setPlans(plans);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError(error.response?.data?.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleActiveFilter = (e) => {
    setActiveFilter(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getRenewalText = (interval) => {
    const intervals = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      'one-time': 'One-time'
    };
    return intervals[interval] || interval;
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone.')) return;

    try {
      await api.delete(`/membership/plans/${planId}`);
      fetchPlans();
    } catch (error) {
      alert('Error deleting plan: ' + error.message);
    }
  };

  const togglePlanStatus = async (plan) => {
    try {
      await api.put(`/membership/plans/${plan.id}`, {
        ...plan,
        isActive: !plan.isActive
      });
      fetchPlans();
    } catch (error) {
      alert('Error updating plan: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="plans-container">
      <div className="plans-header">
        <h2>Membership Plans</h2>
        <button onClick={handleAddPlan} className="add-button">
          <i className="fas fa-plus"></i> Add Plan
        </button>
      </div>

      <div className="plans-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <select
          value={activeFilter}
          onChange={handleActiveFilter}
          className="status-filter"
        >
          <option value="">All Plans</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="plans-grid">
        {Array.isArray(plans) && plans.map(plan => (
          <div key={plan.id} className={`plan-card ${!plan.isActive ? 'inactive' : ''}`}>
            <div className="plan-header">
              <div className="plan-title">
                <h3>{plan.name}</h3>
                <div className="plan-status">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={plan.isActive}
                      onChange={() => togglePlanStatus(plan)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-text ${plan.isActive ? 'active' : 'inactive'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="plan-actions">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="edit-button"
                  title="Edit Plan"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="delete-button"
                  title="Delete Plan"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div className="plan-content">
              <div className="plan-price">
                <span className="price">{formatCurrency(plan.fee)}</span>
                <span className="interval">/{getRenewalText(plan.renewalInterval)}</span>
              </div>

              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}

              <div className="plan-stats">
                <div className="stat">
                  <i className="fas fa-users"></i>
                  <span>{plan.activeSubscriptions || 0} Active</span>
                </div>
                <div className="stat">
                  <i className="fas fa-chart-line"></i>
                  <span>{plan.totalSubscriptions || 0} Total</span>
                </div>
                {plan.maxMembers && (
                  <div className="stat">
                    <i className="fas fa-limit"></i>
                    <span>Limit: {plan.maxMembers}</span>
                  </div>
                )}
              </div>

              {plan.benefits && (
                <div className="plan-benefits">
                  <h4>Benefits:</h4>
                  <ul>
                    {(() => {
                      let benefits = [];
                      
                      try {
                        // Handle case where benefits is already an array
                        if (Array.isArray(plan.benefits)) {
                          benefits = plan.benefits;
                        } 
                        // Handle case where benefits is a JSON string
                        else if (typeof plan.benefits === 'string') {
                          benefits = JSON.parse(plan.benefits || '[]');
                        }
                        // Handle other cases
                        else {
                          benefits = [];
                        }
                      } catch (e) {
                        console.warn('Invalid benefits JSON for plan:', plan.id, plan.benefits);
                        benefits = [];
                      }
                      
                      // Final safety check
                      if (!Array.isArray(benefits)) {
                        console.warn('Benefits is not an array for plan:', plan.id, benefits);
                        benefits = [];
                      }
                      
                      return benefits.map((benefit, index) => (
                        <li key={index}>
                          <i className="fas fa-check"></i>
                          {benefit}
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="no-data">
          <i className="fas fa-layer-group"></i>
          <p>No plans found</p>
          <button onClick={handleAddPlan} className="add-first-button">
            Create your first plan
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {showModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchPlans();
          }}
        />
      )}

      <style jsx>{`
        .plans-container {
          padding: 30px;
        }

        .plans-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .plans-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .add-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .add-button:hover {
          background: #2980b9;
        }

        .plans-filters {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
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
          padding: 12px 15px 12px 45px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .status-filter {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          min-width: 150px;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }

        .plan-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .plan-card.inactive {
          opacity: 0.7;
          background: #f8f9fa;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 25px 25px 15px 25px;
          border-bottom: 1px solid #ecf0f1;
        }

        .plan-title h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .plan-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: #27ae60;
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .status-text {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .status-text.active {
          color: #27ae60;
        }

        .status-text.inactive {
          color: #e74c3c;
        }

        .plan-actions {
          display: flex;
          gap: 8px;
        }

        .edit-button,
        .delete-button {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-button {
          background: #f8f9fa;
          color: #3498db;
        }

        .edit-button:hover {
          background: #3498db;
          color: white;
        }

        .delete-button {
          background: #f8f9fa;
          color: #e74c3c;
        }

        .delete-button:hover {
          background: #e74c3c;
          color: white;
        }

        .plan-content {
          padding: 25px;
        }

        .plan-price {
          margin-bottom: 20px;
        }

        .plan-price .price {
          font-size: 2.5rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .plan-price .interval {
          font-size: 1rem;
          color: #7f8c8d;
          margin-left: 5px;
        }

        .plan-description {
          color: #7f8c8d;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .plan-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .stat i {
          color: #3498db;
        }

        .plan-benefits h4 {
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
          margin-bottom: 8px;
          color: #34495e;
          font-size: 0.9rem;
        }

        .plan-benefits li i {
          color: #27ae60;
          font-size: 0.8rem;
        }

        .no-data {
          text-align: center;
          padding: 60px;
          color: #7f8c8d;
        }

        .no-data i {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .add-first-button {
          background: #3498db;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 20px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
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

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }

        .pagination-button {
          background: #f8f9fa;
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-button:hover:not(:disabled) {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-weight: 500;
          color: #7f8c8d;
        }

        @media (max-width: 768px) {
          .plans-container {
            padding: 20px;
          }

          .plans-header {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .plans-filters {
            flex-direction: column;
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plan-header {
            flex-direction: column;
            gap: 15px;
          }

          .plan-stats {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

// Plan Modal Component
const PlanModal = ({ plan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    fee: plan?.fee || '',
    renewalInterval: plan?.renewalInterval || 'monthly',
    maxMembers: plan?.maxMembers || '',
    benefits: (() => {
      if (!plan?.benefits) return [''];
      try {
        return JSON.parse(plan.benefits);
      } catch (e) {
        console.warn('Invalid benefits JSON for plan in modal:', plan.id, plan.benefits);
        return [''];
      }
    })()
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const addBenefit = () => {
    setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const removeBenefit = (index) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        benefits: formData.benefits.filter(benefit => benefit.trim())
      };

      if (plan) {
        await api.put(`/membership/plans/${plan.id}`, submitData);
      } else {
        await api.post('/membership/plans', submitData);
      }
      
      onSave();
    } catch (error) {
      alert('Error saving plan: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{plan ? 'Edit Plan' : 'Add Plan'}</h3>
          <button onClick={onClose} className="close-button">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Plan Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Basic Plan"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Plan description..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fee *</label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Renewal Interval *</label>
              <select
                name="renewalInterval"
                value={formData.renewalInterval}
                onChange={handleChange}
                required
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Max Members (optional)</label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="1"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="form-group">
            <label>Benefits</label>
            <div className="benefits-list">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder="Enter benefit..."
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="remove-benefit"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBenefit}
                className="add-benefit"
              >
                <i className="fas fa-plus"></i> Add Benefit
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 1px solid #ecf0f1;
          }

          .modal-header h3 {
            margin: 0;
            color: #2c3e50;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #7f8c8d;
            cursor: pointer;
          }

          .modal-form {
            padding: 30px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
          }

          .form-group label {
            margin-bottom: 8px;
            font-weight: 500;
            color: #2c3e50;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
          }

          .benefits-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .benefit-item {
            display: flex;
            gap: 10px;
            align-items: center;
          }

          .benefit-item input {
            flex: 1;
          }

          .remove-benefit {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
          }

          .add-benefit {
            background: #f8f9fa;
            color: #3498db;
            border: 1px solid #3498db;
            padding: 10px 15px;
            border-radius: 6px;
            cursor: pointer;
            align-self: flex-start;
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
          }

          .cancel-button,
          .save-button {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
          }

          .cancel-button {
            background: #f8f9fa;
            color: #6c757d;
          }

          .save-button {
            background: #3498db;
            color: white;
          }

          .save-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .form-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Plans;
