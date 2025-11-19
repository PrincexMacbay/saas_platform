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
              <div className="stat-label">{t('admin.coupon.total')}</div>
              <div className="stat-value">{stats.totalCoupons || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">{t('admin.coupon.active')}</div>
              <div className="stat-value">{stats.activeCoupons || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">{t('admin.coupon.redemptions')}</div>
              <div className="stat-value">{stats.totalRedemptions || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-label">{t('admin.coupon.expired')}</div>
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
                    <span className="detail-label">{t('admin.coupon.created')}</span>
                    <span className="detail-value">{formatDate(coupon.createdAt)}</span>
                  </div>
                  {coupon.expiryDate && (
                    <div className="detail-item">
                      <span className="detail-label">{t('admin.coupon.expires')}</span>
                      <span className="detail-value">{formatDate(coupon.expiryDate)}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">{t('admin.coupon.redemptions.label')}</span>
                    <span className="detail-value">
                      {coupon.currentRedemptions || 0} / {coupon.maxRedemptions || '∞'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('admin.coupon.usage.rate')}</span>
                    <span className="detail-value">{getUsageRate(coupon)}</span>
                  </div>
                </div>
                <div className="coupon-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditCoupon(coupon)}
                  >
                    {t('admin.coupon.edit')}
                  </button>
                  <button className="btn btn-sm btn-outline">{t('admin.coupon.view.usage')}</button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    {t('admin.coupon.delete')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">{t('admin.coupon.no.coupons')}</div>
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
            <i className="fas fa-plus"></i> {t('admin.coupon.create')}
          </button>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCouponId ? t('admin.coupon.edit.coupon') : t('admin.coupon.create')}</h3>
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
                <label>{t('admin.coupon.name')}</label>
                <input
                  type="text"
                  value={couponForm.name}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('admin.coupon.name.placeholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('admin.coupon.code')}</label>
                <input
                  type="text"
                  value={couponForm.couponId}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, couponId: e.target.value }))}
                  placeholder={t('admin.coupon.code.placeholder')}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.coupon.discount.type')}</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, discountType: e.target.value }))}
                  >
                    <option value="percentage">{t('admin.coupon.discount.percentage')}</option>
                    <option value="fixed">{t('admin.coupon.discount.fixed')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('admin.coupon.discount.value')}</label>
                  <input
                    type="number"
                    value={couponForm.discount}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder={t('admin.coupon.discount.placeholder')}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.coupon.max.redemptions')}</label>
                  <input
                    type="number"
                    value={couponForm.maxRedemptions}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, maxRedemptions: e.target.value }))}
                    placeholder={t('admin.coupon.max.redemptions.placeholder')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin.coupon.expiry.date')}</label>
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
                  {t('admin.coupon.active.coupon')}
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowCreateModal(false)}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveCoupon}
              >
                {editingCouponId ? t('admin.coupon.update') : t('admin.coupon.create.button')}
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
