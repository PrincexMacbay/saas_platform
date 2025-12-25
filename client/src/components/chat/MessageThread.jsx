import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { buildImageUrl } from '../../utils/imageUtils';
import api from '../../services/api';
import './MessageThread.css';

const MessageThread = ({ conversationId, onBack }) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    typingUsers,
    loadMessages,
    sendMessage,
    setTyping,
    joinConversation,
    markMessagesAsRead
  } = useChat();

  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversation = conversations.find(c => c.id === conversationId);
  const conversationMessages = messages[conversationId] || [];
  const typingUser = typingUsers[conversationId];
  const otherUser = conversation?.otherUser;

  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      loadMessages(conversationId).finally(() => setLoading(false));
      markMessagesAsRead(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages, typingUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || sending) return;

    const content = messageContent.trim();
    setMessageContent('');
    setSending(true);
    setTyping(conversationId, false);

    try {
      await sendMessage(conversationId, content, null, null);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageContent(content); // Restore message on error
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
                    {message.attachment && (
                      <div className="message-attachment">
                        <img src={buildImageUrl(message.attachment)} alt="Attachment" />
                      </div>
                    )}
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">{formatTime(message.createdAt)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="message-thread-input" onSubmit={handleSend}>
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

export default MessageThread;
