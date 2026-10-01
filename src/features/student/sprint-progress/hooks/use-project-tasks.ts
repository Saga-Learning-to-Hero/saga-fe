import { showSuccessToast, showErrorToast, showWarningToast } from "@/lib/api-error";
import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { ProjectTaskService } from "../api/project-task-service";
import type {
  CreateProjectTaskRequest,
  PatchProjectTaskRequest,
  ProjectTaskResponse,
  TransitionProjectTaskRequest,
  GetTaskParentOptionsParams,
} from "../types/jira-task-types";

import type { GetTaskWorkSessionTimelineParams } from "../types/work-session-timeline";
import { getApiErrorCode } from "@/lib/api-error";
import { JIRA_SPRINT_QUERY_KEYS } from "./use-sprint-data";
import { upsertProjectTaskInList } from "../lib/task-list-cache";
import { getPersonalIntegrationErrorMessage } from "../lib/personal-integration-error";
import { getTaskMutationErrorMessage } from "../lib/task-mutation-errors";
import { PROJECT_GRAPH_QUERY_KEY } from "@/features/graph/hooks/use-project-graph";
import { CONTRIBUTION_QUERY_KEYS } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";

export type TransitionTaskPayload =
  | TransitionProjectTaskRequest
  | { targetStatus: string };

function invalidateAfterTaskMutation(
  queryClient: QueryClient,
  projectId: string,
  taskId?: string
) {
  void queryClient.invalidateQueries({
    queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(projectId),
  });
  if (taskId) {
    void queryClient.invalidateQueries({
      queryKey: JIRA_SPRINT_QUERY_KEYS.taskDetail(projectId, taskId),
    });
  }
  void queryClient.invalidateQueries({
    queryKey: [...JIRA_SPRINT_QUERY_KEYS.all, "parent-task-options", projectId],
  });
  void queryClient.invalidateQueries({
    queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(projectId),
  });
  void queryClient.invalidateQueries({
    queryKey: [PROJECT_GRAPH_QUERY_KEY, projectId],
  });
  void queryClient.invalidateQueries({
    queryKey: CONTRIBUTION_QUERY_KEYS.evaluations,
  });
}

export function useProjectTasksData(projectId?: string | null) {
  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.tasks(projectId),
    queryFn: () => ProjectTaskService.getTasks(projectId!),
    enabled: Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectTaskDetail(
  projectId?: string | null,
  taskId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.taskDetail(projectId, taskId),
    queryFn: () => ProjectTaskService.getTask(projectId!, taskId!),
    enabled:
      Boolean(projectId && projectId.trim() && taskId && taskId.trim()) &&
      (options?.enabled ?? true),
    staleTime: 1000 * 30,
  });
}

export function useTaskOptions(
  projectId?: string | null,
  options?: { enabled?: boolean; jiraIntegrationId?: string }
) {
  return useQuery({
    queryKey: [...JIRA_SPRINT_QUERY_KEYS.taskOptions(projectId), options?.jiraIntegrationId ?? ""],
    queryFn: () => ProjectTaskService.getTaskOptions(projectId!, options?.jiraIntegrationId),
    enabled: Boolean(projectId && projectId.trim()) && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5,
    retry: false,
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
      queryClient.setQueryData(
        JIRA_SPRINT_QUERY_KEYS.tasks(variables.projectId),
        (old: ProjectTaskResponse[] | undefined) => upsertProjectTaskInList(old, updatedTask)
      );
      queryClient.setQueryData(
        JIRA_SPRINT_QUERY_KEYS.taskDetail(variables.projectId, variables.taskId),
        updatedTask
      );
      void queryClient.invalidateQueries({
        queryKey: JIRA_SPRINT_QUERY_KEYS.taskTransitions(variables.projectId, variables.taskId),
      });
      showSuccessToast(`Đã chuyển trạng thái task sang "${updatedTask.jiraStatusName || updatedTask.status}".`);
    },
    onError: (error: unknown) => {
      showErrorToast(getTaskMutationErrorMessage(error, "Không thể chuyển trạng thái Task trên Jira."));
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
      invalidateAfterTaskMutation(queryClient, variables.projectId, res.id);
      showSuccessToast(`Đã tạo task [${res.externalKey}] trên Jira thành công.`);
    },
    onError: (error: unknown, variables) => {
      const personalIntegrationMsg = getPersonalIntegrationErrorMessage(error);
      if (personalIntegrationMsg) {
        showErrorToast(personalIntegrationMsg);
        return;
      }
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const code = err.response?.data?.code;
      if (code === "JIRA_WRITE_INCOMPLETE") {
        invalidateAfterTaskMutation(queryClient, variables.projectId);
        showWarningToast(
          err.response?.data?.message ||
          "Task đã được tạo trên Jira nhưng một số thuộc tính phụ chưa được cập nhật đầy đủ."
        );
        return;
      }
      showErrorToast(getTaskMutationErrorMessage(error, "Không thể tạo Task trên Jira."));
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
      invalidateAfterTaskMutation(queryClient, variables.projectId, variables.taskId);
      showSuccessToast(`Đã cập nhật task [${res.externalKey}] thành công.`);
    },
    onError: (error: unknown) => {
      const personalIntegrationMsg = getPersonalIntegrationErrorMessage(error);
      if (personalIntegrationMsg) {
        showErrorToast(personalIntegrationMsg);
        return;
      }
      const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
      const msg =
        err.response?.data?.code === "JIRA_FIELD_INVALID"
          ? "Jira từ chối cập nhật Task (do cấu hình màn hình Edit Screen hoặc quyền hạn trên Jira)."
          : getTaskMutationErrorMessage(error, "Không thể cập nhật Task.");
      showErrorToast(msg);
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
      invalidateAfterTaskMutation(queryClient, variables.projectId, variables.taskId);
      showSuccessToast("Đã xóa task thành công.");
    },
    onError: (error: unknown) => {
      showErrorToast(getTaskMutationErrorMessage(error, "Không thể xóa Task."));
    },
  });
}

export function useParentTaskOptions(
  projectId?: string | null,
  params?: GetTaskParentOptionsParams,
  options?: { enabled?: boolean }
) {
  const childIssueTypeId = params?.childIssueTypeId?.trim() || "";
  const jiraIntegrationId = params?.jiraIntegrationId?.trim() || "";
  const hasRequiredParams = Boolean(childIssueTypeId && jiraIntegrationId);

  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.parentTaskOptions(projectId, params),
    queryFn: () => ProjectTaskService.getParentOptions(projectId!, params!),
    enabled:
      Boolean(projectId && projectId.trim()) &&
      hasRequiredParams &&
      (options?.enabled ?? true),
    staleTime: 1000 * 30,
  });
}



export function useTaskWorkSessionTimeline(
  projectId?: string | null,
  taskId?: string | null,
  params?: GetTaskWorkSessionTimelineParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: JIRA_SPRINT_QUERY_KEYS.taskTimeline(projectId, taskId, params),
    queryFn: () =>
      ProjectTaskService.getTaskWorkSessionTimeline(projectId!, taskId!, params),
    enabled:
      Boolean(projectId && projectId.trim() && taskId && taskId.trim()) &&
      (options?.enabled ?? true),
    staleTime: 1000 * 30,
  });
}
