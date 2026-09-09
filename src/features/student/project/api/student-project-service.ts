import { apiClient } from "@/lib/axios";
import type {
  StudentTeamProjectResponse,
  ProjectTypeItem,
  CreateStudentProjectRequest,
  StudentCourseTeamResponse,
  ProjectIntegrationsResponse,
  ProjectGitHubConnectResponse,
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
  /** Lấy thông tin dự án nhóm của sinh viên: GET /api/student/courses/{courseId}/project */
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

  /** Lấy thông tin nhóm và thành viên: GET /api/student/courses/{courseId}/team */
  static async getStudentTeam(courseId: string): Promise<StudentCourseTeamResponse> {
    if (!courseId || courseId.trim() === "") {
      throw new Error("Throw ValidationException: Course ID is required");
    }
    const cleanCourseId = courseId.trim();
    const res = await apiClient.get<StudentCourseTeamResponse>(
      `/api/student/courses/${encodeURIComponent(cleanCourseId)}/team`
    );
    return res.data;
  }

  /** Lấy danh mục Loại dự án: GET /api/student/project-types */
  static async getProjectTypes(): Promise<ProjectTypeItem[]> {
    const res = await apiClient.get<ProjectTypeItem[]>("/api/student/project-types");
    return res.data;
  }

  /** Tạo dự án nhóm mới (Trưởng nhóm): POST /api/student/courses/{courseId}/project */
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

  /** Lấy thông tin tích hợp Jira/GitHub: GET /api/projects/{projectId}/integrations */
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

  /** Ngắt kết nối Jira: DELETE /api/projects/{projectId}/integrations/jira */
  static async disconnectProjectJira(projectId: string): Promise<void> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    await apiClient.delete(`/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/jira`);
  }

  /** Ngắt kết nối GitHub: DELETE /api/projects/{projectId}/integrations/github */
  static async disconnectProjectGitHub(projectId: string): Promise<void> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    await apiClient.delete(`/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/github`);
  }

  /** Khởi tạo liên kết GitHub: POST /api/projects/{projectId}/integrations/github/connect */
  static async connectProjectGitHub(
    projectId: string,
    returnPath?: string
  ): Promise<ProjectGitHubConnectResponse> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    const params = returnPath ? { returnPath: returnPath.trim() } : undefined;
    const res = await apiClient.post<ProjectGitHubConnectResponse>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/github/connect`,
      null,
      { params }
    );
    return res.data;
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

  /** Xử lý callback sau khi cài đặt GitHub App: GET /api/projects/{projectId}/integrations/github/setup/callback */
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

  /** Chọn danh sách repositories cho dự án (Leader): PUT /api/projects/{projectId}/integrations/github/repositories */
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

  /** Khởi tạo liên kết Jira cho dự án: POST /api/projects/{projectId}/integrations/jira/connect */
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

  /** Lấy danh sách Jira Sites của dự án: GET /api/projects/{projectId}/integrations/jira/sites */
  static async getProjectJiraSites(projectId: string): Promise<ProjectJiraSiteItem[]> {
    if (!projectId || projectId.trim() === "") throw new Error("Throw ValidationException: Project ID is required");
    const cleanProjectId = projectId.trim();
    const res = await apiClient.get<ProjectJiraSiteItem[]>(
      `/api/projects/${encodeURIComponent(cleanProjectId)}/integrations/jira/sites`
    );
    return res.data;
  }

  /** Lấy danh sách Jira Projects theo site: GET /api/projects/{projectId}/integrations/jira/projects */
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

  /** Lấy danh sách Jira Boards theo project: GET /api/projects/{projectId}/integrations/jira/boards */
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

  /** Lưu cấu hình Jira của dự án (Leader): PUT /api/projects/{projectId}/integrations/jira */
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
