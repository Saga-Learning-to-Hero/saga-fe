import { useQuery } from "@tanstack/react-query";
import { ActivityAnalyticsService } from "../api/activity-analytics-service";
import type {
  BurndownChartResponse,
  GetHeatmapParams,
  HeatmapResponse,
} from "../types/activity-analytics";

export const ACTIVITY_ANALYTICS_KEYS = {
  all: ["activity-analytics"] as const,
  heatmap: (courseId: string, teamId: string, params: GetHeatmapParams) =>
    [...ACTIVITY_ANALYTICS_KEYS.all, "heatmap", courseId, teamId, params] as const,
  burndown: (courseId: string, teamId: string, sprintId: string) =>
    [...ACTIVITY_ANALYTICS_KEYS.all, "burndown", courseId, teamId, sprintId] as const,
};

export function useTeamHeatmap(
  courseId?: string | null,
  teamId?: string | null,
  params?: GetHeatmapParams,
  options?: { enabled?: boolean }
) {
  const isEnabled = Boolean(
    courseId &&
    teamId &&
    params?.startDate &&
    params?.endDate &&
    (options?.enabled ?? true)
  );

  return useQuery<HeatmapResponse>({
    queryKey: ACTIVITY_ANALYTICS_KEYS.heatmap(
      courseId || "",
      teamId || "",
      params || { startDate: "", endDate: "" }
    ),
    queryFn: () =>
      ActivityAnalyticsService.getTeamHeatmap(courseId!, teamId!, params!),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });
}

export function useSprintBurndown(
  courseId?: string | null,
  teamId?: string | null,
  sprintId?: string | null,
  options?: { enabled?: boolean }
) {
  const isEnabled = Boolean(
    courseId &&
    teamId &&
    sprintId &&
    (options?.enabled ?? true)
  );

  return useQuery<BurndownChartResponse>({
    queryKey: ACTIVITY_ANALYTICS_KEYS.burndown(
      courseId || "",
      teamId || "",
      sprintId || ""
    ),
    queryFn: () =>
      ActivityAnalyticsService.getSprintBurndown(courseId!, teamId!, sprintId!),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData,
  });
}
