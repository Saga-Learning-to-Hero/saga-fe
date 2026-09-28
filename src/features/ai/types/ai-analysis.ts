import type {
  AiAnalysisStatus,
  AiCommitMessageVerdict,
  AiCodeVerdict,
  AiTaskAlignmentVerdict,
  AiOverallDecision,
  AiTaskEvidenceStrength,
  AiRiskLevel,
} from "./ai-common";

export interface AiAnalysisEvidenceSummaryResponse {
  id: string;
  evidenceType: string;
  refKey: string;
  summary: string;
}

export interface AiAnalysisDecisionResponse {
  id: string;
  providerRole: string;
  providerKey: string;
  modelId: string;
  modelRevision: string;
  route: string;
  status: string;
  schemaValid: boolean;
  latencyMs: number;
  inputUnits: number;
  outputUnits: number;
  safeErrorCode: string | null;
  structuredResultJson: string | null;
  completedAt: string | null;
  aiProvider?: string | null;
  fallbackAttemptsJson?: string | null;
}

export interface AiAnalysisResponse {
  id: string;
  projectId: string | null;
  courseId: string | null;
  artifactType: string;
  artifactId: string;
  artifactRevision: string;
  analysisType: string;
  status: AiAnalysisStatus;
  evidenceHash: string;
  policyVersion: string;
  promptVersion: string;
  schemaVersion: string;
  taxonomyVersion: string;
  providerConfigHash: string;
  startedAt: string | null;
  completedAt: string | null;
  failureCode: string | null;
  createdAt: string;
  evidence: AiAnalysisEvidenceSummaryResponse[];
  providerDecision: AiAnalysisDecisionResponse | null;
}

export interface AiLatestAnalysisResponse {
  status: "FOUND" | "NOT_ANALYZED";
  analysis: AiAnalysisResponse | null;
}

export interface CourseAiProgressSubmitResult {
  analysis: AiAnalysisResponse;
  isReused: boolean;
}

export interface AiAdjudicationResponse {
  outcome: string;
  disagreementDetailsJson: string | null;
  humanReviewRequired: boolean;
}

export interface AiEvidenceReference {
  kind: string;
  evidenceId: string;
}

export interface AiFinding {
  code?: string;
  description: string;
  impact?: string;
  severity?: string;
  evidence?: AiEvidenceReference[];
}

export interface AiCommitMessageAssessment {
  verdict: AiCommitMessageVerdict;
  score: number;
  summary: string;
  suggestedMessage?: string;
  findings: AiFinding[];
}

export interface AiCodeAssessment {
  verdict: AiCodeVerdict;
  confidence: number;
  findings: AiFinding[];
  evidence: AiEvidenceReference[];
}

export interface AiTaskAlignment {
  taskId: string;
  externalKey: string;
  verdict: AiTaskAlignmentVerdict;
  confidence: number;
  summary: string;
  evidence: AiEvidenceReference[];
}

export interface AiStructuredResult {
  commitMessageAssessment: AiCommitMessageAssessment;
  codeAssessment: AiCodeAssessment;
  taskAlignments: AiTaskAlignment[];
  taskAlignmentSummary: AiTaskAlignmentVerdict;
  overallDecision: AiOverallDecision;
  humanReviewRequired: boolean;
}

export interface AiTaskIntelligenceResult {
  evidenceStrength: AiTaskEvidenceStrength;
  summary: string;
  deviationDetected: boolean;
  deviationSummary: string;
  evidence: AiEvidenceReference[];
  humanReviewRequired: boolean;
}

export interface AiRiskAnalysisResult {
  riskLevel: AiRiskLevel;
  riskReasons: AiFinding[];
  recommendedActions: string[];
  humanReviewRecommended: boolean;
  confidence: number;
}

export interface AiProgressNarrativeResult {
  overview: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  blockers: string[];
  dueSoonOverdueNote: string | null;
  evidence: AiEvidenceReference[];
  humanReviewRecommended: boolean;
}
