import type { RoleInTeam } from "@/types/auth";

/**
 * Interface phản hồi từ Backend API cho Dự án Sinh viên
 * GET /api/student/courses/{courseId}/project
 */
export interface ProjectTypeSummary {
  id: string;
  code: string;
  name: string;
}

/**
 * Interface cho danh mục Loại dự án từ API:
 * GET /api/student/project-types
 */
export interface ProjectTypeItem {
  id: string;
  code: string;
  name: string;
  description: string;
}

/**
 * Request payload tạo dự án nhóm mới:
 * POST /api/student/courses/{courseId}/project
 */
export interface CreateStudentProjectRequest {
  name: string;
  projectTypeId: string;
  description: string;
}

export interface ProjectCreatorSummary {
  userId: string;
  fullName: string;
}

export interface StudentTeamProjectResponse {
  projectId: string;
  courseId: string;
  teamId: string;
  teamNo: number;
  teamName: string;
  name: string;
  description: string;
  projectType: ProjectTypeSummary;
  createdBy: ProjectCreatorSummary;
  createdAt: string;
}

/**
 * Interface phản hồi từ Backend API cho Nhóm của Sinh viên
 * GET /api/student/courses/{courseId}/team
 */
export interface StudentCourseTeamMember {
  studentCode: string;
  fullName: string;
  role: string;
}

export interface StudentCourseTeamResponse {
  teamId: string;
  teamNo: number;
  teamName: string;
  myRole: string;
  projectId?: string | null;
  members: StudentCourseTeamMember[];
}

export type ProjectCategory = string;

export interface ProjectTeamMember {
  id: string;
  studentCode: string;
  name: string;
  fullName?: string;
  role: RoleInTeam;
  email: string;
  avatar?: string;
  tasksAssigned: number;
  tasksCompleted: number;
  traceabilityScore: number;
  commitsCount?: number;
}

export interface ProjectJiraConfig {
  serverUrl: string;
  projectKey: string;
  projectName?: string;
  connected: boolean;
  lastSyncedAt?: string;
  tasksCount?: number;
}

export interface ProjectGitHubRepo {
  id: string;
  repository: string;
  alias?: string;
  defaultBranch: string;
  connected: boolean;
  lastSyncedAt?: string;
  commitsCount?: number;
  pullRequestsCount?: number;
}

export interface StudentProjectDetails {
  id: string;
  projectId: string;
  courseId: string;
  teamId: string;
  teamNo: number;
  teamName: string;
  name: string;
  description: string;
  projectType: ProjectTypeSummary;
  createdBy: ProjectCreatorSummary;
  createdAt: string;

  // Thuộc tính hiển thị UI & tích hợp
  category?: string;
  groupName?: string;
  members?: ProjectTeamMember[];
  jiraConfig?: ProjectJiraConfig;
  githubRepositories?: ProjectGitHubRepo[];
  updatedAt?: string;
}

/**
 * Interface cho phản hồi API Tích hợp Đồ án:
 * GET /api/projects/{projectId}/integrations
 */
export interface ProjectGitHubRepositoryItem {
  id: string;
  repositoryId: number;
  fullName: string;
  role?: string;
  status?: "ACTIVE" | "REVOKED" | string;
}

export interface ProjectGitHubIntegration {
  installationId?: number;
  accountLogin?: string;
  status?: "ACTIVE" | "REVOKED" | string;
  repositories: ProjectGitHubRepositoryItem[];
}

export interface ProjectJiraIntegration {
  cloudId?: string;
  siteName?: string;
  projectKey?: string;
  boardId?: string;
  status?: "ACTIVE" | "REVOKED" | string;
}

export interface ProjectIntegrationsResponse {
  github: ProjectGitHubIntegration | null;
  jira: ProjectJiraIntegration | null;
}

export interface ProjectGitHubConnectResponse {
  authorizationUrl: string;
  state: string;
}

export interface ProjectAvailableGitHubRepositoryItem {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  privateRepo: boolean;
}

export interface ProjectGitHubSetupCallbackParams {
  state: string;
  installation_id: number | string;
  code?: string;
}

export interface SelectProjectGitHubRepoPayloadItem {
  repositoryId: number;
  role: "FRONTEND" | "BACKEND" | "FULLSTACK" | "DOCS" | "OTHER" | string;
}

export interface ProjectJiraConnectResponse {
  authorizationUrl: string;
  state: string;
}

export interface ProjectJiraSiteItem {
  id: string;
  url: string;
  name: string;
}

export interface ProjectJiraProjectItem {
  id: string;
  key: string;
  name: string;
}

export interface ProjectJiraBoardItem {
  id: string;
  name: string;
  type: string;
}

export interface UpdateProjectJiraPayload {
  cloudId: string;
  jiraProjectId: string;
  boardId?: string | null;
}

