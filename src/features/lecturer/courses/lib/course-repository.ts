import { MOCK_LECTURER_COURSES } from "../data/mock-courses";
import type { LecturerCourse } from "../types/course";

export type LecturerCourseId =
  | "prn212-01"
  | "swd392-02"
  | "swp391-03"
  | "swt301-04"
  | "prm392-05"
  | "mln122-06";

export function getLecturerCourseById(courseId: string): LecturerCourse | undefined {
  return MOCK_LECTURER_COURSES.find((c) => c.id === courseId);
}

export function isLecturerCourseId(courseId: string): boolean {
  return MOCK_LECTURER_COURSES.some((c) => c.id === courseId);
}

export function getLecturerCoursesBySemester(semesterId: string): LecturerCourse[] {
  return MOCK_LECTURER_COURSES.filter((c) => c.semesterId === semesterId);
}
