"use client";

import { useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectProjectionService } from "../api/project-projection-service";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
import { ProjectTaskService } from "@/features/student/sprint-progress/api/project-task-service";
import { StudentDashboardService } from "@/features/student/dashboard/api/student-dashboard-service";
import { STUDENT_DASHBOARD_QUERY_KEYS } from "@/features/student/dashboard/hooks/use-student-dashboard";
import {
  shouldPrefetchTeamProgress,
  shouldRetryLeaderOnlyProjection,
  type PrefetchProjectProjectionOptions,
} from "../lib/student-team-role-cache";
import {
  isActivelySyncing,
  resolveSyncStatusPollInterval,
} from "../lib/sync-job-status";
import type { SSEConnectionStatus } from "../types/project-realtime-types";
import type {
  ProjectSyncStatusItem,
  ProjectTaskCommitLinkQuery,
  GetProjectCommitsParams,
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
    onSuccess: async (_data, projectId: string) => {
      // POST /sync chỉ enqueue; tasks/sprints/commits chờ SSE hoặc job terminal.
      await queryClient.invalidateQueries({
        queryKey: PROJECT_PROJECTION_QUERY_KEYS.syncStatus(projectId),
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
    sseStatus?: SSEConnectionStatus;
    refetchInterval?: number | false | ((query: unknown) => number | false | undefined);
  }
) {
  const activeSinceRef = useRef<number | null>(null);
  const errorSinceRef = useRef<number | null>(null);

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
      const activelySyncing = isActivelySyncing(jobs);
      const now = Date.now();

      if (activelySyncing) {
        if (activeSinceRef.current == null) activeSinceRef.current = now;
      } else {
        activeSinceRef.current = null;
      }

      if (options?.sseStatus === "ERROR") {
        if (errorSinceRef.current == null) errorSinceRef.current = now;
      } else {
        errorSinceRef.current = null;
      }

      return resolveSyncStatusPollInterval({
        isActivelySyncing: activelySyncing,
        sseStatus: options?.sseStatus,
        activeSinceMs: activeSinceRef.current,
        errorSinceMs: errorSinceRef.current,
        now,
      });
    },
  });
}

export function useTaskCommits(
  projectId?: string | null,
  taskId?: string | null,
  optionsOrParams?: { enabled?: boolean } | (GetProjectCommitsParams & { enabled?: boolean })
) {
  const enabled = optionsOrParams?.enabled ?? true;
  const params: GetProjectCommitsParams | undefined =
    optionsOrParams && ("page" in optionsOrParams || "size" in optionsOrParams)
      ? { page: optionsOrParams.page, size: optionsOrParams.size }
      : undefined;

  return useQuery({
    queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.taskCommits(projectId, taskId), params] as const,
    queryFn: () => ProjectProjectionService.getTaskCommits(projectId!, taskId!, params),
    enabled:
      enabled &&
      Boolean(projectId && projectId.trim() && taskId && taskId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectCommits(
  projectId?: string | null,
  optionsOrParams?: { enabled?: boolean } | (GetProjectCommitsParams & { enabled?: boolean })
) {
  const enabled = optionsOrParams?.enabled ?? true;
  const params: GetProjectCommitsParams | undefined =
    optionsOrParams &&
    ("page" in optionsOrParams || "size" in optionsOrParams || "authorStudentId" in optionsOrParams)
      ? {
          page: optionsOrParams.page,
          size: optionsOrParams.size,
          authorStudentId: optionsOrParams.authorStudentId,
        }
      : undefined;

  return useQuery({
    queryKey: [...PROJECT_PROJECTION_QUERY_KEYS.commits(projectId), params] as const,
    queryFn: () => ProjectProjectionService.getProjectCommits(projectId!, params),
    enabled: enabled && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectProgress(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROJECT_PROJECTION_QUERY_KEYS.progress(projectId),
    queryFn: () => ProjectProjectionService.getProjectProgress(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
    retry: shouldRetryLeaderOnlyProjection,
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
    retry: shouldRetryLeaderOnlyProjection,
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
    (projectId?: string | null, options?: PrefetchProjectProjectionOptions) => {
      const cleanProjectId = projectId?.trim() || "";
      const courseId = options?.courseId?.trim() || "";
      if (!cleanProjectId && !courseId) return;

      if (courseId) {
        void queryClient.prefetchQuery({
          queryKey: STUDENT_DASHBOARD_QUERY_KEYS.byCourse(courseId, null),
          queryFn: () => StudentDashboardService.getDashboard(courseId),
          staleTime: 1000 * 30,
        });
      }

      if (!cleanProjectId) return;

      if (shouldPrefetchTeamProgress(queryClient, { ...options, courseId })) {
        void queryClient.prefetchQuery({
          queryKey: PROJECT_PROJECTION_QUERY_KEYS.progress(cleanProjectId),
          queryFn: () => ProjectProjectionService.getProjectProgress(cleanProjectId),
          staleTime: 1000 * 30,
          retry: false,
        });
      }

      if (options?.includeCommits) {
        void queryClient.prefetchQuery({
          queryKey: PROJECT_PROJECTION_QUERY_KEYS.commits(cleanProjectId),
          queryFn: () => ProjectProjectionService.getProjectCommits(cleanProjectId),
          staleTime: 1000 * 30,
        });
      }
    },
    [queryClient]
  );
}
