import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { offersApi } from '../api/offers.js';

const KEYS = {
  all: ['offers'],
  list: (params) => ['offers', 'list', params],
  detail: (id) => ['offers', 'detail', id],
};

export function useOffers(params = {}, options = {}) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => offersApi.list(params), ...options });
}

export function useOffer(id, options = {}) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => offersApi.getOne(id), enabled: Boolean(id), ...options });
}

function useOfferMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (offer) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      const offerId = offer?._id || offer?.id;
      if (offerId) queryClient.setQueryData(KEYS.detail(offerId), offer);
    },
  });
}

export function useCreateOffer() {
  return useOfferMutation(offersApi.create);
}

export function useUpdateOffer() {
  return useOfferMutation(({ id, ...payload }) => offersApi.update(id, payload));
}

export function useSendOffer() {
  return useOfferMutation(offersApi.send);
}

export function useWithdrawOffer() {
  return useOfferMutation(offersApi.withdraw);
}

export function useAcceptOffer() {
  return useOfferMutation(({ id, revision }) => offersApi.accept(id, revision));
}

export function useRejectOffer() {
  return useOfferMutation(offersApi.reject);
}

export function useRequestOfferChanges() {
  return useOfferMutation(({ id, message }) => offersApi.requestChanges(id, message));
}

export function useSendOfferMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }) => offersApi.sendMessage(id, message),
    onMutate: async (variables) => {
      const key = KEYS.detail(variables.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      const temporaryId = `pending-${Date.now()}`;
      queryClient.setQueryData(key, (current) => current ? {
        ...current,
        messages: [...(current.messages || []), {
          _id: temporaryId,
          offer: variables.id,
          sender: variables.sender,
          senderRole: variables.senderRole,
          kind: 'message',
          body: variables.message,
          revision: current.revision,
          createdAt: new Date().toISOString(),
          pending: true,
        }],
      } : current);
      return { previous, temporaryId };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) queryClient.setQueryData(KEYS.detail(variables.id), context.previous);
    },
    onSuccess: (message, variables, context) => {
      queryClient.setQueryData(KEYS.detail(variables.id), (current) => {
        if (!current) return current;
        const messages = current.messages || [];
        const hasTemporary = messages.some((item) => item._id === context?.temporaryId);
        const hasSaved = messages.some((item) => item._id === message._id);
        return {
          ...current,
          messages: hasTemporary
            ? messages.map((item) => item._id === context?.temporaryId ? message : item)
            : hasSaved ? messages : [...messages, message],
        };
      });
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export { KEYS as offerKeys };
