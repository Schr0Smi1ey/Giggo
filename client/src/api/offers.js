import { api } from './client.js';

export const offersApi = {
  list: (params) => api.get('/offers', { params }).then((response) => response.data.data),
  getOne: (id) => api.get(`/offers/${id}`).then((response) => response.data.data.offer),
  create: (payload) => api.post('/offers', payload).then((response) => response.data.data.offer),
  update: (id, payload) => api.patch(`/offers/${id}`, payload).then((response) => response.data.data.offer),
  send: (id) => api.post(`/offers/${id}/send`).then((response) => response.data.data.offer),
  withdraw: (id) => api.post(`/offers/${id}/withdraw`).then((response) => response.data.data.offer),
  accept: (id, revision) => api.post(`/offers/${id}/accept`, { revision }).then((response) => response.data.data.offer),
  reject: (id) => api.post(`/offers/${id}/reject`).then((response) => response.data.data.offer),
  requestChanges: (id, message) => api.post(`/offers/${id}/request-changes`, { message }).then((response) => response.data.data.offer),
  sendMessage: (id, message) => api.post(`/offers/${id}/messages`, { message }).then((response) => response.data.data.message),
};
