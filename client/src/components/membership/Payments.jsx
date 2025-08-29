import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CryptoPayment from './CryptoPayment';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('crypto');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPlanId, setPaymentPlanId] = useState(null);
  const [paymentDescription, setPaymentDescription] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchPlans();
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await api.get('/membership/payments', { params });
      setPayments(response.data.data.payments);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/membership/plans', { params: { limit: 100 } });
      setPlans(response.data.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', { params: { limit: 100 } });
      setUsers(response.data.data.users || response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      completed: 'success',
      failed: 'danger',
      refunded: 'info'
    };
    
    return (
      <span className={`status-badge ${statusColors[status] || 'secondary'}`}>
        {status}
      </span>
    );
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowPaymentModal(true);
  };

  const handleCryptoPayment = (amount, planId, description) => {
    setPaymentAmount(amount);
    setPaymentPlanId(planId);
    setPaymentDescription(description);
    setSelectedPaymentMethod('crypto');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    fetchPayments();
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowAddModal(true);
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      await api.delete(`/membership/payments/${paymentId}`);
      fetchPayments();
    } catch (error) {
      alert('Error deleting payment: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h2>Payments</h2>
        <button onClick={handleAddPayment} className="add-button">
          <i className="fas fa-plus"></i> Add Payment
        </button>
      </div>

      <div className="payments-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, reference number..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="status-filter"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Payment Date</th>
              <th>Full Name</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Identifier</th>
              <th>Reference Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{formatDate(payment.paymentDate)}</td>
                <td>
                  {payment.user 
                    ? `${payment.user.firstName || ''} ${payment.user.lastName || ''}`.trim() || payment.user.username
                    : 'N/A'
                  }
                </td>
                <td>{payment.plan?.name || 'N/A'}</td>
                <td>{formatCurrency(payment.amount)}</td>
                <td style={{ textTransform: 'capitalize' }}>
                  {payment.paymentMethod?.replace('_', ' ')}
                </td>
                <td>{payment.identifier || '-'}</td>
                <td>{payment.referenceNumber || '-'}</td>
                <td>{getStatusBadge(payment.status)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditPayment(payment)}
                      className="edit-button"
                      title="Edit Payment"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="delete-button"
                      title="Delete Payment"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && !loading && (
          <div className="no-data">
            <i className="fas fa-credit-card"></i>
            <p>No payments found</p>
          </div>
        )}
      </div>

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

      {showAddModal && (
        <PaymentModal
          payment={editingPayment}
          plans={plans}
          users={users}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            fetchPayments();
          }}
        />
      )}

      <style jsx>{`
        .payments-container {
          padding: 30px;
        }

        .payments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .payments-header h2 {
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

        .payments-filters {
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

        .payments-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .payments-table {
          width: 100%;
          border-collapse: collapse;
        }

        .payments-table th,
        .payments-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .payments-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payments-table td {
          color: #34495e;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.success {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.warning {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.danger {
          background: #f8d7da;
          color: #721c24;
        }

        .status-badge.info {
          background: #d1ecf1;
          color: #0c5460;
        }

        .action-buttons {
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

        .no-data {
          text-align: center;
          padding: 60px;
          color: #7f8c8d;
        }

        .no-data i {
          font-size: 4rem;
          margin-bottom: 20px;
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
          .payments-container {
            padding: 20px;
          }

          .payments-header {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .payments-filters {
            flex-direction: column;
          }

          .payments-table-container {
            overflow-x: auto;
          }

          .payments-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ payment, plans, users, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    userId: payment?.userId || '',
    planId: payment?.planId || '',
    amount: payment?.amount || '',
    paymentMethod: payment?.paymentMethod || 'cash',
    paymentDate: payment?.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    identifier: payment?.identifier || '',
    referenceNumber: payment?.referenceNumber || '',
    status: payment?.status || 'pending',
    notes: payment?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (payment) {
        await api.put(`/membership/payments/${payment.id}`, formData);
      } else {
        await api.post('/membership/payments', formData);
      }
      onSave();
    } catch (error) {
      alert('Error saving payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{payment ? 'Edit Payment' : 'Add Payment'}</h3>
          <button onClick={onClose} className="close-button">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>User *</label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Plan</label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleChange}
              >
                <option value="">Select Plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.fee}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="mobile_payment">Mobile Payment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Payment Date *</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Identifier</label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Transaction ID"
              />
            </div>

            <div className="form-group">
              <label>Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="Reference number"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Saving...' : 'Save Payment'}
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

        {/* Crypto Payment Modal */}
        {showPaymentModal && selectedPaymentMethod === 'crypto' && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <CryptoPayment
                amount={paymentAmount}
                planId={paymentPlanId}
                description={paymentDescription}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
