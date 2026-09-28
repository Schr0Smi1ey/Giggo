import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.js';

const KEYS = {
  all: ['projects'],
  list: (params) => ['projects', 'list', params],
  detail: (id) => ['projects', 'detail', id],
  time: (id, params) => ['projects', 'time', id, params],
};

export function useProjects(params = {}, options = {}) {
  return useQuery({ queryKey: KEYS.list(params), queryFn: () => projectsApi.list(params), ...options });
}

export function useProject(id, options = {}) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => projectsApi.getOne(id), enabled: Boolean(id), ...options });
}

export function useUpdateProjectProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, progress, note }) => projectsApi.updateProgress(id, { progress, note }),
    onSuccess: (project) => {
      const projectId = project?._id || project?.id;
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (projectId) queryClient.setQueryData(KEYS.detail(projectId), project);
    },
  });
}

function useProjectAction(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (project) => {
      const projectId = project?._id || project?.id;
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (projectId) queryClient.setQueryData(KEYS.detail(projectId), project);
    },
  });
}

export function useStartMilestone() {
  return useProjectAction(({ projectId, milestoneId }) => projectsApi.startMilestone(projectId, milestoneId));
}

export function useSubmitMilestoneWork() {
  return useProjectAction(({ projectId, milestoneId, description, links }) => projectsApi.submitWork(projectId, milestoneId, { description, links }));
}

export function useReviewMilestoneSubmission() {
  return useProjectAction(({ projectId, milestoneId, submissionId, decision, feedback }) => projectsApi.reviewSubmission(projectId, milestoneId, submissionId, { decision, feedback }));
}

export function useHourlyWork(projectId, params = {}, options = {}) {
  return useQuery({
    queryKey: KEYS.time(projectId, params),
    queryFn: () => projectsApi.getHourlyWork(projectId, params),
    enabled: Boolean(projectId),
    refetchInterval: (query) => query.state.data?.activeTimer ? 15_000 : 30_000,
    ...options,
  });
}

function useTimeAction(mutationFn, { quiet = false } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'time', variables.projectId] });
      if (!quiet) queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useStartTimer() {
  return useTimeAction(({ projectId, description, idempotencyKey }) => projectsApi.startTimer(projectId, { description, idempotencyKey }));
}

export function useHeartbeatTimer() {
  return useTimeAction(({ projectId, timerId }) => projectsApi.heartbeatTimer(projectId, timerId), { quiet: true });
}

export function useStopTimer() {
  return useTimeAction(({ projectId, timerId, description }) => projectsApi.stopTimer(projectId, timerId, description ? { description } : {}));
}

export function useCreateTimeEntry() {
  return useTimeAction(({ projectId, ...payload }) => projectsApi.createTimeEntry(projectId, payload));
}

export function useUpdateTimeEntry() {
  return useTimeAction(({ projectId, entryId, ...payload }) => projectsApi.updateTimeEntry(projectId, entryId, payload));
}

export function useDeleteTimeEntry() {
  return useTimeAction(({ projectId, entryId, ...payload }) => projectsApi.deleteTimeEntry(projectId, entryId, payload));
}

export { KEYS as projectKeys };
