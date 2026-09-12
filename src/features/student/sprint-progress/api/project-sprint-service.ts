import { apiClient } from "@/lib/axios";
import type {
  ProjectSprintResponse,
  CreateProjectSprintRequest,
  PatchProjectSprintRequest,
  AssignTaskToSprintPayload,
} from "../types/jira-task-types";

export class ProjectSprintService {
  static async getSprints(projectId: string): Promise<ProjectSprintResponse[]> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanId = projectId.trim();
    const res = await apiClient.get<ProjectSprintResponse[]>(
      `/api/projects/${encodeURIComponent(cleanId)}/sprints`
    );
    return res.data;
  }

  static async getSprint(
    projectId: string,
    sprintId: string
  ): Promise<ProjectSprintResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!sprintId || !sprintId.trim()) {
      throw new Error("Throw ValidationException: Sprint ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanSprintId = sprintId.trim();
    const res = await apiClient.get<ProjectSprintResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/sprints/${encodeURIComponent(cleanSprintId)}`
    );
    return res.data;
  }

  static async createSprint(
    projectId: string,
    data: CreateProjectSprintRequest
  ): Promise<ProjectSprintResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!data.name || !data.name.trim()) {
      throw new Error("Throw ValidationException: Sprint name is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.post<ProjectSprintResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/sprints`,
      {
        name: data.name.trim(),
        goal: data.goal?.trim() || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      }
    );
    return res.data;
  }

  static async patchSprint(
    projectId: string,
    sprintId: string,
    data: PatchProjectSprintRequest
  ): Promise<ProjectSprintResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!sprintId || !sprintId.trim()) {
      throw new Error("Throw ValidationException: Sprint ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanSprintId = sprintId.trim();
    const res = await apiClient.patch<ProjectSprintResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/sprints/${encodeURIComponent(cleanSprintId)}`,
      data
    );
    return res.data;
  }

  static async deleteSprint(
    projectId: string,
    sprintId: string
  ): Promise<void> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!sprintId || !sprintId.trim()) {
      throw new Error("Throw ValidationException: Sprint ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanSprintId = sprintId.trim();
    await apiClient.delete(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/sprints/${encodeURIComponent(cleanSprintId)}`
    );
  }

  static async assignTaskToSprint(
    projectId: string,
    taskId: string,
    sprintId: number | string | null
  ): Promise<void> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!taskId || !taskId.trim()) {
      throw new Error("Throw ValidationException: Task ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanTaskId = taskId.trim();
    const payload: AssignTaskToSprintPayload = {
      sprintId: sprintId !== null && sprintId !== undefined ? sprintId : null,
    };
    await apiClient.put(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/tasks/${encodeURIComponent(cleanTaskId)}/sprint`,
      payload
    );
  }
}
