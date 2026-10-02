export type DelayCaseStatus =
  | "OPEN"
  | "AWAITING_LEADER"
  | "AWAITING_LECTURER"
  | "CLOSED_OBJECTIVE"
  | "CLOSED_SUBJECTIVE"
  | (string & {});

export type DelayCauseCategory =
  | "BLOCKED_BY_TASK"
  | "SCOPE_CHANGED"
  | "REASSIGNED_LATE"
  | "SCHEDULE_CHANGED"
  | "TECHNICAL_ISSUE"
  | "PERSONAL_EMERGENCY"
  | "STARTED_LATE"
  | "UNDERESTIMATED"
  | "NO_PROGRESS"
  | "OTHER"
  | (string & {});

export type CategoryGroup = "OBJECTIVE" | "SUBJECTIVE" | "OTHER" | (string & {});

export type Verification = "CONSISTENT" | "MISMATCH" | "UNVERIFIABLE" | (string & {});

export type LeaderDecision = "AGREE" | "DISAGREE" | (string & {});

export type LecturerOutcome = "OBJECTIVE" | "SUBJECTIVE" | (string & {});

export type CloseReason = "LEADER_CONFIRMED" | "LECTURER_DECIDED" | "EXPLANATION_EXPIRED" | (string & {});

export interface DelaySignals {
  commitCount: number;
  firstCommitAt: string | null;
  lastCommitAt: string | null;
  workSessionCount: number;
  firstWorkAt: string | null;
  lastWorkAt: string | null;
  evidenceCount: number;
  currentlyBlocked: boolean;
  dueDateChanged: boolean;
  storyPointIncreased: boolean;
  reassignedNearDue: boolean;
  otherOpenTasksNearDue: number;
}

export interface DelayCasePermissions {
  canExplain: boolean;
  canLeaderReview: boolean;
  canLecturerReview: boolean;
  canReopen: boolean;
}

export interface DelayCaseTask {
  id: string;
  externalKey: string;
  title: string;
}

export interface DelayCaseStudent {
  studentProfileId: string;
  userId: string;
  fullName: string;
  studentCode: string;
}

export interface DelayCaseResponse {
  id: string;
  projectId: string;
  task: DelayCaseTask;
  student: DelayCaseStudent;
  dueDate: string; // date-only
  openedAt: string; // no offset
  explanationDueAt: string; // no offset

  status: DelayCaseStatus;

  category?: DelayCauseCategory | null;
  categoryGroup?: CategoryGroup | null;
  explanationNote?: string | null; // masked based on permission
  blockingTask?: DelayCaseTask | null;
  evidenceUrl?: string | null; // masked based on permission
  explainedAt?: string | null;

  verification?: Verification | null;
  verificationNote?: string | null;

  leaderDecision?: LeaderDecision | null;
  leaderComment?: string | null; // masked based on permission
  leaderReviewedAt?: string | null;

  lecturerOutcome?: LecturerOutcome | null;
  lecturerComment?: string | null; // masked based on permission
  lecturerReviewedAt?: string | null;

  closeReason?: CloseReason | null;
  closedAt?: string | null;

  signals: DelaySignals;
  permissions: DelayCasePermissions;
}

export interface OnTimeRateMember {
  studentProfileId: string;
  evaluatedTasks: number;
  onTimeTasks: number;
  lateTasks: number;
  excusedLateTasks: number;
  onTimeRate: number | null;
}

export interface OnTimeRateResponse {
  projectId: string;
  asOf: string;
  members: OnTimeRateMember[];
}

export interface ExplainDelayCaseRequest {
  category: DelayCauseCategory;
  note?: string;
  blockingTaskId?: string;
  evidenceUrl?: string;
}

export interface LeaderReviewRequest {
  decision: LeaderDecision;
  comment?: string;
}

export interface LecturerReviewRequest {
  outcome: LecturerOutcome;
  comment?: string;
}
