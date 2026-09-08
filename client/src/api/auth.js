import { api } from './client.js';

export const usersApi = {
  updateMe: (payload) => api.patch('/users/me', payload).then((r) => r.data.data),
};
