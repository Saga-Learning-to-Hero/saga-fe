import type { AiAnalysisFailure } from "./ai-analysis";

/** AI review status of one commit, decided by the backend from the AI verdicts (never by the AI). */
export type CommitAiReviewStatus =
  | "PASS"
  | "WARNING"
  | "PENDING"
  | "FAILED"
  | "SKIPPED_MERGE"
  | "NO_KEY"
  | "NOT_REVIEWED"
  | "INSUFFICIENT_DATA";

export type CommitAiReviewReasonCode =
  | "MESSAGE"
  | "CODE"
  | "TASK_MISMATCH"
  | "TASK_PARTIAL"
  | "NO_TASK";

export interface CommitAiReviewReason {
  code: CommitAiReviewReasonCode | string;
  label: string;
}

/** Badge data returned with every commit of `GET /commits` (field `aiReview`). */
export interface CommitAiReviewSummary {
  status: CommitAiReviewStatus | string;
  label: string;
  reasons: CommitAiReviewReason[];
  taskLinked: boolean;
}

export interface CommitAiReviewLocation {
  kind: "DIFF_HUNK" | "COMMIT_MESSAGE" | "TASK_FIELD" | "SYLLABUS" | "OTHER" | string;
  path: string | null;
  hunkId: string | null;
  snippet: string | null;
  label: string | null;
}

export interface CommitAiReviewFinding {
  code: string;
  message: string;
  locations: CommitAiReviewLocation[];
}

export interface CommitAiMessageReview {
  verdict: string | null;
  verdictLabel: string | null;
  score: number | null;
  summary: string | null;
  suggestedMessage: string | null;
  findings: CommitAiReviewFinding[];
}

export interface CommitAiCodeReview {
  verdict: string | null;
  verdictLabel: string | null;
  confidence: number | null;
  findings: CommitAiReviewFinding[];
  coverage: {
    filesTotal: number | null;
    filesAnalyzed: number | null;
    filesOmitted: number | null;
    complete: boolean;
  } | null;
}

export interface CommitAiTaskAlignment {
  taskId: string;
  externalKey: string | null;
  title: string | null;
  verdict: string | null;
  verdictLabel: string | null;
  confidence: number | null;
  summary: string | null;
}

export interface CommitAiLinkedTask {
  taskId: string;
  externalKey: string | null;
  title: string | null;
  status: string | null;
  /** AUTO = Jira key in the commit/branch; MANUAL = attached by hand (display only, never scored). */
  source: "AUTO" | "MANUAL" | string;
  canUnlink: boolean;
}

export interface CommitAiReviewDetail {
  commitId: string;
  sha: string | null;
  message: string | null;
  merge: boolean;
  status: CommitAiReviewStatus | string;
  label: string;
  headline: string;
  reasons: CommitAiReviewReason[];
  canRequestReview: boolean;
  /** MERGE (never reviewed: hide the AI button) | NO_KEY | null */
  reviewBlockedReason: "MERGE" | "READ_ONLY" | "NOT_ALLOWED" | "NO_KEY" | string | null;
  keySource: "TEAM" | "COURSE" | "NONE" | string;
  canManageLinks: boolean;
  analysisId: string | null;
  reviewedAt: string | null;
  provider: string | null;
  modelId: string | null;
  messageReview: CommitAiMessageReview | null;
  codeReview: CommitAiCodeReview | null;
  taskReview: {
    verdict: string | null;
    verdictLabel: string | null;
    alignments: CommitAiTaskAlignment[];
    linkedTasks: CommitAiLinkedTask[];
  };
  failure: AiAnalysisFailure | null;
}

export interface CommitAiBackfillResult {
  queued: number;
  skipped: number;
  failed: number;
}

export interface TeamAiKeyModelOption {
  provider: "GEMINI" | "OPENAI" | "COHERE" | string;
  modelId: string;
  displayName: string;
  freeTierEligible: boolean;
  recommended: boolean;
}

export interface TeamAiKeyStatus {
  configured: boolean;
  provider: string | null;
  modelId: string | null;
  /** UNVERIFIED | ACTIVE | DEGRADED | INVALID */
  status: string | null;
  lastFour: string | null;
  lastErrorCode: string | null;
  lastError: AiAnalysisFailure | null;
  lastSuccessfulUseAt: string | null;
  updatedAt: string | null;
  canManage: boolean;
  courseFallbackAvailable: boolean;
  models: TeamAiKeyModelOption[];
}

export interface SaveTeamAiKeyRequest {
  provider: string;
  modelId: string;
  apiKey: string;
}

/** Lecturer: which teams may fall back to the course key (`/api/lecturer/courses/{courseId}/ai/team-access`). */
export interface CourseAiTeamAccess {
  teamId: string;
  teamNo: number | null;
  teamName: string | null;
  projectId: string | null;
  projectName: string | null;
  teamKey: { configured: boolean; provider: string | null; modelId: string | null; status: string | null };
  courseKeyAllowed: boolean;
  /** TEAM | COURSE | NONE */
  effectiveKey: string;
}

export interface CourseAiTeamAccessResponse {
  courseKeyConfigured: boolean;
  automationEnabled: boolean;
  teams: CourseAiTeamAccess[];
}
