import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSocket, initializeSocket, disconnectSocket } from '../utils/socket';
import * as chatService from '../services/chatService';

// ChatContext may not be available if user is not authenticated
const useChatSafe = () => {
  try {
    return useContext(ChatContext);
  } catch {
    return null;
  }
};

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [groupConversations, setGroupConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState({ conversations: 0, groups: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeGroupConversation, setActiveGroupConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [groupMessages, setGroupMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [groupTypingUsers, setGroupTypingUsers] = useState({});

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = initializeSocket(token);

      // Listen for new messages (1-on-1)
      socket.on('new_message', (message) => {
        console.log('📨 New message received:', message);
        setMessages(prev => {
          const conversationId = message.conversationId;
          const existing = prev[conversationId] || [];
          // Avoid duplicates
          if (existing.find(m => m.id === message.id)) {
            return prev;
          }
          return {
            ...prev,
            [conversationId]: [...existing, message]
          };
        });

        // Update conversation list
        setConversations(prev => prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              unreadCount: message.senderId !== user?.id ? (conv.unreadCount || 0) + 1 : conv.unreadCount
            };
          }
          return conv;
        }));

        // Update unread count if not viewing this conversation
        if (activeConversation?.id !== message.conversationId) {
          updateUnreadCount();
        }
      });

      // Listen for new group messages
      socket.on('new_group_message', (message) => {
        console.log('📨 New group message received:', message);
        setGroupMessages(prev => {
          const groupId = message.groupConversationId;
          const existing = prev[groupId] || [];
          if (existing.find(m => m.id === message.id)) {
            return prev;
          }
          return {
            ...prev,
            [groupId]: [...existing, message]
          };
        });

        // Update group conversation list
        setGroupConversations(prev => prev.map(group => {
          if (group.id === message.groupConversationId) {
            return {
              ...group,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              unreadCount: message.senderId !== user?.id ? (group.unreadCount || 0) + 1 : group.unreadCount
            };
          }
          return group;
        }));

        if (activeGroupConversation?.id !== message.groupConversationId) {
          updateUnreadCount();
        }
      });

      // Typing indicators
      socket.on('user_typing', (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.conversationId]: data.isTyping ? data : null
        }));
      });

      socket.on('user_typing_group', (data) => {
        setGroupTypingUsers(prev => ({
          ...prev,
          [data.groupConversationId]: data.isTyping ? data : null
        }));
      });

      // Messages read
      socket.on('messages_read', (data) => {
        setMessages(prev => {
          const conversationId = data.conversationId;
          const conversationMessages = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: conversationMessages.map(msg => 
              msg.senderId !== data.userId ? { ...msg, read: true, readAt: new Date() } : msg
            )
          };
        });
      });

      socket.on('group_messages_read', (data) => {
        // Handle group messages read
        console.log('Group messages read:', data);
      });

      return () => {
        socket.off('new_message');
        socket.off('new_group_message');
        socket.off('user_typing');
        socket.off('user_typing_group');
        socket.off('messages_read');
        socket.off('group_messages_read');
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, token, user, activeConversation, activeGroupConversation]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await chatService.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Load group conversations
  const loadGroupConversations = useCallback(async () => {
    try {
      const response = await chatService.getGroupConversations();
      if (response.success) {
        setGroupConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading group conversations:', error);
    }
  }, []);

  // Update group settings
  const updateGroupSettings = useCallback(async (groupConversationId, settings) => {
    try {
      const response = await chatService.updateGroupSettings(groupConversationId, settings);
      if (response.success) {
        await loadGroupConversations();
      }
      return response;
    } catch (error) {
      console.error('Error updating group settings:', error);
      throw error;
    }
  }, [loadGroupConversations]);

  // Remove group member
  const removeGroupMember = useCallback(async (groupConversationId, memberId) => {
    try {
      const response = await chatService.removeGroupMember(groupConversationId, memberId);
      if (response.success) {
        await loadGroupConversations();
      }
      return response;
    } catch (error) {
      console.error('Error removing group member:', error);
      throw error;
    }
  }, [loadGroupConversations]);

  // Update unread count
  const updateUnreadCount = useCallback(async () => {
    try {
      const response = await chatService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data);
      }
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      Promise.all([
        loadConversations(),
        loadGroupConversations(),
        updateUnreadCount()
      ]).finally(() => setLoading(false));
    }
  }, [isAuthenticated, loadConversations, loadGroupConversations, updateUnreadCount]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId, page = 1) => {
    try {
      const response = await chatService.getMessages(conversationId, page);
      if (response.success) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: response.data.messages
        }));
        return response.data;
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
  }, []);

  // Load messages for a group
  const loadGroupMessages = useCallback(async (groupConversationId, page = 1) => {
    try {
      const response = await chatService.getGroupMessages(groupConversationId, page);
      if (response.success) {
        setGroupMessages(prev => ({
          ...prev,
          [groupConversationId]: response.data.messages
        }));
        return response.data;
      }
    } catch (error) {
      console.error('Error loading group messages:', error);
      throw error;
    }
  }, []);

  // Send message (1-on-1)
  const sendMessage = useCallback(async (conversationId, content, attachment, attachmentType) => {
    const socket = getSocket();
    if (!socket || !socket.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      socket.emit('send_message', {
        conversationId,
        content,
        attachment,
        attachmentType
      }, (response) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  // Send group message
  const sendGroupMessage = useCallback(async (groupConversationId, content, attachment, attachmentType) => {
    const socket = getSocket();
    if (!socket || !socket.connected) {
      throw new Error('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      socket.emit('send_group_message', {
        groupConversationId,
        content,
        attachment,
        attachmentType
      }, (response) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  // Join conversation room
  const joinConversation = useCallback((conversationId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('join_conversation', conversationId);
      setActiveConversation(conversationId);
    }
  }, []);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('leave_conversation', conversationId);
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
    }
  }, [activeConversation]);

  // Join group conversation room
  const joinGroupConversation = useCallback((groupConversationId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('join_group_conversation', groupConversationId);
      setActiveGroupConversation(groupConversationId);
    }
  }, []);

  // Leave group conversation room
  const leaveGroupConversation = useCallback((groupConversationId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('leave_group_conversation', groupConversationId);
      if (activeGroupConversation === groupConversationId) {
        setActiveGroupConversation(null);
      }
    }
  }, [activeGroupConversation]);

  // Mark messages as read
  const markMessagesAsRead = useCallback((conversationId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('mark_messages_read', conversationId);
      
      // Update local state
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      }));
      
      updateUnreadCount();
    }
  }, [updateUnreadCount]);

  // Mark group messages as read
  const markGroupMessagesAsRead = useCallback((groupConversationId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('mark_group_messages_read', groupConversationId);
      
      setGroupConversations(prev => prev.map(group => {
        if (group.id === groupConversationId) {
          return { ...group, unreadCount: 0 };
        }
        return group;
      }));
      
      updateUnreadCount();
    }
  }, [updateUnreadCount]);

  // Typing indicator
  const setTyping = useCallback((conversationId, isTyping) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('typing', { conversationId, isTyping });
    }
  }, []);

  const setGroupTyping = useCallback((groupConversationId, isTyping) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('group_typing', { groupConversationId, isTyping });
    }
  }, []);

  const value = {
    conversations,
    groupConversations,
    unreadCount,
    loading,
    activeConversation,
    activeGroupConversation,
    messages,
    groupMessages,
    typingUsers,
    groupTypingUsers,
    loadConversations,
    loadGroupConversations,
    loadMessages,
    loadGroupMessages,
    sendMessage,
    sendGroupMessage,
    joinConversation,
    leaveConversation,
    joinGroupConversation,
    leaveGroupConversation,
    markMessagesAsRead,
    markGroupMessagesAsRead,
    setTyping,
    setGroupTyping,
    updateUnreadCount,
    updateGroupSettings,
    removeGroupMember,
    setActiveConversation,
    setActiveGroupConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
