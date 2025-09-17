import React from 'react';

const ConfirmDialog = ({ isOpen, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-dialog">
        <div className="confirm-dialog-header">
          <h3>Confirm Action</h3>
        </div>
        
        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>
        
        <div className="confirm-dialog-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>

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

        .modal-content.confirm-dialog {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .confirm-dialog-header {
          padding: 20px 20px 0 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .confirm-dialog-header h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .confirm-dialog-body {
          padding: 20px;
        }

        .confirm-dialog-body p {
          margin: 0;
          color: #666;
          line-height: 1.5;
          font-size: 1rem;
        }

        .confirm-dialog-footer {
          padding: 0 20px 20px 20px;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .modal-content.confirm-dialog {
            width: 95%;
            margin: 20px;
          }

          .confirm-dialog-footer {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
