import React, { useState, useEffect } from 'react';
import { createDebt, getDebts, deleteDebt, updateDebtStatus } from '../../services/membershipService';
import ConfirmDialog from '../ConfirmDialog';
import { useMembershipData } from '../../contexts/MembershipDataContext';

const Debts = () => {
  const { data, loading: contextLoading, refreshData, isInitialized } = useMembershipData();
  const [debts, setDebts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    dataType: 'subscription',
    issuedOn: '',
    isManualEntry: false
  });

  useEffect(() => {
    // Use preloaded data if available
    if (data.debts && Array.isArray(data.debts)) {
      console.log('🚀 Debts: Using preloaded data', data.debts.length, 'debts');
      setDebts(data.debts);
    } else if (!contextLoading.debts) {
      console.log('🚀 Debts: Fetching data (not preloaded)');
      loadDebts();
    }
  }, [data.debts, contextLoading.debts]);

  const loadDebts = async () => {
    // Only set loading if we don't have preloaded data
    if (!data.debts) {
      setLoading(true);
    }
    try {
      const response = await getDebts();
      setDebts(response.data.debts || []);
    } catch (error) {
      console.error('Error loading debts:', error);
      setError('Failed to load debts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createDebt(formData);
      setShowAddModal(false);
      setFormData({
        amount: '',
        description: '',
        dataType: 'subscription',
        issuedOn: '',
        isManualEntry: false
      });
      loadDebts();
    } catch (error) {
      console.error('Error creating debt:', error);
      setError(error.response?.data?.message || 'Failed to create debt');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this debt?',
      onConfirm: () => deleteDebtItem(id)
    });
  };

  const deleteDebtItem = async (id) => {
    try {
      await deleteDebt(id);
      loadDebts();
    } catch (error) {
      console.error('Error deleting debt:', error);
      setError('Failed to delete debt');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDebtStatus(id, newStatus);
      loadDebts();
    } catch (error) {
      console.error('Error updating debt status:', error);
      setError('Failed to update debt status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'outstanding': { class: 'badge-warning', text: 'Outstanding' },
      'paid': { class: 'badge-success', text: 'Paid' },
      'written_off': { class: 'badge-secondary', text: 'Written Off' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getDataTypeBadge = (dataType) => {
    const typeConfig = {
      'subscription': { class: 'badge-info', text: 'Subscription' },
      'fee': { class: 'badge-primary', text: 'Fee' },
      'penalty': { class: 'badge-danger', text: 'Penalty' },
      'other': { class: 'badge-secondary', text: 'Other' }
    };
    
    const config = typeConfig[dataType] || { class: 'badge-secondary', text: dataType };
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

  const getTotalOutstanding = () => {
    return debts
      .filter(debt => debt.status === 'outstanding')
      .reduce((total, debt) => total + parseFloat(debt.amount), 0);
  };

  return (
    <div className="debts-container">
      <div className="debts-header">
        <div className="header-info">
          <h2>Debts & Outstanding Balances</h2>
          <div className="total-outstanding">
            <span className="label">Total Outstanding:</span>
            <span className="amount">{formatCurrency(getTotalOutstanding())}</span>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <i className="fas fa-plus"></i> Add Debt
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="debts-content">
        {!debts.length && loading && !data.debts ? (
          <div className="text-center py-5">
            <p style={{ color: '#666' }}>Loading debts...</p>
          </div>
        ) : debts.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-exclamation-triangle"></i>
            <p>No debts recorded</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              Add Your First Debt
            </button>
          </div>
        ) : (
          <div className="debts-list">
            {debts.map(debt => (
              <div key={debt.id} className="debt-card">
                <div className="debt-info">
                  <div className="debt-amount">
                    <h4>{formatCurrency(debt.amount)}</h4>
                    <p className="debt-description">{debt.description}</p>
                  </div>
                  <div className="debt-details">
                    <div className="detail-item">
                      <span className="label">Issued On:</span>
                      <span className="value">{formatDate(debt.issuedOn)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span className="value">{getDataTypeBadge(debt.dataType)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className="value">{getStatusBadge(debt.status)}</span>
                    </div>
                    {debt.isManualEntry && (
                      <div className="detail-item">
                        <span className="label">Entry Type:</span>
                        <span className="value badge badge-info">Manual</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="debt-actions">
                  {debt.status === 'outstanding' && (
                    <div className="status-actions">
                      <button
                        onClick={() => handleStatusUpdate(debt.id, 'paid')}
                        className="btn btn-success btn-sm"
                        title="Mark as paid"
                      >
                        <i className="fas fa-check"></i> Paid
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(debt.id, 'written_off')}
                        className="btn btn-warning btn-sm"
                        title="Write off"
                      >
                        <i className="fas fa-times"></i> Write Off
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(debt.id)}
                    className="btn btn-outline-danger btn-sm"
                    title="Delete debt"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Debt Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Debt</h3>
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
                <label htmlFor="description" className="form-label">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Enter debt description..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dataType" className="form-label">Debt Type *</label>
                <select
                  id="dataType"
                  name="dataType"
                  className="form-control"
                  value={formData.dataType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="subscription">Subscription</option>
                  <option value="fee">Fee</option>
                  <option value="penalty">Penalty</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="issuedOn" className="form-label">Issue Date *</label>
                <input
                  type="date"
                  id="issuedOn"
                  name="issuedOn"
                  className="form-control"
                  value={formData.issuedOn}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="isManualEntry"
                    name="isManualEntry"
                    className="form-check-input"
                    checked={formData.isManualEntry}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isManualEntry" className="form-check-label">
                    Manual Entry
                  </label>
                </div>
                <small className="form-text text-muted">
                  Check this if this debt was entered manually rather than generated automatically
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
                    'Create Debt'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .debts-container {
          padding: 30px;
        }

        .debts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-info h2 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .total-outstanding {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .total-outstanding .label {
          color: #666;
          font-size: 14px;
        }

        .total-outstanding .amount {
          color: #e74c3c;
          font-weight: 600;
          font-size: 18px;
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

        .debts-content {
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
          color: #f39c12;
        }

        .debts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .debt-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .debt-info {
          flex: 1;
        }

        .debt-amount h4 {
          margin: 0 0 8px 0;
          color: #e74c3c;
          font-weight: 600;
        }

        .debt-description {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 14px;
        }

        .debt-details {
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

        .debt-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .status-actions {
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

        .form-check {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-check-input {
          margin: 0;
        }

        .form-check-label {
          margin: 0;
          font-weight: 500;
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

        .badge-info {
          background: #3498db;
          color: white;
        }

        .badge-primary {
          background: #9b59b6;
          color: white;
        }

        @media (max-width: 768px) {
          .debts-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .debt-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .debt-details {
            gap: 16px;
          }

          .debt-actions {
            width: 100%;
            justify-content: space-between;
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

export default Debts;
