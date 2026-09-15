import { apiClient } from "@/lib/axios";
import type {
  ProjectSyncResponse,
  ProjectTaskItem,
  ProjectSyncStatusItem,
  TaskLinkedCommitItem,
  ProjectProgressResponse,
  ProjectMemberProgressResponse,
  ProjectGitBranchListResponse,
  ProjectTaskCommitLinkQuery,
  ProjectTaskCommitLinksResponse,
} from "../types/student-project";

const TASK_COMMIT_LINK_PAGE_SIZE = 200;

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

  static async getRepositoryBranches(
    projectId: string,
    repoId: string
  ): Promise<ProjectGitBranchListResponse> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!repoId || repoId.trim() === "") {
      throw new Error("Throw ValidationException: Repo ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanRepoId = repoId.trim();
    const res = await apiClient.get<ProjectGitBranchListResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/repos/${encodeURIComponent(cleanRepoId)}/branches`
    );
    return res.data;
  }

  static async getProjectTaskCommitLinks(
    projectId: string,
    query: ProjectTaskCommitLinkQuery = {}
  ): Promise<ProjectTaskCommitLinksResponse> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }

    const cleanProjectId = projectId.trim();
    const repoId = query.repoId?.trim() || undefined;
    const branchName = query.branchName?.trim() || undefined;
    if (branchName && !repoId) {
      throw new Error("Throw ValidationException: Repo ID is required when filtering by branch");
    }

    const requestPage = async (page: number) => {
      const res = await apiClient.get<ProjectTaskCommitLinksResponse>(
        `/api/projects/${encodeURIComponent(cleanProjectId)}/task-commit-links`,
        {
          params: {
            ...(repoId ? { repoId } : {}),
            ...(branchName ? { branchName } : {}),
            page,
            size: TASK_COMMIT_LINK_PAGE_SIZE,
          },
        }
      );
      return res.data;
    };

    const firstPage = await requestPage(0);
    const pageCount = Math.ceil(firstPage.total / TASK_COMMIT_LINK_PAGE_SIZE);
    if (pageCount <= 1) return firstPage;

    const remainingPages = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, index) => requestPage(index + 1))
    );
    return {
      ...firstPage,
      links: [firstPage, ...remainingPages].flatMap((page) => page.links),
      size: firstPage.total,
    };
  }

  static async getProjectProgress(projectId: string): Promise<ProjectProgressResponse> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectProgressResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/progress`
    );
    return res.data;
  }

  static async getMemberProgress(
    projectId: string,
    studentId: string
  ): Promise<ProjectMemberProgressResponse> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!studentId || studentId.trim() === "") {
      throw new Error("Throw ValidationException: Student ID is required");
    }
    const cleanProjectId = projectId.trim();
    const cleanStudentId = studentId.trim();
    const res = await apiClient.get<ProjectMemberProgressResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/progress/members/${encodeURIComponent(cleanStudentId)}`
    );
    return res.data;
  }
}
