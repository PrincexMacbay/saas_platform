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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3498db] mb-4"></div>
          <p className="text-gray-600">Loading coupon data...</p>
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
          onClick={fetchCouponData} 
          className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = couponData.stats || {};

  return (
    <div className="coupon-management">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('admin.coupon.title') || 'Coupon Management'}
            </h1>
            <p className="text-gray-600">
              {t('admin.coupon.description') || 'Create and manage discount coupons and promotional codes'}
            </p>
          </div>
          <button 
            className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            onClick={handleCreateCoupon}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('admin.coupon.create') || 'Create Coupon'}
          </button>
        </div>
      </div>

      {/* Coupon Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('admin.coupon.analytics') || 'Coupon Analytics'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{t('admin.coupon.total') || 'Total Coupons'}</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCoupons || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{t('admin.coupon.active') || 'Active Coupons'}</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCoupons || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{t('admin.coupon.redemptions') || 'Total Redemptions'}</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRedemptions || 0}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">{t('admin.coupon.expired') || 'Expired Coupons'}</p>
                <p className="text-3xl font-bold text-gray-900">{stats.expiredCoupons || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {t('admin.coupon.performance') || 'Coupon Performance'}
          </h3>
        </div>
        <div className="space-y-4">
          {couponData.coupons && couponData.coupons.length > 0 ? (
            couponData.coupons.map(coupon => (
              <div key={coupon.id} className={`p-6 bg-gray-50 rounded-lg border-2 ${isExpired(coupon) ? 'border-red-200 bg-red-50' : 'border-gray-200'} hover:bg-gray-100 transition-colors`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{coupon.name}</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <code className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-800">
                        {coupon.couponId}
                      </code>
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        coupon.discountType === 'percentage' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {formatDiscount(coupon)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {isExpired(coupon) && (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Expired
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('admin.coupon.created') || 'Created:'}</span>
                    <div className="font-medium text-gray-900">{formatDate(coupon.createdAt)}</div>
                  </div>
                  {coupon.expiryDate && (
                    <div>
                      <span className="text-gray-600">{t('admin.coupon.expires') || 'Expires:'}</span>
                      <div className="font-medium text-gray-900">{formatDate(coupon.expiryDate)}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">{t('admin.coupon.redemptions.label') || 'Redemptions:'}</span>
                    <div className="font-medium text-gray-900">
                      {coupon.currentRedemptions || 0} / {coupon.maxRedemptions || '∞'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('admin.coupon.usage.rate') || 'Usage Rate:'}</span>
                    <div className="font-medium text-gray-900">{getUsageRate(coupon)}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-[#3498db] border border-[#3498db] rounded-lg hover:bg-[#3498db] hover:text-white transition-colors"
                    onClick={() => handleEditCoupon(coupon)}
                  >
                    {t('admin.coupon.edit') || 'Edit'}
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    {t('admin.coupon.view.usage') || 'View Usage'}
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    {t('admin.coupon.delete') || 'Delete'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">{t('admin.coupon.no.coupons') || 'No coupons found'}</div>
          )}
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
