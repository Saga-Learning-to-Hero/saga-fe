import { apiClient } from "@/lib/axios";
import { getApiErrorCode, requireCourseId } from "@/lib/api-error";
import type {
  StudentCourseResponse,
  StudentTeamResponse,
} from "../types/student-course";

export class StudentCourseService {
  static async getCourses(): Promise<StudentCourseResponse[]> {
    const response = await apiClient.get<StudentCourseResponse[]>("/api/student/courses");
    return Array.isArray(response.data) ? response.data : [];
  }

  static async getMyTeam(courseId: string): Promise<StudentTeamResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<StudentTeamResponse>(
      `/api/student/courses/${id}/team`
    );
    return response.data;
  }

  static isTeamNotFound(error: unknown): boolean {
    return getApiErrorCode(error) === "TEAM_NOT_FOUND";
  }
}
