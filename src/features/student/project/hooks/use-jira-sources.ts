"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { JiraSourcesService } from "../api/jira-sources-service";
import type {
  JiraFailoverExecuteRequest,
  JiraFailoverPreviewRequest,
  JiraFailoverReconcileRequest,
} from "../types/jira-sources";

export const JIRA_SOURCES_QUERY_KEYS = {
  all: (projectId: string) => ["projects", projectId, "jira-sources"] as const,
  taskOptions: (projectId: string, integrationId: string) =>
    ["projects", projectId, "jira-sources", integrationId, "task-options"] as const,
  preview: (projectId: string, sourceId: string, req: JiraFailoverPreviewRequest) =>
    ["projects", projectId, "jira-sources", sourceId, "failover-preview", req] as const,
  run: (projectId: string, sourceId: string, runId: string, page: number, size: number) =>
    ["projects", projectId, "jira-sources", sourceId, "failover-runs", runId, page, size] as const,
};

export function useJiraSources(
  projectId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: JIRA_SOURCES_QUERY_KEYS.all(projectId ?? ""),
    queryFn: () => JiraSourcesService.listJiraSources(projectId!),
    enabled:
      Boolean(projectId && projectId.trim()) &&
      (options?.enabled ?? true),
    staleTime: 1000 * 30,
  });
}

export function useJiraSourceTaskOptions(projectId: string, integrationId?: string) {
  return useQuery({
    queryKey: JIRA_SOURCES_QUERY_KEYS.taskOptions(projectId, integrationId ?? ""),
    queryFn: () => JiraSourcesService.getJiraSourceTaskOptions(projectId, integrationId!),
    enabled: Boolean(projectId && integrationId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useJiraSourceSync(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationId: string) =>
      JiraSourcesService.syncJiraSource(projectId, integrationId),
    onSuccess: () => {
      toast.info("Yêu cầu đồng bộ đã được đưa vào hàng đợi.", {
        description: "Hệ thống đang đồng bộ dữ liệu ngầm từ nguồn Jira.",
      });
      void queryClient.invalidateQueries({
        queryKey: JIRA_SOURCES_QUERY_KEYS.all(projectId),
      });
    },
    onError: (error) => {
      toast.error("Không thể bắt đầu đồng bộ Jira", {
        description: getApiErrorMessage(error, "Vui lòng thử lại sau."),
      });
    },
  });
}

export function useJiraSourceDisconnect(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationId: string) =>
      JiraSourcesService.disconnectJiraSource(projectId, integrationId),
    onSuccess: () => {
      toast.success("Đã ngắt kết nối nguồn Jira thành công.", {
        description: "Dữ liệu lịch sử vẫn được bảo toàn nguyên vẹn.",
      });
      void queryClient.invalidateQueries({
        queryKey: JIRA_SOURCES_QUERY_KEYS.all(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "integrations"],
      });
    },
    onError: (error) => {
      toast.error("Không thể ngắt kết nối nguồn Jira", {
        description: getApiErrorMessage(error, "Vui lòng kiểm tra lại quyền thao tác."),
      });
    },
  });
}

export function useFailoverPreview(
  projectId: string,
  sourceIntegrationId: string,
  request: JiraFailoverPreviewRequest,
  enabled: boolean
) {
  return useQuery({
    queryKey: JIRA_SOURCES_QUERY_KEYS.preview(projectId, sourceIntegrationId, request),
    queryFn: () => JiraSourcesService.previewFailover(projectId, sourceIntegrationId, request),
    enabled: Boolean(enabled && projectId && sourceIntegrationId && request.targetIntegrationId),
    staleTime: 1000 * 15,
  });
}

export function useFailoverExecute(projectId: string, sourceIntegrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: JiraFailoverExecuteRequest) =>
      JiraSourcesService.executeFailover(projectId, sourceIntegrationId, body),
    onSuccess: (data) => {
      toast.success("Đã kích hoạt chuyển giao công việc dở dang.", {
        description: `Đang xử lý ${data.itemCount} công việc.`,
      });
      void queryClient.invalidateQueries({
        queryKey: JIRA_SOURCES_QUERY_KEYS.all(projectId),
      });
    },
    onError: (error) => {
      toast.error("Không thể khởi động chuyển giao", {
        description: getApiErrorMessage(error, "Vui lòng kiểm tra lại cấu hình và thử lại."),
      });
    },
  });
}

export function useFailoverRun(
  projectId: string,
  sourceIntegrationId: string,
  runId?: string,
  page = 0,
  size = 50
) {
  return useQuery({
    queryKey: JIRA_SOURCES_QUERY_KEYS.run(projectId, sourceIntegrationId, runId ?? "", page, size),
    queryFn: () => JiraSourcesService.getFailoverRun(projectId, sourceIntegrationId, runId!, page, size),
    enabled: Boolean(projectId && sourceIntegrationId && runId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "PENDING" || status === "RUNNING") {
        return 2500;
      }
      return false;
    },
  });
}

export function useFailoverRetry(projectId: string, sourceIntegrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) =>
      JiraSourcesService.retryFailover(projectId, sourceIntegrationId, runId),
    onSuccess: () => {
      toast.success("Đã đưa các ca lỗi an toàn vào hàng đợi thử lại.");
      void queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "jira-sources", sourceIntegrationId, "failover-runs"],
      });
    },
    onError: (error) => {
      toast.error("Không thể thử lại chuyển giao", {
        description: getApiErrorMessage(
          error,
          "Nguồn Jira ban đầu có thể đang hoạt động. Vui lòng ngắt kết nối nguồn trước khi thử lại."
        ),
      });
    },
  });
}

export function useFailoverReconcile(
  projectId: string,
  sourceIntegrationId: string,
  runId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: string; body: JiraFailoverReconcileRequest }) =>
      JiraSourcesService.reconcileFailoverItem(projectId, sourceIntegrationId, runId, itemId, body),
    onSuccess: () => {
      toast.success("Đối soát và liên kết issue thành công.");
      void queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "jira-sources", sourceIntegrationId, "failover-runs"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks"],
      });
    },
    onError: (error) => {
      toast.error("Không thể xác thực và liên kết issue", {
        description: getApiErrorMessage(
          error,
          "Issue Key không hợp lệ hoặc không thuộc dự án Jira đích."
        ),
      });
    },
  });
}
