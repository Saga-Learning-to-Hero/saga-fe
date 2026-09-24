import type {
  AiAcademicTargetType,
  AiAcademicClassificationStatus,
  AiAcademicProvenance,
  AiAcademicReviewAction,
  AiArtifactType,
} from "./ai-common";

export interface AiAcademicClassificationResponse {
  id: string;
  artifactType: string;
  artifactId: string;
  artifactRevision: string;
  syllabusVersionId: string;
  targetType: AiAcademicTargetType;
  targetId: string;
  targetCode: string;
  targetName: string;
  confidence: number;
  aiSummary: string;
  status: AiAcademicClassificationStatus;
  provenance: AiAcademicProvenance;
  sourceClassificationId: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface AiAcademicReviewRequest {
  action: AiAcademicReviewAction;
  reason?: string;
  correctedTargetType?: AiAcademicTargetType;
  correctedTargetId?: string;
}

export interface LecturerCourseAcademicClassificationResponse {
  classification: AiAcademicClassificationResponse;
  authoritative: boolean;
  projectId: string;
  projectName: string;
  teamId?: string | null;
  teamName?: string | null;
  taskExternalKey?: string | null;
  taskTitle?: string | null;
  commitSha?: string | null;
  commitMessage?: string | null;
}

export interface LecturerCourseAcademicClassificationPageResponse {
  items: LecturerCourseAcademicClassificationResponse[];
  page: number;
  size: number;
  total: number;
}

export interface CourseAcademicClassificationFilterParams {
  artifactType?: Extract<AiArtifactType, "TASK" | "COMMIT">;
  status?: AiAcademicClassificationStatus;
  projectId?: string;
  teamId?: string;
  page?: number;
  size?: number;
}

