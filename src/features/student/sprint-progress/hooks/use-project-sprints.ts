import { showSuccessToast, showErrorToast } from "@/lib/api-error";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectSprintService } from "../api/project-sprint-service";
import type {
  CreateProjectSprintRequest,
  PatchProjectSprintRequest,
  ProjectSprintResponse,
} from "../types/jira-task-types";
import { JIRA_SPRINT_QUERY_KEYS } from "./use-sprint-data";
import { useProjectIntegrations } from "@/features/student/project/hooks/useProjectIntegrations";
import { useJiraSources } from "@/features/student/project/hooks/use-jira-sources";
import {
  areJiraSourceQueriesSettled,
  resolveSprintQuerySource,
  shouldRetrySprintQuery,
} from "../lib/sprint-query-source";

export function useProjectSprints(
  projectId?: string | null,
  jiraIntegrationIdOrOptions?: string | null | { enabled?: boolean; jiraIntegrationId?: string },
  options?: { enabled?: boolean; jiraIntegrationId?: string }
) {
  const explicitIntegrationId = typeof jiraIntegrationIdOrOptions === "string"
    ? jiraIntegrationIdOrOptions
    : (typeof jiraIntegrationIdOrOptions === "object" && jiraIntegrationIdOrOptions !== null
      ? jiraIntegrationIdOrOptions.jiraIntegrationId
      : options?.jiraIntegrationId);

  const effectiveOptions = typeof jiraIntegrationIdOrOptions === "object" && jiraIntegrationIdOrOptions !== null
    ? jiraIntegrationIdOrOptions
    : options;

  const trimmedExplicit = explicitIntegrationId?.trim() || "";
  const cleanProjectId = projectId?.trim() || "";
  const needSources = Boolean(cleanProjectId && !trimmedExplicit);

  const jiraSourcesQuery = useJiraSources(projectId, {
    enabled: needSources,
  });

  const canonicalFetched = jiraSourcesQuery.isFetched || jiraSourcesQuery.isError;
  const canonicalCount = jiraSourcesQuery.data?.length ?? 0;
  const needIntegrations = needSources && canonicalFetched && canonicalCount === 0;

  const integrationsQuery = useProjectIntegrations(projectId, {
    enabled: needIntegrations,
  });

  const integrationsFetched = integrationsQuery.isFetched || integrationsQuery.isError;
  const sourcesSettled = areJiraSourceQueriesSettled({
    hasExplicitId: Boolean(trimmedExplicit),
    canonicalFetched,
    canonicalCount,
    integrationsEnabled: needIntegrations,
    integrationsFetched,
  });

  const activeSourceIds = useMemo(() => {
    const sources =
      canonicalCount > 0
        ? jiraSourcesQuery.data || []
        : integrationsQuery.data?.jiraSources || [];
    return sources
      .filter((source) => source.connectionStatus === "ACTIVE")
      .map((source) => source.integrationId)
      .filter((id): id is string => Boolean(id?.trim()));
  }, [canonicalCount, jiraSourcesQuery.data, integrationsQuery.data?.jiraSources]);

  const resolution = resolveSprintQuerySource({
    explicitIntegrationId: trimmedExplicit || null,
    sourcesSettled,
    activeSourceIds,
  });

  const query = useQuery({
    queryKey: [...JIRA_SPRINT_QUERY_KEYS.sprints(projectId), resolution.integrationId || "unresolved"],
    queryFn: () => ProjectSprintService.getSprints(projectId!, resolution.integrationId),
    enabled:
      (effectiveOptions?.enabled ?? true) &&
      Boolean(cleanProjectId) &&
      resolution.enabled,
    staleTime: 1000 * 60,
    retry: shouldRetrySprintQuery,
  });

  return {
    ...query,
    isLoading: query.isLoading || resolution.status === "pending",
    sprintSourceStatus: resolution.status,
    resolvedIntegrationId: resolution.integrationId,
  };
}

export function useCreateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateProjectSprintRequest;
    }) => ProjectSprintService.createSprint(projectId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(variables.projectId),
      });
      showSuccessToast(`Đã tạo ${res.name} đồng bộ với Jira thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      showErrorToast(err.response?.data?.message || err.message || "Không thể tạo Sprint trên Jira.");
    },
  });
}

export function usePatchSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      sprintId,
      data,
    }: {
      projectId: string;
      sprintId: string;
      data: PatchProjectSprintRequest;
    }) => ProjectSprintService.patchSprint(projectId, sprintId, data),
    onSuccess: (res, variables) => {
      queryClient.setQueryData<ProjectSprintResponse[]>(
        JIRA_SPRINT_QUERY_KEYS.sprints(variables.projectId),
        (old) => {
          if (!old) return old;
          return old.map((s) => (s.id === res.id ? { ...s, ...res } : s));
        }
      );
      queryClient.invalidateQueries(
        { queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(variables.projectId), refetchType: "none" },
        { cancelRefetch: false }
      );
      showSuccessToast(`Đã cập nhật ${res.name} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const msg =
        err.response?.data?.code === "JIRA_FIELD_INVALID"
          ? "Jira từ chối cập nhật Sprint (do ràng buộc trạng thái hoặc quyền hạn trên Jira)."
          : err.response?.data?.message || err.message || "Không thể cập nhật Sprint.";
      showErrorToast(msg);
    },
  });
}

export function useDeleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      sprintId,
    }: {
      projectId: string;
      sprintId: string;
    }) => ProjectSprintService.deleteSprint(projectId, sprintId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(variables.projectId),
      });
      showSuccessToast("Đã xóa Sprint trên Jira thành công.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      showErrorToast(err.response?.data?.message || err.message || "Không thể xóa Sprint.");
    },
  });
}

export function useAssignTaskToSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      sprintId,
    }: {
      projectId: string;
      taskId: string;
      sprintId: number | string | null;
    }) => ProjectSprintService.assignTaskToSprint(projectId, taskId, sprintId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(variables.projectId),
      });
      showSuccessToast(
        variables.sprintId === null
          ? "Đã chuyển task về Backlog."
          : "Đã gán task vào Sprint thành công."
      );
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      showErrorToast(err.response?.data?.message || err.message || "Không thể cập nhật Sprint của task.");
    },
  });
}
