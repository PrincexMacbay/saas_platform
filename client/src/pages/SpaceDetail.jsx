import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSpace, joinSpace, leaveSpace, toggleFollowSpace } from '../services/spaceService';
import ConfirmDialog from '../components/ConfirmDialog';
import { getPosts, createPost } from '../services/postService';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';

const SpaceDetail = () => {
  const { identifier } = useParams();
  const [space, setSpace] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSpaceData();
  }, [identifier]);

  const loadSpaceData = async () => {
    setIsLoading(true);
    try {
      const [spaceResponse, postsResponse] = await Promise.all([
        getSpace(identifier),
        getPosts({ spaceId: identifier, limit: 20 })
      ]);
      setSpace(spaceResponse.data.space);
      setPosts(postsResponse.data.posts);
    } catch (error) {
      console.error('Error loading space data:', error);
      if (error.response?.status === 404) {
        navigate('/spaces');
      }
    }
    setIsLoading(false);
  };

  const handleJoinSpace = async () => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      await joinSpace(space.id);
      loadSpaceData(); // Reload to update membership status
    } catch (error) {
      console.error('Error joining space:', error);
    }
    setActionLoading(false);
  };

  const handleLeaveSpace = async () => {
    if (actionLoading) return;
    
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to leave this space?',
      onConfirm: () => leaveSpaceItem()
    });
  };

  const leaveSpaceItem = async () => {
    setActionLoading(true);
    try {
      await leaveSpace(space.id);
      loadSpaceData(); // Reload to update membership status
    } catch (error) {
      console.error('Error leaving space:', error);
    }
    setActionLoading(false);
  };

  const handleFollowSpace = async () => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      const response = await toggleFollowSpace(space.id);
      // Update the local state instead of reloading all data
      setSpace(prevSpace => ({
        ...prevSpace,
        isFollowing: response.data.isFollowing
      }));
    } catch (error) {
      console.error('Error following space:', error);
    }
    setActionLoading(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await createPost({
        message: newPost,
        spaceId: space.id,
        visibility: 1,
      });
      setNewPost('');
      loadSpaceData(); // Reload posts
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setIsPosting(false);
  };

  const getJoinPolicyText = (joinPolicy) => {
    switch (joinPolicy) {
      case 0: return 'Invitation Only';
      case 1: return 'Request to Join';
      case 2: return 'Open to All';
      default: return 'Unknown';
    }
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case 0: return 'Private';
      case 1: return 'Members Only';
      case 2: return 'Public';
      default: return 'Unknown';
    }
  };

  const getMembershipStatusText = (status) => {
    switch (status) {
      case 0: return 'Request Pending';
      case 1: return 'Member';
      case 2: return 'Admin';
      case 3: return 'Moderator';
      case 4: return 'Owner';
      default: return 'Unknown';
    }
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <div className="spinner"></div>
        <p>Loading space...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <h3>Space not found</h3>
        <button onClick={() => navigate('/spaces')} className="btn btn-primary">
          Back to Spaces
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '80px' }}>
      {/* Space Header */}
      <div className="card mb-4">
        <div className="space-header" style={{ padding: '30px' }}>
          <div className="d-flex align-items-center mb-3">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '10px',
              backgroundColor: space.color || 'rgb(17 24 39)',
              marginRight: '20px'
            }}></div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, marginBottom: '5px' }}>{space.name}</h1>
              {space.description && (
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '16px' }}>
                  {space.description}
                </p>
              )}
            </div>
            <div>
              {space.isMember ? (
                <div>
                  <span className="btn btn-success" style={{ marginRight: '10px' }}>
                    <i className="fas fa-check"></i> {getMembershipStatusText(space.membershipStatus)}
                  </span>
                  {space.membershipStatus !== 4 && ( // Not owner
                    <button
                      className="btn btn-danger"
                      onClick={handleLeaveSpace}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Leaving...' : 'Leave Space'}
                    </button>
                  )}
                </div>
              ) : space.joinPolicy === 0 ? (
                <span className="btn btn-secondary" style={{ cursor: 'default' }}>
                  Invitation Only
                </span>
              ) : (
                <div>
                  <button
                    className="btn btn-primary"
                    onClick={handleJoinSpace}
                    disabled={actionLoading}
                    style={{ marginRight: '10px' }}
                  >
                    {actionLoading ? 'Joining...' : 
                     space.joinPolicy === 2 ? 'Join Space' : 'Request to Join'}
                  </button>
                  
                  <button
                    className={`btn ${space.isFollowing ? 'btn-secondary' : 'btn-outline'}`}
                    onClick={handleFollowSpace}
                    disabled={actionLoading}
                  >
                    {space.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {space.about && (
            <div style={{ marginBottom: '20px' }}>
              <h4>About</h4>
              <p style={{ lineHeight: '1.6' }}>{space.about}</p>
            </div>
          )}

          <div className="row">
            <div className="col-3">
              <div className="text-center">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {space.members?.length || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Members</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  <i className="fas fa-eye"></i> {getVisibilityText(space.visibility)}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Visibility</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  <i className="fas fa-door-open"></i> {getJoinPolicyText(space.joinPolicy)}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Join Policy</div>
              </div>
            </div>
            <div className="col-3">
              <div className="text-center">
                <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                  Owner: {space.owner.firstName && space.owner.lastName
                    ? `${space.owner.firstName} ${space.owner.lastName}`
                    : space.owner.username}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Created by</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="main-feed">
          {/* Create Post - Only for members */}
          {space.isMember && space.membershipStatus >= 1 && (
            <div className="create-post">
              <form onSubmit={handleCreatePost}>
                <div className="d-flex align-items-center mb-3">
                  <div className="post-avatar" style={{ marginRight: '12px' }}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.username} />
                    ) : (
                      getInitials(user)
                    )}
                  </div>
                  <div>
                    <strong>
                      Post to {space.name}
                    </strong>
                  </div>
                </div>
                
                <textarea
                  placeholder={`Share something with ${space.name}...`}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  disabled={isPosting}
                  rows="3"
                />
                
                <div className="create-post-actions">
                  <div></div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!newPost.trim() || isPosting}
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.length === 0 ? (
              <div className="card text-center">
                <p>
                  {space.isMember 
                    ? 'No posts yet. Be the first to post!' 
                    : 'No posts to show. Join the space to see posts and participate.'}
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={loadSpaceData}
                />
              ))
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Members</div>
          {space.members && space.members.length > 0 ? (
            <div className="members-list">
              {space.members.slice(0, 10).map((member) => (
                <div key={member.id} className="d-flex align-items-center mb-2">
                  <div className="comment-avatar" style={{ marginRight: '8px' }}>
                    {member.profileImage ? (
                      <img src={member.profileImage} alt={member.username} />
                    ) : (
                      getInitials(member)
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      {member.firstName && member.lastName
                        ? `${member.firstName} ${member.lastName}`
                        : member.username}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      {getMembershipStatusText(member.Membership?.status)}
                    </div>
                  </div>
                </div>
              ))}
              {space.members.length > 10 && (
                <div className="text-muted" style={{ fontSize: '12px' }}>
                  And {space.members.length - 10} more members...
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted">No members yet.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
        confirmText="Leave"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SpaceDetail;