import React, { useState, useEffect } from 'react';
import { getPosts } from '../services/postService';
import { getUserMemberships } from '../services/membershipService';
import PostCard from '../components/PostCard';
import PostWithAttachment from '../components/PostWithAttachment';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsResponse, membershipsResponse] = await Promise.all([
        getPosts({ limit: 20 }),
        getUserMemberships().catch(() => ({ data: [] })) // Handle error gracefully
      ]);
      setPosts(postsResponse.data.posts);
      setMemberships(membershipsResponse.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setIsLoading(false);
  };

  const handlePostCreated = () => {
    loadData(); // Reload posts when a new post is created
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
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="main-feed">
          {/* Create Post with Attachment */}
          <PostWithAttachment onPostCreated={handlePostCreated} />

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.length === 0 ? (
              <div className="card text-center">
                <p>No posts yet. Create your first post above!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={loadData}
                />
              ))
            )}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">My Memberships</div>
          {memberships.length === 0 ? (
            <p className="text-muted">You don't have any active memberships yet.</p>
          ) : (
            <div className="memberships-list">
              {memberships.slice(0, 5).map((membership) => (
                <div key={membership.id} className="membership-item" style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: membership.status === 'active' ? '#28a745' : 
                                       membership.status === 'pending' ? '#ffc107' : '#6c757d',
                        marginRight: '8px'
                      }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>
                        {membership.plan?.name || 'Membership Plan'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                      {membership.plan?.organization?.name || 'Organization'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        textTransform: 'uppercase',
                        color: membership.status === 'active' ? '#28a745' : 
                               membership.status === 'pending' ? '#ffc107' : '#6c757d',
                        fontWeight: '600'
                      }}>
                        {membership.status}
                      </span>
                      {membership.memberNumber && (
                        <span style={{ fontSize: '11px', color: '#6c757d' }}>
                          #{membership.memberNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3">
            <Link to="/browse-memberships" className="btn btn-outline btn-sm">
              Browse All Memberships
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;