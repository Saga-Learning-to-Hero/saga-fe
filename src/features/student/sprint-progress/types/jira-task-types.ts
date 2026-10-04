import type {
  TaskMigrationLink,
  TaskMigrationSummary,
} from "@/features/student/project/types/jira-sources";

export interface ProjectSprintSource {
  jiraIntegrationId?: string | null;
  siteName?: string | null;
  projectKey?: string | null;
  boardId?: string | null;
  connectionStatus?: string | null;
}

export interface ProjectSprintResponse {
  id: string;
  externalSprintId?: string | number | null;
  name: string;
  state: "active" | "future" | "closed" | string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  completeDate?: string | null;
  completedDate?: string | null;
  source?: ProjectSprintSource | null;
  jiraIntegrationId?: string | null;
  overlaps?: SprintOverlapItem[];
  hasOverlap?: boolean;
}

export interface SprintOverlapItem {
  sprintId: string;
  name: string;
  state: string;
  jiraIntegrationId?: string | null;
  siteName?: string;
}

export interface CreateProjectSprintRequest {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  jiraIntegrationId?: string;
}

export interface PatchProjectSprintRequest {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  state?: string;
}

export interface JiraPriorityDetail {
  id: string | null;
  name: string;
}

export interface JiraAssigneeSummary {
  accountId: string;
  displayName: string;
  studentId?: string | null;
  avatarUrl?: string | null;
}

export interface JiraSprintSummary {
  id: string;
  externalSprintId?: string | null;
  name: string;
  state: string;
}

export type IssueTypeLevel =
  | "EPIC"
  | "STANDARD"
  | "SUBTASK"
  | "ABOVE_EPIC"
  | "UNKNOWN";

export type JiraParentResolution = "RESOLVED" | "UNRESOLVED";
export type JiraParentResolutionReason = "PARENT_NOT_SYNCED" | "PARENT_SOURCE_REVOKED";

export interface JiraTaskParent {
  externalId: string;
  externalKey: string;
  taskId: string | null;
  resolution: JiraParentResolution;
  resolutionReason: JiraParentResolutionReason | null;
}

/** @deprecated Dùng JiraTaskParent. Giữ alias để mapper đọc response cũ trong giai đoạn chuyển. */
export type JiraIssueParentSummary = JiraTaskParent;

export interface TaskJiraSourceProvenance {
  integrationId: string;
  siteName?: string | null;
  projectKey?: string | null;
  boardId?: string | null;
  connectionStatus?: string | null;
}

export type EvidenceCheckStatus =
  | "MISSING_COMMIT"
  | "MISSING_DOCUMENT"
  | "MISSING_COMMIT_AND_DOCUMENT"
  | "UNLABELED"
  | "SATISFIED"
  | "NOT_DONE";

export interface TaskEvidenceCheck {
  status: EvidenceCheckStatus;
  requiresCommit: boolean;
  requiresDocument: boolean;
}

export interface ProjectTaskResponse {
  id: string;
  externalId: string;
  externalKey: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED" | string;
  jiraStatusId?: string | null;
  jiraStatusName?: string | null;
  issueTypeId?: string | null;
  issueTypeName: string;
  issueTypeLevel: IssueTypeLevel;
  jiraHierarchyLevel?: number | null;
  assigneeExternalId?: string | null;
  assigneeDisplayName?: string | null;
  assigneeStudentId?: string | null;
  assignee?: JiraAssigneeSummary | null;
  priority?: string | null;
  priorityDetail?: JiraPriorityDetail | null;
  storyPoint?: number | null;
  sprint?: JiraSprintSummary | null;
  sprints?: JiraSprintSummary[] | null;
  parent?: JiraTaskParent | null;
  labels?: string[];
  dueDate?: string | null;
  startDate?: string | null;
  linkedCommitCount: number;
  evidenceCount?: number;
  hasEvidence?: boolean;
  evidenceCheck?: TaskEvidenceCheck | null;
  scheduleCheck?: {
    runsPastSprint?: boolean;
    issues?: string[];
  } | null;
  externalUpdatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks?: {
    id: string;
    title: string;
    status: string;
    externalKey: string;
    issueTypeName: string;
    issueTypeLevel: IssueTypeLevel;
  }[] | null;
  jiraIntegrationId?: string | null;
  source?: TaskJiraSourceProvenance | null;
  superseded?: boolean;
  migratedFrom?: TaskMigrationLink | null;
  migratedTo?: TaskMigrationLink | null;
  migration?: TaskMigrationSummary | null;
}

export interface CreateProjectTaskRequest {
  summary: string;
  description?: string;
  issueTypeId?: string;
  assigneeAccountId?: string;
  priorityId?: string;
  storyPoints?: number;
  sprintId?: number | string;
  sprintExternalId?: string;
  labels?: string[];
  dueDate?: string | null;
  startDate?: string | null;
  jiraParentTaskId?: string | null;
  jiraIntegrationId?: string;
}

export interface PatchProjectTaskRequest {
  summary?: string;
  description?: string;
  issueTypeId?: string;
  assigneeAccountId?: string;
  clearAssignee?: boolean;
  priorityId?: string;
  storyPoints?: number;
  sprintExternalId?: string;
  moveToBacklog?: boolean;
  labels?: string[];
  dueDate?: string | null;
  clearDueDate?: boolean;
  startDate?: string | null;
  clearStartDate?: boolean;
  jiraParentTaskId?: string | null;
  clearJiraParent?: boolean;
}

export interface TaskParentOptionItem {
  id: string;
  title: string;
  status: string;
  externalKey?: string | null;
  level?: IssueTypeLevel;
  jiraHierarchyLevel?: number | null;
}

export interface TaskParentOptionsResponse {
  items: TaskParentOptionItem[];
  page: number;
  size: number;
  total: number;
}

export interface GetTaskParentOptionsParams {
  childIssueTypeId: string;
  jiraIntegrationId: string;
  q?: string;
  page?: number;
  size?: number;
  excludeTaskId?: string;
}

export interface ProjectTaskOptionItem {
  id: string;
  name: string;
  description?: string;
  level: IssueTypeLevel;
  jiraHierarchyLevel?: number | null;
}

export interface ProjectAssignableUser {
  accountId: string;
  displayName: string;
}

export interface ProjectEstimationOption {
  supported: boolean;
  fieldId?: string | null;
  fieldName?: string | null;
}

export interface ProjectTaskOptionsResponse {
  issueTypes: ProjectTaskOptionItem[];
  priorities: ProjectTaskOptionItem[];
  assignableUsers: ProjectAssignableUser[];
  estimation: ProjectEstimationOption;
  sprints: { id: string; name: string; state: string }[];
  labels?: string[];
}

export interface ProjectTaskTransitionItem {
  id: string;
  name: string;
  toStatusId: string;
  toStatusName: string;
}

export interface TransitionProjectTaskRequest {
  transitionId?: string;
  targetStatusId?: string;
}

export interface AssignTaskToSprintPayload {
  sprintId: number | string | null;
}
