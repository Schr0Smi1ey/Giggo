import { api } from './client.js';

export const contractsApi = {
  list: (params) => api.get('/contracts', { params }).then((response) => response.data.data),
  getOne: (id) => api.get(`/contracts/${id}`).then((response) => response.data.data.contract),
  transition: (id, payload) => api.post(`/contracts/${id}/status`, payload).then((response) => response.data.data.contract),
};
