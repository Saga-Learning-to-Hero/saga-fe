import type { RoleInTeam } from "@/types/auth";

export interface ProjectTypeSummary {
  id: string;
  code: string;
  name: string;
}

export interface ProjectTypeItem {
  id: string;
  code: string;
  name: string;
  description: string;
}

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
  category?: string;
  groupName?: string;
  members?: ProjectTeamMember[];
  jiraConfig?: ProjectJiraConfig;
  githubRepositories?: ProjectGitHubRepo[];
  updatedAt?: string;
}

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

export interface ConnectProjectGitHubOptions {
  returnPath?: string;
  installationId?: number | string;
  mode?: "install_new" | string;
}

export interface GitHubInstallationCandidateItem {
  id?: number | string;
  installationId?: number | string;
  accountLogin?: string;
  accountName?: string;
  login?: string;
  avatarUrl?: string;
  accountType?: string;
  targetType?: string;
  repositorySelection?: string;
  repositoriesCount?: number;
  [key: string]: unknown;
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

export interface ProjectSyncResponse {
  projectId: string;
  jira: string;
  github: string;
}

export interface ProjectTaskItem {
  id: string;
  externalId: string;
  externalKey: string;
  title: string;
  status: string;
  issueTypeName: string;
  assigneeExternalId: string | null;
  assigneeStudentId: string | null;
  linkedCommitCount: number;
  externalUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSyncStatusItem {
  projectId: string;
  provider: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  itemsProcessed: number;
  itemsFailed: number;
}

export interface TaskLinkedCommitItem {
  id: string;
  repoId: string;
  repositoryFullName: string;
  sha: string;
  message: string;
  authorExternalId?: string | null;
  authorStudentId?: string | null;
  committedAt: string;
  createdAt: string;
}

export type ProjectCommitItem = TaskLinkedCommitItem;




