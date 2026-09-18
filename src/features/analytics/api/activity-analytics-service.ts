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
    if (params.startDate > params.endDate) {
      throw new Error("Throw ValidationException: Start date cannot be after end date");
    }

    const query = new URLSearchParams({
      startDate: params.startDate.trim(),
      endDate: params.endDate.trim(),
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
