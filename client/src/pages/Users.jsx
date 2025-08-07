import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, toggleFollowUser } from '../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers({ search, limit: 50 });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setIsLoading(false);
  };

  const handleFollowUser = async (userId) => {
    if (actionLoading[userId]) return;
    
    setActionLoading({ ...actionLoading, [userId]: true });
    try {
      await toggleFollowUser(userId);
      loadUsers(); // Reload to update follow status
    } catch (error) {
      console.error('Error following user:', error);
    }
    setActionLoading({ ...actionLoading, [userId]: false });
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 1: return <i className="fas fa-users" title="Visible to registered users"></i>;
      case 2: return <i className="fas fa-globe" title="Public profile"></i>;
      case 3: return <i className="fas fa-eye-slash" title="Hidden profile"></i>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '80px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>People</h2>
      </div>

      <div className="row mb-4">
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {users.length === 0 ? (
          <div className="col">
            <div className="card text-center">
              <p>No users found. {search ? 'Try a different search term.' : 'No users to display.'}</p>
            </div>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="col-4">
              <div className="user-card">
                <div className="user-avatar-lg">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.username}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(user)
                  )}
                </div>
                
                <div className="user-name">
                  <Link 
                    to={`/profile/${user.username}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username}
                  </Link>
                </div>
                
                <div className="user-username">
                  @{user.username} {getVisibilityIcon(user.visibility)}
                </div>

                {user.about && (
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#7f8c8d', 
                    marginBottom: '15px',
                    lineHeight: '1.4',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.about.length > 100 ? `${user.about.substring(0, 100)}...` : user.about}
                  </div>
                )}

                <div style={{ marginTop: '15px' }}>
                  <Link
                    to={`/profile/${user.username}`}
                    className="btn btn-outline btn-sm"
                    style={{ marginRight: '8px' }}
                  >
                    View Profile
                  </Link>
                  
                  <button
                    className={`btn btn-sm ${user.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleFollowUser(user.id)}
                    disabled={actionLoading[user.id]}
                  >
                    {actionLoading[user.id] ? 'Loading...' : 
                     user.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>

                <div style={{ 
                  marginTop: '10px', 
                  fontSize: '12px', 
                  color: '#95a5a6',
                  borderTop: '1px solid #ecf0f1',
                  paddingTop: '10px'
                }}>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                  {user.lastLogin && (
                    <>
                      <br />
                      Last seen {new Date(user.lastLogin).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {users.length > 0 && (
        <div className="text-center mt-4">
          <p className="text-muted">Showing {users.length} users</p>
        </div>
      )}
    </div>
  );
};

export default Users;