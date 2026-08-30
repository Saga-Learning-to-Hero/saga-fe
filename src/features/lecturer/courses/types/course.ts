export type CourseStatus = "IN_PROGRESS" | "ACTIVE" | "UPCOMING" | "COMPLETED";

export interface LecturerCourse {
  id: string;
  code: string;
  name: string;
  subjectCode?: string;
  subjectName?: string;
  semesterId: string;
  semesterCode?: string;
  semesterName?: string;
  schedule: string;
  room: string;
  studentsCount: number;
  studentCount: number;
  groupsCount: number;
  groupCount: number;
  progress: number;
  nextSession: string;
  status: CourseStatus;
  tone: "indigo" | "cyan" | "emerald" | "amber";
}
