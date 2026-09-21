import { api } from './client.js';

export const projectsApi = {
  list: (params) => api.get('/projects', { params }).then((response) => response.data.data),
  getOne: (id) => api.get(`/projects/${id}`).then((response) => response.data.data.project),
  updateProgress: (id, payload) => api.patch(`/projects/${id}/progress`, payload).then((response) => response.data.data.project),
};
