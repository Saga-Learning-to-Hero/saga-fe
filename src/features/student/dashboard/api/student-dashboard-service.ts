import { apiClient } from "@/lib/axios";
import { requireCourseId } from "@/lib/api-error";
import type { StudentDashboardResponse } from "../types/student-dashboard-types";

export class StudentDashboardService {
  /**
   * Lấy dữ liệu dashboard cá nhân hóa cho sinh viên theo môn học (BFF endpoint).
   * URL: GET /api/student/courses/{courseId}/dashboard
   * Cho phép cả LEADER và MEMBER truy cập.
   */
  static async getDashboard(courseId: string): Promise<StudentDashboardResponse> {
    const cleanCourseId = requireCourseId(courseId);
    const response = await apiClient.get<StudentDashboardResponse>(
      `/api/student/courses/${encodeURIComponent(cleanCourseId)}/dashboard`
    );
    return response.data;
  }
}
