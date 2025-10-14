import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/adminService';
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
      setError('Failed to load users');
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
      setError('Failed to update user status');
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await adminService.updateUserStatus(userId, { role: newRole });
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
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
      setError('Failed to perform bulk action');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { label: 'Disabled', class: 'inactive' },
      1: { label: 'Active', class: 'active' },
      2: { label: 'Pending', class: 'pending' }
    };
    const statusInfo = statusMap[status] || { label: 'Unknown', class: 'inactive' };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      user: { label: 'User', class: 'secondary' },
      admin: { label: 'Admin', class: 'primary' },
      moderator: { label: 'Moderator', class: 'warning' }
    };
    const roleInfo = roleMap[role] || { label: 'User', class: 'secondary' };
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
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>User Management</h2>
        <p>Manage users, roles, and permissions</p>
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search by name, email, or username..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="1">Active</option>
            <option value="0">Disabled</option>
            <option value="2">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Role</label>
          <select
            className="filter-select"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Per Page</label>
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
            {selectedUsers.length} user(s) selected
          </span>
          <div className="bulk-actions-buttons">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleBulkAction('activate')}
            >
              Activate
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleBulkAction('suspend')}
            >
              Suspend
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => handleBulkAction('export')}
            >
              Export
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Users ({pagination.total})</h3>
          <button className="btn btn-primary" onClick={fetchUsers}>
            Refresh
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
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Actions</th>
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
                <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                <td>
                  <div className="action-buttons">
                    <select
                      className="btn btn-sm btn-outline"
                      value={user.status}
                      onChange={(e) => handleUserStatusUpdate(user.id, parseInt(e.target.value))}
                    >
                      <option value="1">Active</option>
                      <option value="0">Suspend</option>
                      <option value="2">Pending</option>
                    </select>
                    
                    <select
                      className="btn btn-sm btn-outline"
                      value={user.role}
                      onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
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
              Previous
            </button>
            
            <span className="pagination-info">
              Page {filters.page} of {pagination.totalPages}
            </span>
            
            <button
              className="btn btn-outline btn-sm"
              disabled={filters.page === pagination.totalPages}
              onClick={() => handleFilterChange('page', filters.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
