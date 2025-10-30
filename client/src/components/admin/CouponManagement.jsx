import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import ConfirmDialog from '../ConfirmDialog';
import './CouponManagement.css';

const CouponManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponData, setCouponData] = useState({
    stats: null,
    coupons: []
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [couponForm, setCouponForm] = useState({
    name: '',
    couponId: '',
    discount: '',
    discountType: 'percentage',
    maxRedemptions: '',
    expiryDate: '',
    isActive: true
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchCouponData();
  }, []);

  const fetchCouponData = async () => {
    try {
      setLoading(true);
      console.log('Fetching coupon data...');
      const response = await adminService.getCouponData();
      console.log('Coupon data response:', response);
      setCouponData(response.data || {});
      setError(null);
    } catch (err) {
      console.error('Error fetching coupon data:', err);
      setError('Failed to load coupon data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discount}%`;
    }
    return `$${coupon.discount}`;
  };

  const getUsageRate = (coupon) => {
    const maxRedemptions = coupon.maxRedemptions || 0;
    const currentRedemptions = coupon.currentRedemptions || 0;
    if (maxRedemptions === 0) return 'Unlimited';
    return ((currentRedemptions / maxRedemptions) * 100).toFixed(1) + '%';
  };

  const isExpired = (coupon) => {
    if (!coupon.expiryDate) return false;
    return new Date(coupon.expiryDate) < new Date();
  };

  const handleCreateCoupon = () => {
    setEditingCouponId(null);
    setShowCreateModal(true);
    setCouponForm({
      name: '',
      couponId: '',
      discount: '',
      discountType: 'percentage',
      maxRedemptions: '',
      expiryDate: '',
      isActive: true
    });
  };

  const handleSaveCoupon = async () => {
    try {
      if (editingCouponId) {
        console.log('Updating coupon:', editingCouponId, couponForm);
        await adminService.updateCoupon(editingCouponId, couponForm);
        console.log('✅ Coupon updated successfully');
      } else {
        console.log('Creating coupon:', couponForm);
        await adminService.createCoupon(couponForm);
        console.log('✅ Coupon created successfully');
      }
      setShowCreateModal(false);
      setEditingCouponId(null);
      fetchCouponData();
    } catch (err) {
      console.error('❌ Error saving coupon:', err);
      setError(`Failed to ${editingCouponId ? 'update' : 'create'} coupon. Please try again.`);
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCouponId(coupon.id);
    setCouponForm({
      name: coupon.name,
      couponId: coupon.couponId,
      discount: coupon.discount,
      discountType: coupon.discountType,
      maxRedemptions: coupon.maxRedemptions || '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    });
    setShowCreateModal(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    setConfirmDialog({
      message: 'Are you sure you want to delete this coupon?',
      onConfirm: async () => {
        try {
          await adminService.deleteCoupon(couponId);
          fetchCouponData();
          setConfirmDialog(null);
        } catch (err) {
          console.error('Error deleting coupon:', err);
          setError('Failed to delete coupon. Please try again.');
          setConfirmDialog(null);
        }
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  if (loading) {
    return (
      <div className="coupon-management">
        <div className="loading">Loading coupon data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coupon-management">
        <div className="error">{error}</div>
      </div>
    );
  }

  const stats = couponData.stats || {};

  return (
    <div className="coupon-management">
      <div className="management-header">
        <h2>{t('admin.coupon.title')}</h2>
        <p>{t('admin.coupon.description')}</p>
      </div>

      {/* Coupon Analytics */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.coupon.analytics')}</h3>
        
        <div className="coupon-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-content">
              <div className="stat-label">Total Coupons</div>
              <div className="stat-value">{stats.totalCoupons || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">Active Coupons</div>
              <div className="stat-value">{stats.activeCoupons || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Total Redemptions</div>
              <div className="stat-value">{stats.totalRedemptions || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-label">Expired Coupons</div>
              <div className="stat-value">{stats.expiredCoupons || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Performance */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.coupon.performance')}</h3>
        <div className="coupons-list">
          {couponData.coupons && couponData.coupons.length > 0 ? (
            couponData.coupons.map(coupon => (
              <div key={coupon.id} className={`coupon-item ${isExpired(coupon) ? 'expired' : ''}`}>
                <div className="coupon-header">
                  <div className="coupon-info">
                    <h4 className="coupon-name">{coupon.name}</h4>
                    <div className="coupon-code">
                      <code>{coupon.couponId}</code>
                      <span className={`coupon-discount ${coupon.discountType}`}>
                        {formatDiscount(coupon)}
                      </span>
                    </div>
                  </div>
                  <div className="coupon-badges">
                    <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {isExpired(coupon) && (
                      <span className="status-badge expired">Expired</span>
                    )}
                  </div>
                </div>
                <div className="coupon-details">
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{formatDate(coupon.createdAt)}</span>
                  </div>
                  {coupon.expiryDate && (
                    <div className="detail-item">
                      <span className="detail-label">Expires:</span>
                      <span className="detail-value">{formatDate(coupon.expiryDate)}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Redemptions:</span>
                    <span className="detail-value">
                      {coupon.currentRedemptions || 0} / {coupon.maxRedemptions || '∞'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Usage Rate:</span>
                    <span className="detail-value">{getUsageRate(coupon)}</span>
                  </div>
                </div>
                <div className="coupon-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditCoupon(coupon)}
                  >
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline">View Usage</button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No coupons found</div>
          )}
        </div>
      </div>

      {/* Create New Coupon */}
      <div className="chart-container">
        <h3 className="chart-title">{t('admin.coupon.create')}</h3>
        <div className="create-coupon-section">
          <button 
            className="btn btn-primary"
            onClick={handleCreateCoupon}
          >
            <i className="fas fa-plus"></i> Create New Coupon
          </button>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCouponId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCouponId(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Coupon Name</label>
                <input
                  type="text"
                  value={couponForm.name}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter coupon name"
                />
              </div>
              <div className="form-group">
                <label>Coupon Code</label>
                <input
                  type="text"
                  value={couponForm.couponId}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, couponId: e.target.value }))}
                  placeholder="Enter coupon code"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, discountType: e.target.value }))}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value</label>
                  <input
                    type="number"
                    value={couponForm.discount}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="Enter discount"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Max Redemptions</label>
                  <input
                    type="number"
                    value={couponForm.maxRedemptions}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active Coupon
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveCoupon}
              >
                {editingCouponId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
};

export default CouponManagement;
