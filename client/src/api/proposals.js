import { api } from './client.js';

export const proposalsApi = {
  create: (payload) => api.post('/proposals', payload).then((response) => response.data.data.proposal),
  mineForJob: (jobId) => api.get(`/proposals/jobs/${jobId}/mine`).then((response) => response.data.data.proposal),
  listMine: (params) => api.get('/proposals/mine', { params }).then((response) => response.data.data),
  listReceived: (params) => api.get('/proposals/received', { params }).then((response) => response.data.data),
  getOne: (id) => api.get(`/proposals/${id}`).then((response) => response.data.data.proposal),
  update: (id, payload) => api.patch(`/proposals/${id}`, payload).then((response) => response.data.data.proposal),
  withdraw: (id) => api.post(`/proposals/${id}/withdraw`).then((response) => response.data.data.proposal),
  decide: (id, payload) => api.post(`/proposals/${id}/decision`, payload).then((response) => response.data.data.proposal),
};
