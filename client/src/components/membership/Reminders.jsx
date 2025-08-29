import React, { useState, useEffect } from 'react';
import { createReminder, getReminders, deleteReminder, sendReminder } from '../../services/membershipService';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'renewal',
    reminderDate: '',
    message: ''
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const response = await getReminders();
      setReminders(response.data.reminders || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
      setError('Failed to load reminders');
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
      await createReminder(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        type: 'renewal',
        reminderDate: '',
        message: ''
      });
      loadReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      setError(error.response?.data?.message || 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await deleteReminder(id);
        loadReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
        setError('Failed to delete reminder');
      }
    }
  };

  const handleSendNow = async (id) => {
    try {
      await sendReminder(id);
      loadReminders();
    } catch (error) {
      console.error('Error sending reminder:', error);
      setError('Failed to send reminder');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'badge-warning', text: 'Pending' },
      'sent': { class: 'badge-success', text: 'Sent' },
      'failed': { class: 'badge-danger', text: 'Failed' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'renewal': { class: 'badge-info', text: 'Renewal' },
      'payment_due': { class: 'badge-warning', text: 'Payment Due' },
      'overdue': { class: 'badge-danger', text: 'Overdue' },
      'welcome': { class: 'badge-success', text: 'Welcome' },
      'custom': { class: 'badge-secondary', text: 'Custom' }
    };
    
    const config = typeConfig[type] || { class: 'badge-secondary', text: type };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (reminderDate) => {
    return new Date(reminderDate) < new Date();
  };

  return (
    <div className="reminders-container">
      <div className="reminders-header">
        <h2>Reminders & Notifications</h2>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <i className="fas fa-plus"></i> Add Reminder
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="reminders-content">
        {loading && reminders.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-bell"></i>
            <p>No reminders configured</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              Create Your First Reminder
            </button>
          </div>
        ) : (
          <div className="reminders-list">
            {reminders.map(reminder => (
              <div key={reminder.id} className={`reminder-card ${isOverdue(reminder.reminderDate) ? 'overdue' : ''}`}>
                <div className="reminder-info">
                  <div className="reminder-header">
                    <h4>{reminder.name}</h4>
                    <div className="reminder-badges">
                      {getTypeBadge(reminder.type)}
                      {getStatusBadge(reminder.status)}
                    </div>
                  </div>
                  <p className="reminder-message">{reminder.message}</p>
                  <div className="reminder-details">
                    <div className="detail-item">
                      <span className="label">Scheduled:</span>
                      <span className={`value ${isOverdue(reminder.reminderDate) ? 'overdue' : ''}`}>
                        {formatDate(reminder.reminderDate)}
                      </span>
                    </div>
                    {reminder.user && (
                      <div className="detail-item">
                        <span className="label">Recipient:</span>
                        <span className="value">{reminder.user.firstName} {reminder.user.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="reminder-actions">
                  {reminder.status === 'pending' && (
                    <button
                      onClick={() => handleSendNow(reminder.id)}
                      className="btn btn-success btn-sm"
                      title="Send now"
                    >
                      <i className="fas fa-paper-plane"></i> Send Now
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="btn btn-outline-danger btn-sm"
                    title="Delete reminder"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Reminder</h3>
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
                <label htmlFor="name" className="form-label">Reminder Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="Enter reminder name..."
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type" className="form-label">Reminder Type *</label>
                <select
                  id="type"
                  name="type"
                  className="form-control"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="renewal">Renewal Reminder</option>
                  <option value="payment_due">Payment Due</option>
                  <option value="overdue">Overdue Notice</option>
                  <option value="welcome">Welcome Message</option>
                  <option value="custom">Custom Reminder</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reminderDate" className="form-label">Reminder Date & Time *</label>
                <input
                  type="datetime-local"
                  id="reminderDate"
                  name="reminderDate"
                  className="form-control"
                  value={formData.reminderDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-control"
                  rows="4"
                  placeholder="Enter reminder message..."
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
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
                    'Create Reminder'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .reminders-container {
          padding: 30px;
        }

        .reminders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .reminders-header h2 {
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

        .reminders-content {
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
          color: #3498db;
        }

        .reminders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .reminder-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f8f9fa;
          transition: all 0.2s ease;
        }

        .reminder-card.overdue {
          border-color: #e74c3c;
          background: #fdf2f2;
        }

        .reminder-info {
          flex: 1;
        }

        .reminder-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .reminder-header h4 {
          margin: 0;
          color: #2c3e50;
          font-weight: 600;
        }

        .reminder-badges {
          display: flex;
          gap: 8px;
        }

        .reminder-message {
          margin: 0 0 16px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .reminder-details {
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

        .detail-item .value.overdue {
          color: #e74c3c;
          font-weight: 600;
        }

        .reminder-actions {
          display: flex;
          gap: 8px;
          align-items: flex-start;
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

        .btn-success {
          background: #27ae60;
          color: white;
        }

        .btn-success:hover {
          background: #229954;
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

        @media (max-width: 768px) {
          .reminder-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .reminder-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .reminder-details {
            gap: 16px;
          }

          .reminder-actions {
            width: 100%;
            justify-content: space-between;
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

export default Reminders;
