import { apiClient } from "@/lib/axios";
import type {
  ProjectTaskResponse,
  CreateProjectTaskRequest,
  PatchProjectTaskRequest,
  ProjectTaskOptionsResponse,
  ProjectTaskTransitionItem,
  TransitionProjectTaskRequest,
} from "../types/jira-task-types";

export class ProjectTaskService {
  static async getTasks(projectId: string): Promise<ProjectTaskResponse[]> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanId = projectId.trim();
    const res = await apiClient.get<ProjectTaskResponse[]>(
      `/api/projects/${encodeURIComponent(cleanId)}/tasks`
    );
    return res.data;
  }

  static async getTask(
    projectId: string,
    taskId: string
  ): Promise<ProjectTaskResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!taskId || !taskId.trim()) {
      throw new Error("Throw ValidationException: Task ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanTaskId = taskId.trim();
    const res = await apiClient.get<ProjectTaskResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks/${encodeURIComponent(cleanTaskId)}`
    );
    return res.data;
  }

  static async createTask(
    projectId: string,
    data: CreateProjectTaskRequest
  ): Promise<ProjectTaskResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!data.summary || !data.summary.trim()) {
      throw new Error("Throw ValidationException: Task summary is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.post<ProjectTaskResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks`,
      {
        ...data,
        summary: data.summary.trim(),
      }
    );
    return res.data;
  }

  static async patchTask(
    projectId: string,
    taskId: string,
    data: PatchProjectTaskRequest
  ): Promise<ProjectTaskResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!taskId || !taskId.trim()) {
      throw new Error("Throw ValidationException: Task ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanTaskId = taskId.trim();
    const res = await apiClient.patch<ProjectTaskResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks/${encodeURIComponent(cleanTaskId)}`,
      data
    );
    return res.data;
  }

  static async deleteTask(
    projectId: string,
    taskId: string
  ): Promise<void> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!taskId || !taskId.trim()) {
      throw new Error("Throw ValidationException: Task ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanTaskId = taskId.trim();
    await apiClient.delete(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks/${encodeURIComponent(cleanTaskId)}`
    );
  }

  static async getTaskOptions(
    projectId: string
  ): Promise<ProjectTaskOptionsResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectTaskOptionsResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks/options`
    );
    return res.data;
  }

  static async getTaskTransitions(
    projectId: string,
    taskId: string
  ): Promise<ProjectTaskTransitionItem[]> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!taskId || !taskId.trim()) {
      throw new Error("Throw ValidationException: Task ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanTaskId = taskId.trim();
    const res = await apiClient.get<ProjectTaskTransitionItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks/${encodeURIComponent(cleanTaskId)}/transitions`
    );
    return res.data;
  }

  static async transitionTask(
    projectId: string,
    taskId: string,
    data: TransitionProjectTaskRequest
  ): Promise<ProjectTaskResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!taskId || !taskId.trim()) {
      throw new Error("Throw ValidationException: Task ID is required");
    }
    if (!data.transitionId && !data.targetStatusId) {
      throw new Error(
        "Throw ValidationException: Either transitionId or targetStatusId is required"
      );
    }
    const cleanProjectId = projectId.trim();
    const cleanTaskId = taskId.trim();
    const res = await apiClient.post<ProjectTaskResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks/${encodeURIComponent(cleanTaskId)}/transition`,
      data
    );
    return res.data;
  }
}
