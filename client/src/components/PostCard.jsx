import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleLike, createComment } from '../services/postService';

const PostCard = ({ post, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      await toggleLike('Post', post.id);
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
    setIsLiking(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      await createComment(post.id, { message: newComment });
      setNewComment('');
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
    setIsCommenting(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  return (
    <div className="post">
      <div className="post-header">
        <div className="post-avatar">
          {post.author.profileImage ? (
            <img 
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${post.author.profileImage}`}
              alt={post.author.username}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            getInitials(post.author)
          )}
        </div>
        <div className="post-author">
          <div className="post-author-name">
            <Link to={`/profile/${post.author.username}`}>
              {post.author.firstName && post.author.lastName
                ? `${post.author.firstName} ${post.author.lastName}`
                : post.author.username}
            </Link>
            {post.space && (
              <>
                <span className="text-muted"> in </span>
                <Link to={`/spaces/${post.space.url || post.space.id}`}>
                  {post.space.name}
                </Link>
              </>
            )}
          </div>
          <div className="post-time">{formatDate(post.createdAt)}</div>
        </div>
      </div>

      <div className="post-content">
        <div className="post-message">{post.message}</div>
        
        {/* Post Attachment */}
        {post.attachmentUrl && (
          <div className="post-attachment" style={{ marginTop: '15px' }}>
            <img 
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${post.attachmentUrl}`}
              alt="Post attachment"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`post-action ${post.isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          <i className={`fas fa-heart ${post.isLiked ? '' : 'far'}`}></i>
          {post.likeCount > 0 && ` ${post.likeCount}`}
        </button>
        
        <button
          className="post-action"
          onClick={() => setShowComments(!showComments)}
        >
          <i className="fas fa-comment"></i>
          {post.comments && post.comments.length > 0 && ` ${post.comments.length}`}
        </button>
      </div>

      {showComments && (
        <div className="comments">
          {post.comments && post.comments.length > 0 && (
            <>
              {post.comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                                      <div className="comment-avatar">
                    {comment.author.profileImage ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${comment.author.profileImage}`}
                        alt={comment.author.username}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      getInitials(comment.author)
                    )}
                  </div>
                    <span className="comment-author">
                      <Link to={`/profile/${comment.author.username}`}>
                        {comment.author.firstName && comment.author.lastName
                          ? `${comment.author.firstName} ${comment.author.lastName}`
                          : comment.author.username}
                      </Link>
                    </span>
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="comment-content">{comment.message}</div>
                </div>
              ))}
            </>
          )}
          
          <form onSubmit={handleComment} style={{ padding: '15px 20px' }}>
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="2"
                disabled={isCommenting}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!newComment.trim() || isCommenting}
            >
              {isCommenting ? 'Posting...' : 'Comment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;