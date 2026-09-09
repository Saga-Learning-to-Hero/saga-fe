export type SyllabusStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CreateSyllabusRequest {
  versionLabel: string;
  externalSyllabusId?: string | null;
  titleEnglish?: string | null;
  titleVietnamese?: string | null;
  credits?: number | null;
  level?: string | null;
  learningTeachingMethod?: string | null;
  timeAllocation?: string | null;
  prerequisites?: string | null;
  description?: string | null;
  studentDuties?: string | null;
  tools?: string | null;
  textbooks?: string | null;
  referenceMaterials?: string | null;
  gradingScale?: string | null;
}

export type PatchSyllabusRequest = Partial<CreateSyllabusRequest>;

export interface LearningOutcomeRequest {
  code: string;
  name: string;
  description?: string | null;
  orderIndex: number;
}

export interface LearningUnitRequest {
  code: string;
  name: string;
  description?: string | null;
  orderIndex: number;
  learningOutcomeCodes?: string[];
  outcomeCodes?: string[];
}

export interface ActivityRequest {
  code: string;
  name: string;
  description?: string | null;
  orderIndex: number;
  outcomeCodes?: string[];
}

export interface DeliverableRequest {
  code: string;
  name: string;
  description?: string | null;
  orderIndex: number;
  learningOutcomeCodes?: string[];
  outcomeCodes?: string[];
  weightPercentage?: number | null;
}

export interface PhaseRequest {
  code: string;
  name: string;
  description?: string | null;
  orderIndex: number;
  learningOutcomeCodes?: string[];
  activities: ActivityRequest[];
  deliverables: DeliverableRequest[];
}

export interface ReplaceSyllabusStructureRequest {
  learningOutcomes: LearningOutcomeRequest[];
  learningUnits?: LearningUnitRequest[];
  phases: PhaseRequest[];
}

export interface LearningOutcomeResponse extends LearningOutcomeRequest {
  id: string;
}

export interface LearningUnitResponse extends LearningUnitRequest {
  id: string;
}

export interface ActivityResponse extends ActivityRequest {
  id: string;
}

export interface DeliverableResponse {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  orderIndex: number;
  learningOutcomeCodes?: string[];
}

export interface PhaseResponse {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  orderIndex: number;
  learningOutcomeCodes?: string[];
  activities: ActivityResponse[];
  deliverables: DeliverableResponse[];
}

export interface SyllabusSummaryResponse {
  id: string;
  subjectId: string;
  subjectCode?: string;
  externalSyllabusId?: string | null;
  versionLabel: string;
  status: SyllabusStatus;
  titleEnglish?: string | null;
  titleVietnamese?: string | null;
  credits?: number | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyllabusDetailResponse extends SyllabusSummaryResponse {
  level?: string | null;
  learningTeachingMethod?: string | null;
  timeAllocation?: string | null;
  prerequisites?: string | null;
  description?: string | null;
  studentDuties?: string | null;
  tools?: string | null;
  textbooks?: string | null;
  referenceMaterials?: string | null;
  gradingScale?: string | null;
  learningOutcomes: LearningOutcomeResponse[];
  learningUnits: LearningUnitResponse[];
  phases: PhaseResponse[];
}
