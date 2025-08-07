import React, { useState, useEffect } from 'react';
import { getPosts } from '../services/postService';
import { getSpaces } from '../services/spaceService';
import PostCard from '../components/PostCard';
import PostWithAttachment from '../components/PostWithAttachment';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsResponse, spacesResponse] = await Promise.all([
        getPosts({ limit: 20 }),
        getSpaces({ limit: 10 })
      ]);
      setPosts(postsResponse.data.posts);
      setSpaces(spacesResponse.data.spaces);
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
          <div className="sidebar-title">My Spaces</div>
          {spaces.filter(space => space.isMember).length === 0 ? (
            <p className="text-muted">You haven't joined any spaces yet.</p>
          ) : (
            <div className="spaces-list">
              {spaces.filter(space => space.isMember).slice(0, 5).map((space) => (
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
                        backgroundColor: space.color || '#3498db',
                        marginRight: '8px'
                      }}></div>
                      <span style={{ fontSize: '14px' }}>{space.name}</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-3">
            <a href="/spaces" className="btn btn-outline btn-sm">
              Browse All Spaces
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;