import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationModal } from '../../contexts/NotificationModalContext';
import { buildImageUrl } from '../../utils/imageUtils';
import { uploadChatAttachment } from '../../services/uploadService';
import { updateGroupSettings, removeGroupMember } from '../../services/chatService';
import './GroupChat.css';

const GroupChat = ({ groupConversationId, onBack }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning, showConfirm } = useNotificationModal();
  const {
    groupConversations,
    groupMessages,
    groupTypingUsers,
    loadGroupMessages,
    sendGroupMessage,
    setGroupTyping,
    joinGroupConversation,
    markGroupMessagesAsRead,
    loadGroupConversations
  } = useChat();

  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [removingMember, setRemovingMember] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const group = groupConversations.find(g => g.id === groupConversationId);
  const groupMessagesList = groupMessages[groupConversationId] || [];
  const typingUsersList = groupTypingUsers[groupConversationId];
  const isCreator = group && group.createdBy === user.id;
  const canSendMessage = isCreator || !group?.onlyCreatorCanSend;

  useEffect(() => {
    if (groupConversationId) {
      joinGroupConversation(groupConversationId);
      loadGroupMessages(groupConversationId).finally(() => setLoading(false));
      markGroupMessagesAsRead(groupConversationId);
    }
  }, [groupConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [groupMessagesList, typingUsersList]);

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
    setGroupTyping(groupConversationId, false);

    try {
      await sendGroupMessage(groupConversationId, content, att, attType);
    } catch (error) {
      console.error('Error sending group message:', error);
      if (error.message.includes('Only the group creator')) {
        showWarning('Only the group creator can send messages in this group.', 'Message Restriction');
      } else {
        showError('Failed to send message. Please try again.', 'Message Error');
      }
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.target.value.trim()) {
      setGroupTyping(groupConversationId, true);
      typingTimeoutRef.current = setTimeout(() => {
        setGroupTyping(groupConversationId, false);
      }, 3000);
    } else {
      setGroupTyping(groupConversationId, false);
    }
  };

  const handleUpdateSettings = async (onlyCreatorCanSend) => {
    try {
      await updateGroupSettings(groupConversationId, { onlyCreatorCanSend });
      await loadGroupConversations();
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating group settings:', error);
      alert('Failed to update settings. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    showConfirm(
      'Are you sure you want to remove this member from the group?',
      async () => {
        setRemovingMember(memberId);
        try {
          await removeGroupMember(groupConversationId, memberId);
          await loadGroupConversations();
          setShowMembers(false);
          showSuccess('Member removed successfully', 'Member Removed');
        } catch (error) {
          console.error('Error removing member:', error);
          showError('Failed to remove member. Please try again.', 'Error');
        } finally {
          setRemovingMember(null);
        }
      },
      'Remove Member'
    );
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
        <div className="group-message-attachment">
          <img src={buildImageUrl(message.attachment)} alt="Attachment" />
        </div>
      );
    } else if (message.attachmentType === 'video') {
      return (
        <div className="group-message-attachment group-message-video">
          <video controls src={buildImageUrl(message.attachment)}>
            Your browser does not support video playback.
          </video>
        </div>
      );
    } else {
      return (
        <div className="group-message-attachment group-message-file">
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
      <div className="group-chat">
        <div className="group-chat-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-chat">
        <div className="group-chat-error">
          <p>Group not found</p>
          <button onClick={onBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-chat">
      {/* Header */}
      <div className="group-chat-header">
        <button className="back-button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="group-info-header" onClick={() => setShowMembers(!showMembers)} style={{ cursor: 'pointer' }}>
          {group.avatar ? (
            <img src={buildImageUrl(group.avatar)} alt={group.name} />
          ) : (
            <div className="group-header-avatar">
              {group.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="group-header-name">{group.name}</div>
            <div className="group-header-members">
              {group.members?.length || 0} members
            </div>
          </div>
        </div>
        {isCreator && (
          <button 
            className="group-settings-button"
            onClick={() => setShowSettings(!showSettings)}
            title="Group Settings"
          >
            <i className="fas fa-cog"></i>
          </button>
        )}
      </div>

      {/* Group Settings Modal */}
      {showSettings && (
        <div className="group-settings-modal">
          <div className="group-settings-content">
            <div className="group-settings-header">
              <h3>Group Settings</h3>
              <button onClick={() => setShowSettings(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="group-settings-body">
              <label className="group-settings-option">
                <input
                  type="checkbox"
                  checked={group.onlyCreatorCanSend || false}
                  onChange={(e) => handleUpdateSettings(e.target.checked)}
                />
                <span>Only creator can send messages</span>
              </label>
              <p className="group-settings-hint">
                When enabled, only you (the group creator) can send messages. Other members can only read messages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Members List Modal */}
      {showMembers && (
        <div className="group-members-modal">
          <div className="group-members-content">
            <div className="group-members-header">
              <h3>Group Members</h3>
              <button onClick={() => setShowMembers(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="group-members-list">
              {group.members?.map((member) => (
                <div key={member.userId} className="group-member-item">
                  <div className="group-member-info">
                    {member.user.profileImage ? (
                      <img src={buildImageUrl(member.user.profileImage)} alt={member.user.username} />
                    ) : (
                      <div className="group-member-avatar">
                        {getInitials(member.user)}
                      </div>
                    )}
                    <div>
                      <div className="group-member-name">
                        {member.user.firstName && member.user.lastName
                          ? `${member.user.firstName} ${member.user.lastName}`
                          : member.user.username}
                        {member.userId === group.createdBy && (
                          <span className="group-member-badge">Creator</span>
                        )}
                        {member.role === 'admin' && member.userId !== group.createdBy && (
                          <span className="group-member-badge">Admin</span>
                        )}
                      </div>
                      <div className="group-member-username">@{member.user.username}</div>
                    </div>
                  </div>
                  {isCreator && member.userId !== user.id && (
                    <button
                      className="remove-member-button"
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={removingMember === member.userId}
                      title="Remove member"
                    >
                      {removingMember === member.userId ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-times"></i>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="group-chat-messages">
        {groupMessagesList.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          groupMessagesList.map((message) => {
            const isOwn = message.senderId === user.id;

            return (
              <div
                key={message.id}
                className={`group-message ${isOwn ? 'own' : 'other'}`}
              >
                {!isOwn && (
                  <div className="group-message-avatar">
                    {message.sender.profileImage ? (
                      <img src={buildImageUrl(message.sender.profileImage)} alt={message.sender.username} />
                    ) : (
                      <div className="group-message-avatar-placeholder">
                        {getInitials(message.sender)}
                      </div>
                    )}
                  </div>
                )}
                <div className="group-message-content-wrapper">
                  {!isOwn && (
                    <div className="group-message-sender-name">
                      {message.sender.firstName || message.sender.username}
                    </div>
                  )}
                  <div className="group-message-bubble">
                    {renderAttachment(message)}
                    {message.content && (
                      <div className="group-message-text">{message.content}</div>
                    )}
                    <div className="group-message-time">{formatTime(message.createdAt)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingUsersList && typingUsersList.isTyping && (
          <div className="group-typing-indicator">
            {typingUsersList.firstName || typingUsersList.username} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!canSendMessage && (
        <div className="group-chat-restricted">
          <i className="fas fa-lock"></i>
          <span>Only the group creator can send messages</span>
        </div>
      )}
      <form className="group-chat-input" onSubmit={handleSend}>
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
        <div className="group-chat-input-wrapper">
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
            title="Attach file"
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
            placeholder={canSendMessage ? "Type a message..." : "Only creator can send messages"}
            value={messageContent}
            onChange={handleTyping}
            disabled={sending || !canSendMessage}
          />
          <button 
            type="submit" 
            disabled={(!messageContent.trim() && !attachment) || sending || !canSendMessage}
            title="Send message"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;
