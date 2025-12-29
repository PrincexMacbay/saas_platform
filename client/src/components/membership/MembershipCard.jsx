import React, { useState } from 'react';
import { getDigitalCard } from '../../services/membershipService';

const MembershipCard = ({ membership, onViewCard }) => {
  const [showCard, setShowCard] = useState(false);
  const [digitalCard, setDigitalCard] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleViewCard = async () => {
    if (digitalCard) {
      setShowCard(true);
      return;
    }

    setLoading(true);
    try {
      const response = await getDigitalCard(membership.id);
      setDigitalCard(response.data.data);
      setShowCard(true);
    } catch (error) {
      console.error('Error fetching digital card:', error);
      // If no digital card exists, show a basic card
      const startDate = getStartDate();
      setDigitalCard({
        organizationName: membership.plan?.organization?.name || membership.plan?.name || 'Organization',
        cardTitle: 'Membership Card',
        headerText: startDate ? `Member Since ${new Date(startDate).getFullYear()}` : 'Membership Card',
        footerText: 'Thank you for being a member',
        primaryColor: '#3498db',
        secondaryColor: '#2c3e50',
        textColor: '#ffffff'
      });
      setShowCard(true);
    }
    setLoading(false);
  };

  // Get start date from multiple possible sources
  const getStartDate = () => {
    return membership.startDate || 
           membership.subscription?.startDate || 
           membership.subscription?.createdAt ||
           membership.application?.approvedAt ||
           membership.createdAt ||
           membership.subscription?.createdAt;
  };

  // Format date nicely
  const formatDate = (date) => {
    if (!date) return null;
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return null;
    }
  };

  // Get status explanation
  const getStatusExplanation = (status) => {
    switch (status) {
      case 'active':
        return 'Your membership is active and in good standing';
      case 'pending':
        return 'Application submitted. Awaiting approval or payment completion';
      case 'past_due':
        return 'Payment is overdue. Please update your payment method';
      case 'cancelled':
        return 'This membership has been cancelled';
      case 'expired':
        return 'This membership has expired';
      default:
        return 'Status information unavailable';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'past_due': return '#e74c3c';
      case 'cancelled': return '#95a5a6';
      case 'expired': return '#34495e';
      default: return '#3498db';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'fa-check-circle';
      case 'pending': return 'fa-clock';
      case 'past_due': return 'fa-exclamation-triangle';
      case 'cancelled': return 'fa-times-circle';
      case 'expired': return 'fa-calendar-times';
      default: return 'fa-info-circle';
    }
  };

  const startDate = getStartDate();
  const formattedDate = formatDate(startDate);
  const statusColor = getStatusColor(membership.status);
  const statusIcon = getStatusIcon(membership.status);

  return (
    <div className="membership-card">
      <div className="card h-100">
        <div className="card-body">
          {/* Header with Plan Name and Status */}
          <div className="card-header-section">
            <div className="plan-name-section">
              <h6 className="card-title">{membership.plan?.name || 'Unknown Plan'}</h6>
              {membership.plan?.organization?.name && (
                <p className="organization-name">{membership.plan.organization.name}</p>
              )}
            </div>
            <div 
              className="status-badge" 
              style={{ backgroundColor: `${statusColor}15`, borderColor: statusColor }}
              title={getStatusExplanation(membership.status)}
            >
              <i className={`fas ${statusIcon}`} style={{ color: statusColor }}></i>
              <span style={{ color: statusColor }}>{membership.status?.charAt(0).toUpperCase() + membership.status?.slice(1) || 'Unknown'}</span>
            </div>
          </div>
          
          {/* Membership Details */}
          <div className="membership-details">
            <div className="detail-row">
              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-id-card"></i>
                  <span>Member #</span>
                </div>
                <div className="detail-value">{membership.memberNumber || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Member Since</span>
                </div>
                <div className="detail-value">
                  {formattedDate || (startDate ? new Date(startDate).getFullYear().toString() : 'N/A')}
                </div>
              </div>
            </div>
            
            {membership.endDate && (
              <div className="detail-row">
                <div className="detail-item">
                  <div className="detail-label">
                    <i className="fas fa-calendar-times"></i>
                    <span>Expires</span>
                  </div>
                  <div className="detail-value">{formatDate(membership.endDate) || new Date(membership.endDate).toLocaleDateString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <i className="fas fa-sync-alt"></i>
                    <span>Auto Renew</span>
                  </div>
                  <div className="detail-value">
                    {membership.autoRenew ? (
                      <span className="auto-renew-yes">
                        <i className="fas fa-check"></i> Yes
                      </span>
                    ) : (
                      <span className="auto-renew-no">
                        <i className="fas fa-times"></i> No
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status Explanation */}
            {membership.status === 'pending' && (
              <div className="status-explanation">
                <i className="fas fa-info-circle"></i>
                <span>{getStatusExplanation(membership.status)}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="card-action">
            <button
              className="view-card-button"
              onClick={handleViewCard}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-id-card"></i>
                  <span>View Digital Card</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Digital Card Modal */}
      {showCard && digitalCard && (
        <div className="modal-overlay" onClick={() => setShowCard(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Digital Membership Card</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCard(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div 
                className="digital-card-preview"
                style={{
                  background: `linear-gradient(135deg, ${digitalCard.primaryColor}, ${digitalCard.secondaryColor})`,
                  color: digitalCard.textColor,
                  padding: '20px',
                  borderRadius: '15px',
                  minHeight: '200px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div className="card-header">
                  {digitalCard.logo && (
                    <img 
                      src={digitalCard.logo.startsWith('http') ? digitalCard.logo : `${import.meta.env.VITE_API_URL}${digitalCard.logo}`}
                      alt="Logo"
                      style={{ maxWidth: '80px', maxHeight: '80px', marginBottom: '10px' }}
                    />
                  )}
                  <h4 style={{ margin: 0, fontSize: '18px' }}>
                    {digitalCard.organizationName || 'Organization'}
                  </h4>
                  <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.9 }}>
                    {digitalCard.cardTitle || 'Membership Card'}
                  </p>
                </div>
                
                <div className="card-body" style={{ marginTop: '20px' }}>
                  <div className="member-info">
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                      {membership.user?.firstName || membership.subscription?.user?.firstName} {membership.user?.lastName || membership.subscription?.user?.lastName}
                    </h5>
                    <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.8 }}>
                      Member #{membership.memberNumber}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.8 }}>
                      {digitalCard.headerText || (startDate ? `Member Since ${new Date(startDate).getFullYear()}` : 'Member')}
                    </p>
                  </div>
                </div>
                
                <div className="card-footer" style={{ 
                  position: 'absolute', 
                  bottom: '15px', 
                  left: '20px', 
                  right: '20px' 
                }}>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.8, textAlign: 'center' }}>
                    {digitalCard.footerText || 'Thank you for being a member'}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCard(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .membership-card {
          height: 100%;
        }

        .card.h-100 {
          height: 100%;
          border: 1px solid #e1e8ed;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          background: white;
        }

        .card.h-100:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card-header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f1f3f4;
        }

        .plan-name-section {
          flex: 1;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 5px 0;
          line-height: 1.3;
        }

        .organization-name {
          font-size: 0.85rem;
          color: #7f8c8d;
          margin: 0;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          border: 2px solid;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-badge i {
          font-size: 0.85rem;
        }

        .membership-details {
          flex: 1;
          margin-bottom: 20px;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #7f8c8d;
          margin-bottom: 5px;
          font-weight: 500;
        }

        .detail-label i {
          font-size: 0.7rem;
          color: #95a5a6;
        }

        .detail-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .auto-renew-yes {
          color: #27ae60;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .auto-renew-no {
          color: #e74c3c;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .status-explanation {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px;
          background: #fff3cd;
          border-left: 3px solid #f39c12;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 0.8rem;
          color: #856404;
        }

        .status-explanation i {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .card-action {
          margin-top: auto;
        }

        .view-card-button {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .view-card-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .view-card-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .view-card-button i {
          font-size: 0.9rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
          padding: 1.25rem;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #2c3e50;
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
        }
        
        .modal-body {
          padding: 1.25rem;
        }
        
        .modal-footer {
          padding: 1.25rem;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        
        .btn-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: white;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .digital-card-preview {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        @media (max-width: 768px) {
          .detail-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .card-header-section {
            flex-direction: column;
            gap: 10px;
          }

          .status-badge {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default MembershipCard;
