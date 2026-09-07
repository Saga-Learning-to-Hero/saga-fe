import { apiClient } from "@/lib/axios";
import type {
  CreateCourseRequest,
  PatchCourseRequest,
  CourseResponse,
  GetCoursesParams,
} from "../types/course-roster-types";

export class CourseService {
  static async getCourses(params?: GetCoursesParams): Promise<CourseResponse[]> {
    const response = await apiClient.get<CourseResponse[]>("/api/admin/courses", {
      params,
    });
    return response.data;
  }

  static async getCourseById(courseId: string): Promise<CourseResponse> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }
    const response = await apiClient.get<CourseResponse>(`/api/admin/courses/${courseId.trim()}`);
    return response.data;
  }

  static async createCourse(data: CreateCourseRequest): Promise<CourseResponse> {
    if (!data.academicClassId || !data.academicClassId.trim()) {
      throw new Error("Throw ValidationException: Academic class ID is required");
    }
    if (!data.subjectId || !data.subjectId.trim()) {
      throw new Error("Throw ValidationException: Subject ID is required");
    }
    if (!data.syllabusVersionId || !data.syllabusVersionId.trim()) {
      throw new Error("Throw ValidationException: Published syllabus version ID is required");
    }
    if (!data.lecturerId || !data.lecturerId.trim()) {
      throw new Error("Throw ValidationException: Lecturer ID is required");
    }

    const payload: CreateCourseRequest = {
      academicClassId: data.academicClassId.trim(),
      subjectId: data.subjectId.trim(),
      syllabusVersionId: data.syllabusVersionId.trim(),
      lecturerId: data.lecturerId.trim(),
      courseCode: data.courseCode?.trim() || undefined,
      name: data.name?.trim() || undefined,
    };

    const response = await apiClient.post<CourseResponse>("/api/admin/courses", payload);
    return response.data;
  }

  static async patchCourse(courseId: string, data: PatchCourseRequest): Promise<CourseResponse> {
    if (!courseId || !courseId.trim()) {
      throw new Error("Throw ValidationException: Course ID is required");
    }

    const response = await apiClient.patch<CourseResponse>(
      `/api/admin/courses/${courseId.trim()}`,
      data
    );
    return response.data;
  }
}
