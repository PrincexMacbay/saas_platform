import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Applications = () => {
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

  useEffect(() => {
    fetchApplications();
  }, [currentPage, searchTerm, statusFilter]);

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
      alert('Successfully joined organization! You can now view applications.');
      await fetchApplications(); // Refresh the applications
    } catch (error) {
      console.error('Error joining organization:', error);
      alert('Error joining organization: ' + (error.response?.data?.message || error.message));
    } finally {
      setJoiningOrganization(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!confirm('Approve this application and create user account?')) return;

    try {
      const response = await api.post(`/membership/applications/${applicationId}/approve`, { createUser: true });
      alert(`Application approved! ${response.data.data.credentials ? `User created with username: ${response.data.data.credentials.username}` : ''}`);
      fetchApplications();
    } catch (error) {
      alert('Error approving application: ' + error.message);
    }
  };

  const handleReject = async (applicationId) => {
    if (!confirm('Are you sure you want to reject this application?')) return;

    try {
      await api.post(`/membership/applications/${applicationId}/reject`);
      fetchApplications();
    } catch (error) {
      alert('Error rejecting application: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (applicationId) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      await api.delete(`/membership/applications/${applicationId}`);
      fetchApplications();
    } catch (error) {
      alert('Error deleting application: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    
    return (
      <span className={`status-badge ${statusColors[status] || 'secondary'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && applications.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  if (showOrganizationSelector) {
    return (
      <div className="applications-container">
        <div className="organization-selector">
          <div className="selector-header">
            <i className="fas fa-building"></i>
            <h2>Join an Organization</h2>
            <p>You need to be a member of an organization to view membership applications.</p>
          </div>
          
          <div className="organizations-list">
            {organizations.length === 0 ? (
              <div className="no-organizations">
                <p>No organizations available to join.</p>
              </div>
            ) : (
              organizations.map(org => (
                <div key={org.id} className="organization-card">
                  <div className="org-info">
                    <h3>{org.name}</h3>
                    <p>{org.description}</p>
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-external-link-alt"></i> Visit Website
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={() => handleJoinOrganization(org.id)}
                    disabled={joiningOrganization}
                    className="join-button"
                  >
                    {joiningOrganization ? 'Joining...' : 'Join Organization'}
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
        <h2>Membership Applications</h2>
      </div>

      <div className="applications-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, email..."
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
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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
              <th>Date Applied</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Plan</th>
              <th>Student ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(application => (
              <tr key={application.id}>
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
                          onClick={() => handleApprove(application.id)}
                          className="approve-button"
                          title="Approve Application"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={() => handleReject(application.id)}
                          className="reject-button"
                          title="Reject Application"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(application.id)}
                      className="delete-button"
                      title="Delete Application"
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
            <p>No applications found</p>
          </div>
        )}
      </div>

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
            Page {currentPage} of {totalPages}
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
