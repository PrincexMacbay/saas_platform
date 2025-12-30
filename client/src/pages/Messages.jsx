import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import ConversationList from '../components/chat/ConversationList';
import MessageThread from '../components/chat/MessageThread';
import GroupChat from '../components/chat/GroupChat';
import './Messages.css';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    groupConversations,
    loading,
    activeConversation,
    activeGroupConversation,
    joinConversation,
    leaveConversation,
    joinGroupConversation,
    leaveGroupConversation,
    loadMessages,
    loadGroupMessages,
    markMessagesAsRead,
    markGroupMessagesAsRead,
    setActiveConversation,
    setActiveGroupConversation
  } = useChat();

  const [view, setView] = useState('conversations'); // 'conversations' or 'groups'
  const conversationId = searchParams.get('conversation');
  const groupId = searchParams.get('group');

  useEffect(() => {
    if (conversationId) {
      const convId = parseInt(conversationId);
      setView('conversations');
      // Leave previous conversation if switching
      if (activeConversation && activeConversation !== convId) {
        leaveConversation(activeConversation);
      }
      setActiveConversation(convId);
      joinConversation(convId);
      loadMessages(convId);
      markMessagesAsRead(convId);
    } else if (groupId) {
      const grpId = parseInt(groupId);
      setView('groups');
      // Leave previous group if switching
      if (activeGroupConversation && activeGroupConversation !== grpId) {
        leaveGroupConversation(activeGroupConversation);
      }
      setActiveGroupConversation(grpId);
      joinGroupConversation(grpId);
      loadGroupMessages(grpId);
      markGroupMessagesAsRead(grpId);
    } else {
      // Clear active conversations when no params
      if (activeConversation) {
        leaveConversation(activeConversation);
        setActiveConversation(null);
      }
      if (activeGroupConversation) {
        leaveGroupConversation(activeGroupConversation);
        setActiveGroupConversation(null);
      }
    }
  }, [conversationId, groupId]);

  const handleConversationSelect = (convId) => {
    navigate(`/messages?conversation=${convId}`);
  };

  const handleGroupSelect = (groupId) => {
    navigate(`/messages?group=${groupId}`);
  };

  const handleBack = () => {
    if (activeConversation) {
      leaveConversation(activeConversation);
      setActiveConversation(null);
    }
    if (activeGroupConversation) {
      leaveGroupConversation(activeGroupConversation);
      setActiveGroupConversation(null);
    }
    navigate('/messages');
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Sidebar - Conversation/Group List */}
        <div className={`messages-sidebar ${(activeConversation || activeGroupConversation) ? 'hidden-mobile' : ''}`}>
          <div className="messages-header">
            <h2>Messages</h2>
            <div className="messages-tabs">
              <button
                className={view === 'conversations' ? 'active' : ''}
                onClick={() => setView('conversations')}
              >
                Conversations
              </button>
              <button
                className={view === 'groups' ? 'active' : ''}
                onClick={() => setView('groups')}
              >
                Groups
              </button>
            </div>
          </div>

          {loading ? (
            <div className="messages-loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {view === 'conversations' ? (
                <ConversationList
                  conversations={conversations}
                  activeConversation={activeConversation}
                  onSelect={handleConversationSelect}
                />
              ) : (
                <div className="group-conversations-list">
                  {groupConversations.map(group => (
                    <div
                      key={group.id}
                      className={`group-item ${activeGroupConversation === group.id ? 'active' : ''}`}
                      onClick={() => handleGroupSelect(group.id)}
                    >
                      <div className="group-avatar">
                        {group.avatar ? (
                          <img src={group.avatar} alt={group.name} />
                        ) : (
                          <div className="group-avatar-placeholder">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="group-info">
                        <div className="group-name">{group.name}</div>
                        {group.lastMessage && (
                          <div className="group-last-message">
                            {group.lastMessage.sender.firstName || group.lastMessage.sender.username}: {group.lastMessage.content.substring(0, 50)}
                          </div>
                        )}
                      </div>
                      {group.unreadCount > 0 && (
                        <div className="unread-badge">{group.unreadCount}</div>
                      )}
                    </div>
                  ))}
                  {groupConversations.length === 0 && (
                    <div className="empty-state">
                      <p>No group conversations yet</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Main Content - Message Thread */}
        <div className={`messages-content ${!(activeConversation || activeGroupConversation) ? 'hidden-mobile' : ''}`}>
          {activeConversation ? (
            <MessageThread
              conversationId={activeConversation}
              onBack={handleBack}
            />
          ) : activeGroupConversation ? (
            <GroupChat
              groupConversationId={activeGroupConversation}
              onBack={handleBack}
            />
          ) : (
            <div className="messages-empty">
              <i className="fas fa-comments"></i>
              <h3>Select a conversation to start messaging</h3>
              <p>Choose a conversation from the sidebar to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
