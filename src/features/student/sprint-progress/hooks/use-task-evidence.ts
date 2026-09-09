import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskEvidenceService } from "../api/task-evidence-service";
import type {
  CreateTaskWebLinkPayload,
  CreateContributionConfirmationPayload,
} from "../types/task-evidence";

export const TASK_EVIDENCE_QUERY_KEYS = {
  webLinks: (taskId?: string | null) => ["tasks", taskId, "web-links"] as const,
  files: (taskId?: string | null) => ["tasks", taskId, "files"] as const,
};

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
  return useMutation({
    mutationFn: () => TaskEvidenceService.startWorkSession(taskId),
  });
}

export function useStopWorkSession(taskId: string) {
  return useMutation({
    mutationFn: (sessionId: string) =>
      TaskEvidenceService.stopWorkSession(taskId, sessionId),
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
    },
  });
}

export function useConfirmContribution(taskId: string) {
  return useMutation({
    mutationFn: (payload: CreateContributionConfirmationPayload) =>
      TaskEvidenceService.confirmContribution(taskId, payload),
  });
}
