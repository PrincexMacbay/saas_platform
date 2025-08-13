import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUser, updateProfile, toggleFollowUser, getFollowers, getFollowing } from '../services/userService';
import { getPosts } from '../services/postService';
import { getSpaces } from '../services/spaceService';
import PostCard from '../components/PostCard';
import ProfileImageUpload from '../components/ProfileImageUpload';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { identifier } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userSpaces, setUserSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const { user, updateUser } = useAuth();

  const isOwnProfile = user && profileUser && user.id === profileUser.id;

  useEffect(() => {
    loadProfileData();
  }, [identifier]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const [userResponse, postsResponse, spacesResponse] = await Promise.all([
        getUser(identifier),
        getPosts({ userId: identifier, limit: 20 }),
        getSpaces({ userId: identifier, limit: 50 })
      ]);
      
      setProfileUser(userResponse.data.user);
      setPosts(postsResponse.data.posts);
      setUserSpaces(spacesResponse.data.spaces);
      
      if (userResponse.data.user.id === user?.id) {
        setEditData({
          firstName: userResponse.data.user.firstName || '',
          lastName: userResponse.data.user.lastName || '',
          about: userResponse.data.user.about || '',
          visibility: userResponse.data.user.visibility || 1,
        });
      }

      // Load followers and following
      if (userResponse.data.user) {
        try {
          const [followersResponse, followingResponse] = await Promise.all([
            getFollowers(userResponse.data.user.id),
            getFollowing(userResponse.data.user.id)
          ]);
          setFollowers(followersResponse.data.followers || []);
          setFollowing(followingResponse.data.following || []);
        } catch (error) {
          console.error('Error loading followers/following:', error);
        }
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

  const getProfession = (user) => {
    if (user.userType === 'company' && user.companyName) {
      return `Company: ${user.companyName}`;
    } else if (user.userType === 'individual' && user.workExperience) {
      return user.workExperience.split('\n')[0]; // First line of work experience
    } else if (user.userType) {
      return user.userType.charAt(0).toUpperCase() + user.userType.slice(1);
    }
    return 'Not specified';
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
              <p style={{ margin: '5px 0', color: '#3498db', fontSize: '14px' }}>
                {getProfession(profileUser)}
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

          {/* Profile Stats */}
          <div className="row">
            <div className="col-2">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {followers.length}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Followers</div>
              </div>
            </div>
            <div className="col-2">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {following.length}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Following</div>
              </div>
            </div>
            <div className="col-2">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {userSpaces.length}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Spaces</div>
              </div>
            </div>
            <div className="col-2">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {posts.length}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Posts</div>
              </div>
            </div>
            <div className="col-2">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  {getVisibilityText(profileUser.visibility)}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Profile visibility</div>
              </div>
            </div>
            <div className="col-2">
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

      {/* Profile Tabs */}
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                <i className="fas fa-file-alt me-2"></i> Posts ({posts.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'spaces' ? 'active' : ''}`}
                onClick={() => setActiveTab('spaces')}
              >
                <i className="fas fa-users me-2"></i> Spaces ({userSpaces.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'followers' ? 'active' : ''}`}
                onClick={() => setActiveTab('followers')}
              >
                <i className="fas fa-user-plus me-2"></i> Followers ({followers.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'following' ? 'active' : ''}`}
                onClick={() => setActiveTab('following')}
              >
                <i className="fas fa-user-friends me-2"></i> Following ({following.length})
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div>
              <h4>Posts by {profileUser.firstName && profileUser.lastName
                ? `${profileUser.firstName} ${profileUser.lastName}`
                : profileUser.username}</h4>
              
              <div className="posts-feed">
                {posts.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
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
          )}

          {/* Spaces Tab */}
          {activeTab === 'spaces' && (
            <div>
              <h4>Spaces</h4>
              {userSpaces.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <p>{isOwnProfile ? 'You haven\'t joined any spaces yet.' : 'No spaces to show.'}</p>
                </div>
              ) : (
                <div className="row">
                  {userSpaces.map((space) => (
                    <div key={space.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">{space.name}</h6>
                          <p className="card-text text-muted small">
                            {space.description && space.description.length > 100 
                              ? `${space.description.substring(0, 100)}...` 
                              : space.description}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {space.membersCount || 0} members
                            </small>
                            <a href={`/spaces/${space.url || space.id}`} className="btn btn-sm btn-outline-primary">
                              View Space
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Followers Tab */}
          {activeTab === 'followers' && (
            <div>
              <h4>Followers</h4>
              {followers.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-user-plus fa-3x text-muted mb-3"></i>
                  <p>No followers yet.</p>
                </div>
              ) : (
                <div className="row">
                  {followers.map((follower) => (
                    <div key={follower.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="user-avatar-sm me-3">
                              {follower.profileImage ? (
                                <img 
                                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${follower.profileImage}`}
                                  alt={follower.username}
                                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor: '#3498db',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontWeight: 'bold'
                                }}>
                                  {getInitials(follower)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="mb-1">
                                {follower.firstName && follower.lastName
                                  ? `${follower.firstName} ${follower.lastName}`
                                  : follower.username}
                              </h6>
                              <p className="mb-1 text-muted small">@{follower.username}</p>
                              <p className="mb-0 text-muted small">{getProfession(follower)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            <div>
              <h4>Following</h4>
              {following.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-user-friends fa-3x text-muted mb-3"></i>
                  <p>{isOwnProfile ? 'You\'re not following anyone yet.' : 'Not following anyone.'}</p>
                </div>
              ) : (
                <div className="row">
                  {following.map((followed) => (
                    <div key={followed.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="user-avatar-sm me-3">
                              {followed.profileImage ? (
                                <img 
                                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${followed.profileImage}`}
                                  alt={followed.username}
                                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor: '#3498db',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontWeight: 'bold'
                                }}>
                                  {getInitials(followed)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="mb-1">
                                {followed.firstName && followed.lastName
                                  ? `${followed.firstName} ${followed.lastName}`
                                  : followed.username}
                              </h6>
                              <p className="mb-1 text-muted small">@{followed.username}</p>
                              <p className="mb-0 text-muted small">{getProfession(followed)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;