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
      setDigitalCard({
        organizationName: membership.plan?.organization?.name || 'Organization',
        cardTitle: 'Membership Card',
        headerText: `Member Since ${new Date(membership.startDate).getFullYear()}`,
        footerText: 'Thank you for being a member',
        primaryColor: 'rgb(17 24 39)',
        secondaryColor: '#2c3e50',
        textColor: '#ffffff'
      });
      setShowCard(true);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'past_due': return 'danger';
      case 'cancelled': return 'secondary';
      case 'expired': return 'dark';
      default: return 'info';
    }
  };

  return (
    <div className="membership-card">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h6 className="card-title mb-0">{membership.plan?.name || 'Unknown Plan'}</h6>
            <span className={`badge bg-${getStatusColor(membership.status)}`}>
              {membership.status}
            </span>
          </div>
          
          <div className="membership-details mb-3">
            <div className="row">
              <div className="col-6">
                <small className="text-muted d-block">Member #</small>
                <strong>{membership.memberNumber || 'N/A'}</strong>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Since</small>
                <strong>
                  {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : 'N/A'}
                </strong>
              </div>
            </div>
            
            {membership.endDate && (
              <div className="row mt-2">
                <div className="col-6">
                  <small className="text-muted d-block">Expires</small>
                  <strong>{new Date(membership.endDate).toLocaleDateString()}</strong>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Auto Renew</small>
                  <strong>{membership.autoRenew ? 'Yes' : 'No'}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="d-grid">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={handleViewCard}
              disabled={loading}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-id-card"></i>
              )}
              {' '}View Digital Card
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
              ></button>
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
                  <h4 style={{ margin: 0, fontSize: '18px' }}>
                    {digitalCard.organizationName}
                  </h4>
                  <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.9 }}>
                    {digitalCard.cardTitle}
                  </p>
                </div>
                
                <div className="card-body" style={{ marginTop: '20px' }}>
                  <div className="member-info">
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                      {membership.user?.firstName} {membership.user?.lastName}
                    </h5>
                    <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.8 }}>
                      Member #{membership.memberNumber}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.8 }}>
                      {digitalCard.headerText}
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
                    {digitalCard.footerText}
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
                  // Here you could implement download or print functionality
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
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          padding: 1rem;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-body {
          padding: 1rem;
        }
        
        .modal-footer {
          padding: 1rem;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        
        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .digital-card-preview {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default MembershipCard;
