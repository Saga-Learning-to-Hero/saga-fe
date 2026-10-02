import { apiClient } from "@/lib/axios";
import { requireCourseId } from "@/lib/api-error";
import type { StudentDashboardResponse } from "../types/student-dashboard-types";

export class StudentDashboardService {
  /**
   * Lấy dữ liệu dashboard cá nhân hóa cho sinh viên theo môn học (BFF endpoint).
   * URL: GET /api/student/courses/{courseId}/dashboard
   * Query params: sprintId (optional UUID) - chọn sprint cụ thể để nạp dữ liệu currentSprint
   * Cho phép cả LEADER và MEMBER truy cập.
   */
  static async getDashboard(
    courseId: string,
    sprintId?: string | null,
    jiraIntegrationId?: string | null
  ): Promise<StudentDashboardResponse> {
    const cleanCourseId = requireCourseId(courseId);
    const cleanSprintId = sprintId?.trim();
    const cleanIntegrationId = jiraIntegrationId?.trim();
    const url = `/api/student/courses/${encodeURIComponent(cleanCourseId)}/dashboard`;

    const params: Record<string, string> = {};
    if (cleanSprintId) params.sprintId = cleanSprintId;
    if (cleanIntegrationId) params.jiraIntegrationId = cleanIntegrationId;

    const response = Object.keys(params).length > 0
      ? await apiClient.get<StudentDashboardResponse>(url, { params })
      : await apiClient.get<StudentDashboardResponse>(url);
    return response.data;
  }
}
