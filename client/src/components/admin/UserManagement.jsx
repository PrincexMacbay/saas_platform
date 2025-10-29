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
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    page: 1,
    limit: 10
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(filters);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('admin.user.failed.load'));
    } finally {
      setLoading(false);
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
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(t('admin.user.failed.update.status'));
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await adminService.updateUserStatus(userId, { role: newRole });
      // Refresh users list
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

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    try {
      switch (action) {
        case 'suspend':
          // Implement bulk suspend
          break;
        case 'activate':
          // Implement bulk activate
          break;
        case 'export':
          // Implement bulk export
          break;
        default:
          break;
      }
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError(t('admin.user.failed.bulk.action'));
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
              <tr key={user.id}>
                <td>
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
                <td>
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
    </div>
  );
};

export default UserManagement;
