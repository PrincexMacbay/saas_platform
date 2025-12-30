import React, { useState, useEffect } from 'react';
import { createCoupon, getCoupons, deleteCoupon, updateCoupon, getPlans } from '../../services/membershipService';
import ConfirmDialog from '../ConfirmDialog';
import { useMembershipData } from '../../contexts/MembershipDataContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Coupons = () => {
  const { data, loading: contextLoading, refreshData, isInitialized, isLoadingAll } = useMembershipData();
  const { t } = useLanguage();
  // Initialize with preloaded data if available and ensure it's an array
  const [coupons, setCoupons] = useState(Array.isArray(data.coupons) ? data.coupons : []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [formData, setFormData] = useState({
    name: '',
    couponId: '',
    discount: '',
    discountType: 'percentage',
    maxRedemptions: '',
    expiryDate: '',
    applicablePlans: []
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [planSearchTerm, setPlanSearchTerm] = useState('');
  const planDropdownRef = useRef(null);

  useEffect(() => {
    // Use preloaded data if available
    if (data.coupons && Array.isArray(data.coupons)) {
      console.log('🚀 Coupons: Using preloaded data', data.coupons.length, 'coupons');
      setCoupons(data.coupons);
    } else if (!contextLoading.coupons && !isLoadingAll) {
      console.log('🚀 Coupons: Fetching data (not preloaded)');
      loadCoupons();
    }
  }, [data.coupons, contextLoading.coupons, isLoadingAll]);

  useEffect(() => {
    // Load plans for selection
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      // Use plans from context if available
      if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
        setAvailablePlans(data.plans);
      } else {
        // Fetch plans if not in context
        const response = await getPlans();
        const plans = response.data?.data?.plans || [];
        setAvailablePlans(plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadCoupons = async () => {
    // Only set loading if we don't have preloaded data
    if (!data.coupons) {
      setLoading(true);
    }
    try {
      const response = await getCoupons();
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCouponId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, couponId: result }));
  };

  const handlePlanSelection = (planId) => {
    setFormData(prev => {
      const currentPlans = prev.applicablePlans || [];
      if (currentPlans.includes(planId)) {
        // Remove plan if already selected
        return {
          ...prev,
          applicablePlans: currentPlans.filter(id => id !== planId)
        };
      } else {
        // Add plan if not selected
        return {
          ...prev,
          applicablePlans: [...currentPlans, planId]
        };
      }
    });
  };

  const handleSelectAllPlans = () => {
    const allPlanIds = availablePlans.map(plan => plan.id);
    setFormData(prev => ({
      ...prev,
      applicablePlans: allPlanIds
    }));
  };

  const handleDeselectAllPlans = () => {
    setFormData(prev => ({
      ...prev,
      applicablePlans: []
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (planDropdownRef.current && !planDropdownRef.current.contains(event.target)) {
        setShowPlanDropdown(false);
      }
    };

    if (showPlanDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPlanDropdown]);

  // Filter plans based on search term
  const filteredPlans = availablePlans.filter(plan =>
    plan.name.toLowerCase().includes(planSearchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure applicablePlans is an array of numbers
      const submitData = {
        ...formData,
        applicablePlans: formData.applicablePlans || []
      };
      await createCoupon(submitData);
      setShowAddModal(false);
      setFormData({
        name: '',
        couponId: '',
        discount: '',
        discountType: 'percentage',
        maxRedemptions: '',
        expiryDate: '',
        applicablePlans: []
      });
      setPlanSearchTerm('');
      setShowPlanDropdown(false);
      await refreshData('coupons');
      loadCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      setError(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this coupon?',
      onConfirm: () => deleteCouponItem(id)
    });
  };

  const deleteCouponItem = async (id) => {
    try {
      await deleteCoupon(id);
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setError('Failed to delete coupon');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await updateCoupon(id, { isActive: !isActive });
      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      setError('Failed to update coupon');
    }
  };

  const getStatusBadge = (coupon) => {
    if (!coupon.isActive) {
      return <span className="badge badge-secondary">Inactive</span>;
    }
    
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return <span className="badge badge-danger">Expired</span>;
    }
    
    if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
      return <span className="badge badge-warning">Maxed Out</span>;
    }
    
    return <span className="badge badge-success">Active</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDiscount = (discount, discountType) => {
    if (discountType === 'percentage') {
      return `${discount}%`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(discount);
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="coupons-container">
      <div className="coupons-header">
        <h2>{t('coupons.title')}</h2>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <i className="fas fa-plus"></i> {t('coupons.add.coupon')}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="coupons-content">
        {!coupons.length && loading && !data.coupons ? (
          <div className="text-center py-5">
            <p style={{ color: '#666' }}>{t('coupons.loading')}</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-tag"></i>
            <p>{t('coupons.no.coupons')}</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              {t('coupons.create.first')}
            </button>
          </div>
        ) : (
          <div className="coupons-list">
            {coupons.map(coupon => (
              <div key={coupon.id} className={`coupon-card ${!coupon.isActive ? 'inactive' : ''} ${isExpired(coupon.expiryDate) ? 'expired' : ''}`}>
                <div className="coupon-info">
                  <div className="coupon-header">
                    <div className="coupon-main">
                      <h4>{coupon.name}</h4>
                      <div className="coupon-code">{coupon.couponId}</div>
                    </div>
                    <div className="coupon-badges">
                      {getStatusBadge(coupon)}
                    </div>
                  </div>
                  
                  <div className="coupon-details">
                    <div className="detail-item">
                      <span className="label">{t('coupons.discount')}:</span>
                      <span className="value discount-value">
                        {formatDiscount(coupon.discount, coupon.discountType)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">{t('coupons.redemptions')}:</span>
                      <span className="value">
                        {coupon.currentRedemptions || 0}
                        {coupon.maxRedemptions && ` / ${coupon.maxRedemptions}`}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">{t('coupons.expires')}:</span>
                      <span className={`value ${isExpired(coupon.expiryDate) ? 'expired' : ''}`}>
                        {formatDate(coupon.expiryDate)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="coupon-actions">
                  <button
                    onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                    className={`btn btn-sm ${coupon.isActive ? 'btn-warning' : 'btn-success'}`}
                    title={coupon.isActive ? t('coupons.deactivate') : t('coupons.activate')}
                  >
                    <i className={`fas fa-${coupon.isActive ? 'pause' : 'play'}`}></i>
                    {coupon.isActive ? t('coupons.deactivate') : t('coupons.activate')}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="btn btn-outline-danger btn-sm"
                    title={t('coupons.delete.coupon')}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{t('coupons.add.modal')}</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setPlanSearchTerm('');
                  setShowPlanDropdown(false);
                }}
                className="modal-close"
                disabled={loading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="name" className="form-label">{t('coupons.coupon.name')} *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder={t('coupons.coupon.name.placeholder')}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="couponId" className="form-label">{t('coupons.coupon.code')} *</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="couponId"
                    name="couponId"
                    className="form-control"
                    placeholder={t('coupons.coupon.code.placeholder')}
                    value={formData.couponId}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={generateCouponId}
                  >
                    {t('coupons.generate')}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="discount" className="form-label">{t('coupons.discount.amount')} *</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    className="form-control"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="discountType" className="form-label">{t('coupons.discount.type')} *</label>
                  <select
                    id="discountType"
                    name="discountType"
                    className="form-control"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">{t('coupons.percentage')}</option>
                    <option value="fixed">{t('coupons.fixed.amount')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="maxRedemptions" className="form-label">{t('coupons.max.redemptions')}</label>
                <input
                  type="number"
                  id="maxRedemptions"
                  name="maxRedemptions"
                  className="form-control"
                  placeholder={t('coupons.max.redemptions.placeholder')}
                  min="1"
                  value={formData.maxRedemptions}
                  onChange={handleInputChange}
                />
                <small className="form-text text-muted">
                  {t('coupons.max.redemptions.help')}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate" className="form-label">{t('coupons.expiry.date')}</label>
                <input
                  type="datetime-local"
                  id="expiryDate"
                  name="expiryDate"
                  className="form-control"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
                <small className="form-text text-muted">
                  Leave empty for no expiry date
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Applicable Membership Plans</label>
                <div className="plan-select-container" ref={planDropdownRef}>
                  {loadingPlans ? (
                    <p className="text-muted">Loading plans...</p>
                  ) : availablePlans.length === 0 ? (
                    <p className="text-muted">No plans available. Create a plan first.</p>
                  ) : (
                    <>
                      <div 
                        className="plan-select-trigger"
                        onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                      >
                        <div className="plan-select-display">
                          {formData.applicablePlans?.length > 0 ? (
                            <span className="selected-count">
                              {formData.applicablePlans.length} plan{formData.applicablePlans.length !== 1 ? 's' : ''} selected
                            </span>
                          ) : (
                            <span className="placeholder">Select plans (optional - leave empty for all plans)</span>
                          )}
                        </div>
                        <i className={`fas fa-chevron-${showPlanDropdown ? 'up' : 'down'}`}></i>
                      </div>
                      
                      {showPlanDropdown && (
                        <div className="plan-select-dropdown">
                          <div className="plan-select-header">
                            <div className="plan-search-box">
                              <i className="fas fa-search"></i>
                              <input
                                type="text"
                                placeholder="Search plans..."
                                value={planSearchTerm}
                                onChange={(e) => setPlanSearchTerm(e.target.value)}
                                className="plan-search-input"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="plan-select-actions">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectAllPlans();
                                }}
                                className="select-all-btn"
                              >
                                Select All
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeselectAllPlans();
                                }}
                                className="deselect-all-btn"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                          <div className="plan-select-options">
                            {filteredPlans.length === 0 ? (
                              <div className="no-plans-found">
                                <i className="fas fa-search"></i>
                                <p>No plans found matching "{planSearchTerm}"</p>
                              </div>
                            ) : (
                              filteredPlans.map(plan => (
                                <label
                                  key={plan.id}
                                  className={`plan-option ${formData.applicablePlans?.includes(plan.id) ? 'selected' : ''}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.applicablePlans?.includes(plan.id) || false}
                                    onChange={() => handlePlanSelection(plan.id)}
                                    className="plan-option-checkbox"
                                  />
                                  <div className="plan-option-content">
                                    <span className="plan-option-name">{plan.name}</span>
                                    <span className="plan-option-fee">
                                      {plan.fee === 0 || plan.fee === '0' || !plan.fee 
                                        ? 'Free' 
                                        : `$${parseFloat(plan.fee).toFixed(2)}`}
                                    </span>
                                  </div>
                                </label>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <small className="form-text text-muted">
                  Select which membership plans this coupon code will apply to. Leave empty to apply to all plans.
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setPlanSearchTerm('');
                    setShowPlanDropdown(false);
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  {t('coupons.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {t('coupons.creating')}
                    </>
                  ) : (
                    t('coupons.create.coupon')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .coupons-container {
          padding: 30px;
        }

        .coupons-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .coupons-header h2 {
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

        .coupons-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .no-data {
          text-align: center;
          color: #7f8c8d;
          padding: 60px 20px;
        }

        .no-data i {
          font-size: 4rem;
          margin-bottom: 20px;
          color: #e74c3c;
        }

        .coupons-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .coupon-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f8f9fa;
          transition: all 0.2s ease;
        }

        .coupon-card.inactive {
          opacity: 0.6;
          background: #f1f2f6;
        }

        .coupon-card.expired {
          border-color: #e74c3c;
          background: #fdf2f2;
        }

        .coupon-info {
          flex: 1;
        }

        .coupon-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .coupon-main h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .coupon-code {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #3498db;
          font-size: 16px;
          background: #ecf0f1;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }

        .coupon-details {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item .label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .detail-item .value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .detail-item .value.expired {
          color: #e74c3c;
          font-weight: 600;
        }

        .discount-value {
          color: #27ae60;
          font-weight: 600;
          font-size: 16px;
        }

        .coupon-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* Modal Styles */
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
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e0e0e0;
          background: #2c3e50;
          color: white;
        }

        .modal-header h3 {
          margin: 0;
          color: white;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 18px;
          color: white;
          cursor: pointer;
          padding: 4px;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-control {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-control:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .input-group {
          display: flex;
        }

        .input-group .form-control {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .input-group .btn {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        .form-text {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .plan-select-container {
          position: relative;
        }

        .plan-select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 44px;
        }

        .plan-select-trigger:hover {
          border-color: #3498db;
        }

        .plan-select-trigger:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .plan-select-display {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .selected-count {
          color: #2c3e50;
          font-weight: 500;
        }

        .placeholder {
          color: #999;
        }

        .plan-select-trigger i {
          color: #666;
          margin-left: 12px;
          transition: transform 0.2s ease;
        }

        .plan-select-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 300px;
          display: flex;
          flex-direction: column;
        }

        .plan-select-header {
          padding: 12px;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .plan-search-box {
          position: relative;
          margin-bottom: 8px;
        }

        .plan-search-box i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .plan-search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .plan-search-input:focus {
          outline: none;
          border-color: #3498db;
        }

        .plan-select-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .select-all-btn,
        .deselect-all-btn {
          padding: 4px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .select-all-btn {
          color: #3498db;
          border-color: #3498db;
        }

        .select-all-btn:hover {
          background: #3498db;
          color: white;
        }

        .deselect-all-btn {
          color: #666;
        }

        .deselect-all-btn:hover {
          background: #f0f0f0;
        }

        .plan-select-options {
          max-height: 200px;
          overflow-y: auto;
          padding: 4px;
        }

        .plan-option {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s ease;
          margin-bottom: 2px;
        }

        .plan-option:hover {
          background: #f0f0f0;
        }

        .plan-option.selected {
          background: #e8f4fd;
        }

        .plan-option-checkbox {
          margin-right: 12px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .plan-option-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .plan-option-name {
          color: #2c3e50;
          font-weight: 500;
          font-size: 14px;
        }

        .plan-option-fee {
          color: #27ae60;
          font-weight: 600;
          font-size: 13px;
          margin-left: 12px;
        }

        .no-plans-found {
          padding: 20px;
          text-align: center;
          color: #999;
        }

        .no-plans-found i {
          font-size: 24px;
          margin-bottom: 8px;
          display: block;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        .btn-success {
          background: #27ae60;
          color: white;
        }

        .btn-success:hover {
          background: #229954;
        }

        .btn-warning {
          background: #f39c12;
          color: white;
        }

        .btn-warning:hover {
          background: #e67e22;
        }

        .btn-outline-danger {
          background: transparent;
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }

        .btn-outline-danger:hover {
          background: #e74c3c;
          color: white;
        }

        .btn-outline-secondary {
          background: transparent;
          color: #6c757d;
          border: 1px solid #6c757d;
        }

        .btn-outline-secondary:hover {
          background: #6c757d;
          color: white;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge-warning {
          background: #f39c12;
          color: white;
        }

        .badge-success {
          background: #27ae60;
          color: white;
        }

        .badge-danger {
          background: #e74c3c;
          color: white;
        }

        .badge-secondary {
          background: #95a5a6;
          color: white;
        }

        @media (max-width: 768px) {
          .coupon-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .coupon-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .coupon-details {
            gap: 16px;
          }

          .coupon-actions {
            width: 100%;
            justify-content: space-between;
          }

          .form-row {
            flex-direction: column;
            gap: 0;
          }

          .modal-content {
            width: 95%;
            margin: 20px;
          }
        }
      `}</style>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
        confirmText={t('applications.delete')}
        cancelText={t('coupons.cancel')}
      />
    </div>
  );
};

export default Coupons;
