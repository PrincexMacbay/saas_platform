import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, toggleFollowUser, getFollowers, getFollowing, checkBlockStatus } from '../services/userService';
import { useNotificationModal } from '../contexts/NotificationModalContext';
import { getOrCreateConversation } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useChat } from '../contexts/ChatContext';
import { buildImageUrl } from '../utils/imageUtils';
import './Users.css';

const Users = () => {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { loadConversations } = useChat();
  
  const [allUsers, setAllUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'followers-not-followed', 'suggested'

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load data when component mounts
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  // Filter users when search or tab changes
  useEffect(() => {
    filterUsers();
  }, [debouncedSearch, allUsers, followers, following, activeTab]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, followersResponse, followingResponse] = await Promise.all([
        getUsers({ limit: 1000 }),
        getFollowers(currentUser.id),
        getFollowing(currentUser.id)
      ]);

      // Filter out current user
      const otherUsers = usersResponse.data.users.filter(user => user.id !== currentUser?.id);
      setAllUsers(otherUsers);
      setFollowers(followersResponse.data.followers || []);
      setFollowing(followingResponse.data.following || []);
    } catch (error) {
      console.error('Error loading users data:', error);
    }
    setIsLoading(false);
  };

  // Get followers who haven't been followed back
  const getFollowersNotFollowedBack = () => {
    const followingIds = new Set(following.map(u => u.id));
    return followers.filter(follower => !followingIds.has(follower.id));
  };

  // Get suggested users (users you don't follow and who don't follow you)
  const getSuggestedUsers = () => {
    const followingIds = new Set(following.map(u => u.id));
    const followerIds = new Set(followers.map(u => u.id));
    return allUsers.filter(user => 
      !followingIds.has(user.id) && 
      !followerIds.has(user.id)
    ).slice(0, 12); // Limit to 12 suggestions
  };

  const filterUsers = () => {
    let usersToFilter = [];

    switch (activeTab) {
      case 'followers-not-followed':
        usersToFilter = getFollowersNotFollowedBack();
        break;
      case 'suggested':
        usersToFilter = getSuggestedUsers();
        break;
      case 'all':
      default:
        usersToFilter = allUsers;
        break;
    }

    if (!debouncedSearch.trim()) {
      setFilteredUsers(usersToFilter);
      return;
    }

    const searchTerm = debouncedSearch.toLowerCase();
    const filtered = usersToFilter.filter(user => {
      const firstName = (user.firstName || '').toLowerCase();
      const lastName = (user.lastName || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      const about = (user.about || '').toLowerCase();

      return firstName.includes(searchTerm) ||
             lastName.includes(searchTerm) ||
             username.includes(searchTerm) ||
             about.includes(searchTerm);
    });

    setFilteredUsers(filtered);
  };

  const handleMessageUser = async (userId) => {
    if (actionLoading[userId]) return;
    
    // Verify mutual follow before attempting to message
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      const isFollower = followers.some(f => f.id === userId);
      const isFollowingUser = following.some(f => f.id === userId);
      const isMutualFollow = isFollower && isFollowingUser;
      
      if (!isMutualFollow) {
        alert('You can only message users who follow you and whom you follow (mutual follow required).');
        return;
      }
    }
    
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await getOrCreateConversation(userId);
      
      if (response.success && response.data) {
        await loadConversations();
        navigate(`/messages?conversation=${response.data.id}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start conversation. Please try again.';
      showError(errorMessage, 'Error');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleFollowUser = async (userId) => {
    if (actionLoading[userId]) return;
    
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await toggleFollowUser(userId);
      
      const updateUser = (user) => 
        user.id === userId 
          ? { ...user, isFollowing: response.data.isFollowing }
          : user;

      setAllUsers(prevUsers => prevUsers.map(updateUser));
      setFilteredUsers(prevUsers => prevUsers.map(updateUser));
      
      // Reload followers/following to update counts
      const [followersResponse, followingResponse] = await Promise.all([
        getFollowers(currentUser.id),
        getFollowing(currentUser.id)
      ]);
      setFollowers(followersResponse.data.followers || []);
      setFollowing(followingResponse.data.following || []);
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
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

  const followersNotFollowedBack = getFollowersNotFollowedBack();
  const suggestedUsers = getSuggestedUsers();

  if (isLoading) {
    return (
      <div className="users-page-loading">
        <div className="spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="users-page-header">
        <h1 className="users-page-title">
          <i className="fas fa-users"></i> {t('users.title') || 'Discover People'}
        </h1>
        <p className="users-page-subtitle">
          Connect with members of the community
        </p>
      </div>

      {/* Search Bar */}
      <div className="users-search-container">
        <div className="users-search-wrapper">
          <i className="fas fa-search users-search-icon"></i>
          <input
            type="text"
            className="users-search-input"
            placeholder={t('users.search') || 'Search by name, username, or bio...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="users-search-clear"
              onClick={() => setSearch('')}
              title="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="users-tabs">
        <button
          className={`users-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <i className="fas fa-globe"></i>
          All Users
          <span className="users-tab-badge">{allUsers.length}</span>
        </button>
        {followersNotFollowedBack.length > 0 && (
          <button
            className={`users-tab ${activeTab === 'followers-not-followed' ? 'active' : ''}`}
            onClick={() => setActiveTab('followers-not-followed')}
          >
            <i className="fas fa-user-plus"></i>
            Follow Back
            <span className="users-tab-badge users-tab-badge-highlight">
              {followersNotFollowedBack.length}
            </span>
          </button>
        )}
        <button
          className={`users-tab ${activeTab === 'suggested' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggested')}
        >
          <i className="fas fa-lightbulb"></i>
          Suggested
          <span className="users-tab-badge">{suggestedUsers.length}</span>
        </button>
      </div>

      {/* Special Section: Followers Not Followed Back */}
      {activeTab === 'followers-not-followed' && followersNotFollowedBack.length > 0 && (
        <div className="users-special-section">
          <div className="users-section-header">
            <div className="users-section-header-content">
              <h2>
                <i className="fas fa-heart" style={{ color: '#e74c3c' }}></i>
                People Following You
              </h2>
              <p>These users are following you. Consider following them back!</p>
            </div>
            <div className="users-section-stats">
              <div className="users-stat-item">
                <span className="users-stat-number">{followers.length}</span>
                <span className="users-stat-label">Followers</span>
              </div>
              <div className="users-stat-item">
                <span className="users-stat-number">{following.length}</span>
                <span className="users-stat-label">Following</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Users Section Header */}
      {activeTab === 'suggested' && suggestedUsers.length > 0 && (
        <div className="users-special-section">
          <div className="users-section-header">
            <div className="users-section-header-content">
              <h2>
                <i className="fas fa-lightbulb" style={{ color: '#f39c12' }}></i>
                Suggested for You
              </h2>
              <p>Discover new connections based on your activity</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="users-empty-state">
          <div className="users-empty-icon">
            <i className="fas fa-user-slash"></i>
          </div>
          <h3>No users found</h3>
          <p>
            {search 
              ? `No users match "${search}". Try a different search term.`
              : activeTab === 'followers-not-followed'
              ? 'All your followers have been followed back! 🎉'
              : activeTab === 'suggested'
              ? 'No suggestions available at the moment.'
              : 'No users to display.'}
          </p>
          {search && (
            <button
              className="users-clear-search-btn"
              onClick={() => setSearch('')}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="users-grid">
            {filteredUsers.map((user) => {
              const isFollower = followers.some(f => f.id === user.id);
              const isFollowingUser = following.some(f => f.id === user.id);
              const isMutualFollow = isFollower && isFollowingUser; // Both following each other
              
              return (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <Link 
                      to={`/profile/${user.username}`}
                      className="user-avatar-link"
                    >
                      <div className="user-avatar">
                        {user.profileImage ? (
                          <img 
                            src={buildImageUrl(user.profileImage)} 
                            alt={user.username}
                          />
                        ) : (
                          <div className="user-avatar-initials">
                            {getInitials(user)}
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    {isFollower && !isFollowingUser && (
                      <div className="user-badge user-badge-follower">
                        <i className="fas fa-heart"></i>
                        Follows you
                      </div>
                    )}
                    {isFollowingUser && !isFollower && (
                      <div className="user-badge user-badge-following">
                        <i className="fas fa-check"></i>
                        Following
                      </div>
                    )}
                    {isMutualFollow && (
                      <div className="user-badge user-badge-mutual">
                        <i className="fas fa-user-friends"></i>
                        Mutual
                      </div>
                    )}
                  </div>

                  <div className="user-card-body">
                    <Link 
                      to={`/profile/${user.username}`}
                      className="user-name-link"
                    >
                      <h3 className="user-name">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username}
                      </h3>
                      <p className="user-username">
                        @{user.username} {getVisibilityIcon(user.visibility)}
                      </p>
                    </Link>

                    {user.about && (
                      <p className="user-bio">
                        {user.about.length > 120 
                          ? `${user.about.substring(0, 120)}...` 
                          : user.about}
                      </p>
                    )}

                    <div className="user-meta">
                      <span className="user-meta-item">
                        <i className="fas fa-calendar"></i>
                        Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      {user.lastLogin && (
                        <span className="user-meta-item">
                          <i className="fas fa-clock"></i>
                          Active {new Date(user.lastLogin).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="user-card-actions">
                    <Link
                      to={`/profile/${user.username}`}
                      className="user-action-btn user-action-btn-secondary"
                    >
                      <i className="fas fa-user"></i>
                      View Profile
                    </Link>
                    
                    {/* Show Message button if mutual follow OR if conversation exists (but not if blocked) */}
                    {isMutualFollow && (
                      <button
                        className="user-action-btn user-action-btn-primary"
                        onClick={() => handleMessageUser(user.id)}
                        disabled={actionLoading[user.id]}
                        title="Send a message"
                      >
                        {actionLoading[user.id] ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <>
                            <i className="fas fa-comments"></i>
                            Message
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      className={`user-action-btn ${
                        user.isFollowing || isFollowingUser
                          ? 'user-action-btn-secondary'
                          : 'user-action-btn-primary'
                      }`}
                      onClick={() => handleFollowUser(user.id)}
                      disabled={actionLoading[user.id]}
                    >
                      {actionLoading[user.id] ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <i className={`fas ${user.isFollowing || isFollowingUser ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                          {user.isFollowing || isFollowingUser ? 'Following' : 'Follow'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results Summary */}
          <div className="users-results-summary">
            <p>
              Showing <strong>{filteredUsers.length}</strong> of <strong>{allUsers.length}</strong> users
              {search && ` matching "${search}"`}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;
