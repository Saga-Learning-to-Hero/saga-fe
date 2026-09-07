import { apiClient } from "@/lib/axios";
import { requireCourseId } from "@/lib/api-error";
import type {
  LecturerCourseResponse,
  LecturerRosterResponse,
} from "../types/lecturer-course";

export class LecturerCourseService {
  static async getCourses(): Promise<LecturerCourseResponse[]> {
    const response = await apiClient.get<LecturerCourseResponse[]>("/api/lecturer/courses");
    return Array.isArray(response.data) ? response.data : [];
  }

  static async getCourseById(courseId: string): Promise<LecturerCourseResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<LecturerCourseResponse>(`/api/lecturer/courses/${id}`);
    return response.data;
  }

  static async getRoster(courseId: string): Promise<LecturerRosterResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<LecturerRosterResponse>(`/api/lecturer/courses/${id}/roster`);
    const data = response.data;

    return {
      courseId: data?.courseId || id,
      classCode: data?.classCode || "",
      enrolledCount: data?.enrolledCount ?? (Array.isArray(data?.entries) ? data.entries.length : 0),
      entries: Array.isArray(data?.entries) ? data.entries : [],
    };
  }
}
