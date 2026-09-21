import { api } from './client.js';

export const messagesApi = {
  contacts: (search = '') => api.get('/conversations/contacts', { params: { search } }).then((response) => response.data.data.items),
  conversations: (params = {}) => api.get('/conversations', { params }).then((response) => response.data.data),
  createConversation: (payload) => api.post('/conversations', payload).then((response) => response.data.data.conversation),
  conversation: (id) => api.get(`/conversations/${id}`).then((response) => response.data.data.conversation),
  messages: (id, params = {}) => api.get(`/conversations/${id}/messages`, { params }).then((response) => response.data.data),
  send: (id, payload) => api.post(`/conversations/${id}/messages`, payload).then((response) => response.data.data.message),
  markRead: (id) => api.post(`/conversations/${id}/read`).then((response) => response.data.data),
  edit: (id, body) => api.patch(`/conversations/messages/${id}`, { body }).then((response) => response.data.data.message),
  remove: (id) => api.delete(`/conversations/messages/${id}`).then((response) => response.data.data.message),
  react: (id, emoji) => api.post(`/conversations/messages/${id}/reaction`, { emoji }).then((response) => response.data.data.message),
  pin: (id) => api.post(`/conversations/messages/${id}/pin`).then((response) => response.data.data.message),
  save: (id) => api.post(`/conversations/messages/${id}/save`).then((response) => response.data.data),
  settings: (id, payload) => api.patch(`/conversations/${id}/settings`, payload).then((response) => response.data.data.conversation),
  addParticipant: (id, userId) => api.post(`/conversations/${id}/participants`, { userId }).then((response) => response.data.data.conversation),
  removeParticipant: (id, userId) => api.delete(`/conversations/${id}/participants/${userId}`).then((response) => response.data.data.conversation),
};
