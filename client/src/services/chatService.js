import api from './api';

// ========== 1-ON-1 CONVERSATIONS ==========

export const getConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data;
};

export const getOrCreateConversation = async (otherUserId) => {
  const response = await api.get(`/chat/conversations/user/${otherUserId}`);
  return response.data;
};

export const getMessages = async (conversationId, page = 1, limit = 50) => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
  return response.data;
};

// ========== GROUP CONVERSATIONS ==========

export const createGroupConversation = async (groupData) => {
  const response = await api.post('/chat/groups', groupData);
  return response.data;
};

export const getGroupConversations = async () => {
  const response = await api.get('/chat/groups');
  return response.data;
};

export const getGroupMessages = async (groupConversationId, page = 1, limit = 50) => {
  const response = await api.get(`/chat/groups/${groupConversationId}/messages`, {
    params: { page, limit }
  });
  return response.data;
};

// ========== GROUP MANAGEMENT ==========

export const updateGroupSettings = async (groupConversationId, settings) => {
  const response = await api.put(`/chat/groups/${groupConversationId}/settings`, settings);
  return response.data;
};

export const removeGroupMember = async (groupConversationId, memberId) => {
  const response = await api.delete(`/chat/groups/${groupConversationId}/members/${memberId}`);
  return response.data;
};

// ========== UNREAD COUNT ==========

export const getUnreadCount = async () => {
  const response = await api.get('/chat/unread-count');
  return response.data;
};
