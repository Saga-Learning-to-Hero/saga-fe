"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectProjectionService } from "../api/project-projection-service";
import { PROJECT_INTEGRATIONS_QUERY_KEYS } from "./useProjectIntegrations";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
import { ProjectTaskService } from "@/features/student/sprint-progress/api/project-task-service";
import type {
  ProjectSyncResponse,
  ProjectSyncStatusItem,
  ProjectTaskCommitLinkQuery,
} from "../types/student-project";

export const PROJECT_PROJECTION_QUERY_KEYS = {
  all: ["project-projections"] as const,
  tasks: (projectId?: string | null) => JIRA_SPRINT_QUERY_KEYS.tasks(projectId),
  syncStatus: (projectId?: string | null) => [...PROJECT_PROJECTION_QUERY_KEYS.all, "sync-status", projectId] as const,
  taskCommits: (projectId?: string | null, taskId?: string | null) =>
    [...PROJECT_PROJECTION_QUERY_KEYS.all, "task-commits", projectId, taskId] as const,
  commits: (projectId?: string | null) => [...PROJECT_PROJECTION_QUERY_KEYS.all, "commits", projectId] as const,
  progress: (projectId?: string | null) => [...PROJECT_PROJECTION_QUERY_KEYS.all, "progress", projectId] as const,
  memberProgress: (projectId?: string | null, studentId?: string | null) =>
    [...PROJECT_PROJECTION_QUERY_KEYS.all, "member-progress", projectId, studentId] as const,
  repositoryBranches: (projectId?: string | null, repoId?: string | null) =>
    [...PROJECT_PROJECTION_QUERY_KEYS.all, "repository-branches", projectId, repoId] as const,
  taskCommitLinks: (
    projectId?: string | null,
    repoId?: string | null,
    branchName?: string | null
  ) =>
    [
      ...PROJECT_PROJECTION_QUERY_KEYS.all,
      "task-commit-links",
      projectId,
      repoId || null,
      branchName || null,
    ] as const,
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
        queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "repository-branches", projectId],
      });
      await queryClient.invalidateQueries({
        queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.all, "task-commit-links", projectId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["jira-sprint"],
      });
    },
  });
}

export function useProjectTasks(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(projectId),
    queryFn: () => ProjectTaskService.getTasks(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectSyncStatus(
  projectId?: string | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false | ((query: unknown) => number | false | undefined);
  }
) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.syncStatus(projectId),
    queryFn: () => ProjectProjectionService.getProjectSyncStatus(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 15,
    refetchInterval: (query) => {
      if (options?.refetchInterval !== undefined) {
        return typeof options.refetchInterval === "function"
          ? (options.refetchInterval as (q: unknown) => number | false | undefined)(query)
          : options.refetchInterval;
      }
      const jobs = query.state.data as ProjectSyncStatusItem[] | undefined;
      const isActivelySyncing = jobs?.some((job) =>
        ["ENQUEUED", "IN_PROGRESS", "RUNNING", "SYNCING"].includes(
          (job.status || "").toUpperCase()
        )
      );
      return isActivelySyncing ? 3000 : 30000;
    },
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

export function useProjectRepositoryBranches(
  projectId?: string | null,
  repoId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.repositoryBranches(projectId, repoId),
    queryFn: () => ProjectProjectionService.getRepositoryBranches(projectId!, repoId!),
    enabled:
      (options?.enabled ?? true) &&
      Boolean(projectId && projectId.trim() && repoId && repoId.trim() && repoId !== "all"),
    staleTime: 1000 * 60,
  });
}

export function useProjectTaskCommitLinks(
  projectId?: string | null,
  query: ProjectTaskCommitLinkQuery = {},
  options?: { enabled?: boolean }
) {
  const repoId = query.repoId?.trim() || null;
  const branchName = query.branchName?.trim() || null;
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.taskCommitLinks(projectId, repoId, branchName),
    queryFn: () =>
      ProjectProjectionService.getProjectTaskCommitLinks(projectId!, { repoId, branchName }),
    enabled:
      (options?.enabled ?? true) &&
      Boolean(projectId && projectId.trim()) &&
      (!branchName || Boolean(repoId)),
    staleTime: 1000 * 30,
  });
}

export function usePrefetchProjectProjection() {
  const queryClient = useQueryClient();
  return useCallback(
    (projectId: string, options?: { includeCommits?: boolean }) => {
      if (!projectId || !projectId.trim()) return;
      void queryClient.prefetchQuery({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.progress(projectId),
        queryFn: () => ProjectProjectionService.getProjectProgress(projectId),
        staleTime: 1000 * 30,
      });
      if (options?.includeCommits) {
        void queryClient.prefetchQuery({
          queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits(projectId),
          queryFn: () => ProjectProjectionService.getProjectCommits(projectId),
          staleTime: 1000 * 30,
        });
      }
    },
    [queryClient]
  );
}
