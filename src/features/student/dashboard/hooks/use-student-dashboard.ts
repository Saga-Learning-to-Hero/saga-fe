"use client";

import { useQuery } from "@tanstack/react-query";
import { StudentDashboardService } from "../api/student-dashboard-service";
import { getApiErrorCode } from "@/lib/api-error";
import type { StudentDashboardResponse } from "../types/student-dashboard-types";

export const STUDENT_DASHBOARD_QUERY_KEYS = {
  all: ["student-dashboard"] as const,
  byCourse: (courseId?: string | null) =>
    [...STUDENT_DASHBOARD_QUERY_KEYS.all, courseId || null] as const,
};

export function useStudentDashboard(
  courseId?: string | null,
  options?: { enabled?: boolean }
) {
  const cleanCourseId = courseId?.trim() || "";

  return useQuery<StudentDashboardResponse>({
    queryKey: STUDENT_DASHBOARD_QUERY_KEYS.byCourse(cleanCourseId),
    queryFn: () => StudentDashboardService.getDashboard(cleanCourseId),
    enabled: (options?.enabled ?? true) && Boolean(cleanCourseId),
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
