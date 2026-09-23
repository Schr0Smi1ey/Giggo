import { api } from './client.js';

export const notificationsApi = {
  list: (params = {}) => api.get('/notifications', { params }).then((response) => response.data.data),
  read: (id) => api.patch(`/notifications/${id}/read`).then((response) => response.data.data.notification),
  readAll: () => api.post('/notifications/read-all').then((response) => response.data.data),
  archive: (id) => api.patch(`/notifications/${id}/archive`).then((response) => response.data.data.notification),
  preferences: () => api.get('/notifications/preferences/me').then((response) => response.data.data.preferences),
  updatePreferences: (inApp) => api.patch('/notifications/preferences/me', { inApp }).then((response) => response.data.data.preferences),
};
