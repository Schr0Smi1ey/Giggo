import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '../api/contracts.js';

const KEYS = {
  all: ['contracts'],
  list: (params) => ['contracts', 'list', params],
  detail: (id) => ['contracts', 'detail', id],
};

export function useContracts(params = {}, options = {}) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => contractsApi.list(params), ...options });
}

export function useContract(id, options = {}) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => contractsApi.getOne(id), enabled: Boolean(id), ...options });
}

export function useTransitionContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) => contractsApi.transition(id, { status, note }),
    onSuccess: (contract) => {
      const contractId = contract?._id || contract?.id;
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (contractId) queryClient.setQueryData(KEYS.detail(contractId), contract);
    },
  });
}

export { KEYS as contractKeys };
