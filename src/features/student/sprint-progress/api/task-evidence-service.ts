import { apiClient } from "@/lib/axios";
import type {
  TaskWorkSessionResponse,
  TaskWebLinkItem,
  CreateTaskWebLinkPayload,
  TaskFileItem,
  CreateContributionConfirmationPayload,
  ContributionConfirmationResponse,
} from "../types/task-evidence";

export class TaskEvidenceService {
  static async startWorkSession(taskId: string): Promise<TaskWorkSessionResponse> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const response = await apiClient.post<TaskWorkSessionResponse>(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/work-sessions/start`
    );
    return response.data;
  }

  static async stopWorkSession(
    taskId: string,
    sessionId: string
  ): Promise<TaskWorkSessionResponse> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const cleanSessionId = sessionId ? sessionId.trim() : "";
    if (!cleanSessionId) {
      throw new Error("sessionId is required");
    }

    const response = await apiClient.post<TaskWorkSessionResponse>(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/work-sessions/${encodeURIComponent(cleanSessionId)}/stop`
    );
    return response.data;
  }

  static async getWebLinks(taskId: string): Promise<TaskWebLinkItem[]> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const response = await apiClient.get<TaskWebLinkItem[]>(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/web-links`
    );
    return response.data || [];
  }

  static async addWebLink(
    taskId: string,
    payload: CreateTaskWebLinkPayload
  ): Promise<TaskWebLinkItem> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const cleanUrl = payload?.url ? payload.url.trim() : "";
    if (!cleanUrl) {
      throw new Error("URL is required");
    }

    const cleanTitle = payload?.title ? payload.title.trim() : "";

    const response = await apiClient.post<TaskWebLinkItem>(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/web-links`,
      {
        url: cleanUrl,
        title: cleanTitle,
      }
    );
    return response.data;
  }

  static async deleteWebLink(taskId: string, linkId: string): Promise<void> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const cleanLinkId = linkId ? linkId.trim() : "";
    if (!cleanLinkId) {
      throw new Error("linkId is required");
    }

    await apiClient.delete(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/web-links/${encodeURIComponent(cleanLinkId)}`
    );
  }

  static async getFiles(taskId: string): Promise<TaskFileItem[]> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const response = await apiClient.get<TaskFileItem[]>(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/files`
    );
    return response.data || [];
  }

  static async uploadFile(taskId: string, file: File): Promise<TaskFileItem> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    if (!file) {
      throw new Error("file is required");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<TaskFileItem>(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  static async downloadFile(taskId: string, fileId: string): Promise<Blob> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const cleanFileId = fileId ? fileId.trim() : "";
    if (!cleanFileId) {
      throw new Error("fileId is required");
    }

    const response = await apiClient.get<Blob>(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/files/${encodeURIComponent(cleanFileId)}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }

  static async deleteFile(taskId: string, fileId: string): Promise<void> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const cleanFileId = fileId ? fileId.trim() : "";
    if (!cleanFileId) {
      throw new Error("fileId is required");
    }

    await apiClient.delete(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/files/${encodeURIComponent(cleanFileId)}`
    );
  }

  static async confirmContribution(
    taskId: string,
    payload: CreateContributionConfirmationPayload
  ): Promise<ContributionConfirmationResponse> {
    const cleanTaskId = taskId ? taskId.trim() : "";
    if (!cleanTaskId) {
      throw new Error("taskId is required");
    }

    const response = await apiClient.post<ContributionConfirmationResponse>(
      `/api/tasks/${encodeURIComponent(cleanTaskId)}/contribution-confirmations`,
      {
        commitShas: payload?.commitShas || [],
        pullRequests: payload?.pullRequests || [],
      }
    );
    return response.data;
  }
}
