import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useMembershipData } from '../../contexts/MembershipDataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotificationModal } from '../../contexts/NotificationModalContext';

const Applications = () => {
  const [searchParams] = useSearchParams();
  const { data, loading: contextLoading, refreshData, isInitialized } = useMembershipData();
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotificationModal();
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
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});

  // Fetch organizations - defined before fetchApplications
  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await api.get('/users/organizations/available');
      setOrganizations(response.data.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  }, []);

  // Fetch applications - defined before useEffect to avoid initialization error
  const fetchApplications = useCallback(async () => {
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
      setError(null);
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
  }, [currentPage, searchTerm, statusFilter, fetchOrganizations]);

  useEffect(() => {
    const applicationId = searchParams.get('applicationId');
    
    // If we have applicationId in URL, always fetch to ensure we have the latest data
    if (applicationId) {
      console.log('📋 Applications: applicationId in URL, fetching fresh data...', applicationId);
      fetchApplications();
    } else {
      // Use preloaded data if available
      if (data.applications && Array.isArray(data.applications)) {
        console.log('🚀 Applications: Using preloaded data', data.applications.length, 'applications');
        setApplications(data.applications);
        setLoading(false);
      } else if (!contextLoading.applications) {
        console.log('🚀 Applications: Fetching data (not preloaded)');
        fetchApplications();
      }
    }
  }, [searchParams, data.applications, contextLoading.applications, fetchApplications]);

  useEffect(() => {
    // Fetch when filters or page change (debounce search for better performance)
    if (isInitialized) {
      const timeoutId = setTimeout(() => {
        console.log('🚀 Applications: Fetching due to filter/page changes', { searchTerm, statusFilter, currentPage });
        fetchApplications();
      }, searchTerm ? 500 : 0); // Debounce search by 500ms, but fetch immediately for status/page changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, searchTerm, statusFilter, isInitialized, fetchApplications]);

  // Handle applicationId from URL query params
  useEffect(() => {
    const applicationId = searchParams.get('applicationId');
    
    if (applicationId) {
      console.log('📋 Applications: applicationId in URL', applicationId, 'applications count:', applications.length);
      
      if (applications.length > 0) {
        // Wait a bit for applications to render, then scroll
        setTimeout(() => {
          const applicationElement = applicationRefs.current[`application-${applicationId}`];
          if (applicationElement) {
            console.log('✅ Found application element, scrolling...');
            applicationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedApplicationId(applicationId);
            // Remove highlight after 3 seconds
            setTimeout(() => {
              setHighlightedApplicationId(null);
            }, 3000);
          } else {
            console.log('⚠️ Application not found in current list, might be on another page');
          }
        }, 800);
      } else {
        // Applications not loaded yet, wait for them to load
        console.log('⏳ Waiting for applications to load...');
      }
    }
  }, [searchParams, applications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId !== null) {
        const dropdownElement = dropdownRefs.current[openDropdownId];
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          // Check if click is on the toggle button
          const toggleButton = event.target.closest('.actions-dropdown-toggle');
          if (!toggleButton) {
            setOpenDropdownId(null);
          }
        }
      }
    };

    if (openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdownId]);

  const handleJoinOrganization = async (organizationId) => {
    try {
      setJoiningOrganization(true);
      await api.post('/users/organizations/join', { organizationId });
      alert(t('applications.successfully.joined'));
      await fetchApplications(); // Refresh the applications
    } catch (error) {
      console.error('Error joining organization:', error);
      showError(t('applications.error.joining', { error: error.response?.data?.message || error.message }), t('applications.error.title') || 'Error');
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
      showSuccess(`Application approved! ${response.data.data.credentials ? `User created with username: ${response.data.data.credentials.username}` : ''}`, 'Application Approved');
      fetchApplications();
    } catch (error) {
      showError('Error approving application: ' + error.message, 'Error');
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
      showError('Error deleting application: ' + (error.response?.data?.message || error.message), 'Error');
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
    <div className="applications-container px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="applications-header mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{t('applications.title')}</h2>
      </div>

      <div className="applications-filters flex flex-col sm:flex-row gap-4 mb-6">
        <div className="search-box flex-1">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={t('applications.search.placeholder')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="status-filter w-full sm:w-auto sm:min-w-[180px]"
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

      <div className="applications-table-container overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block px-4 sm:px-0">
          <table className="applications-table min-w-[800px] sm:min-w-full w-full">
          <thead>
            <tr>
              <th className="hidden sm:table-cell">{t('applications.date.applied')}</th>
              <th>{t('applications.name')}</th>
              <th className="hidden md:table-cell">{t('applications.email')}</th>
              <th className="hidden lg:table-cell">{t('applications.phone')}</th>
              <th className="hidden md:table-cell">{t('applications.plan')}</th>
              <th className="hidden lg:table-cell">{t('applications.student.id')}</th>
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
                <td className="hidden sm:table-cell">{formatDate(application.createdAt)}</td>
                <td className="font-medium">
                  <div className="flex flex-col">
                    <span>{`${application.firstName} ${application.lastName || ''}`.trim()}</span>
                    <span className="text-xs text-gray-500 sm:hidden">{application.email}</span>
                    <span className="text-xs text-gray-500 md:hidden lg:inline">{application.plan?.name || 'N/A'}</span>
                  </div>
                </td>
                <td className="hidden md:table-cell">{application.email}</td>
                <td className="hidden lg:table-cell">{application.phone || '-'}</td>
                <td className="hidden md:table-cell lg:hidden">{application.plan?.name || 'N/A'}</td>
                <td className="hidden lg:table-cell">{application.studentId || '-'}</td>
                <td>{getStatusBadge(application.status)}</td>
                <td>
                  <div className="actions-dropdown-container">
                    <button
                      className="actions-dropdown-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === application.id ? null : application.id);
                      }}
                      title={t('applications.actions')}
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    {openDropdownId === application.id && (
                      <div 
                        className="actions-dropdown-menu"
                        ref={el => dropdownRefs.current[application.id] = el}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openActionModal(application, 'view');
                            setOpenDropdownId(null);
                          }}
                          className="dropdown-item view-item"
                        >
                          <i className="fas fa-eye"></i>
                          <span>{t('applications.view')}</span>
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionModal(application, 'approve');
                                setOpenDropdownId(null);
                              }}
                              className="dropdown-item approve-item"
                            >
                              <i className="fas fa-check"></i>
                              <span>{t('applications.approve')}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionModal(application, 'reject');
                                setOpenDropdownId(null);
                              }}
                              className="dropdown-item reject-item"
                            >
                              <i className="fas fa-times"></i>
                              <span>{t('applications.reject')}</span>
                            </button>
                          </>
                        )}
                        <div className="dropdown-divider"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const confirmed = window.confirm(t('applications.confirm.delete') || 'Are you sure you want to delete this application?');
                            if (confirmed) {
                              handleDelete(application.id);
                            }
                            setOpenDropdownId(null);
                          }}
                          className="dropdown-item delete-item"
                        >
                          <i className="fas fa-trash"></i>
                          <span>{t('applications.delete')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {applications.length === 0 && !loading && (
          <div className="no-data">
            <i className="fas fa-file-alt"></i>
            <p>{t('applications.no.applications')}</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedApplication && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowActionModal(false)}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              width: '100%',
              margin: 0
            }}
          >
            <div className="modal-content border-0 shadow" style={{
              borderRadius: '12px',
              border: 'none',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div className="modal-header" style={{ 
                background: '#2c3e50', 
                color: 'white', 
                border: 'none',
                borderRadius: '12px 12px 0 0',
                padding: '20px 30px'
              }}>
                <h5 className="modal-title" style={{ color: 'white', fontWeight: 600, margin: 0 }}>
                  <i className={`fas fa-${actionType === 'view' ? 'eye' : actionType === 'approve' ? 'check-circle' : 'times-circle'} me-2`} 
                     style={{ color: actionType === 'view' ? '#3498db' : actionType === 'approve' ? '#27ae60' : '#e74c3c' }}></i>
                  {actionType === 'view' ? t('applications.view.details') : actionType === 'approve' ? t('applications.approve.application') : t('applications.reject.application')}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowActionModal(false)}
                  style={{ 
                    filter: 'invert(1)',
                    opacity: 0.8
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0.8'}
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
              <div className="modal-footer" style={{ 
                border: 'none',
                borderTop: '1px solid #e9ecef',
                background: '#f8f9fa',
                borderRadius: '0 0 12px 12px',
                padding: '20px 30px'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowActionModal(false)}
                  style={{ marginRight: '10px' }}
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
          /* Padding handled by Tailwind classes */
        }

        .applications-header {
          /* Margin handled by Tailwind classes */
        }

        .applications-header h2 {
          margin: 0;
        }

        .applications-filters {
          /* Layout handled by Tailwind classes */
        }

        .search-box {
          position: relative;
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
          overflow-x: auto;
          overflow-y: visible;
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
          position: relative;
        }
        
        .applications-table td:last-child {
          overflow: visible;
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

        .actions-dropdown-container {
          position: relative;
          display: inline-block;
          z-index: 1;
        }

        .actions-dropdown-toggle {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          height: 36px;
        }

        .actions-dropdown-toggle:hover {
          background: #e9ecef;
          border-color: #3498db;
          color: #3498db;
        }

        .actions-dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 5px);
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          min-width: 200px;
          z-index: 10000;
          overflow: hidden;
          animation: dropdownFadeIn 0.2s ease;
          padding: 4px 0;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
          color: #34495e;
          font-size: 0.9rem;
          margin: 0;
          white-space: nowrap;
        }

        .dropdown-item:hover {
          background: #f8f9fa;
        }

        .dropdown-item i {
          width: 18px;
          text-align: center;
        }

        .dropdown-item span {
          flex: 1;
        }

        .view-item {
          color: #3498db;
        }

        .view-item:hover {
          background: #e8f4fd;
          color: #2980b9;
        }

        .approve-item {
          color: #27ae60;
        }

        .approve-item:hover {
          background: #d4edda;
          color: #219a52;
        }

        .reject-item {
          color: #e74c3c;
        }

        .reject-item:hover {
          background: #f8d7da;
          color: #c0392b;
        }

        .delete-item {
          color: #e74c3c;
        }

        .delete-item:hover {
          background: #f8d7da;
          color: #c0392b;
        }

        .dropdown-item:first-child {
          border-radius: 8px 8px 0 0;
        }

        .dropdown-item:last-child {
          border-radius: 0 0 8px 8px;
        }

        .dropdown-divider {
          height: 1px;
          background: #e0e0e0;
          margin: 4px 0;
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
          z-index: 9999;
          padding: 20px;
        }

        .modal-overlay .modal-dialog {
          max-width: 800px;
          width: 100%;
          margin: 0;
        }

        .modal-overlay .modal-content {
          border-radius: 12px;
          border: none;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-overlay .modal-header {
          background: #2c3e50;
          color: white;
          border-radius: 12px 12px 0 0;
          padding: 20px 30px;
        }

        .modal-overlay .modal-header .modal-title {
          color: white;
          font-weight: 600;
        }

        .modal-overlay .modal-header .btn-close {
          filter: invert(1);
          opacity: 0.8;
        }

        .modal-overlay .modal-header .btn-close:hover {
          opacity: 1;
        }

        .modal-overlay .modal-body {
          padding: 30px;
        }

        .modal-overlay .modal-footer {
          padding: 20px 30px;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
          border-radius: 0 0 12px 12px;
        }

        @media (max-width: 639px) {
          .actions-dropdown-menu {
            right: auto;
            left: 0;
            min-width: 180px;
          }

          .modal-overlay {
            padding: 10px;
          }

          .modal-overlay .modal-dialog {
            max-width: 100%;
          }

          .modal-overlay .modal-body {
            padding: 20px;
          }

          .modal-overlay .modal-footer {
            padding: 15px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Applications;
