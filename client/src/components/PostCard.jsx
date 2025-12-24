import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toggleLike, createComment, updatePost, deletePost } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import { buildImageUrl } from '../utils/imageUtils';

const PostCard = ({ post, onUpdate, highlightCommentId }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(post.message);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const commentRefs = useRef({});
  const { user } = useAuth();

  // Close dropdown when editing starts
  useEffect(() => {
    if (isEditing) {
      setShowDropdown(false);
    }
  }, [isEditing]);

  // Handle comment highlighting from notification
  useEffect(() => {
    if (highlightCommentId && post.comments && post.comments.length > 0) {
      // Expand comments if not already shown
      if (!showComments) {
        setShowComments(true);
      }
      
      // Wait for comments to render, then scroll to the highlighted comment
      setTimeout(() => {
        const commentElement = commentRefs.current[`comment-${highlightCommentId}`];
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          commentElement.style.backgroundColor = '#fef3c7';
          setTimeout(() => {
            commentElement.style.backgroundColor = '';
          }, 3000);
        }
      }, 300);
    }
  }, [highlightCommentId, showComments, post.comments]);

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

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editMessage.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      await updatePost(post.id, { message: editMessage });
      setIsEditing(false);
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this post?',
      onConfirm: () => deletePostItem()
    });
  };

  const deletePostItem = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
    setIsDeleting(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditMessage(post.message);
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
              src={buildImageUrl(post.author.profileImage)}
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
        
        {/* Post actions for owner */}
        {user && user.id === post.author.id && (
          <div className="post-menu" style={{ marginLeft: 'auto', position: 'relative' }}>
            <button 
              className="btn btn-link btn-sm"
              type="button" 
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ color: '#6c757d', padding: '0.25rem' }}
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
            
            {showDropdown && (
              <>
                {/* Backdrop to close dropdown */}
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* Dropdown menu */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem',
                    boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    minWidth: '120px'
                  }}
                >
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      setIsEditing(true);
                      setShowDropdown(false);
                    }}
                    disabled={isUpdating || isDeleting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-edit" style={{ marginRight: '0.5rem' }}></i>
                    Edit
                  </button>
                  
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={() => {
                      handleDelete();
                      setShowDropdown(false);
                    }}
                    disabled={isUpdating || isDeleting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#dc3545'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="post-content">
        {isEditing ? (
          /* Edit form */
          <form onSubmit={handleEdit}>
            <div className="form-group mb-3">
              <textarea
                className="form-control"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                rows="4"
                placeholder="Edit your post..."
                disabled={isUpdating}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!editMessage.trim() || isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Post'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Normal post view */
          <>
            <div className="post-message">{post.message}</div>
            
            {/* Post Attachment */}
            {post.attachmentUrl && (
              <div className="post-attachment" style={{ marginTop: '15px' }}>
                {console.log('Post attachment URL:', post.attachmentUrl)}
                <img 
                  src={buildImageUrl(post.attachmentUrl)}
                  alt="Post attachment"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    console.log('Image loaded successfully:', e.target.src);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Hide actions when editing */}
      {!isEditing && (
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
      )}

      {showComments && !isEditing && (
        <div className="comments">
          {post.comments && post.comments.length > 0 && (
            <>
              {post.comments.map((comment) => (
                <div 
                  key={comment.id} 
                  ref={el => commentRefs.current[`comment-${comment.id}`] = el}
                  className={`comment ${highlightCommentId && highlightCommentId === comment.id.toString() ? 'highlighted-comment' : ''}`}
                  style={highlightCommentId && highlightCommentId === comment.id.toString() ? {
                    backgroundColor: '#fef3c7',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    transition: 'background-color 0.3s'
                  } : {}}
                >
                  <div className="comment-header">
                                      <div className="comment-avatar">
                    {comment.author.profileImage ? (
                      <img 
                        src={buildImageUrl(comment.author.profileImage)}
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm?.();
          setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PostCard;