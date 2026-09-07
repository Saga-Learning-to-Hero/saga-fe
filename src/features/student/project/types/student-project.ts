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
