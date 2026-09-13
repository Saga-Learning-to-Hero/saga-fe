export interface LecturerCourseResponse {
  id: string;
  courseCode: string;
  name: string;
  subjectId: string;
  subjectCode?: string;
  subjectName?: string;
  academicClassId: string;
  classCode?: string;
  className?: string;
  semesterId?: string;
  semesterCode?: string;
  semesterName?: string;
  syllabusVersionId: string;
  syllabusVersionLabel?: string;
  syllabusStatus?: string;
  lecturerId: string;
  lecturerUserId?: string;
  lecturerEmail?: string;
  lecturerFullName?: string;
  lecturerName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LecturerRosterEntry {
  courseEnrollmentId: string;
  studentProfileId: string;
  studentCode: string;
  fullName: string;
  email: string;
  classCode: string;
}

export interface LecturerRosterResponse {
  courseId: string;
  classCode: string;
  enrolledCount: number;
  entries: LecturerRosterEntry[];
}

export interface LecturerCourseProgressTeamEntry {
  teamId: string;
  teamNo: number;
  teamName: string;
  projectId: string | null;
  totalTasks: number;
  completedTasks: number;
  taskCompletionPercent: number | null;
  currentSprintName: string | null;
  lastActivityAt: string | null;
}

export interface LecturerCourseProgressResponse {
  courseId: string;
  teams: LecturerCourseProgressTeamEntry[];
}
