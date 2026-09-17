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
  parent?: {
    externalId?: string | null;
    externalKey?: string | null;
  } | null;
  assigneeExternalId: string | null;
  assigneeStudentId: string | null;
  assigneeDisplayName?: string | null;
  sprint?: {
    id: string;
    name: string;
    state?: string;
    externalSprintId?: string | null;
  } | null;
  storyPoint?: number | null;
  priority?: string | null;
  jiraStatusName?: string | null;
  labels?: string[];
  dueDate?: string | null;
  startDate?: string | null;
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
  /** Git ref do backend chiếu từ GitHub; không phải lúc nào cũng có. */
  headRef?: string | null;
  committedAt: string;
  createdAt: string;
}

export type ProjectCommitItem = TaskLinkedCommitItem;

export interface ProjectProgressTaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  blocked: number;
  completionPercent: number | null;
}

export interface ProjectProgressSprintSummary {
  id: string;
  externalSprintId: string;
  name: string;
  state: string;
  startDate: string | null;
  endDate: string | null;
  totalTasks: number;
  completedTasks: number;
}

export interface ProjectProgressCommitSummary {
  total: number;
  linked: number;
  lastCommitAt: string | null;
}

export interface ProjectProgressEvidenceSummary {
  workSessions: number;
  files: number;
  webLinks: number;
  confirmations: number;
}

export interface ProjectProgressTaskAttribution {
  assigned: number;
  assignedTotal: number;
  completed: number;
  incomplete: number;
  inProgress: number;
  blocked: number;
}

export interface ProjectProgressCommitAttribution {
  total: number;
  linkedToTasks: number;
  tasksWithLinkedCommits: number;
  lastCommitAt: string | null;
  lastCommittedAt: string | null;
}

export interface ProjectProgressMemberSummary {
  studentId: string;
  userId: string;
  fullName: string;
  studentCode: string;
  teamRole: string;
  tasks: ProjectProgressTaskAttribution;
  commits: ProjectProgressCommitAttribution;
  evidenceConfirmations: number;
}

export interface ProjectProgressSyncSummary {
  jiraStatus: string | null;
  jiraLastSyncedAt: string | null;
  githubStatus: string | null;
  githubLastSyncedAt: string | null;
}

export interface ProjectProgressResponse {
  projectId: string;
  teamId: string;
  teamNo: number;
  teamName: string;
  taskSummary: ProjectProgressTaskSummary;
  currentSprint: ProjectProgressSprintSummary | null;
  commitSummary: ProjectProgressCommitSummary;
  evidenceSummary: ProjectProgressEvidenceSummary;
  memberProgress: ProjectProgressMemberSummary[];
  sync: ProjectProgressSyncSummary;
  lastActivityAt: string | null;
}

export interface ProjectMemberProgressAssignedTask {
  id: string;
  externalKey: string;
  title: string;
  status: string;
  externalUpdatedAt: string | null;
}

export interface ProjectMemberProgressResponse {
  studentId: string;
  userId: string;
  fullName: string;
  studentCode: string;
  teamRole: string;
  taskSummary: ProjectProgressTaskAttribution;
  assignedTasks: ProjectMemberProgressAssignedTask[];
  commitSummary: ProjectProgressCommitAttribution;
  evidenceSummary: ProjectProgressEvidenceSummary;
}

export interface ProjectGitBranchItem {
  name: string;
  isDefault: boolean;
}

export interface ProjectGitBranchListResponse {
  repoId: string;
  repositoryFullName: string;
  branchCount: number;
  branches: ProjectGitBranchItem[];
}

export interface ProjectTaskCommitLinkFilter {
  repoId: string | null;
  repositoryId: number | null;
  repositoryFullName: string | null;
  branchName: string | null;
  branchResolution: "REACHABLE_AT_SYNC" | string;
  resolvedAt: string | null;
}

export interface ProjectTaskCommitLinkItem {
  taskId: string;
  taskKey: string;
  commitId: string;
  sha: string;
  message: string;
  repoId: string | null;
  repositoryId: number | null;
  repositoryFullName: string | null;
  headRef: string | null;
  branchNames: string[];
  linkedAt: string;
  linkSource: string | null;
}

export interface ProjectTaskCommitLinksResponse {
  projectId: string;
  filter: ProjectTaskCommitLinkFilter;
  links: ProjectTaskCommitLinkItem[];
  page: number;
  size: number;
  total: number;
}

export interface ProjectTaskCommitLinkQuery {
  repoId?: string | null;
  branchName?: string | null;
}

export interface UpdateStudentProjectRequest {
  name: string;
  description: string;
}

export interface ProjectCommitDetailStats {
  total: number;
  additions: number;
  deletions: number;
}

export interface ProjectCommitDetailParent {
  sha: string;
}

export interface ProjectCommitDetailChangedFile {
  filename: string;
  previousFilename: string | null;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string | null;
}

export interface ProjectCommitDetailResponse {
  gitCommitId: string;
  repoId: string;
  repositoryFullName: string;
  sha: string;
  message: string;
  authorName: string;
  authorLogin: string;
  committedAt: string;
  htmlUrl: string;
  stats: ProjectCommitDetailStats;
  parents: ProjectCommitDetailParent[];
  filesTruncated: boolean;
  files: ProjectCommitDetailChangedFile[];
}
