import React, { useState } from 'react';

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="debts-container">
      <div className="debts-header">
        <h2>Debts</h2>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <i className="fas fa-plus"></i> Add Debt
        </button>
      </div>

      <div className="debts-content">
        <div className="debts-table-header">
          <div className="table-header-row">
            <span>Created Date</span>
            <span>Issued On</span>
            <span>Full Name</span>
            <span>Plan</span>
            <span>Manual Entry</span>
            <span>Data Type</span>
            <span>Amount</span>
            <span>Actions</span>
          </div>
        </div>
        
        <div className="no-data">
          <i className="fas fa-exclamation-triangle"></i>
          <p>No debts found</p>
        </div>
      </div>

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

        .debts-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .add-button {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .add-button:hover {
          background: #c0392b;
        }

        .debts-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .debts-table-header {
          background: #f8f9fa;
          padding: 15px 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1fr 1fr 0.5fr;
          gap: 15px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .no-data {
          text-align: center;
          padding: 60px;
          color: #7f8c8d;
        }

        .no-data i {
          font-size: 4rem;
          margin-bottom: 20px;
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .debts-container {
            padding: 20px;
          }

          .debts-header {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .table-header-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Debts;
