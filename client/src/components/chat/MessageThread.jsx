import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationModal } from '../../contexts/NotificationModalContext';
import { buildImageUrl } from '../../utils/imageUtils';
import { uploadChatAttachment } from '../../services/uploadService';
import { blockUser, unblockUser, checkBlockStatus } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import './MessageThread.css';

const MessageThread = ({ conversationId, onBack }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showConfirm } = useNotificationModal();
  const {
    conversations,
    messages,
    typingUsers,
    loadMessages,
    sendMessage,
    setTyping,
    joinConversation,
    markMessagesAsRead,
    loadConversations
  } = useChat();

  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const settingsRef = useRef(null);
  const navigate = useNavigate();

  const conversation = conversations.find(c => c.id === conversationId);
  const conversationMessages = messages[conversationId] || [];
  const typingUser = typingUsers[conversationId];
  const otherUser = conversation?.otherUser;
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedByThem, setBlockedByThem] = useState(false);
  const canSendMessage = !isBlocked; // Can send if not blocked

  const loadBlockStatus = async () => {
    if (!otherUser || !user || otherUser.id === user.id) return;
    
    try {
      const response = await checkBlockStatus(otherUser.id);
      if (response.success) {
        setIsBlocked(response.data.isBlocked);
        setBlockedByMe(response.data.blockedByMe);
        setBlockedByThem(response.data.blockedByThem);
      }
    } catch (error) {
      console.error('Error loading block status:', error);
    }
  };

  const handleBlock = async () => {
    if (!otherUser || !user || blocking || otherUser.id === user.id) return;
    
    if (window.confirm(`Are you sure you want to block ${otherUser.firstName || otherUser.username}? You won't be able to send messages to each other.`)) {
      try {
        setBlocking(true);
        await blockUser(otherUser.id);
        setIsBlocked(true);
        setBlockedByMe(true);
        setShowSettings(false);
        alert('User blocked successfully');
        // Reload conversations to update block status
        if (loadConversations) {
          loadConversations();
        }
      } catch (error) {
        console.error('Error blocking user:', error);
        alert('Failed to block user. Please try again.');
      } finally {
        setBlocking(false);
      }
    }
  };

  const handleUnblock = async () => {
    if (!otherUser || !user || blocking || otherUser.id === user.id) return;
    
    try {
      setBlocking(true);
      await unblockUser(otherUser.id);
      setIsBlocked(false);
      setBlockedByMe(false);
      setShowSettings(false);
      showSuccess('User unblocked successfully', 'User Unblocked');
      // Reload conversations to update block status
      if (loadConversations) {
        loadConversations();
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      showError('Failed to unblock user. Please try again.', 'Error');
    } finally {
      setBlocking(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      loadMessages(conversationId).finally(() => setLoading(false));
      markMessagesAsRead(conversationId);
    }
  }, [conversationId]);

  // Load block status when conversation changes
  useEffect(() => {
    if (otherUser && user && otherUser.id !== user.id) {
      loadBlockStatus();
    }
  }, [otherUser, user]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages, typingUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = async (file) => {
    setUploadingAttachment(true);
    try {
      const response = await uploadChatAttachment(file);
      
      // Determine attachment type
      let type = 'file';
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type.startsWith('audio/')) {
        type = 'audio';
      }

      setAttachment(response.data.url);
      setAttachmentType(type);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!messageContent.trim() && !attachment) || sending || !canSendMessage) return;

    const content = messageContent.trim() || '';
    const att = attachment;
    const attType = attachmentType;

    setMessageContent('');
    setAttachment(null);
    setAttachmentType(null);
    setSending(true);
    setTyping(conversationId, false);

    try {
      await sendMessage(conversationId, content, att, attType);
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message. Please try again.', 'Message Error');
      setMessageContent(content);
      setAttachment(att);
      setAttachmentType(attType);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleTyping = (e) => {
    setMessageContent(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing indicator
    if (e.target.value.trim()) {
      setTyping(conversationId, true);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(conversationId, false);
      }, 3000);
    } else {
      setTyping(conversationId, false);
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user.username ? user.username.charAt(0).toUpperCase() : 'U';
  };

  const renderAttachment = (message) => {
    if (!message.attachment) return null;

    if (message.attachmentType === 'image') {
      return (
        <div className="message-attachment">
          <img src={buildImageUrl(message.attachment)} alt="Attachment" />
        </div>
      );
    } else if (message.attachmentType === 'video') {
      return (
        <div className="message-attachment message-video">
          <video controls src={buildImageUrl(message.attachment)}>
            Your browser does not support video playback.
          </video>
        </div>
      );
    } else {
      return (
        <div className="message-attachment message-file">
          <a href={buildImageUrl(message.attachment)} target="_blank" rel="noopener noreferrer" download>
            <i className="fas fa-file"></i>
            <span>Download file</span>
          </a>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="message-thread">
        <div className="message-thread-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="message-thread">
        <div className="message-thread-error">
          <p>Conversation not found</p>
          <button onClick={onBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="message-thread">
      {/* Header */}
      <div className="message-thread-header">
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="thread-user-info">
          {otherUser.profileImage ? (
            <img src={buildImageUrl(otherUser.profileImage)} alt={otherUser.username} />
          ) : (
            <div className="thread-avatar-placeholder">
              {getInitials(otherUser)}
            </div>
          )}
          <div>
            <div className="thread-user-name">
              {otherUser.firstName && otherUser.lastName
                ? `${otherUser.firstName} ${otherUser.lastName}`
                : otherUser.username}
            </div>
            {typingUser && typingUser.isTyping && (
              <div className="typing-indicator">
                {typingUser.firstName || typingUser.username} is typing...
              </div>
            )}
          </div>
        </div>
        <div className="thread-header-actions" ref={settingsRef}>
          <button
            className="settings-button"
            onClick={() => setShowSettings(!showSettings)}
            title="Chat settings"
          >
            <i className="fas fa-ellipsis-v"></i>
          </button>
          {showSettings && (
            <div className="chat-settings-menu">
              <button
                className="settings-menu-item"
                onClick={() => {
                  window.open(`/profile/${otherUser.username}`, '_blank');
                  setShowSettings(false);
                }}
              >
                <i className="fas fa-user"></i>
                View Profile
              </button>
              {blockedByMe ? (
                <button
                  className="settings-menu-item settings-menu-item-danger"
                  onClick={handleUnblock}
                  disabled={blocking}
                >
                  <i className="fas fa-unlock"></i>
                  {blocking ? 'Unblocking...' : 'Unblock User'}
                </button>
              ) : !blockedByThem && (
                <button
                  className="settings-menu-item settings-menu-item-danger"
                  onClick={handleBlock}
                  disabled={blocking}
                >
                  <i className="fas fa-ban"></i>
                  {blocking ? 'Blocking...' : 'Block User'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="message-thread-messages">
        {conversationMessages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversationMessages.map((message) => {
            const isOwn = message.senderId === user.id;

            return (
              <div
                key={message.id}
                className={`message ${isOwn ? 'own' : 'other'}`}
              >
                {!isOwn && (
                  <div className="message-avatar">
                    {message.sender.profileImage ? (
                      <img src={buildImageUrl(message.sender.profileImage)} alt={message.sender.username} />
                    ) : (
                      <div className="message-avatar-placeholder">
                        {getInitials(message.sender)}
                      </div>
                    )}
                  </div>
                )}
                <div className="message-content-wrapper">
                  {!isOwn && (
                    <div className="message-sender-name">
                      {message.sender.firstName || message.sender.username}
                    </div>
                  )}
                  <div className="message-bubble">
                    {renderAttachment(message)}
                    {message.content && (
                      <div className="message-text">{message.content}</div>
                    )}
                    <div className="message-time">{formatTime(message.createdAt)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Blocked Message Banner */}
      {isBlocked && (
        <div className="blocked-message-banner">
          <i className="fas fa-ban"></i>
          <span>
            {blockedByMe 
              ? 'You have blocked this user. You can view previous messages but cannot send new ones.'
              : 'This user has blocked you. You can view previous messages but cannot send new ones.'}
          </span>
        </div>
      )}

      {/* Input */}
      <form className="message-thread-input" onSubmit={handleSend}>
        {attachment && (
          <div className="attachment-preview">
            {attachmentType === 'image' ? (
              <div className="attachment-preview-image">
                <img src={buildImageUrl(attachment)} alt="Preview" />
                <button type="button" onClick={removeAttachment}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <div className="attachment-preview-file">
                <i className="fas fa-file"></i>
                <span>File attached</span>
                <button type="button" onClick={removeAttachment}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        )}
        <div className="message-thread-input-wrapper">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => {
              if (e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAttachment || !canSendMessage}
            title={!canSendMessage ? "Cannot send messages (blocked)" : "Attach file"}
          >
            {uploadingAttachment ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paperclip"></i>
            )}
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder={!canSendMessage ? "You cannot send messages to this user" : "Type a message..."}
            value={messageContent}
            onChange={handleTyping}
            disabled={sending || !canSendMessage}
            readOnly={!canSendMessage}
          />
          <button 
            type="submit" 
            disabled={(!messageContent.trim() && !attachment) || sending || !canSendMessage}
            title={!canSendMessage ? "Cannot send messages (blocked)" : "Send message"}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
