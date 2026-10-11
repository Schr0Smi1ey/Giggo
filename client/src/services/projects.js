import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.js';

const KEYS = {
  all: ['projects'],
  list: (params) => ['projects', 'list', params],
  detail: (id) => ['projects', 'detail', id],
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

export { KEYS as projectKeys };
