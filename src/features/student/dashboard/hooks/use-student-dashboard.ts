import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { StudentDashboardService } from "../api/student-dashboard-service";
import { getApiErrorCode } from "@/lib/api-error";
import type { StudentDashboardResponse } from "../types/student-dashboard-types";

export const STUDENT_DASHBOARD_QUERY_KEYS = {
  all: ["student-dashboard"] as const,
  byCourse: (
    courseId?: string | null,
    sprintId?: string | null,
    jiraIntegrationId?: string | null
  ) =>
    [
      ...STUDENT_DASHBOARD_QUERY_KEYS.all,
      courseId || null,
      sprintId || null,
      jiraIntegrationId || null,
    ] as const,
};

export interface UseStudentDashboardOptions {
  enabled?: boolean;
  sprintId?: string | null;
  jiraIntegrationId?: string | null;
}

export function useStudentDashboard(
  courseId?: string | null,
  sprintIdOrOptions?: string | null | UseStudentDashboardOptions,
  jiraIntegrationIdOrOptions?: string | null | UseStudentDashboardOptions,
  options?: UseStudentDashboardOptions
) {
  let explicitSprintId: string | null | undefined = undefined;
  let explicitIntegrationId: string | null | undefined = undefined;
  let effectiveOptions: UseStudentDashboardOptions | undefined = undefined;

  if (typeof sprintIdOrOptions === "object" && sprintIdOrOptions !== null) {
    explicitSprintId = sprintIdOrOptions.sprintId;
    explicitIntegrationId = sprintIdOrOptions.jiraIntegrationId;
    effectiveOptions = sprintIdOrOptions;
  } else {
    explicitSprintId = sprintIdOrOptions;
    if (typeof jiraIntegrationIdOrOptions === "object" && jiraIntegrationIdOrOptions !== null) {
      explicitIntegrationId = jiraIntegrationIdOrOptions.jiraIntegrationId;
      effectiveOptions = jiraIntegrationIdOrOptions;
    } else {
      explicitIntegrationId = jiraIntegrationIdOrOptions;
      effectiveOptions = options;
    }
  }

  const cleanCourseId = courseId?.trim() || "";
  const cleanSprintId = explicitSprintId?.trim() || null;
  const cleanIntegrationId = explicitIntegrationId?.trim() || null;

  return useQuery<StudentDashboardResponse>({
    queryKey: STUDENT_DASHBOARD_QUERY_KEYS.byCourse(
      cleanCourseId,
      cleanSprintId,
      cleanIntegrationId
    ),
    queryFn: () =>
      StudentDashboardService.getDashboard(
        cleanCourseId,
        cleanSprintId,
        cleanIntegrationId
      ),
    enabled: (effectiveOptions?.enabled ?? true) && Boolean(cleanCourseId),
    staleTime: 1000 * 30, // 30s cache
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      const code = getApiErrorCode(error);
      if (
        code === "STUDENT_COURSE_FORBIDDEN" ||
        code === "INVALID_COURSE_ID" ||
        code === "SPRINT_NOT_FOUND"
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
