import React from 'react';
import { buildImageUrl } from '../../utils/imageUtils';
import './ConversationList.css';

const ConversationList = ({ conversations, activeConversation, onSelect }) => {
  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user.username ? user.username.charAt(0).toUpperCase() : 'U';
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="conversation-list">
      {conversations.length === 0 ? (
        <div className="empty-conversations">
          <i className="fas fa-comments"></i>
          <p>No conversations yet</p>
          <p className="empty-subtitle">Start a conversation with someone!</p>
        </div>
      ) : (
        conversations.map(conv => {
          const otherUser = conv.otherUser;
          const lastMessage = conv.lastMessage;

          return (
            <div
              key={conv.id}
              className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="conversation-avatar">
                {otherUser.profileImage ? (
                  <img src={buildImageUrl(otherUser.profileImage)} alt={otherUser.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(otherUser)}
                  </div>
                )}
              </div>
              <div className="conversation-info">
                <div className="conversation-header">
                  <span className="conversation-name">
                    {otherUser.firstName && otherUser.lastName
                      ? `${otherUser.firstName} ${otherUser.lastName}`
                      : otherUser.username}
                  </span>
                  {lastMessage && (
                    <span className="conversation-time">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <div className="conversation-preview">
                    {lastMessage.content.substring(0, 60)}
                    {lastMessage.content.length > 60 ? '...' : ''}
                  </div>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <div className="unread-badge">{conv.unreadCount}</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ConversationList;
