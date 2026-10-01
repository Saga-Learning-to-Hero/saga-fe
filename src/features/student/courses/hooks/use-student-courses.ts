import { useCallback } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentCourseService } from "../api/student-course-service";
import { getApiErrorCode } from "@/lib/api-error";
import type { CoursePagedParams, StudentTeamResponse } from "../types/student-course";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export const STUDENT_COURSE_QUERY_KEYS = {
  studentCourses: ["student", "courses"] as const,
  studentCoursesPaged: (params: CoursePagedParams) =>
    ["student", "courses", "paged", params] as const,
  studentMyTeam: (courseId?: string | null) => ["student", "courses", courseId, "team"] as const,
};

export function useStudentCourses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: STUDENT_COURSE_QUERY_KEYS.studentCourses,
    queryFn: () => StudentCourseService.getCourses(),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useStudentCoursesPaged(
  params: CoursePagedParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: STUDENT_COURSE_QUERY_KEYS.studentCoursesPaged(params),
    queryFn: () => StudentCourseService.getCoursesPaged(params),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useStudentMyTeam(courseId: string, options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: STUDENT_COURSE_QUERY_KEYS.studentMyTeam(courseId),
    queryFn: () => StudentCourseService.getMyTeam(courseId),
    enabled: (options?.enabled ?? true) && Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      const code = getApiErrorCode(error);
      if (code === "TEAM_NOT_FOUND" || code === "STUDENT_COURSE_FORBIDDEN") {
        return false;
      }
      return failureCount < 1;
    },
  });

  return {
    ...query,
    isWaitingForTeam: query.isError && StudentCourseService.isTeamNotFound(query.error),
  };
}

export function usePrefetchStudentTeam() {
  const queryClient = useQueryClient();
  return useCallback(
    (courseId: string) => {
      if (!courseId || !courseId.trim()) return;
      void queryClient.prefetchQuery({
        queryKey: STUDENT_COURSE_QUERY_KEYS.studentMyTeam(courseId),
        queryFn: () => StudentCourseService.getMyTeam(courseId),
        staleTime: 1000 * 60 * 5,
      });
    },
    [queryClient]
  );
}

export const isStudentTeamNotFound = StudentCourseService.isTeamNotFound;

export function useRefreshStudentCourses() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: STUDENT_COURSE_QUERY_KEYS.studentCourses,
      }),
    [queryClient]
  );
}

function isLeaderRole(role?: string | null): boolean {
  return (role || "").trim().toUpperCase() === "LEADER";
}

export function useIsStudentLeader(courseId?: string | null): boolean {
  const user = useAuthStore((state) => state.user);
  const selectedCourse = useAuthStore((state) => state.selectedCourse);
  const cleanCourseId =
    courseId?.trim() || selectedCourse?.courseId || selectedCourse?.id || "";

  const queryClient = useQueryClient();
  const teamQuery = useStudentMyTeam(cleanCourseId, {
    enabled: user?.role === "STUDENT" && Boolean(cleanCourseId),
  });

  const cachedTeam = queryClient.getQueryData<StudentTeamResponse>(
    STUDENT_COURSE_QUERY_KEYS.studentMyTeam(cleanCourseId)
  );

  const isLeaderInGroup =
    selectedCourse &&
    "myGroup" in selectedCourse &&
    isLeaderRole(selectedCourse.myGroup?.role);

  return (
    isLeaderRole(teamQuery.data?.myRole) ||
    isLeaderRole(cachedTeam?.myRole) ||
    Boolean(isLeaderInGroup)
  );
}
