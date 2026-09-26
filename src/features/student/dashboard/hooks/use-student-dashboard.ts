"use client";

import { useQuery } from "@tanstack/react-query";
import { StudentDashboardService } from "../api/student-dashboard-service";
import { getApiErrorCode } from "@/lib/api-error";
import type { StudentDashboardResponse } from "../types/student-dashboard-types";

export const STUDENT_DASHBOARD_QUERY_KEYS = {
  all: ["student-dashboard"] as const,
  byCourse: (courseId?: string | null, sprintId?: string | null) =>
    [...STUDENT_DASHBOARD_QUERY_KEYS.all, courseId || null, sprintId || null] as const,
};

export interface UseStudentDashboardOptions {
  enabled?: boolean;
  sprintId?: string | null;
}

export function useStudentDashboard(
  courseId?: string | null,
  sprintIdOrOptions?: string | null | UseStudentDashboardOptions,
  options?: UseStudentDashboardOptions
) {
  const explicitSprintId =
    typeof sprintIdOrOptions === "string"
      ? sprintIdOrOptions
      : sprintIdOrOptions?.sprintId;
  const effectiveOptions =
    typeof sprintIdOrOptions === "object" && sprintIdOrOptions !== null
      ? sprintIdOrOptions
      : options;

  const cleanCourseId = courseId?.trim() || "";
  const cleanSprintId = explicitSprintId?.trim() || null;

  return useQuery<StudentDashboardResponse>({
    queryKey: STUDENT_DASHBOARD_QUERY_KEYS.byCourse(cleanCourseId, cleanSprintId),
    queryFn: () => StudentDashboardService.getDashboard(cleanCourseId, cleanSprintId),
    enabled: (effectiveOptions?.enabled ?? true) && Boolean(cleanCourseId),
    staleTime: 1000 * 30, // 30s cache
    retry: (failureCount, error) => {
      const code = getApiErrorCode(error);
      if (code === "STUDENT_COURSE_FORBIDDEN" || code === "INVALID_COURSE_ID") {
        return false;
      }
      return failureCount < 1;
    },
  });
}
