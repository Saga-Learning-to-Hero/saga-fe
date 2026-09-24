export type AiArtifactType = "COMMIT" | "TASK" | "STUDENT" | "TEAM" | "COURSE";

export type AiAnalysisType =
  | "COMMIT_INTELLIGENCE"
  | "ACADEMIC_CLASSIFICATION"
  | "TASK_INTELLIGENCE"
  | "RISK_ANALYSIS"
  | "PROGRESS_NARRATIVE";

export type AiAnalysisStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type AiProviderRole = "PRIMARY" | "SECONDARY";

export type AiRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type AiTaskEvidenceStrength =
  | "NO_EVIDENCE"
  | "EARLY_EVIDENCE"
  | "ACTIVE_PROGRESS"
  | "SUBSTANTIAL_EVIDENCE"
  | "COMPLETED_EVIDENCE"
  | "INSUFFICIENT_EVIDENCE";

export type AiAcademicTargetType = "PHASE" | "EXPECTED_DELIVERABLE";

export type AiAcademicReviewAction = "CONFIRM" | "REJECT" | "CORRECT";

export type AiAcademicClassificationStatus = "PROPOSED" | "CONFIRMED" | "REJECTED" | "CORRECTED";

export type AiAcademicProvenance = "AI" | "HUMAN";

export type AiCommitMessageVerdict =
  | "EXCELLENT"
  | "GOOD"
  | "ACCEPTABLE"
  | "POOR"
  | "UNINFORMATIVE";

export type AiCodeVerdict = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "SUSPICIOUS";

export type AiTaskAlignmentVerdict =
  | "ALIGNED"
  | "PARTIALLY_ALIGNED"
  | "MISALIGNED"
  | "NO_LINKED_TASK";

export type AiOverallDecision = "ACCEPTED" | "REJECTED" | "FLAGGED" | "HUMAN_REVIEW_REQUIRED";
