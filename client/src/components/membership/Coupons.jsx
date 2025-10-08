import React, { useState, useEffect } from 'react';
import { createCoupon, getCoupons, deleteCoupon, updateCoupon } from '../../services/membershipService';
import ConfirmDialog from '../ConfirmDialog';
import { useMembershipData } from '../../contexts/MembershipDataContext';

const Coupons = () => {
  const { data, loading: contextLoading, refreshData, isInitialized, isLoadingAll } = useMembershipData();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createCoupon(formData);
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
        <h2>Coupons & Discounts</h2>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <i className="fas fa-plus"></i> Add Coupon
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
            <p style={{ color: '#666' }}>Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-tag"></i>
            <p>No coupons configured</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              Create Your First Coupon
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
                      <span className="label">Discount:</span>
                      <span className="value discount-value">
                        {formatDiscount(coupon.discount, coupon.discountType)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Redemptions:</span>
                      <span className="value">
                        {coupon.currentRedemptions || 0}
                        {coupon.maxRedemptions && ` / ${coupon.maxRedemptions}`}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Expires:</span>
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
                    title={coupon.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <i className={`fas fa-${coupon.isActive ? 'pause' : 'play'}`}></i>
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="btn btn-outline-danger btn-sm"
                    title="Delete coupon"
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
              <h3>Add New Coupon</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="modal-close"
                disabled={loading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Coupon Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="Enter coupon name..."
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="couponId" className="form-label">Coupon Code *</label>
                <div className="input-group">
                  <input
                    type="text"
                    id="couponId"
                    name="couponId"
                    className="form-control"
                    placeholder="Enter coupon code..."
                    value={formData.couponId}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={generateCouponId}
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="discount" className="form-label">Discount Amount *</label>
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
                  <label htmlFor="discountType" className="form-label">Discount Type *</label>
                  <select
                    id="discountType"
                    name="discountType"
                    className="form-control"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="maxRedemptions" className="form-label">Max Redemptions</label>
                <input
                  type="number"
                  id="maxRedemptions"
                  name="maxRedemptions"
                  className="form-control"
                  placeholder="Leave empty for unlimited"
                  min="1"
                  value={formData.maxRedemptions}
                  onChange={handleInputChange}
                />
                <small className="form-text text-muted">
                  Leave empty for unlimited redemptions
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
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

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Coupon'
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
        }

        .modal-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 18px;
          color: #666;
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
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Coupons;
