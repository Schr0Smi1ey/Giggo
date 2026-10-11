import { api } from './client.js';

export const projectsApi = {
  list: (params) => api.get('/projects', { params }).then((response) => response.data.data),
  getOne: (id) => api.get(`/projects/${id}`).then((response) => response.data.data.project),
  updateProgress: (id, payload) => api.patch(`/projects/${id}/progress`, payload).then((response) => response.data.data.project),
  startMilestone: (projectId, milestoneId) => api.post(`/projects/${projectId}/milestones/${milestoneId}/start`).then((response) => response.data.data.project),
  submitWork: (projectId, milestoneId, payload) => api.post(`/projects/${projectId}/milestones/${milestoneId}/submissions`, payload).then((response) => response.data.data.project),
  reviewSubmission: (projectId, milestoneId, submissionId, payload) => api.post(`/projects/${projectId}/milestones/${milestoneId}/submissions/${submissionId}/review`, payload).then((response) => response.data.data.project),
};
