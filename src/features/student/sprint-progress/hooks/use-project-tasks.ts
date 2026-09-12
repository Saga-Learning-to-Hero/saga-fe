import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectTaskService } from "../api/project-task-service";
import type {
  CreateProjectTaskRequest,
  PatchProjectTaskRequest,
  TransitionProjectTaskRequest,
} from "../types/jira-task-types";
import { getApiErrorCode } from "@/lib/api-error";
import { JIRA_SPRINT_QUERY_KEYS } from "./use-sprint-data";

export type TransitionTaskPayload =
  | TransitionProjectTaskRequest
  | { targetStatus: string };

export function useProjectTasksData(projectId?: string | null) {
  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(projectId),
    queryFn: () => ProjectTaskService.getTasks(projectId!),
    enabled: Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useTaskOptions(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.taskOptions(projectId),
    queryFn: () => ProjectTaskService.getTaskOptions(projectId!),
    enabled: Boolean(projectId && projectId.trim()) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      const code = getApiErrorCode(error);
      if (code === "INTEGRATION_REVOKED" || code === "INTEGRATION_NOT_FOUND") {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useTaskTransitions(
  projectId?: string | null,
  taskId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.taskTransitions(projectId, taskId),
    queryFn: () => ProjectTaskService.getTaskTransitions(projectId!, taskId!),
    enabled: Boolean(projectId && taskId) && (options?.enabled ?? true),
    staleTime: 1000 * 10,
    retry: (failureCount, error) => {
      const code = getApiErrorCode(error);
      if (code === "INTEGRATION_REVOKED" || code === "INTEGRATION_NOT_FOUND") {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function useTransitionTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      taskId,
      data,
    }: {
      projectId: string;
      taskId: string;
      data: TransitionTaskPayload;
    }) => {
      if ("targetStatus" in data && data.targetStatus) {
        const transitions = await ProjectTaskService.getTaskTransitions(projectId, taskId);
        const targetUpper = data.targetStatus.toUpperCase();
        const matched = transitions.find((t) => {
          const tName = (t.toStatusName || t.name).toUpperCase();
          if (targetUpper === "DONE" || targetUpper === "COMPLETED") {
            return ["DONE", "COMPLETED", "RESOLVED", "CLOSED"].some((k) => tName.includes(k));
          }
          if (targetUpper === "IN_REVIEW" || targetUpper === "REVIEW") {
            return ["REVIEW", "TEST", "QA"].some((k) => tName.includes(k));
          }
          if (targetUpper === "IN_PROGRESS" || targetUpper === "PROGRESS") {
            return ["IN PROGRESS", "PROGRESS", "DOING"].some((k) => tName.includes(k));
          }
          if (targetUpper === "TODO" || targetUpper === "TO DO") {
            return ["TO DO", "TODO", "BACKLOG", "OPEN"].some((k) => tName.includes(k));
          }
          return tName.includes(targetUpper);
        });

        if (!matched) {
          throw new Error(`Không tìm thấy luồng chuyển trạng thái phù hợp sang "${data.targetStatus}" trên Jira.`);
        }

        return ProjectTaskService.transitionTask(projectId, taskId, { transitionId: matched.id });
      }

      return ProjectTaskService.transitionTask(projectId, taskId, data as TransitionProjectTaskRequest);
    },
    onSuccess: (updatedTask, variables) => {
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(variables.projectId),
      });
      toast.success(`Đã chuyển trạng thái task sang "${updatedTask.jiraStatusName || updatedTask.status}".`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể chuyển trạng thái task trên Jira.");
    },
  });
}

export function useCreateProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateProjectTaskRequest;
    }) => ProjectTaskService.createTask(projectId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(variables.projectId),
      });
      toast.success(`Đã tạo task [${res.externalKey}] trên Jira thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể tạo task trên Jira.");
    },
  });
}

export function usePatchProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      data,
    }: {
      projectId: string;
      taskId: string;
      data: PatchProjectTaskRequest;
    }) => ProjectTaskService.patchTask(projectId, taskId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(variables.projectId),
      });
      toast.success(`Đã cập nhật task [${res.externalKey}] thành công.`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Không thể cập nhật task.");
    },
  });
}

export function useDeleteProjectTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
    }: {
      projectId: string;
      taskId: string;
    }) => ProjectTaskService.deleteTask(projectId, taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(variables.projectId),
      });
      toast.success("Đã xóa task thành công.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      if (err.response?.data?.code === "TASK_DELETE_BLOCKED_BY_EVIDENCE") {
        toast.error("Không thể xóa: Task này đã có phiên làm việc (Work Session) hoặc bằng chứng gắn vào.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Không thể xóa task.");
      }
    },
  });
}
