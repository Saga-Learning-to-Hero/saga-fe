export type JiraSourceStatus = "ACTIVE" | "REVOKED" | "UNAVAILABLE" | string;

export interface JiraSourceSummary {
  integrationId: string;
  cloudId: string;
  siteName: string;
  jiraProjectId: string;
  projectKey: string;
  boardId?: string | null;
  connectionStatus: JiraSourceStatus;
  lastSuccessfulSyncAt?: string | null;
  lastSyncedAt?: string | null;
  consecutiveFailures?: number | null;
  lastErrorCode?: string | null;
}

export type FailoverItemClassification =
  | "ELIGIBLE"
  | "BLOCKED"
  | "ALREADY_SUPERSEDED"
  | "ALREADY_IN_FAILOVER"
  | "RECONCILIATION_REQUIRED"
  | "SKIP_DONE"
  | string;

export type FailoverReadiness = "READY" | "WARNING" | "BLOCKED" | string;

export type PlannedStatusHandling =
  | "PROVIDER_DEFAULT"
  | "OPTIONAL_TRANSITION_IF_UNAMBIGUOUS"
  | string;

export type PlannedSprintPlacement = "TARGET_SPRINT" | "BACKLOG" | string;

export interface FailoverCounts {
  totalActive: number;
  eligible: number;
  blocked: number;
  alreadySuperseded: number;
  alreadyInFailover: number;
  reconciliationRequired: number;
  skippedDone: number;
  ready: number;
  withWarnings: number;
}

export interface FailoverFieldMappingPreview {
  resolvedIssueTypeId?: string | null;
  resolvedIssueTypeName?: string | null;
  issueTypeMatchedByName: boolean;
  resolvedPriorityId?: string | null;
  resolvedPriorityName?: string | null;
  targetAssigneeAccountId?: string | null;
  assigneePreserved: boolean;
  unassignedReason?: string | null;
}

export interface FailoverPlannedCopyPreview {
  summary: string;
  descriptionIncluded: boolean;
  storyPointsIncluded: boolean;
}

export interface FailoverParentPreview {
  sourceParentKey?: string | null;
  mappedTargetParentKey?: string | null;
  preserved: boolean;
}

export interface FailoverPreviewItem {
  sourceTaskId: string;
  externalKey: string;
  title: string;
  status: string;
  taskType: string;
  issueTypeName: string;
  classification: FailoverItemClassification;
  readiness: FailoverReadiness;
  blockers: string[];
  warnings: string[];
  mapping: FailoverFieldMappingPreview;
  plannedCopy: FailoverPlannedCopyPreview;
  plannedStatusHandling: PlannedStatusHandling;
  plannedSprint: PlannedSprintPlacement;
  plannedTargetSprintId?: string | null;
  parentTaskId?: string | null;
  parent?: FailoverParentPreview | null;
  claimRunId?: string | null;
  claimItemId?: string | null;
  supersededTargetTaskId?: string | null;
  supersededTargetExternalKey?: string | null;
  supersededRunId?: string | null;
}

export interface TargetOptionIssueType {
  id: string;
  name: string;
  subtask: boolean;
}

export interface TargetOptionPriority {
  id: string;
  name: string;
}

export interface TargetOptionSprint {
  id: string;
  externalSprintId?: string | null;
  name: string;
  state: string;
}

export interface TargetOptionsSummary {
  issueTypes: TargetOptionIssueType[];
  priorities: TargetOptionPriority[];
  sprints: TargetOptionSprint[];
}

export interface JiraFailoverPreviewRequest {
  targetIntegrationId: string;
  targetSprintId?: string | null;
  defaultIssueTypeId?: string | null;
  page?: number;
  size?: number;
}

export interface JiraFailoverPreviewResponse {
  projectId: string;
  sourceIntegrationId: string;
  targetIntegrationId: string;
  targetSprintId?: string | null;
  defaultIssueTypeId?: string | null;
  sourceLastSuccessfulSyncAt?: string | null;
  dependencyRemap?: string;
  counts: FailoverCounts;
  items: FailoverPreviewItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  totalEligible: number;
  targetOptions: TargetOptionsSummary;
}

export interface JiraFailoverExecuteRequest {
  targetIntegrationId: string;
  targetSprintId?: string | null;
  defaultIssueTypeId?: string | null;
  revokeSource: boolean;
  sourceTaskIds: string[];
}

export type JiraFailoverRunStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "PARTIAL"
  | "FAILED"
  | "RECONCILIATION_REQUIRED"
  | "CANCELLED"
  | string;

export interface JiraFailoverExecuteResponse {
  runId: string;
  status: JiraFailoverRunStatus;
  itemCount: number;
}

export type JiraFailoverItemStatus =
  | "PENDING"
  | "CREATING"
  | "REMOTE_BOUND"
  | "SUCCEEDED"
  | "FAILED"
  | "REMOTE_OUTCOME_UNKNOWN"
  | "SKIPPED"
  | "ABANDONED"
  | string;

export interface FailoverRunItem {
  id: string;
  sourceTaskId: string;
  sourceExternalKey: string;
  sourceTitle: string;
  status: JiraFailoverItemStatus;
  targetTaskId?: string | null;
  targetExternalKey?: string | null;
  remoteIssueId?: string | null;
  remoteIssueKey?: string | null;
  errorCode?: string | null;
  reconciliationRequired: boolean;
}

export interface JiraFailoverRunResponse {
  id: string;
  sourceIntegrationId: string;
  targetIntegrationId: string;
  status: JiraFailoverRunStatus;
  itemCounts: Record<string, number>;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  items: FailoverRunItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export interface ProjectSyncEnqueueResponse {
  jobId?: string;
  status?: string;
  provider?: string;
  message?: string;
}

export interface JiraFailoverReconcileRequest {
  remoteIssueIdOrKey: string;
}

export interface TaskMigrationLink {
  taskId: string;
  externalKey: string;
  jiraIntegrationId?: string | null;
  runId?: string | null;
  sourceName?: string | null;
}

export interface TaskMigrationSummary {
  migratedFrom?: TaskMigrationLink | null;
  migratedTo?: TaskMigrationLink | null;
  superseded: boolean;
}
