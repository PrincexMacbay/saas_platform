import React, { useState } from 'react';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);

  return (
    <div className="reminders-container">
      <div className="reminders-header">
        <h2>Reminders</h2>
      </div>

      <div className="reminders-content">
        <div className="reminders-table-header">
          <div className="table-header-row">
            <span>Name</span>
            <span>Plan Name</span>
            <span>Status</span>
            <span>Type</span>
            <span>Reminder Date</span>
            <span>Plan Renewal Date</span>
            <span>Actions</span>
          </div>
        </div>
        
        <div className="no-data">
          <i className="fas fa-bell"></i>
          <p>No reminders configured</p>
        </div>
      </div>

      <style jsx>{`
        .reminders-container {
          padding: 30px;
        }

        .reminders-header {
          margin-bottom: 30px;
        }

        .reminders-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .reminders-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .reminders-table-header {
          background: #f8f9fa;
          padding: 15px 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr 0.5fr;
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
          color: #f39c12;
        }

        @media (max-width: 768px) {
          .reminders-container {
            padding: 20px;
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

export default Reminders;
