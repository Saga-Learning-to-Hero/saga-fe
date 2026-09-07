import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentCourseService } from "../api/student-course-service";
import { getApiErrorCode } from "@/lib/api-error";

export const STUDENT_COURSE_QUERY_KEYS = {
  studentCourses: ["studentCourses"] as const,
  studentMyTeam: (courseId: string) => ["studentMyTeam", courseId] as const,
};

export function useStudentCourses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: STUDENT_COURSE_QUERY_KEYS.studentCourses,
    queryFn: () => StudentCourseService.getCourses(),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useStudentMyTeam(courseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: STUDENT_COURSE_QUERY_KEYS.studentMyTeam(courseId),
    queryFn: () => StudentCourseService.getMyTeam(courseId),
    enabled: (options?.enabled ?? true) && Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 30,
    retry: (failureCount, error) => {
      const code = getApiErrorCode(error);
      if (code === "TEAM_NOT_FOUND" || code === "STUDENT_COURSE_FORBIDDEN") {
        return false;
      }
      return failureCount < 1;
    },
  });
}

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
