import type { QueryClient } from "@tanstack/react-query";
import { STUDENT_COURSE_QUERY_KEYS } from "@/features/student/courses/hooks/use-student-courses";
import type { StudentTeamResponse } from "@/features/student/courses/types/student-course";
import { STUDENT_DASHBOARD_QUERY_KEYS } from "@/features/student/dashboard/hooks/use-student-dashboard";
import type { StudentDashboardResponse } from "@/features/student/dashboard/types/student-dashboard-types";
import { getApiErrorCode, getApiErrorStatus } from "@/lib/api-error";

export interface PrefetchProjectProjectionOptions {
  includeCommits?: boolean;
  includeTeamProgress?: boolean;
  courseId?: string | null;
}

function isLeaderRole(role?: string | null): boolean {
  return (role || "").trim().toUpperCase() === "LEADER";
}

/** Chỉ tin cache đã có: Member/chưa hydrate thì không prefetch /progress. */
export function isCachedStudentTeamLeader(
  queryClient: QueryClient,
  courseId?: string | null
): boolean {
  const cleanCourseId = courseId?.trim() || "";
  if (!cleanCourseId) return false;

  const team = queryClient.getQueryData<StudentTeamResponse>(
    STUDENT_COURSE_QUERY_KEYS.studentMyTeam(cleanCourseId)
  );
  if (isLeaderRole(team?.myRole)) return true;

  const dashboard = queryClient.getQueryData<StudentDashboardResponse>(
    STUDENT_DASHBOARD_QUERY_KEYS.byCourse(cleanCourseId, null)
  );
  return isLeaderRole(dashboard?.student?.teamRole);
}

export function shouldPrefetchTeamProgress(
  queryClient: QueryClient,
  options?: PrefetchProjectProjectionOptions
): boolean {
  if (!options?.includeTeamProgress) return false;
  return isCachedStudentTeamLeader(queryClient, options.courseId);
}

/** 403 ACCESS_DENIED trên /progress không retry (Member không có quyền). */
export function shouldRetryLeaderOnlyProjection(failureCount: number, error: unknown): boolean {
  const status = getApiErrorStatus(error);
  const code = getApiErrorCode(error);
  if (status === 403 || code === "ACCESS_DENIED" || code === "PERMISSION_DENIED") {
    return false;
  }
  return failureCount < 1;
}
