import { api } from './client.js';

export const projectsApi = {
  list: (params) => api.get('/projects', { params }).then((response) => response.data.data),
  getOne: (id) => api.get(`/projects/${id}`).then((response) => response.data.data.project),
  updateProgress: (id, payload) => api.patch(`/projects/${id}/progress`, payload).then((response) => response.data.data.project),
  startMilestone: (projectId, milestoneId) => api.post(`/projects/${projectId}/milestones/${milestoneId}/start`).then((response) => response.data.data.project),
  submitWork: (projectId, milestoneId, payload) => api.post(`/projects/${projectId}/milestones/${milestoneId}/submissions`, payload).then((response) => response.data.data.project),
  reviewSubmission: (projectId, milestoneId, submissionId, payload) => api.post(`/projects/${projectId}/milestones/${milestoneId}/submissions/${submissionId}/review`, payload).then((response) => response.data.data.project),
  getHourlyWork: (projectId, params) => api.get(`/projects/${projectId}/time`, { params }).then((response) => response.data.data),
  startTimer: (projectId, payload) => api.post(`/projects/${projectId}/time/timers`, payload).then((response) => response.data.data.timer),
  heartbeatTimer: (projectId, timerId) => api.post(`/projects/${projectId}/time/timers/${timerId}/heartbeat`).then((response) => response.data.data.timer),
  stopTimer: (projectId, timerId, payload = {}) => api.post(`/projects/${projectId}/time/timers/${timerId}/stop`, payload).then((response) => response.data.data.entry),
  createTimeEntry: (projectId, payload) => api.post(`/projects/${projectId}/time/entries`, payload).then((response) => response.data.data.entry),
  updateTimeEntry: (projectId, entryId, payload) => api.patch(`/projects/${projectId}/time/entries/${entryId}`, payload).then((response) => response.data.data.entry),
  deleteTimeEntry: (projectId, entryId, payload) => api.delete(`/projects/${projectId}/time/entries/${entryId}`, { data: payload }).then((response) => response.data.data.entry),
};
