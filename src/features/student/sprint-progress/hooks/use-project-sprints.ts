import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectSprintService } from "../api/project-sprint-service";
import type {
  CreateProjectSprintRequest,
  PatchProjectSprintRequest,
} from "../types/jira-task-types";
import { getApiErrorCode } from "@/lib/api-error";
import { JIRA_SPRINT_QUERY_KEYS } from "./use-sprint-data";

export function useProjectSprints(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(projectId),
    queryFn: () => ProjectSprintService.getSprints(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      const code = getApiErrorCode(error);
      if (code === "INTEGRATION_REVOKED" || code === "INTEGRATION_NOT_FOUND") {
        return false;
      }
      return failureCount < 1;
    },
  });
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
      toast.success(`Đã tạo ${res.name} đồng bộ với Jira thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể tạo Sprint trên Jira.");
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
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(variables.projectId),
      });
      toast.success(`Đã cập nhật ${res.name} thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const msg =
        err.response?.data?.code === "JIRA_FIELD_INVALID"
          ? "Jira từ chối cập nhật Sprint (do ràng buộc trạng thái hoặc quyền hạn trên Jira)."
          : err.response?.data?.message || err.message || "Không thể cập nhật Sprint.";
      toast.error(msg);
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
      toast.success("Đã xóa Sprint trên Jira thành công.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể xóa Sprint.");
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
      toast.success(
        variables.sprintId === null
          ? "Đã chuyển task về Backlog."
          : "Đã gán task vào Sprint thành công."
      );
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể cập nhật Sprint của task.");
    },
  });
}
