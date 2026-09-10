import { apiClient } from "@/lib/axios";
import type {
  StudentTeamProjectResponse,
  ProjectTypeItem,
  CreateStudentProjectRequest,
  ProjectIntegrationsResponse,
  ProjectGitHubConnectResponse,
  ConnectProjectGitHubOptions,
  GitHubInstallationCandidateItem,
  ProjectAvailableGitHubRepositoryItem,
  ProjectGitHubSetupCallbackParams,
  SelectProjectGitHubRepoPayloadItem,
  ProjectJiraConnectResponse,
  ProjectJiraSiteItem,
  ProjectJiraProjectItem,
  ProjectJiraBoardItem,
  UpdateProjectJiraPayload,
} from "../types/student-project";

export class StudentProjectService {
  static async getStudentTeamProject(courseId: string): Promise<StudentTeamProjectResponse> {
    if (!courseId || courseId.trim() === "") {
      throw new Error("Throw ValidationException: Course ID is required");
    }
    const cleanCourseId = courseId.trim();
    const res = await apiClient.get<StudentTeamProjectResponse>(
      `/api/student/courses/${encodeURIComponent(cleanCourseId)}/project`
    );
    return res.data;
  }

  static async getProjectTypes(): Promise<ProjectTypeItem[]> {
    const res = await apiClient.get<ProjectTypeItem[]>("/api/student/project-types");
    return res.data;
  }

  static async createStudentProject(
    courseId: string,
    payload: CreateStudentProjectRequest
  ): Promise<StudentTeamProjectResponse> {
    if (!courseId || courseId.trim() === "") throw new Error("Throw ValidationException: Course ID is required");
    if (!payload.name?.trim()) throw new Error("Throw ValidationException: Project name is required");
    if (!payload.projectTypeId?.trim()) throw new Error("Throw ValidationException: Project type ID is required");
    if (!payload.description?.trim()) throw new Error("Throw ValidationException: Project description is required");

    const cleanCourseId = courseId.trim();
    const res = await apiClient.post<StudentTeamProjectResponse>(
      `/api/student/courses/${encodeURIComponent(cleanCourseId)}/project`,
      {
        name: payload.name.trim(),
        projectTypeId: payload.projectTypeId.trim(),
        description: payload.description.trim(),
      }
    );
    return res.data;
  }

  static async getProjectIntegrations(projectId: string): Promise<ProjectIntegrationsResponse> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectIntegrationsResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations`
    );
    return res.data;
  }

  static async disconnectProjectJira(projectId: string): Promise<void> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    await apiClient.delete(`/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/jira`);
  }

  static async disconnectProjectGitHub(projectId: string): Promise<void> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    await apiClient.delete(`/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/github`);
  }

  static async connectProjectGitHub(
    projectId: string,
    options?: string | ConnectProjectGitHubOptions
  ): Promise<ProjectGitHubConnectResponse> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();

    let params: Record<string, string> | undefined = undefined;
    if (typeof options === "string") {
      if (options.trim()) {
        params = { returnPath: options.trim() };
      }
    } else if (options) {
      const p: Record<string, string> = {};
      if (options.returnPath?.trim()) {
        p.returnPath = options.returnPath.trim();
      }
      if (options.installationId !== undefined && options.installationId !== null && String(options.installationId).trim()) {
        p.installationId = String(options.installationId).trim();
      }
      if (options.mode?.trim()) {
        p.mode = options.mode.trim();
      }
      if (Object.keys(p).length > 0) {
        params = p;
      }
    }

    const res = await apiClient.post<ProjectGitHubConnectResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/github/connect`,
      null,
      { params }
    );
    return res.data;
  }

  /** Lấy danh sách các cài đặt GitHub có thể kết nối lại: GET /api/projects/{projectId}/integrations/github/reconnect/candidates */
  static async getProjectGitHubReconnectCandidates(
    projectId: string
  ): Promise<GitHubInstallationCandidateItem[]> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<GitHubInstallationCandidateItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/github/reconnect/candidates`
    );
    return res.data || [];
  }

  /** Lấy danh sách repository khả dụng: GET /api/projects/{projectId}/integrations/github/repositories */
  static async getProjectAvailableGitHubRepositories(
    projectId: string
  ): Promise<ProjectAvailableGitHubRepositoryItem[]> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectAvailableGitHubRepositoryItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/github/repositories`
    );
    return res.data;
  }

  static async handleProjectGitHubSetupCallback(
    projectId: string,
    params: ProjectGitHubSetupCallbackParams
  ): Promise<unknown> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    if (!params.state || !params.installation_id) {
      throw new Error("Throw ValidationException: state and installation_id are required");
    }

    const cleanProjectId = projectId.trim();
    const queryParams: Record<string, string> = {
      state: String(params.state).trim(),
      installation_id: String(params.installation_id).trim(),
    };
    if (params.code) queryParams.code = params.code.trim();

    const res = await apiClient.get(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/github/setup/callback`,
      { params: queryParams }
    );
    return res.data;
  }

  static async updateProjectGitHubRepositories(
    projectId: string,
    repositories: SelectProjectGitHubRepoPayloadItem[]
  ): Promise<unknown> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    const res = await apiClient.put(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/github/repositories`,
      repositories
    );
    return res.data;
  }

  static async connectProjectJira(
    projectId: string,
    returnPath?: string
  ): Promise<ProjectJiraConnectResponse> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    const params = returnPath ? { returnPath: returnPath.trim() } : undefined;
    const res = await apiClient.post<ProjectJiraConnectResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/jira/connect`,
      null,
      { params }
    );
    return res.data;
  }

  static async getProjectJiraSites(projectId: string): Promise<ProjectJiraSiteItem[]> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectJiraSiteItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/jira/sites`
    );
    return res.data;
  }

  static async getProjectJiraProjects(
    projectId: string,
    cloudId: string
  ): Promise<ProjectJiraProjectItem[]> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    if (!cloudId || cloudId.trim() === "") throw new Error("Throw ValidationException: cloudId is required");
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectJiraProjectItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/jira/projects`,
      { params: { cloudId: cloudId.trim() } }
    );
    return res.data;
  }

  static async getProjectJiraBoards(
    projectId: string,
    cloudId: string,
    jiraProjectId: string
  ): Promise<ProjectJiraBoardItem[]> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    if (!cloudId || cloudId.trim() === "") throw new Error("Throw ValidationException: cloudId is required");
    if (!jiraProjectId || jiraProjectId.trim() === "") throw new Error("Throw ValidationException: jiraProjectId is required");
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectJiraBoardItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/jira/boards`,
      { params: { cloudId: cloudId.trim(), jiraProjectId: jiraProjectId.trim() } }
    );
    return res.data;
  }

  static async updateProjectJira(
    projectId: string,
    payload: UpdateProjectJiraPayload
  ): Promise<unknown> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    if (!payload.cloudId || payload.cloudId.trim() === "") throw new Error("Throw ValidationException: cloudId is required");
    if (!payload.jiraProjectId || payload.jiraProjectId.trim() === "") throw new Error("Throw ValidationException: jiraProjectId is required");
    const cleanProjectId = projectId.trim();
    const res = await apiClient.put(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/jira`,
      payload
    );
    return res.data;
  }
}
