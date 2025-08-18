import React, { useState } from 'react';

const ScheduledPayments = () => {
  const [scheduledPayments, setScheduledPayments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="scheduled-payments-container">
      <div className="scheduled-payments-header">
        <h2>Scheduled Payments</h2>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <i className="fas fa-plus"></i> Add Scheduled Payment
        </button>
      </div>

      <div className="scheduled-payments-content">
        <div className="no-data">
          <i className="fas fa-calendar-alt"></i>
          <p>No scheduled payments configured</p>
        </div>
      </div>

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
          padding: 60px;
        }

        .no-data {
          text-align: center;
          color: #7f8c8d;
        }

        .no-data i {
          font-size: 4rem;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default ScheduledPayments;
