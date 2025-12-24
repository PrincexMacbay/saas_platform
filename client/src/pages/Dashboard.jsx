import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPosts } from '../services/postService';
import { getUserMemberships } from '../services/membershipService';
import PostCard from '../components/PostCard';
import PostWithAttachment from '../components/PostWithAttachment';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);
  const postRefs = useRef({});
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  // Handle postId and commentId from URL query params
  useEffect(() => {
    const postId = searchParams.get('postId');
    const commentId = searchParams.get('commentId');
    
    if (postId && posts.length > 0) {
      // Wait a bit for posts to render, then scroll
      setTimeout(() => {
        const postElement = postRefs.current[`post-${postId}`];
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedPostId(postId);
          
          // If commentId is provided, highlight the comment
          if (commentId) {
            setHighlightedCommentId(commentId);
            // Remove highlight after 3 seconds
            setTimeout(() => {
              setHighlightedPostId(null);
              setHighlightedCommentId(null);
            }, 3000);
          } else {
            // Remove highlight after 2 seconds
            setTimeout(() => {
              setHighlightedPostId(null);
            }, 2000);
          }
        }
      }, 500);
    }
  }, [searchParams, posts]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsResponse, membershipsResponse] = await Promise.all([
        getPosts({ limit: 20 }),
        getUserMemberships().catch(() => ({ data: [] }))
      ]);
      setPosts(postsResponse.data.posts || []);
      const membershipsData = membershipsResponse?.data;
      setMemberships(Array.isArray(membershipsData) ? membershipsData : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setPosts([]);
      setMemberships([]);
    }
    setIsLoading(false);
  };

  const handlePostCreated = () => {
    loadData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: '#3498db' }}></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcome').replace('{name}', user?.firstName || user?.username || 'User')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('dashboard.recent.activity') || 'Here\'s what\'s happening in your network'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <PostWithAttachment onPostCreated={handlePostCreated} />
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {(!posts || posts.length === 0) ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 text-lg">{t('dashboard.no.posts')}</p>
                </div>
              ) : (
                (Array.isArray(posts) ? posts : []).map((post) => (
                  <div 
                    key={post.id} 
                    ref={el => postRefs.current[`post-${post.id}`] = el}
                    className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
                      highlightedPostId === post.id.toString() 
                        ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                        : 'border-gray-200'
                    }`}
                  >
                    <PostCard
                      post={post}
                      onUpdate={loadData}
                      highlightCommentId={highlightedPostId === post.id.toString() ? highlightedCommentId : null}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              {/* Memberships Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    {t('membership.current')}
                  </h2>
                  {memberships.length > 0 && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {memberships.length}
                    </span>
                  )}
                </div>

                {(!memberships || memberships.length === 0) ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <p className="text-gray-600 text-sm mb-4">{t('dashboard.no.memberships')}</p>
                    <Link
                      to="/browse-memberships"
                      className="inline-flex items-center px-4 py-2 bg-[#3498db] hover:bg-[#2980b9] text-white text-sm font-semibold rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {t('dashboard.browse.all.memberships')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(Array.isArray(memberships) ? memberships : []).slice(0, 5).map((membership) => (
                      <div
                        key={membership.id}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 p-4 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
                              {membership.plan?.name || t('dashboard.membership.plan')}
                            </h3>
                            <p className="text-xs text-gray-600 truncate">
                              {membership.plan?.organization?.name || t('dashboard.organization')}
                            </p>
                          </div>
                          <div className={`flex-shrink-0 ml-2 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(membership.status)}`}>
                            {membership.status}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              membership.status === 'active' ? 'bg-green-500' :
                              membership.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-xs text-gray-500 capitalize">
                              {membership.status}
                            </span>
                          </div>
                          {membership.memberNumber && (
                            <span className="text-xs text-gray-500 font-mono">
                              #{membership.memberNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {memberships.length > 5 && (
                      <Link
                        to="/membership"
                        className="block text-center text-sm text-gray-600 hover:text-gray-900 font-medium py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        {t('dashboard.view.all.memberships') || `View all ${memberships.length} memberships`}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t('dashboard.quick.actions') || 'Quick Actions'}
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/browse-memberships"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all group"
                  >
                    <div className="w-10 h-10 bg-[#3498db] hover:bg-[#2980b9] rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{t('dashboard.browse.all.memberships')}</p>
                      <p className="text-xs text-gray-600">Explore available plans</p>
                    </div>
                  </Link>
                  
                  <Link
                    to="/membership"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all group"
                  >
                    <div className="w-10 h-10 bg-[#3498db] hover:bg-[#2980b9] rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{t('membership.dashboard')}</p>
                      <p className="text-xs text-gray-600">Manage your memberships</p>
                    </div>
                  </Link>

                  <Link
                    to="/career"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all group"
                  >
                    <div className="w-10 h-10 bg-[#3498db] hover:bg-[#2980b9] rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{t('nav.career.center')}</p>
                      <p className="text-xs text-gray-600">Browse job opportunities</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
