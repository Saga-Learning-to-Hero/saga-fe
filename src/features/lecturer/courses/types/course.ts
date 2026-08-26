export type CourseStatus = "ACTIVE" | "UPCOMING" | "COMPLETED";

export interface LecturerCourse {
  id: string;
  code: string;
  name: string;
  semesterId: string;
  schedule: string;
  room: string;
  studentCount: number;
  groupCount: number;
  progress: number;
  nextSession: string;
  status: CourseStatus;
  tone: "indigo" | "cyan" | "emerald" | "amber";
}
