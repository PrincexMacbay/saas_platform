import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
import { useLanguage } from '../../contexts/LanguageContext';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showMassEmailModal, setShowMassEmailModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [userLoginHistory, setUserLoginHistory] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    page: 1,
    limit: 10
  });
  const [massEmailData, setMassEmailData] = useState({
    subject: '',
    message: '',
    recipients: 'selected' // 'selected', 'all', 'active', 'inactive'
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users with filters:', filters);
      const response = await adminService.getUsers(filters);
      console.log('✅ Users response:', response);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      setError(t('admin.user.failed.load'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await adminService.getUserDetails(userId);
      setUserDetails(response.data);
      
      // Fetch additional user data
      const [activityResponse, loginResponse, subscriptionsResponse, paymentsResponse] = await Promise.all([
        adminService.getUserActivity(userId),
        adminService.getUserLoginHistory(userId),
        adminService.getUserSubscriptions(userId),
        adminService.getUserPayments(userId)
      ]);
      
      setUserActivity(activityResponse.data);
      setUserLoginHistory(loginResponse.data);
      setUserSubscriptions(subscriptionsResponse.data);
      setUserPayments(paymentsResponse.data);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(t('admin.user.failed.load'));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(t('admin.user.failed.update.status'));
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await adminService.updateUserStatus(userId, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(t('admin.user.failed.update.role'));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleViewUserDetails = async (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    await fetchUserDetails(user.id);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      switch (action) {
        case 'suspend':
          await adminService.bulkUpdateUsers(selectedUsers, { status: 0 });
          break;
        case 'activate':
          await adminService.bulkUpdateUsers(selectedUsers, { status: 1 });
          break;
        case 'export':
          await handleExportUsers();
          break;
        case 'massEmail':
          setShowMassEmailModal(true);
          break;
        default:
          break;
      }
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError(t('admin.user.failed.bulk.action'));
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await adminService.exportUsers('csv');
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting users:', err);
      setError(t('admin.user.failed.export'));
    }
  };

  const handleSendMassEmail = async () => {
    try {
      const emailData = {
        ...massEmailData,
        userIds: massEmailData.recipients === 'selected' ? selectedUsers : null
      };
      await adminService.sendMassEmail(emailData);
      setShowMassEmailModal(false);
      setMassEmailData({ subject: '', message: '', recipients: 'selected' });
    } catch (err) {
      console.error('Error sending mass email:', err);
      setError(t('admin.user.failed.mass.email'));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: t('admin.user.disabled'), class: 'inactive' },
      1: { label: t('admin.user.active'), class: 'active' },
      2: { label: t('admin.user.pending'), class: 'pending' }
    };
    const statusInfo = statusMap[status] || { label: t('admin.unknown'), class: 'inactive' };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      user: { label: t('admin.user.user'), class: 'secondary' },
      admin: { label: t('admin.user.admin'), class: 'primary' },
      moderator: { label: t('admin.user.moderator'), class: 'warning' }
    };
    const roleInfo = roleMap[role] || { label: t('admin.user.user'), class: 'secondary' };
    return (
      <span className={`role-badge ${roleInfo.class}`}>
        {roleInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t('admin.user.loading')}</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>{t('admin.user.title')}</h2>
        <p>{t('admin.user.description')}</p>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">
            {t('admin.user.retry')}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label className="filter-label">{t('admin.user.search')}</label>
          <input
            type="text"
            className="filter-input"
            placeholder={t('admin.user.search.placeholder')}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">{t('admin.user.status')}</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">{t('admin.user.all.statuses')}</option>
            <option value="1">{t('admin.user.active')}</option>
            <option value="0">{t('admin.user.disabled')}</option>
            <option value="2">{t('admin.user.pending')}</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">{t('admin.user.role')}</label>
          <select
            className="filter-select"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="">{t('admin.user.all.roles')}</option>
            <option value="user">{t('admin.user.user')}</option>
            <option value="admin">{t('admin.user.admin')}</option>
            <option value="moderator">{t('admin.user.moderator')}</option>
          </select>
        </div>

        <div className="filter-group">
          <label className='filter-label'>{t('admin.user.per.page')}</label>
          <select
            className="filter-select"
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span className="bulk-actions-label">
            {selectedUsers.length} {t('admin.user.bulk.actions')}
          </span>
          <div className="bulk-actions-buttons">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleBulkAction('activate')}
            >
              {t('admin.user.activate')}
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleBulkAction('suspend')}
            >
              {t('admin.user.suspend')}
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleBulkAction('export')}
            >
              {t('admin.user.export')}
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleBulkAction('massEmail')}
            >
              {t('admin.user.send.email')}
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h3 className="admin-table-title">{t('admin.user.users')} ({pagination.total})</h3>
          <button className="btn btn-primary" onClick={fetchUsers}>
            {t('admin.user.refresh')}
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>{t('admin.user.user.column')}</th>
              <th>{t('admin.user.email')}</th>
              <th>{t('admin.user.role.column')}</th>
              <th>{t('admin.user.status.column')}</th>
              <th>{t('admin.user.joined')}</th>
              <th>{t('admin.user.last.login')}</th>
              <th>{t('admin.user.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="user-row" onClick={() => handleViewUserDetails(user)}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.firstName ? user.firstName[0] : user.username[0]}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username
                        }
                      </div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{getStatusBadge(user.status)}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{user.lastLogin ? formatDate(user.lastLogin) : t('admin.user.never')}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="action-buttons">
                    <select
                      className="btn btn-sm btn-outline"
                      value={user.status}
                      onChange={(e) => handleUserStatusUpdate(user.id, parseInt(e.target.value))}
                    >
                      <option value="1">{t('admin.user.active')}</option>
                      <option value="0">{t('admin.user.suspend')}</option>
                      <option value="2">{t('admin.user.pending')}</option>
                    </select>
                    
                    <select
                      className="btn btn-sm btn-outline"
                      value={user.role}
                      onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                    >
                      <option value="user">{t('admin.user.user')}</option>
                      <option value="admin">{t('admin.user.admin')}</option>
                      <option value="moderator">{t('admin.user.moderator')}</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline btn-sm"
              disabled={filters.page === 1}
              onClick={() => handleFilterChange('page', filters.page - 1)}
            >
              {t('admin.user.previous')}
            </button>
            
            <span className="pagination-info">
              {t('admin.user.page.of', { current: filters.page, total: pagination.totalPages })}
            </span>
            
            <button
              className="btn btn-outline btn-sm"
              disabled={filters.page === pagination.totalPages}
              onClick={() => handleFilterChange('page', filters.page + 1)}
            >
              {t('admin.user.next')}
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserDetails(false)}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('admin.user.details.title')}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowUserDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="user-details-tabs">
                <button className="tab-button active">{t('admin.user.details.profile')}</button>
                <button className="tab-button">{t('admin.user.details.activity')}</button>
                <button className="tab-button">{t('admin.user.details.login.history')}</button>
                <button className="tab-button">{t('admin.user.details.subscriptions')}</button>
                <button className="tab-button">{t('admin.user.details.payments')}</button>
              </div>
              
              <div className="user-details-content">
                {userDetails && (
                  <div className="profile-info">
                    <div className="profile-header">
                      <div className="profile-avatar-large">
                        {selectedUser.firstName ? selectedUser.firstName[0] : selectedUser.username[0]}
                      </div>
                      <div className="profile-info-text">
                        <h4>
                          {selectedUser.firstName && selectedUser.lastName 
                            ? `${selectedUser.firstName} ${selectedUser.lastName}`
                            : selectedUser.username
                          }
                        </h4>
                        <p>@{selectedUser.username}</p>
                        <p>{selectedUser.email}</p>
                        <div className="profile-badges">
                          {getRoleBadge(selectedUser.role)}
                          {getStatusBadge(selectedUser.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="profile-details">
                      <div className="detail-row">
                        <span className="detail-label">{t('admin.user.details.joined')}</span>
                        <span className="detail-value">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">{t('admin.user.details.last.login')}</span>
                        <span className="detail-value">
                          {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : t('admin.user.never')}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">{t('admin.user.details.email.verified')}</span>
                        <span className="detail-value">
                          {userDetails.emailVerified ? t('admin.user.details.yes') : t('admin.user.details.no')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowUserDetails(false)}
              >
                {t('admin.user.details.close')}
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => window.open(`/profile/${selectedUser.username}`, '_blank')}
              >
                {t('admin.user.details.view.profile')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mass Email Modal */}
      {showMassEmailModal && (
        <div className="modal-overlay" onClick={() => setShowMassEmailModal(false)}>
          <div className="modal-content mass-email-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('admin.user.mass.email.title')}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowMassEmailModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{t('admin.user.mass.email.recipients')}</label>
                <select
                  className="form-select"
                  value={massEmailData.recipients}
                  onChange={(e) => setMassEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                >
                  <option value="selected">{t('admin.user.mass.email.selected.users')}</option>
                  <option value="all">{t('admin.user.mass.email.all.users')}</option>
                  <option value="active">{t('admin.user.mass.email.active.users')}</option>
                  <option value="inactive">{t('admin.user.mass.email.inactive.users')}</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('admin.user.mass.email.subject')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={massEmailData.subject}
                  onChange={(e) => setMassEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={t('admin.user.mass.email.subject.placeholder')}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('admin.user.mass.email.message')}</label>
                <textarea
                  className="form-textarea"
                  rows="6"
                  value={massEmailData.message}
                  onChange={(e) => setMassEmailData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={t('admin.user.mass.email.message.placeholder')}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowMassEmailModal(false)}
              >
                {t('admin.user.mass.email.cancel')}
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSendMassEmail}
                disabled={!massEmailData.subject || !massEmailData.message}
              >
                {t('admin.user.mass.email.send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;