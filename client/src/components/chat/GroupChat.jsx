import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { buildImageUrl } from '../../utils/imageUtils';
import './GroupChat.css';

const GroupChat = ({ groupConversationId, onBack }) => {
  const { user } = useAuth();
  const {
    groupConversations,
    groupMessages,
    groupTypingUsers,
    loadGroupMessages,
    sendGroupMessage,
    setGroupTyping,
    joinGroupConversation,
    markGroupMessagesAsRead
  } = useChat();

  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const group = groupConversations.find(g => g.id === groupConversationId);
  const groupMessagesList = groupMessages[groupConversationId] || [];
  const typingUsersList = groupTypingUsers[groupConversationId];

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || sending) return;

    const content = messageContent.trim();
    setMessageContent('');
    setSending(true);
    setGroupTyping(groupConversationId, false);

    try {
      await sendGroupMessage(groupConversationId, content, null, null);
    } catch (error) {
      console.error('Error sending group message:', error);
      setMessageContent(content);
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
        <div className="group-info-header">
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
      </div>

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
                    {message.attachment && (
                      <div className="group-message-attachment">
                        <img src={buildImageUrl(message.attachment)} alt="Attachment" />
                      </div>
                    )}
                    <div className="group-message-text">{message.content}</div>
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
      <form className="group-chat-input" onSubmit={handleSend}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={messageContent}
          onChange={handleTyping}
          disabled={sending}
        />
        <button type="submit" disabled={!messageContent.trim() || sending}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
