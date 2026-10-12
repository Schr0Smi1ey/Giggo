import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../api/payment.js';
import { useSocket } from '../context/SocketContext.jsx';
import { projectKeys } from './projects.js';
import { virtualCardKeys } from './virtualCard.js';

export const pendingPayment = (payment) => ['created', 'checkout_created', 'processing'].includes(payment?.status);

function refreshAll(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['payments'] });
  queryClient.invalidateQueries({ queryKey: projectKeys.all });
  queryClient.invalidateQueries({ queryKey: ['notifications'] });
  Object.values(virtualCardKeys).forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
}

// Keeps payment, project and card data fresh when the server pushes payment events.
export function usePaymentSync() {
  const { socket } = useSocket() || {};
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!socket) return undefined;
    const refresh = () => refreshAll(queryClient);
    const events = ['payment:created', 'payment:processing', 'payment:success', 'payment:failed', 'escrow:funded', 'milestone:funded', 'escrow:released', 'transaction:new', 'developer:earning', 'card:updated', 'wallet:updated', 'connect'];
    events.forEach((event) => socket.on(event, refresh));
    return () => events.forEach((event) => socket.off(event, refresh));
  }, [socket, queryClient]);
}

export const usePayment = (id) => useQuery({
  queryKey: ['payments', id],
  queryFn: () => paymentApi.get(id),
  enabled: Boolean(id),
  refetchInterval: (query) => (!query.state.data || pendingPayment(query.state.data.payment) ? 2000 : false),
});

export const usePayments = () => useQuery({ queryKey: ['payments'], queryFn: paymentApi.list, refetchInterval: 5000 });

export function useFundMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, provider, outcome, idempotencyKey }) => paymentApi.fundMilestone(milestoneId, provider, outcome, idempotencyKey),
    onSuccess: () => refreshAll(queryClient),
  });
}

export function useReleaseMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId) => paymentApi.release(milestoneId),
    onSuccess: () => refreshAll(queryClient),
  });
}
