import React, { useState, useRef, useEffect } from 'react';

const EnhancedApplicationDropdown = ({ application, onStatusChange, onAddNotes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState(application.notes || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'interview' || newStatus === 'accepted' || newStatus === 'rejected') {
      setSelectedStatus(newStatus);
      setShowNotesModal(true);
    } else {
      onStatusChange(application.id, newStatus);
      setIsOpen(false);
    }
  };

  const handleConfirmStatusChange = () => {
    onStatusChange(application.id, selectedStatus, notes);
    setShowNotesModal(false);
    setNotes('');
    setSelectedStatus('');
    setIsOpen(false);
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'fas fa-clock',
      'reviewing': 'fas fa-eye',
      'interview': 'fas fa-calendar-alt',
      'accepted': 'fas fa-check-circle',
      'rejected': 'fas fa-times-circle'
    };
    return icons[status] || 'fas fa-circle';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'reviewing': '#17a2b8',
      'interview': '#007bff',
      'accepted': '#28a745',
      'rejected': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const statusOptions = [
    {
      value: 'reviewing',
      label: 'Mark as Reviewing',
      icon: 'fas fa-eye',
      color: '#17a2b8',
      description: 'Application is under review'
    },
    {
      value: 'interview',
      label: 'Schedule Interview',
      icon: 'fas fa-calendar-alt',
      color: '#007bff',
      description: 'Invite candidate for interview'
    },
    {
      value: 'accepted',
      label: 'Accept Application',
      icon: 'fas fa-check-circle',
      color: '#28a745',
      description: 'Hire the candidate'
    },
    {
      value: 'rejected',
      label: 'Reject Application',
      icon: 'fas fa-times-circle',
      color: '#dc3545',
      description: 'Decline the application'
    }
  ];

  return (
    <>
      <div className="dropdown" ref={dropdownRef}>
        <button 
          className="btn btn-outline-primary btn-sm dropdown-toggle d-flex align-items-center gap-2"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className="fas fa-cog me-1"></i>
          Actions
        </button>
        
        {isOpen && (
          <div className="dropdown-menu show p-0 border-0 shadow-lg enhanced-dropdown" style={{ minWidth: '300px' }}>
            {/* Current Status Header */}
            <div className="dropdown-header bg-light py-3 px-3 border-bottom">
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: `${getStatusColor(application.status)}20` 
                  }}
                >
                  <i 
                    className={getStatusIcon(application.status)} 
                    style={{ color: getStatusColor(application.status) }}
                  ></i>
                </div>
                <div>
                  <div className="fw-bold">Current Status</div>
                  <div className="text-capitalize text-muted">{application.status}</div>
                </div>
              </div>
            </div>

            {/* Status Options */}
            <div className="py-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={`dropdown-item d-flex align-items-center py-3 px-3 border-0 enhanced-dropdown-item ${application.status === option.value ? 'active' : ''}`}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={application.status === option.value}
                >
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      backgroundColor: `${option.color}20` 
                    }}
                  >
                    <i className={option.icon} style={{ color: option.color }}></i>
                  </div>
                  <div className="flex-grow-1 text-start">
                    <div className="fw-medium">{option.label}</div>
                    <div className="small text-muted">{option.description}</div>
                  </div>
                  {application.status === option.value && (
                    <i className="fas fa-check text-success"></i>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="dropdown-divider"></div>
            <div className="py-2">
              <button
                className="dropdown-item d-flex align-items-center py-2 px-3"
                onClick={() => {
                  setShowNotesModal(true);
                  setSelectedStatus(application.status);
                }}
              >
                <i className="fas fa-edit me-3 text-muted"></i>
                Add/Edit Notes
              </button>
              <button
                className="dropdown-item d-flex align-items-center py-2 px-3"
                onClick={() => {
                  // TODO: Implement email functionality
                  console.log('Send email to:', application.applicant.email);
                  setIsOpen(false);
                }}
              >
                <i className="fas fa-envelope me-3 text-muted"></i>
                Send Email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">
                  <i className={`${getStatusIcon(selectedStatus)} me-2`} 
                     style={{ color: getStatusColor(selectedStatus) }}></i>
                  {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowNotesModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-medium">Application Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Add notes about this application..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                  <div className="form-text">
                    Notes will be saved with the application and can be viewed later.
                  </div>
                </div>
                
                <div className="alert alert-info d-flex align-items-center">
                  <i className="fas fa-info-circle me-2"></i>
                  <div>
                    <strong>Status Change:</strong> {application.status} → {selectedStatus}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowNotesModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleConfirmStatusChange}
                >
                  <i className="fas fa-check me-2"></i>
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .enhanced-dropdown {
          border-radius: 12px !important;
          overflow: hidden;
          animation: dropdownSlideIn 0.2s ease-out;
          backdrop-filter: blur(10px);
        }

        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .enhanced-dropdown-item {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .enhanced-dropdown-item:hover:not(:disabled) {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          transform: translateX(4px);
          border-left: 4px solid #007bff;
        }

        .enhanced-dropdown-item.active {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
          border-left: 4px solid #2196f3;
        }

        .enhanced-dropdown-item:not(:disabled):active {
          transform: translateX(2px) scale(0.98);
        }

        .enhanced-dropdown-item:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dropdown-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
        }

        .modal-content {
          border-radius: 16px !important;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .btn {
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .alert {
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
        }

        .form-control {
          border-radius: 8px;
          border: 2px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .form-control:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
          transform: translateY(-1px);
        }

        .rounded-circle {
          transition: all 0.2s ease;
        }

        .enhanced-dropdown-item:hover .rounded-circle {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
};

export default EnhancedApplicationDropdown;
