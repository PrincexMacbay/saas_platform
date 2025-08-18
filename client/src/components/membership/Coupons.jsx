import React, { useState } from 'react';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="coupons-container">
      <div className="coupons-header">
        <h2>Coupons</h2>
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <i className="fas fa-plus"></i> Add Coupon
        </button>
      </div>

      <div className="coupons-content">
        <div className="no-data">
          <i className="fas fa-ticket-alt"></i>
          <p>No coupons created yet</p>
        </div>
      </div>

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
          background: #9b59b6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .add-button:hover {
          background: #8e44ad;
        }

        .coupons-content {
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
          color: #9b59b6;
        }
      `}</style>
    </div>
  );
};

export default Coupons;
