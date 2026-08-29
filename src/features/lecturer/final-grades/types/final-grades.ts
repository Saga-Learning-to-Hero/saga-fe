export type GradeStatus =
  | "COMPLETE"
  | "INCOMPLETE"
  | "NOT_GRADED"
  | "FAILED"
  | "MANUALLY_ADJUSTED"
  | "LOCKED";

export type GradebookStatus = "DRAFT" | "READY_TO_PUBLISH" | "PUBLISHED" | "LOCKED";

export type ComponentSource = "MANUAL" | "SYSTEM";

export interface GradeComponent {
  id: string;
  name: string;
  shortName: string;
  weight: number; // e.g., 20 for 20%
  source: ComponentSource;
  editable: boolean;
  minScore: number;
  maxScore: number;
  order: number;
}

export interface StudentComponentScore {
  componentId: string;
  score: number | null; // null if not graded
  isManuallyAdjusted?: boolean;
  adjustmentReason?: string;
  updatedAt?: string;
}

export interface StudentFinalGrade {
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  avatar?: string;
  groupId: string | null;
  groupName: string | null;
  componentScores: StudentComponentScore[];
  calculatedScore: number | null;
  finalScore: number | null; // Same as calculated unless overridden
  status: GradeStatus;
}

export interface FinalGradebook {
  courseId: string;
  status: GradebookStatus;
  version: number;
  updatedAt: string;
  updatedBy: string;
  publishedAt?: string;
  lockedAt?: string;
  components: GradeComponent[];
  summary: {
    averageScore: number;
    passCount: number;
    failCount: number; // below 5.0
    missingGradesCount: number;
    totalStudents: number;
  };
  students: StudentFinalGrade[];
}
