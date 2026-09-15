import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskEvidenceService } from "../api/task-evidence-service";
import type {
  CreateTaskWebLinkPayload,
  CreateContributionConfirmationPayload,
  TaskWorkSessionResponse,
  TaskWorkSessionsResponse,
} from "../types/task-evidence";

export const TASK_EVIDENCE_QUERY_KEYS = {
  workSessions: (taskId?: string | null) => ["tasks", taskId, "work-sessions"] as const,
  webLinks: (taskId?: string | null) => ["tasks", taskId, "web-links"] as const,
  files: (taskId?: string | null) => ["tasks", taskId, "files"] as const,
};

function updateWorkSessionCache(
  current: TaskWorkSessionsResponse | undefined,
  taskId: string,
  session: TaskWorkSessionResponse
): TaskWorkSessionsResponse {
  const sessions = current?.sessions ?? [];
  const nextSessions = [
    ...sessions.filter((item) => item.id !== session.id),
    session,
  ].sort((left, right) => left.startedAt.localeCompare(right.startedAt));

  return {
    taskId: session.taskId || current?.taskId || taskId,
    activeSession: session.status === "OPEN" ? session : null,
    sessions: nextSessions,
  };
}

export function useTaskWorkSessions(taskId?: string | null) {
  return useQuery({
    queryKey: TASK_EVIDENCE_QUERY_KEYS.workSessions(taskId),
    queryFn: () => TaskEvidenceService.getWorkSessions(taskId!),
    enabled: Boolean(taskId && taskId.trim()),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useTaskWebLinks(taskId?: string | null) {
  return useQuery({
    queryKey: TASK_EVIDENCE_QUERY_KEYS.webLinks(taskId),
    queryFn: () => TaskEvidenceService.getWebLinks(taskId!),
    enabled: Boolean(taskId && taskId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useTaskFiles(taskId?: string | null) {
  return useQuery({
    queryKey: TASK_EVIDENCE_QUERY_KEYS.files(taskId),
    queryFn: () => TaskEvidenceService.getFiles(taskId!),
    enabled: Boolean(taskId && taskId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useStartWorkSession(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => TaskEvidenceService.startWorkSession(taskId),
    onSuccess: (session) => {
      queryClient.setQueryData<TaskWorkSessionsResponse>(
        TASK_EVIDENCE_QUERY_KEYS.workSessions(taskId),
        (current) => updateWorkSessionCache(current, taskId, session)
      );
    },
  });
}

export function useStopWorkSession(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      TaskEvidenceService.stopWorkSession(taskId, sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData<TaskWorkSessionsResponse>(
        TASK_EVIDENCE_QUERY_KEYS.workSessions(taskId),
        (current) => updateWorkSessionCache(current, taskId, session)
      );
    },
  });
}

export function useAddTaskWebLink(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskWebLinkPayload) =>
      TaskEvidenceService.addWebLink(taskId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASK_EVIDENCE_QUERY_KEYS.webLinks(taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["contributionEvaluation"],
      });
    },
  });
}

export function useDeleteTaskWebLink(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) =>
      TaskEvidenceService.deleteWebLink(taskId, linkId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASK_EVIDENCE_QUERY_KEYS.webLinks(taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["contributionEvaluation"],
      });
    },
  });
}

export function useUploadTaskFile(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => TaskEvidenceService.uploadFile(taskId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASK_EVIDENCE_QUERY_KEYS.files(taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["contributionEvaluation"],
      });
    },
  });
}

export function useDownloadTaskFile(taskId: string) {
  return useMutation({
    mutationFn: async ({ fileId, filename }: { fileId: string; filename: string }) => {
      const blob = await TaskEvidenceService.downloadFile(taskId, fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useDeleteTaskFile(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => TaskEvidenceService.deleteFile(taskId, fileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TASK_EVIDENCE_QUERY_KEYS.files(taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["contributionEvaluation"],
      });
    },
  });
}

export function useConfirmContribution(taskId: string) {
  return useMutation({
    mutationFn: (payload: CreateContributionConfirmationPayload) =>
      TaskEvidenceService.confirmContribution(taskId, payload),
  });
}
