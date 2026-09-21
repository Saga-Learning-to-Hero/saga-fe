export type LecturerDashboardScope = "CURRENT_SPRINT";

export type LecturerDashboardRiskLevel = "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";

export type LecturerDashboardRiskCode =
  | "NO_PROJECT"
  | "NO_ACTIVE_SPRINT"
  | "INACTIVE"
  | "DATA_UNAVAILABLE"
  | "SCHEDULE_LAG"
  | "BLOCKED_TASKS"
  | "OVERDUE_TASKS"
  | "MISSING_TASK_COMMIT_LINK"
  | "JIRA_SYNC_FAILED"
  | "GITHUB_SYNC_FAILED"
  | "CONTRIBUTION_CONFIG_MISSING"
  | "PEER_REVIEW_INCOMPLETE";

export type LecturerDashboardRiskUnit =
  | "COUNT"
  | "DAY"
  | "PERCENTAGE_POINT"
  | "TASK"
  | "REVIEW";

export type LecturerDashboardContributionMode = "COURSE" | "PROJECT_GROUP";

export type LecturerDashboardChannelStatus = "ACTIVE" | "DEGRADED" | "REVOKED";

export type LecturerDashboardSyncJobStatus = "RUNNING" | "SUCCEEDED" | "FAILED";

export interface LecturerDashboardRiskPolicy {
  inactivityWarningDays: number;
  inactivityCriticalDays: number;
  scheduleLagWarningPercentagePoints: number;
  scheduleLagCriticalPercentagePoints: number;
  peerReviewWarningElapsedPercent: number;
}

export interface LecturerDashboardSummary {
  enrolledStudents: number;
  unassignedStudents: number;
  totalTeams: number;
  healthyTeams: number;
  warningTeams: number;
  criticalTeams: number;
  unknownTeams: number;
  teamsWithoutProject: number;
  teamsWithoutActiveSprint: number;
  teamsWithSyncFailure: number;
}

export interface LecturerDashboardTaskStatusTotals {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  blocked: number;
  overdue: number;
  completionPercent: number | null;
}

export interface LecturerDashboardCurrentSprint {
  sprintId: string;
  sprintName: string;
  state: string;
  startDate: string | null;
  endDate: string | null;
  elapsedPercent: number | null;
}

export interface LecturerDashboardProgress {
  totalTasks: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  blocked: number;
  overdue: number;
  completionPercent: number | null;
  scheduleGapPercentagePoints: number | null;
}

export interface LecturerDashboardActivityPoint {
  date: string;
  commits: number;
  tasks: number;
  peerReviews: number;
  documents: number;
  totalActivities: number;
}

export interface LecturerDashboardActivity {
  lastActivityAt: string | null;
  inactiveDays: number | null;
  totalActivities: number;
  series: LecturerDashboardActivityPoint[];
}

export interface LecturerDashboardTraceability {
  completedTasks: number;
  completedTasksWithCommit: number;
  completedTasksWithoutCommit: number;
  linkedCommits: number;
  unlinkedCommits: number;
  taskCommitLinkRate: number | null;
}

export interface LecturerDashboardPeerReview {
  expectedReviews: number;
  submittedReviews: number;
  completionRate: number | null;
  pendingStudentCount: number;
  pendingStudentProfileIds: string[];
  deadlineAt: string | null;
}

export interface LecturerDashboardSync {
  jiraStatus: LecturerDashboardChannelStatus | null;
  jiraSyncStatus: LecturerDashboardSyncJobStatus | null;
  jiraLastSuccessfulSyncAt: string | null;
  githubStatus: LecturerDashboardChannelStatus | null;
  githubSyncStatus: LecturerDashboardSyncJobStatus | null;
  githubLastSuccessfulSyncAt: string | null;
}

export interface LecturerDashboardConfiguration {
  contributionMode: LecturerDashboardContributionMode;
  contributionWeightsConfigured: boolean;
}

export interface LecturerDashboardPreviousSprintComparison {
  sprintId: string;
  sprintName: string;
  completionDeltaPercentagePoints: number | null;
  activityDeltaPercent: number | null;
  traceabilityDeltaPercentagePoints: number | null;
}

export interface LecturerDashboardRiskReason {
  code: LecturerDashboardRiskCode | string;
  severity: LecturerDashboardRiskLevel;
  actualValue: number | null;
  thresholdValue: number | null;
  unit: LecturerDashboardRiskUnit | string;
  affectedStudentProfileIds: string[];
}

export interface LecturerDashboardRisk {
  level: LecturerDashboardRiskLevel;
  reasons: LecturerDashboardRiskReason[];
}

export interface LecturerDashboardTeam {
  teamId: string;
  teamNo: number;
  teamName: string;
  projectId: string | null;
  projectName: string | null;
  memberCount: number;
  currentSprint: LecturerDashboardCurrentSprint | null;
  progress: LecturerDashboardProgress | null;
  activity: LecturerDashboardActivity | null;
  traceability: LecturerDashboardTraceability | null;
  peerReview: LecturerDashboardPeerReview | null;
  sync: LecturerDashboardSync | null;
  configuration: LecturerDashboardConfiguration;
  previousSprintComparison: LecturerDashboardPreviousSprintComparison | null;
  risk: LecturerDashboardRisk;
  reminder: null;
}

export interface LecturerCourseDashboardResponse {
  courseId: string;
  courseCode: string;
  subjectCode: string | null;
  subjectName: string | null;
  classCode: string | null;
  semesterCode: string | null;
  scope: LecturerDashboardScope;
  generatedAt: string;
  riskPolicy: LecturerDashboardRiskPolicy;
  summary: LecturerDashboardSummary;
  taskStatusTotals: LecturerDashboardTaskStatusTotals;
  teams: LecturerDashboardTeam[];
}
