import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '../api/proposals.js';
import { jobKeys } from './jobs.js';

const KEYS = {
  all: ['proposals'],
  mineForJob: (jobId) => ['proposals', 'mine-for-job', jobId],
  mine: (params) => ['proposals', 'mine', params],
  received: (params) => ['proposals', 'received', params],
  detail: (id) => ['proposals', 'detail', id],
};

export function useMyProposals(params = {}, options = {}) {
  return useQuery({ queryKey: KEYS.mine(params), queryFn: () => proposalsApi.listMine(params), ...options });
}

export function useReceivedProposals(params = {}, options = {}) {
  return useQuery({ queryKey: KEYS.received(params), queryFn: () => proposalsApi.listReceived(params), ...options });
}

export function useProposal(id, options = {}) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => proposalsApi.getOne(id), enabled: Boolean(id), ...options });
}

export function useMyProposalForJob(jobId, options = {}) {
  return useQuery({
    queryKey: KEYS.mineForJob(jobId),
    queryFn: () => proposalsApi.mineForJob(jobId),
    enabled: Boolean(jobId),
    ...options,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: proposalsApi.create,
    onSuccess: (proposal) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      if (proposal?.job) queryClient.setQueryData(KEYS.mineForJob(proposal.job), proposal);
    },
  });
}

function useProposalMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (proposal) => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      const proposalId = proposal?._id || proposal?.id;
      if (proposalId) queryClient.invalidateQueries({ queryKey: KEYS.detail(proposalId) });
    },
  });
}

export function useUpdateProposal() {
  return useProposalMutation(({ id, ...payload }) => proposalsApi.update(id, payload));
}

export function useWithdrawProposal() {
  return useProposalMutation(proposalsApi.withdraw);
}

export function useDecideProposal() {
  return useProposalMutation(({ id, ...payload }) => proposalsApi.decide(id, payload));
}

export { KEYS as proposalKeys };
