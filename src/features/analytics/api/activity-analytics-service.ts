import { apiClient } from "@/lib/axios";
import { requireCourseId, requireSprintId, requireTeamId } from "@/lib/api-error";
import type {
  BurndownChartResponse,
  GetHeatmapParams,
  HeatmapResponse,
} from "../types/activity-analytics";

export class ActivityAnalyticsService {
  static async getTeamHeatmap(
    courseId: string,
    teamId: string,
    params: GetHeatmapParams
  ): Promise<HeatmapResponse> {
    const cId = requireCourseId(courseId);
    const tId = requireTeamId(teamId);

    if (!params.startDate || !params.startDate.trim()) {
      throw new Error("Throw ValidationException: Start date is required");
    }
    if (!params.endDate || !params.endDate.trim()) {
      throw new Error("Throw ValidationException: End date is required");
    }

    const sDate = params.startDate.trim();
    const eDate = params.endDate.trim();
    const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

    if (!DATE_REGEX.test(sDate)) {
      throw new Error("Throw ValidationException: Start date must be in format yyyy-MM-dd");
    }
    if (!DATE_REGEX.test(eDate)) {
      throw new Error("Throw ValidationException: End date must be in format yyyy-MM-dd");
    }
    if (sDate > eDate) {
      throw new Error("Throw ValidationException: Start date cannot be after end date");
    }

    const start = new Date(`${sDate}T00:00:00Z`).getTime();
    const end = new Date(`${eDate}T00:00:00Z`).getTime();
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 366) {
      throw new Error("Throw ValidationException: Date range cannot exceed 366 days");
    }

    const query = new URLSearchParams({
      startDate: sDate,
      endDate: eDate,
    });

    if (params.studentId && params.studentId.trim()) {
      query.set("studentId", params.studentId.trim());
    }

    const res = await apiClient.get<HeatmapResponse>(
      `/api/courses/${encodeURIComponent(cId)}/teams/${encodeURIComponent(tId)}/heatmap?${query.toString()}`
    );
    return res.data;
  }

  static async getSprintBurndown(
    courseId: string,
    teamId: string,
    sprintId: string
  ): Promise<BurndownChartResponse> {
    const cId = requireCourseId(courseId);
    const tId = requireTeamId(teamId);
    const sId = requireSprintId(sprintId);

    const res = await apiClient.get<BurndownChartResponse>(
      `/api/courses/${encodeURIComponent(cId)}/teams/${encodeURIComponent(tId)}/sprints/${encodeURIComponent(sId)}/burndown`
    );
    return res.data;
  }
}
