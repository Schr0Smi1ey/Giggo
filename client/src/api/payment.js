import { api } from './client.js';

const data = (request) => request.then((response) => response.data.data);

export const paymentApi = {
  fundMilestone: (milestoneId, provider, outcome, idempotencyKey) =>
    data(api.post(`/milestones/${milestoneId}/fund`, { provider, outcome }, { headers: { 'Idempotency-Key': idempotencyKey } })),
  get: (id) => data(api.get(`/payments/${id}`)),
  list: () => data(api.get('/payments')),
  release: (milestoneId) => data(api.post(`/milestones/${milestoneId}/release`)),
};
