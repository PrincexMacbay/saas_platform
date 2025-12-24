import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useMembershipData } from '../../contexts/MembershipDataContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Applications = () => {
  const [searchParams] = useSearchParams();
  const { data, loading: contextLoading, refreshData, isInitialized } = useMembershipData();
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showOrganizationSelector, setShowOrganizationSelector] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [joiningOrganization, setJoiningOrganization] = useState(false);
  const [highlightedApplicationId, setHighlightedApplicationId] = useState(null);
  const applicationRefs = useRef({});

  useEffect(() => {
    // Use preloaded data if available
    if (data.applications && Array.isArray(data.applications)) {
      console.log('🚀 Applications: Using preloaded data', data.applications.length, 'applications');
      setApplications(data.applications);
      setLoading(false);
    } else if (!contextLoading.applications) {
      console.log('🚀 Applications: Fetching data (not preloaded)');
      fetchApplications();
    }
  }, [data.applications, contextLoading.applications]);

  useEffect(() => {
    // Only fetch when filters change, not on initial load
    if (isInitialized && (!data.applications || data.applications.length === 0)) {
      console.log('🚀 Applications: Fetching due to filter changes');
      fetchApplications();
    }
  }, [currentPage, searchTerm, statusFilter, isInitialized]);

  // Handle applicationId from URL query params
  useEffect(() => {
    const applicationId = searchParams.get('applicationId');
    
    if (applicationId && applications.length > 0) {
      // Wait a bit for applications to render, then scroll
      setTimeout(() => {
        const applicationElement = applicationRefs.current[`application-${applicationId}`];
        if (applicationElement) {
          applicationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedApplicationId(applicationId);
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedApplicationId(null);
          }, 3000);
        }
      }, 500);
    }
  }, [searchParams, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await api.get('/membership/applications', { params });
      setApplications(response.data.data.applications || []);
      setTotalPages(response.data.data.pagination.totalPages || 1);
      setShowOrganizationSelector(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (error.response?.data?.code === 'NO_ORGANIZATION') {
        setShowOrganizationSelector(true);
        await fetchOrganizations();
      } else {
        setError(error.response?.data?.message || 'Failed to fetch applications');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/users/organizations/available');
      setOrganizations(response.data.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleJoinOrganization = async (organizationId) => {
    try {
      setJoiningOrganization(true);
      await api.post('/users/organizations/join', { organizationId });
      alert(t('applications.successfully.joined'));
      await fetchApplications(); // Refresh the applications
    } catch (error) {
      console.error('Error joining organization:', error);
      alert(t('applications.error.joining', { error: error.response?.data?.message || error.message }));
    } finally {
      setJoiningOrganization(false);
    }
  };

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');

  const handleApprove = async (applicationId, notes = '') => {
    try {
      const response = await api.post(`/membership/applications/${applicationId}/approve`, { 
        createUser: true,
        notes: notes
      });
      alert(`Application approved! ${response.data.data.credentials ? `User created with username: ${response.data.data.credentials.username}` : ''}`);
      fetchApplications();
    } catch (error) {
      alert('Error approving application: ' + error.message);
    }
  };

  const handleReject = async (applicationId, notes = '') => {
    try {
      await api.post(`/membership/applications/${applicationId}/reject`, { notes });
      fetchApplications();
    } catch (error) {
      alert('Error rejecting application: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (applicationId) => {
    try {
      await api.delete(`/membership/applications/${applicationId}`);
      fetchApplications();
    } catch (error) {
      alert('Error deleting application: ' + (error.response?.data?.message || error.message));
    }
  };

  const openActionModal = (application, type) => {
    setSelectedApplication(application);
    setActionType(type);
    setNotes('');
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedApplication) return;

    try {
      if (actionType === 'approve') {
        await handleApprove(selectedApplication.id, notes);
      } else if (actionType === 'reject') {
        await handleReject(selectedApplication.id, notes);
      }
      setShowActionModal(false);
      setSelectedApplication(null);
      setActionType('');
      setNotes('');
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning', text: t('applications.pending') },
      'approved': { class: 'bg-success', text: t('applications.approved') },
      'rejected': { class: 'bg-danger', text: t('applications.rejected') },
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Only show loading if no data is available at all
  if (!applications.length && loading && !data.applications) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>{t('applications.loading')}</p>
      </div>
    );
  }

  if (showOrganizationSelector) {
    return (
      <div className="applications-container">
        <div className="organization-selector">
          <div className="selector-header">
            <i className="fas fa-building"></i>
            <h2>{t('applications.join.organization')}</h2>
            <p>{t('applications.join.description')}</p>
          </div>
          
          <div className="organizations-list">
            {organizations.length === 0 ? (
              <div className="no-organizations">
                <p>{t('applications.no.organizations')}</p>
              </div>
            ) : (
              organizations.map(org => (
                <div key={org.id} className="organization-card">
                  <div className="org-info">
                    <h3>{org.name}</h3>
                    <p>{org.description}</p>
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-external-link-alt"></i> {t('applications.visit.website')}
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={() => handleJoinOrganization(org.id)}
                    disabled={joiningOrganization}
                    className="join-button"
                  >
                    {joiningOrganization ? t('applications.joining') : t('applications.join.organization.button')}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <style jsx>{`
          .applications-container {
            padding: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
          }

          .organization-selector {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 40px;
            max-width: 800px;
            width: 100%;
          }

          .selector-header {
            text-align: center;
            margin-bottom: 40px;
          }

          .selector-header i {
            font-size: 3rem;
            color: #3498db;
            margin-bottom: 20px;
          }

          .selector-header h2 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 2rem;
          }

          .selector-header p {
            color: #7f8c8d;
            font-size: 1.1rem;
            margin: 0;
          }

          .organizations-list {
            display: grid;
            gap: 20px;
          }

          .organization-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 25px;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            transition: border-color 0.3s ease;
          }

          .organization-card:hover {
            border-color: #3498db;
          }

          .org-info h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 1.3rem;
          }

          .org-info p {
            margin: 0 0 10px 0;
            color: #7f8c8d;
            line-height: 1.5;
          }

          .org-info a {
            color: #3498db;
            text-decoration: none;
            font-size: 0.9rem;
          }

          .org-info a:hover {
            text-decoration: underline;
          }

          .join-button {
            background: #27ae60;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.3s ease;
          }

          .join-button:hover:not(:disabled) {
            background: #219a52;
          }

          .join-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .no-organizations {
            text-align: center;
            padding: 40px;
            color: #7f8c8d;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>{t('applications.title')}</h2>
      </div>

      <div className="applications-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={t('applications.search.placeholder')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="status-filter"
        >
          <option value="">{t('applications.all.statuses')}</option>
          <option value="pending">{t('applications.pending')}</option>
          <option value="approved">{t('applications.approved')}</option>
          <option value="rejected">{t('applications.rejected')}</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="applications-table-container">
        <table className="applications-table">
          <thead>
            <tr>
              <th>{t('applications.date.applied')}</th>
              <th>{t('applications.name')}</th>
              <th>{t('applications.email')}</th>
              <th>{t('applications.phone')}</th>
              <th>{t('applications.plan')}</th>
              <th>{t('applications.student.id')}</th>
              <th>{t('applications.status')}</th>
              <th>{t('applications.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(application => (
              <tr 
                key={application.id}
                ref={el => applicationRefs.current[`application-${application.id}`] = el}
                className={highlightedApplicationId === application.id.toString() ? 'highlighted-application' : ''}
                style={highlightedApplicationId === application.id.toString() ? {
                  backgroundColor: '#fef3c7',
                  transition: 'background-color 0.3s'
                } : {}}
              >
                <td>{formatDate(application.createdAt)}</td>
                <td>
                  {`${application.firstName} ${application.lastName || ''}`.trim()}
                </td>
                <td>{application.email}</td>
                <td>{application.phone || '-'}</td>
                <td>{application.plan?.name || 'N/A'}</td>
                <td>{application.studentId || '-'}</td>
                <td>{getStatusBadge(application.status)}</td>
                <td>
                  <div className="action-buttons">
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openActionModal(application, 'approve')}
                          className="approve-button"
                          title={t('applications.approve')}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={() => openActionModal(application, 'reject')}
                          className="reject-button"
                          title={t('applications.reject')}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openActionModal(application, 'view')}
                      className="view-button"
                      title={t('applications.view')}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(application.id)}
                      className="delete-button"
                      title={t('applications.delete')}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && !loading && (
          <div className="no-data">
            <i className="fas fa-file-alt"></i>
            <p>{t('applications.no.applications')}</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedApplication && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">
                  <i className={`fas fa-${actionType === 'view' ? 'eye text-info' : actionType === 'approve' ? 'check-circle text-success' : 'times-circle text-danger'} me-2`}></i>
                  {actionType === 'view' ? t('applications.view.details') : actionType === 'approve' ? t('applications.approve.application') : t('applications.reject.application')}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowActionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {actionType === 'view' ? (
                  <div className="application-details">
                    <div className="basic-info mb-4">
                      <h6 className="text-muted mb-3">{t('applications.basic.information')}</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <p><strong>{t('applications.name')}:</strong> {selectedApplication.firstName} {selectedApplication.lastName}</p>
                          <p><strong>{t('applications.email')}:</strong> {selectedApplication.email}</p>
                          <p><strong>{t('applications.phone')}:</strong> {selectedApplication.phone || t('applications.not.provided')}</p>
                          <p><strong>{t('applications.student.id')}:</strong> {selectedApplication.studentId || t('applications.not.provided')}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>{t('applications.plan')}:</strong> {selectedApplication.plan?.name || 'N/A'}</p>
                          <p><strong>{t('applications.status')}:</strong> {getStatusBadge(selectedApplication.status)}</p>
                          <p><strong>{t('applications.date.applied')}:</strong> {formatDate(selectedApplication.createdAt)}</p>
                          <p><strong>Referral:</strong> {selectedApplication.referral || 'None'}</p>
                        </div>
                      </div>
                    </div>

                    {selectedApplication.formData && (
                      <div className="custom-form-data mb-4">
                        <h6 className="text-muted mb-3">{t('applications.custom.form.data')}</h6>
                        <div className="form-data-display">
                          {(() => {
                            try {
                              const formData = JSON.parse(selectedApplication.formData);
                              return Object.entries(formData).map(([key, value]) => {
                                // Skip basic fields that are already shown
                                if (['firstName', 'lastName', 'email', 'phone', 'studentId', 'planId', 'applicationFee'].includes(key)) {
                                  return null;
                                }
                                return (
                                  <div key={key} className="form-field">
                                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
                                    <span>{value || t('applications.not.provided')}</span>
                                  </div>
                                );
                              }).filter(Boolean);
                            } catch (e) {
                              return <p className="text-muted">Unable to parse custom form data</p>;
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {selectedApplication.paymentInfo && (
                      <div className="payment-info mb-4">
                        <h6 className="text-muted mb-3">{t('applications.payment.information')}</h6>
                        <div className="payment-data-display">
                          {(() => {
                            try {
                              const paymentInfo = JSON.parse(selectedApplication.paymentInfo);
                              return (
                                <div className="row">
                                  <div className="col-md-6">
                                    <p><strong>{t('applications.payment.method')}:</strong> {paymentInfo.method}</p>
                                    <p><strong>{t('applications.amount')}:</strong> ${paymentInfo.amount}</p>
                                    <p><strong>{t('applications.transaction.id')}:</strong> {paymentInfo.transactionId}</p>
                                  </div>
                                  <div className="col-md-6">
                                    <p><strong>{t('applications.processed')}:</strong> {new Date(paymentInfo.processedAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              );
                            } catch (e) {
                              return <p className="text-muted">Unable to parse payment information</p>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <p className="mb-2">
                        <strong>Applicant:</strong> {selectedApplication.firstName} {selectedApplication.lastName}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong> {selectedApplication.email}
                      </p>
                      <p className="mb-2">
                        <strong>Plan:</strong> {selectedApplication.plan?.name || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        {actionType === 'approve' ? t('applications.approval.notes') : t('applications.rejection.notes')}
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder={t('applications.add.notes', { type: actionType === 'approve' ? 'approval' : 'rejection' })}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                      <div className="form-text">
                        {t('applications.notes.help')}
                      </div>
                    </div>
                    
                    <div className={`alert alert-${actionType === 'approve' ? 'success' : 'danger'} d-flex align-items-center`}>
                      <i className={`fas fa-${actionType === 'approve' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                      <div>
                        <strong>{t('applications.action')}:</strong> {actionType === 'approve' ? t('applications.approve.and.create', { name: `${selectedApplication.firstName} ${selectedApplication.lastName}` }) : t('applications.reject.application.for', { name: `${selectedApplication.firstName} ${selectedApplication.lastName}` })}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowActionModal(false)}
                >
                  {actionType === 'view' ? t('applications.close') : t('applications.cancel')}
                </button>
                {actionType !== 'view' && (
                  <button 
                    type="button" 
                    className={`btn btn-${actionType === 'approve' ? 'success' : 'danger'}`}
                    onClick={handleConfirmAction}
                  >
                    <i className={`fas fa-${actionType === 'approve' ? 'check' : 'times'} me-2`}></i>
                    {actionType === 'approve' ? t('applications.approve.application.button') : t('applications.reject.application.button')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="pagination-info">
            {t('applications.page', { current: currentPage, total: totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      <style jsx>{`
        .applications-container {
          padding: 30px;
        }

        .applications-header {
          margin-bottom: 30px;
        }

        .applications-header h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8rem;
        }

        .applications-filters {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        .search-box input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
        }

        .status-filter {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          min-width: 150px;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .applications-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 30px;
        }

        .applications-table {
          width: 100%;
          border-collapse: collapse;
        }

        .applications-table th,
        .applications-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #ecf0f1;
        }

        .applications-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .applications-table td {
          color: #34495e;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-badge.success {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.warning {
          background: #fff3cd;
          color: #856404;
        }

        .status-badge.danger {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .approve-button,
        .reject-button,
        .view-button,
        .delete-button {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .approve-button {
          background: #f8f9fa;
          color: #27ae60;
        }

        .approve-button:hover {
          background: #27ae60;
          color: white;
        }

        .reject-button {
          background: #f8f9fa;
          color: #e74c3c;
        }

        .reject-button:hover {
          background: #e74c3c;
          color: white;
        }

        .delete-button {
          background: #f8f9fa;
          color: #6c757d;
        }

        .delete-button:hover {
          background: #6c757d;
          color: white;
        }

        .view-button {
          background: #f8f9fa;
          color: #3498db;
        }

        .view-button:hover {
          background: #3498db;
          color: white;
        }

        .form-data-display {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }

        .form-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .form-field:last-child {
          border-bottom: none;
        }

        .form-field strong {
          color: #2c3e50;
          min-width: 150px;
        }

        .form-field span {
          color: #7f8c8d;
          text-align: right;
          flex: 1;
          margin-left: 20px;
        }

        .payment-data-display {
          background: #e8f4fd;
          border-radius: 8px;
          padding: 20px;
        }

        .no-data {
          text-align: center;
          padding: 60px;
          color: #7f8c8d;
        }

        .no-data i {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }

        .pagination-button {
          background: #f8f9fa;
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-button:hover:not(:disabled) {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-weight: 500;
          color: #7f8c8d;
        }

        @media (max-width: 768px) {
          .applications-container {
            padding: 20px;
          }

          .applications-filters {
            flex-direction: column;
          }

          .applications-table-container {
            overflow-x: auto;
          }

          .applications-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default Applications;
