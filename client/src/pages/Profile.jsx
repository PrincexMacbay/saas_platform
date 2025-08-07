import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUser, updateProfile, toggleFollowUser } from '../services/userService';
import { getPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { identifier } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const { user, updateUser } = useAuth();

  const isOwnProfile = user && profileUser && user.id === profileUser.id;

  useEffect(() => {
    loadProfileData();
  }, [identifier]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const [userResponse, postsResponse] = await Promise.all([
        getUser(identifier),
        getPosts({ userId: identifier, limit: 20 })
      ]);
      setProfileUser(userResponse.data.user);
      setPosts(postsResponse.data.posts);
      
      if (userResponse.data.user.id === user?.id) {
        setEditData({
          firstName: userResponse.data.user.firstName || '',
          lastName: userResponse.data.user.lastName || '',
          about: userResponse.data.user.about || '',
          visibility: userResponse.data.user.visibility || 1,
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    setIsLoading(false);
  };

  const handleFollow = async () => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      await toggleFollowUser(profileUser.id);
      loadProfileData(); // Reload to update follow status
    } catch (error) {
      console.error('Error following user:', error);
    }
    setActionLoading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    try {
      await updateProfile(editData);
      updateUser(editData); // Update context
      setIsEditing(false);
      loadProfileData(); // Reload profile
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setActionLoading(false);
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case 1: return 'Registered Users';
      case 2: return 'Public';
      case 3: return 'Hidden';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <h3>User not found</h3>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '80px' }}>
      {/* Profile Header */}
      <div className="card mb-4">
        <div style={{ padding: '30px' }}>
          <div className="d-flex align-items-center mb-3">
            <div className="user-avatar-lg" style={{ marginRight: '20px', position: 'relative' }}>
              {profileUser.profileImage ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profileUser.profileImage}`}
                  alt={profileUser.username}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(profileUser)
              )}
              {isOwnProfile && (
                <button
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Change profile picture"
                >
                  <i className="fas fa-camera"></i>
                </button>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, marginBottom: '5px' }}>
                {profileUser.firstName && profileUser.lastName
                  ? `${profileUser.firstName} ${profileUser.lastName}`
                  : profileUser.username}
              </h1>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '16px' }}>
                @{profileUser.username}
              </p>
              {profileUser.about && (
                <p style={{ marginTop: '10px', lineHeight: '1.6' }}>
                  {profileUser.about}
                </p>
              )}
            </div>
            <div>
              {isOwnProfile ? (
                <div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ marginRight: '10px' }}
                  >
                    <i className="fas fa-edit"></i> {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                  >
                    <i className="fas fa-camera"></i> Change Photo
                  </button>
                </div>
              ) : (
                <button
                  className={`btn ${profileUser.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={handleFollow}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Loading...' : 
                   profileUser.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-3">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Member since</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {profileUser.ownedSpaces?.length || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Spaces owned</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {getVisibilityText(profileUser.visibility)}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Profile visibility</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {profileUser.lastLogin 
                    ? new Date(profileUser.lastLogin).toLocaleDateString()
                    : 'Never'}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Last login</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Form */}
      {showImageUpload && isOwnProfile && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Update Profile Picture</h3>
          </div>
          <div style={{ padding: '20px' }}>
            <ProfileImageUpload 
              onUploadComplete={() => {
                setShowImageUpload(false);
                loadProfileData(); // Reload profile data
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Edit Profile</h3>
          </div>
          <form onSubmit={handleSaveProfile}>
            <div className="row">
              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.firstName}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="col-2">
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editData.lastName}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                    disabled={actionLoading}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">About</label>
              <textarea
                className="form-control"
                rows="3"
                value={editData.about}
                onChange={(e) => setEditData({...editData, about: e.target.value})}
                disabled={actionLoading}
                maxLength="1000"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Profile Visibility</label>
              <select
                className="form-control"
                value={editData.visibility}
                onChange={(e) => setEditData({...editData, visibility: parseInt(e.target.value)})}
                disabled={actionLoading}
              >
                <option value={1}>Registered Users</option>
                <option value={2}>Public</option>
                <option value={3}>Hidden</option>
              </select>
            </div>
            
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
                disabled={actionLoading}
                style={{ marginRight: '10px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-content">
        <div className="main-feed">
          <h3>Posts by {profileUser.firstName && profileUser.lastName
            ? `${profileUser.firstName} ${profileUser.lastName}`
            : profileUser.username}</h3>
          
          <div className="posts-feed">
            {posts.length === 0 ? (
              <div className="card text-center">
                <p>{isOwnProfile ? 'You haven\'t posted anything yet.' : 'No posts to show.'}</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={loadProfileData}
                />
              ))
            )}
          </div>
        </div>

        <div className="sidebar">
          {profileUser.ownedSpaces && profileUser.ownedSpaces.length > 0 && (
            <>
              <div className="sidebar-title">Owned Spaces</div>
              <div className="spaces-list">
                {profileUser.ownedSpaces.map((space) => (
                  <div key={space.id} className="space-item" style={{ marginBottom: '10px' }}>
                    <a href={`/spaces/${space.url || space.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '8px',
                        borderRadius: '5px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          backgroundColor: '#3498db',
                          marginRight: '8px'
                        }}></div>
                        <span style={{ fontSize: '14px' }}>{space.name}</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;