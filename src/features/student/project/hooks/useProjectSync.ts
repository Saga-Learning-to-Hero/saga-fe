"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectProjectionService } from "../api/project-projection-service";
import { PROJECT_INTEGRATIONS_QUERY_KEYS } from "./useProjectIntegrations";
import type { ProjectSyncResponse, ProjectSyncStatusItem } from "../types/student-project";

export const PROJECT_PROJECTION_QUERY_KEYS = {
  all: ["project-projections"] as const,
  tasks: (projectId?: string | null) => [...PROJECT_PROJECTION_QUERY_KEYS.all, "tasks", projectId] as const,
  syncStatus: (projectId?: string | null) => [...PROJECT_PROJECTION_QUERY_KEYS.all, "sync-status", projectId] as const,
  taskCommits: (projectId?: string | null, taskId?: string | null) =>
    [...PROJECT_PROJECTION_QUERY_KEYS.all, "task-commits", projectId, taskId] as const,
  commits: (projectId?: string | null) => [...PROJECT_PROJECTION_QUERY_KEYS.all, "commits", projectId] as const,
  progress: (projectId?: string | null) => [...PROJECT_PROJECTION_QUERY_KEYS.all, "progress", projectId] as const,
  memberProgress: (projectId?: string | null, studentId?: string | null) =>
    [...PROJECT_PROJECTION_QUERY_KEYS.all, "member-progress", projectId, studentId] as const,
};

export function useSyncProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => ProjectProjectionService.syncProject(projectId),
    onSuccess: async (_data: ProjectSyncResponse, projectId: string) => {
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        exact: true,
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.tasks(projectId),
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.syncStatus(projectId),
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits(projectId),
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.progress(projectId),
      });
      await queryClient.invalidateQueries({
        queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "member-progress", projectId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["jira-sprint"],
      });
    },
  });
}

export function useProjectTasks(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.tasks(projectId),
    queryFn: () => ProjectProjectionService.getProjectTasks(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectSyncStatus(
  projectId?: string | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: import("@tanstack/react-query").UseQueryOptions<ProjectSyncStatusItem[]>["refetchInterval"];
  }
) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.syncStatus(projectId),
    queryFn: () => ProjectProjectionService.getProjectSyncStatus(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 15,
    refetchInterval: options?.refetchInterval,
  });
}

export function useTaskCommits(
  projectId?: string | null,
  taskId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.taskCommits(projectId, taskId),
    queryFn: () => ProjectProjectionService.getTaskCommits(projectId!, taskId!),
    enabled:
      (options?.enabled ?? true) &&
      Boolean(projectId && projectId.trim() && taskId && taskId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectCommits(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits(projectId),
    queryFn: () => ProjectProjectionService.getProjectCommits(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectProgress(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.progress(projectId),
    queryFn: () => ProjectProjectionService.getProjectProgress(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useMemberProgress(
  projectId?: string | null,
  studentId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.memberProgress(projectId, studentId),
    queryFn: () => ProjectProjectionService.getMemberProgress(projectId!, studentId!),
    enabled:
      (options?.enabled ?? true) &&
      Boolean(projectId && projectId.trim() && studentId && studentId.trim()),
    staleTime: 1000 * 30,
  });
}



