import { apiClient } from "@/lib/axios";
import type {
  ProjectSyncResponse,
  ProjectTaskItem,
  ProjectSyncStatusItem,
  TaskLinkedCommitItem,
} from "../types/student-project";

export class ProjectProjectionService {
  static async syncProject(projectId: string): Promise<ProjectSyncResponse> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.post<ProjectSyncResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/sync`
    );
    return res.data;
  }

  static async getProjectTasks(projectId: string): Promise<ProjectTaskItem[]> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectTaskItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks`
    );
    return res.data;
  }

  static async getProjectSyncStatus(projectId: string): Promise<ProjectSyncStatusItem[]> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectSyncStatusItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/sync-status`
    );
    return res.data;
  }

  static async getTaskCommits(
    projectId: string,
    taskId: string
  ): Promise<TaskLinkedCommitItem[]> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!taskId || taskId.trim() === "") {
      throw new Error("Throw ValidationException: Task ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanTaskId = taskId.trim();
    const res = await apiClient.get<TaskLinkedCommitItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks/${encodeURIComponent(cleanTaskId)}/commits`
    );
    return res.data;
  }

  static async getProjectCommits(projectId: string): Promise<TaskLinkedCommitItem[]> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<TaskLinkedCommitItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/commits`
    );
    return res.data;
  }
}



