export interface ProjectSprintResponse {
  id: string;
  externalSprintId?: string | number | null;
  name: string;
  state: "active" | "future" | "closed" | string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  completeDate?: string | null;
}

export interface CreateProjectSprintRequest {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
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
}

export interface JiraSprintSummary {
  id: string;
  externalSprintId?: string | null;
  name: string;
  state: string;
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
  issueTypeName: string;
  assigneeExternalId?: string | null;
  assigneeDisplayName?: string | null;
  assigneeStudentId?: string | null;
  assignee?: JiraAssigneeSummary | null;
  priority?: string | null;
  priorityDetail?: JiraPriorityDetail | null;
  storyPoint?: number | null;
  sprint?: JiraSprintSummary | null;
  linkedCommitCount: number;
  externalUpdatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
}

export interface ProjectTaskOptionItem {
  id: string;
  name: string;
  description?: string;
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
