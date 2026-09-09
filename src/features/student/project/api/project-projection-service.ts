import { apiClient } from "@/lib/axios";
import type {
  ProjectSyncResponse,
  ProjectTaskItem,
  ProjectSyncStatusItem,
  TaskLinkedCommitItem,
} from "../types/student-project";

export class ProjectProjectionService {
  /**
   * Kích hoạt hàng đợi đồng bộ phục hồi dữ liệu Jira và GitHub (Team Leader):
   * POST /api/projects/{projectId}/sync
   * Phản hồi: { projectId, jira, github }
   */
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

  /**
   * Lấy danh sách Jira tasks đã chiếu cho dự án:
   * GET /api/projects/{projectId}/tasks
   */
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

  /**
   * Lấy trạng thái nhật ký đồng bộ gần nhất theo từng nhà cung cấp (Jira / GitHub):
   * GET /api/projects/{projectId}/sync-status
   */
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

  /**
   * Lấy danh sách Git commits liên kết với một Jira task đã chiếu:
   * GET /api/projects/{projectId}/tasks/{taskId}/commits
   */
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

  /**
   * Lấy toàn bộ danh sách Git commits đã chiếu cho dự án:
   * GET /api/projects/{projectId}/commits
   */
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



