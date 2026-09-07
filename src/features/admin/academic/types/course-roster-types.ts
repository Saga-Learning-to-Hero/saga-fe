export interface CreateCourseRequest {
  academicClassId: string;
  subjectId: string;
  syllabusVersionId: string;
  lecturerId: string;
  courseCode?: string;
  name?: string;
}

export interface PatchCourseRequest {
  lecturerId?: string;
  syllabusVersionId?: string;
  courseCode?: string;
  name?: string;
}

export interface CourseResponse {
  id: string;
  courseCode: string;
  name: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  academicClassId: string;
  classCode?: string;
  semesterId?: string;
  semesterCode?: string;
  syllabusVersionId: string;
  lecturerId: string;
  lecturerName?: string;
  lecturerFullName?: string;
  lecturerEmail?: string;
  lecturerUserId?: string;
  createdAt: string;
}

export interface GetCoursesParams {
  semesterId?: string;
  academicClassId?: string;
  subjectId?: string;
  lecturerId?: string;
}

export type RosterEnrollmentStatus = "ENROLLED" | "INVITED" | "DROPPED";

export interface CourseRosterEntry {
  kind: "ENROLLMENT" | "INVITATION" | string;
  enrollmentId?: string | null;
  invitationId?: string | null;
  studentUserId?: string | null;
  studentCode: string;
  fullName: string;
  email: string;
  enrollmentStatus?: string | null;
  invitationStatus?: string | null;
  accountState?: string | null;
  enrolledAt?: string | null;
  status?: RosterEnrollmentStatus;
  id?: string;
}

export interface CourseRosterResponse {
  courseId: string;
  classCode: string;
  semesterCode: string;
  subjectCode: string;
  enrolledCount: number;
  pendingInvitationCount: number;
  entries: CourseRosterEntry[];
}

export interface RosterItemResponse {
  id: string;
  studentId?: string | null;
  studentCode: string;
  email: string;
  fullName: string;
  status: RosterEnrollmentStatus;
  invitedAt?: string | null;
  enrolledAt?: string | null;
}

export type RosterPreviewRowAction =
  | "READY_ENROLL"
  | "READY_INVITE"
  | "ALREADY_ENROLLED"
  | "ALREADY_INVITED"
  | "INVALID"
  | "CONFLICT"
  | string;

export interface RosterPreviewRow {
  rowNumber: number;
  classCode?: string;
  studentCode: string;
  email: string;
  fullName: string;
  memberCode?: string | null;
  action?: RosterPreviewRowAction;
  errors?: string[];
  warnings?: string[];
  valid?: boolean;
  errorMessage?: string | null;
  accountExists?: boolean;
}

export interface RosterPreviewSummary {
  totalRows: number;
  validRows?: number;
  validCount?: number;
  invalidRows?: number;
  errorCount?: number;
  existingAccounts?: number;
  existingAccountsCount?: number;
  newInvitations?: number;
  newInvitesCount?: number;
  alreadyEnrolled?: number;
  alreadyInvited?: number;
}

export interface RosterPreviewResponse {
  previewToken: string;
  courseId: string;
  classCode?: string;
  summary: RosterPreviewSummary;
  rows: RosterPreviewRow[];
}

export interface ConfirmRosterImportRequest {
  previewToken: string;
}

export interface ConfirmRosterImportResponse {
  courseId: string;
  enrolled: number;
  invited: number;
}
