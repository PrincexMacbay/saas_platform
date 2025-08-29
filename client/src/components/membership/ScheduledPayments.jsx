import React, { useState, useEffect } from 'react';
import { createScheduledPayment, getScheduledPayments, deleteScheduledPayment } from '../../services/membershipService';

const ScheduledPayments = () => {
  const [scheduledPayments, setScheduledPayments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    scheduledDate: '',
    frequency: 'one-time',
    description: '',
    planId: ''
  });

  useEffect(() => {
    loadScheduledPayments();
  }, []);

  const loadScheduledPayments = async () => {
    setLoading(true);
    try {
      const response = await getScheduledPayments();
      setScheduledPayments(response.data.scheduledPayments || []);
    } catch (error) {
      console.error('Error loading scheduled payments:', error);
      setError('Failed to load scheduled payments');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createScheduledPayment(formData);
      setShowAddModal(false);
      setFormData({
        amount: '',
        scheduledDate: '',
        frequency: 'one-time',
        description: '',
        planId: ''
      });
      loadScheduledPayments();
    } catch (error) {
      console.error('Error creating scheduled payment:', error);
      setError(error.response?.data?.message || 'Failed to create scheduled payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled payment?')) {
      try {
        await deleteScheduledPayment(id);
        loadScheduledPayments();
      } catch (error) {
        console.error('Error deleting scheduled payment:', error);
        setError('Failed to delete scheduled payment');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'badge-warning', text: 'Pending' },
      'processed': { class: 'badge-success', text: 'Processed' },
      'failed': { class: 'badge-danger', text: 'Failed' },
      'cancelled': { class: 'badge-secondary', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="scheduled-payments-container">
      <div className="scheduled-payments-header">
        <h2>Scheduled Payments</h2>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <i className="fas fa-plus"></i> Add Scheduled Payment
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="scheduled-payments-content">
        {loading && scheduledPayments.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading scheduled payments...</p>
          </div>
        ) : scheduledPayments.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-calendar-alt"></i>
            <p>No scheduled payments configured</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              Create Your First Scheduled Payment
            </button>
          </div>
        ) : (
          <div className="scheduled-payments-list">
            {scheduledPayments.map(payment => (
              <div key={payment.id} className="payment-card">
                <div className="payment-info">
                  <div className="payment-amount">
                    <h4>{formatCurrency(payment.amount)}</h4>
                    <p className="payment-description">{payment.description}</p>
                  </div>
                  <div className="payment-details">
                    <div className="detail-item">
                      <span className="label">Scheduled Date:</span>
                      <span className="value">{formatDate(payment.scheduledDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Frequency:</span>
                      <span className="value">{payment.frequency}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className="value">{getStatusBadge(payment.status)}</span>
                    </div>
                  </div>
                </div>
                <div className="payment-actions">
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="btn btn-outline-danger btn-sm"
                    title="Delete scheduled payment"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Scheduled Payment Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Scheduled Payment</h3>
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
                <label htmlFor="amount" className="form-label">Amount *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-control"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="scheduledDate" className="form-label">Scheduled Date *</label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  name="scheduledDate"
                  className="form-control"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency" className="form-label">Frequency *</label>
                <select
                  id="frequency"
                  name="frequency"
                  className="form-control"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="one-time">One Time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Enter payment description..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="planId" className="form-label">Associated Plan (Optional)</label>
                <select
                  id="planId"
                  name="planId"
                  className="form-control"
                  value={formData.planId}
                  onChange={handleInputChange}
                >
                  <option value="">Select a plan</option>
                  {/* Plan options would be populated from API */}
                </select>
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
                    'Create Scheduled Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .scheduled-payments-container {
          padding: 30px;
        }

        .scheduled-payments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .scheduled-payments-header h2 {
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

        .scheduled-payments-content {
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
        }

        .scheduled-payments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .payment-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .payment-info {
          flex: 1;
        }

        .payment-amount h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .payment-description {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 14px;
        }

        .payment-details {
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

        .payment-actions {
          display: flex;
          gap: 8px;
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

        .btn-outline-danger {
          background: transparent;
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }

        .btn-outline-danger:hover {
          background: #e74c3c;
          color: white;
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
          .payment-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .payment-details {
            gap: 16px;
          }

          .modal-content {
            width: 95%;
            margin: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScheduledPayments;
