import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getUser, updateProfile, toggleFollowUser, getFollowers, getFollowing, checkBlockStatus, blockUser, unblockUser } from '../services/userService';
import { getPosts } from '../services/postService';
import { getUserMemberships } from '../services/membershipService';
import { getOrCreateConversation } from '../services/chatService';
import { useChat } from '../contexts/ChatContext';
import api from '../services/api';
import PostCard from '../components/PostCard';
import ProfileImageUpload from '../components/ProfileImageUpload';
import MembershipCard from '../components/membership/MembershipCard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl } from '../utils/imageUtils';

const Profile = () => {
  const { identifier } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userMemberships, setUserMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { loadConversations, conversations } = useChat();

  const isOwnProfile = user && profileUser && user.id === profileUser.id;
  
  // Check if users are following each other (mutual follow)
  const isMutualFollow = React.useMemo(() => {
    if (!user || !profileUser || isOwnProfile) return false;
    const currentUserFollowing = following.some(f => f.id === profileUser.id);
    const profileUserFollowing = followers.some(f => f.id === user.id);
    return currentUserFollowing && profileUserFollowing;
  }, [user, profileUser, following, followers, isOwnProfile]);

  useEffect(() => {
    loadProfileData();
  }, [identifier]);

  useEffect(() => {
    const shouldEdit = searchParams.get('edit') === 'true';
    if (shouldEdit && isOwnProfile) {
      setIsEditing(true);
    }
  }, [searchParams, isOwnProfile]);

  // Load conversations to check for existing ones
  useEffect(() => {
    if (user && !isOwnProfile) {
      loadConversations();
    }
  }, [user, isOwnProfile, loadConversations]);

  const fetchUserMemberships = async (userId) => {
    try {
      // If viewing own profile, use regular endpoint
      // If viewing another user's profile, need to get their userId first
      if (isOwnProfile && user?.id) {
        const response = await getUserMemberships();
        return response.data.data || [];
      } else {
        // For other users, we need to fetch by userId
        // First get the user to find their ID
        const userResponse = await getUser(identifier);
        const profileUserId = userResponse.data.user.id;
        
        // Fetch subscriptions for that user
        const response = await api.get(`/membership/subscriptions/user?userId=${profileUserId}`);
        return response.data.data || [];
      }
    } catch (error) {
      console.error('Error fetching user memberships:', error);
      return [];
    }
  };

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const userResponse = await getUser(identifier);
      const profileUserData = userResponse.data.user;
      const profileUserId = profileUserData.id;
      
      const [postsResponse, membershipsResponse] = await Promise.all([
        getPosts({ userId: identifier, limit: 20 }),
        fetchUserMemberships(profileUserId)
      ]);
      
      setProfileUser(profileUserData);
      setPosts(postsResponse.data.posts);
      setUserMemberships(membershipsResponse);
      
      // Check block status and existing conversation if viewing another user's profile
      if (profileUserData.id !== user?.id && user?.id) {
        try {
          const [blockStatusResponse] = await Promise.all([
            checkBlockStatus(profileUserData.id)
          ]);
          
          if (blockStatusResponse.success) {
            setIsBlocked(blockStatusResponse.data.isBlocked);
            setBlockedByMe(blockStatusResponse.data.blockedByMe);
            setBlockedByThem(blockStatusResponse.data.blockedByThem);
          }
        } catch (error) {
          console.error('Error checking block status:', error);
        }
      }
      
      if (profileUserData.id === user?.id) {
        setEditData({
          firstName: profileUserData.firstName || '',
          lastName: profileUserData.lastName || '',
          about: profileUserData.about || '',
          visibility: profileUserData.visibility || 1,
        });
      }

      if (profileUserData) {
        try {
          const [followersResponse, followingResponse] = await Promise.all([
            getFollowers(profileUserData.id),
            getFollowing(profileUserData.id)
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

  const handleMessage = async () => {
    if (!profileUser || !user) return;
    
    // Check if blocked
    if (isBlocked) {
      alert('You cannot message this user. One of you has blocked the other.');
      return;
    }
    
    // If conversation exists, navigate directly
    if (hasExistingConversation) {
      const existingConv = conversations.find(conv => 
        conv.otherUser && conv.otherUser.id === profileUser.id
      );
      if (existingConv) {
        navigate(`/messages?conversation=${existingConv.id}`);
        return;
      }
    }
    
    // For NEW conversations, require mutual follow
    // But allow access to existing conversations even without mutual follow
    try {
      setActionLoading(true);
      const response = await getOrCreateConversation(profileUser.id);
      
      if (response.success && response.data) {
        // Reload conversations to get the new one
        await loadConversations();
        // Navigate to the conversation
        navigate(`/messages?conversation=${response.data.id}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start conversation. Please try again.';
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollow = async () => {
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      const response = await toggleFollowUser(profileUser.id);
      setProfileUser(prev => ({
        ...prev,
        isFollowing: response.data.isFollowing
      }));
      
      // Reload followers/following to update mutual follow status
      if (profileUser) {
        try {
          const [followersResponse, followingResponse] = await Promise.all([
            getFollowers(profileUser.id),
            getFollowing(profileUser.id)
          ]);
          setFollowers(followersResponse.data.followers || []);
          setFollowing(followingResponse.data.following || []);
        } catch (error) {
          console.error('Error reloading followers/following:', error);
        }
      }
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
      updateUser(editData);
      setIsEditing(false);
      loadProfileData();
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
      case 1: return t('profile.visibility.registered') || 'Registered Users';
      case 2: return t('profile.visibility.public') || 'Public';
      case 3: return t('profile.visibility.hidden') || 'Hidden';
      default: return 'Unknown';
    }
  };

  const getProfession = (user) => {
    if (user.profile?.userType === 'company' && user.companyProfile?.companyName) {
      return `Company: ${user.companyProfile.companyName}`;
    } else if (user.profile?.userType === 'individual' && user.individualProfile?.workExperience) {
      return user.individualProfile.workExperience.split('\n')[0];
    } else if (user.profile?.userType) {
      return user.profile.userType.charAt(0).toUpperCase() + user.profile.userType.slice(1);
    }
    return t('profile.profession.not.specified') || 'Not specified';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
          <p className="text-gray-600">{t('profile.loading') || 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('profile.not.found') || 'User not found'}</h3>
          <p className="text-gray-600">{t('profile.not.found.message') || 'The user you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200 pt-20 pb-8 md:pt-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 mt-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="relative">
                  {profileUser.profileImage ? (
                    <img 
                      src={buildImageUrl(profileUser.profileImage)}
                      alt={profileUser.username}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-gray-500 to-indigo-600 flex items-center justify-center text-white text-4xl md:text-5xl font-bold border-4 border-white shadow-lg">
                      {getInitials(profileUser)}
                    </div>
                  )}
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowImageUpload(!showImageUpload)}
                      className="absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-2 shadow-lg transition-all transform hover:scale-110"
                      title={t('profile.change.photo') || 'Change profile picture'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {profileUser.firstName && profileUser.lastName
                    ? `${profileUser.firstName} ${profileUser.lastName}`
                    : profileUser.username}
                </h1>
                <p className="text-gray-600 text-lg mb-1">@{profileUser.username}</p>
                <p className="text-gray-600 font-medium mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {getProfession(profileUser)}
                </p>
                
                {profileUser.about && (
                  <p className="text-gray-700 mb-6 max-w-2xl mx-auto md:mx-0">
                    {profileUser.about}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-sm transition-all transform hover:scale-105 border border-gray-700"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {isEditing ? t('common.cancel') : t('profile.edit')}
                      </button>
                      <button
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition-all border border-gray-300"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('profile.change.photo') || 'Change Photo'}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Show Message button if mutual follow (for new conversations) OR if conversation already exists */}
                      {/* But hide if blocked */}
                      {!isBlocked && (isMutualFollow || hasExistingConversation) && (
                        <button
                          onClick={handleMessage}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-sm transition-all transform hover:scale-105 border border-gray-700"
                          title={hasExistingConversation && !isMutualFollow ? 'Continue existing conversation' : 'Send a message'}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Message
                        </button>
                      )}
                      {/* Block/Unblock button */}
                      {blockedByMe ? (
                        <button
                          onClick={handleUnblock}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-sm transition-all transform hover:scale-105 border border-yellow-700"
                          title="Unblock this user"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Unblock
                        </button>
                      ) : !blockedByThem && (
                        <button
                          onClick={handleBlock}
                          disabled={actionLoading}
                          className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm transition-all transform hover:scale-105 border border-red-700"
                          title="Block this user"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Block
                        </button>
                      )}
                      <button
                        onClick={handleFollow}
                        disabled={actionLoading}
                        className={`inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg shadow-sm transition-all transform hover:scale-105 border ${
                          profileUser.isFollowing
                            ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                            : 'bg-gray-800 hover:bg-gray-900 text-white border-gray-700'
                        }`}
                      >
                        {actionLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.loading')}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {profileUser.isFollowing ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              )}
                            </svg>
                            {profileUser.isFollowing ? t('users.unfollow') : t('users.follow')}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{followers.length}</div>
                <div className="text-sm text-gray-600 mt-1 font-medium">{t('nav.followers')}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{following.length}</div>
                <div className="text-sm text-gray-600 mt-1 font-medium">{t('nav.following')}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{userMemberships.length}</div>
                <div className="text-sm text-gray-600 mt-1 font-medium">{t('nav.memberships')}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{posts.length}</div>
                <div className="text-sm text-gray-600 mt-1 font-medium">{t('profile.posts') || 'Posts'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Form */}
      {showImageUpload && isOwnProfile && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('profile.update.photo') || 'Update Profile Picture'}</h3>
            <ProfileImageUpload 
              onUploadComplete={() => {
                setShowImageUpload(false);
                loadProfileData();
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      {isEditing && isOwnProfile && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t('profile.edit')}</h3>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('auth.first.name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    value={editData.firstName}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('auth.last.name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    value={editData.lastName}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                    disabled={actionLoading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.about')}
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  rows="4"
                  value={editData.about}
                  onChange={(e) => setEditData({...editData, about: e.target.value})}
                  disabled={actionLoading}
                  maxLength="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('profile.visibility') || 'Profile Visibility'}
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  value={editData.visibility}
                  onChange={(e) => setEditData({...editData, visibility: parseInt(e.target.value)})}
                  disabled={actionLoading}
                >
                  <option value={1}>{t('profile.visibility.registered') || 'Registered Users'}</option>
                  <option value={2}>{t('profile.visibility.public') || 'Public'}</option>
                  <option value={3}>{t('profile.visibility.hidden') || 'Hidden'}</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {actionLoading ? t('common.saving') || 'Saving...' : t('profile.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto -mb-px">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 sm:flex-none px-4 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'posts'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('profile.posts') || 'Posts'} ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('memberships')}
                className={`flex-1 sm:flex-none px-4 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'memberships'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                {t('nav.memberships')} ({userMemberships.length})
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 sm:flex-none px-4 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'followers'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t('nav.followers')} ({followers.length})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 sm:flex-none px-4 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'following'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('nav.following')} ({following.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-6">
                  {t('profile.posts.by') || 'Posts by'} {profileUser.firstName && profileUser.lastName
                    ? `${profileUser.firstName} ${profileUser.lastName}`
                    : profileUser.username}
                </h4>
                
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">{isOwnProfile ? t('profile.no.posts.own') || "You haven't posted anything yet." : t('profile.no.posts') || 'No posts to show.'}</p>
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

            {/* Memberships Tab */}
            {activeTab === 'memberships' && (
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-6">{t('nav.memberships')}</h4>
                {userMemberships.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <p className="text-gray-600 mb-4">{isOwnProfile ? t('profile.no.memberships.own') || "You haven't joined any memberships yet." : t('profile.no.memberships') || 'No memberships to show.'}</p>
                    {isOwnProfile && (
                      <Link to="/membership" className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-all shadow-sm">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('dashboard.browse.all.memberships')}
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userMemberships.map((membership) => (
                      <MembershipCard 
                        key={membership.id}
                        membership={membership}
                        onViewCard={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Followers Tab */}
            {activeTab === 'followers' && (
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-6">{t('nav.followers')}</h4>
                {followers.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <p className="text-gray-600">{t('profile.no.followers') || 'No followers yet.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followers.map((follower) => (
                      <Link
                        key={follower.id}
                        to={`/profile/${follower.username}`}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all border border-gray-200"
                      >
                        <div className="flex items-center gap-4">
                          {follower.profileImage ? (
                            <img 
                              src={buildImageUrl(follower.profileImage)}
                              alt={follower.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
                              {getInitials(follower)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h6 className="font-semibold text-gray-900 truncate">
                              {follower.firstName && follower.lastName
                                ? `${follower.firstName} ${follower.lastName}`
                                : follower.username}
                            </h6>
                            <p className="text-sm text-gray-600 truncate">@{follower.username}</p>
                            <p className="text-xs text-gray-500 truncate">{getProfession(follower)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && (
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-6">{t('nav.following')}</h4>
                {following.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-600">{isOwnProfile ? t('profile.no.following.own') || "You're not following anyone yet." : t('profile.no.following') || 'Not following anyone.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {following.map((followed) => (
                      <Link
                        key={followed.id}
                        to={`/profile/${followed.username}`}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all border border-gray-200"
                      >
                        <div className="flex items-center gap-4">
                          {followed.profileImage ? (
                            <img 
                              src={buildImageUrl(followed.profileImage)}
                              alt={followed.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
                              {getInitials(followed)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h6 className="font-semibold text-gray-900 truncate">
                              {followed.firstName && followed.lastName
                                ? `${followed.firstName} ${followed.lastName}`
                                : followed.username}
                            </h6>
                            <p className="text-sm text-gray-600 truncate">@{followed.username}</p>
                            <p className="text-xs text-gray-500 truncate">{getProfession(followed)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
