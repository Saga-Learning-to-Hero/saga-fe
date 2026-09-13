import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LecturerCourseService } from "../api/lecturer-course-service";
import type { LecturerCourseResponse } from "../types/lecturer-course";
import { LecturerTeamService } from "@/features/lecturer/teams/api/lecturer-team-service";
import { LecturerWeightsService } from "@/features/lecturer/contribution/api/lecturer-weights-service";
import { CONTRIBUTION_QUERY_KEYS } from "@/features/lecturer/contribution/hooks/use-lecturer-contribution";
import { getApiErrorCode } from "@/lib/api-error";
import { lecturerCoursesPath } from "../lib/course-routes";

export const LECTURER_COURSE_QUERY_KEYS = {
  lecturerCourses: ["lecturerCourses"] as const,
  lecturerCourse: (courseId: string) => ["lecturerCourse", courseId] as const,
  lecturerRoster: (courseId: string) => ["lecturerRoster", courseId] as const,
  lecturerCourseProgress: (courseId: string) => ["lecturerCourseProgress", courseId] as const,
};

export function prefetchLecturerCourses(queryClient: QueryClient) {
  return queryClient
    .prefetchQuery({
      queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerCourses,
      queryFn: () => LecturerCourseService.getCourses(),
      staleTime: 1000 * 60 * 5,
    })
    .catch(() => { });
}

export function useLecturerCourses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerCourses,
    queryFn: () => LecturerCourseService.getCourses(),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

export function useLecturerCourse(courseId: string, options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerCourse(courseId),
    queryFn: () => LecturerCourseService.getCourseById(courseId),
    enabled: (options?.enabled ?? true) && Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 60 * 5,
    initialData: () => {
      const cached = queryClient.getQueryData<LecturerCourseResponse[]>(
        LECTURER_COURSE_QUERY_KEYS.lecturerCourses
      );
      return cached?.find((course) => course.id === courseId);
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(LECTURER_COURSE_QUERY_KEYS.lecturerCourses)?.dataUpdatedAt,
  });
}

export function useLecturerRoster(courseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerRoster(courseId),
    queryFn: () => LecturerCourseService.getRoster(courseId),
    enabled: (options?.enabled ?? true) && Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 60 * 3,
  });
}

export function usePrefetchLecturerCourse() {
  const queryClient = useQueryClient();

  return (courseId: string) => {
    if (!courseId) return;
    void queryClient.prefetchQuery({
      queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerCourse(courseId),
      queryFn: () => LecturerCourseService.getCourseById(courseId),
      staleTime: 1000 * 60 * 5,
    });
    void queryClient.prefetchQuery({
      queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerRoster(courseId),
      queryFn: () => LecturerCourseService.getRoster(courseId),
      staleTime: 1000 * 60 * 3,
    });
    void queryClient.prefetchQuery({
      queryKey: ["lecturerTeams", courseId] as const,
      queryFn: () => LecturerTeamService.getTeams(courseId),
      staleTime: 1000 * 60 * 3,
    });
    void queryClient.prefetchQuery({
      queryKey: CONTRIBUTION_QUERY_KEYS.teamWeights(courseId),
      queryFn: () => LecturerWeightsService.getTeamWeights(courseId),
      staleTime: 1000 * 60 * 3,
    });
    void queryClient.prefetchQuery({
      queryKey: CONTRIBUTION_QUERY_KEYS.sliceWeights(courseId),
      queryFn: () => LecturerWeightsService.getSliceWeights(courseId),
      staleTime: 1000 * 60 * 3,
    });
  };
}

export function useLecturerCourseAccess(isError: boolean, error: unknown) {
  const router = useRouter();
  const errorCode = getApiErrorCode(error);
  const isAccessDenied =
    errorCode === "LECTURER_COURSE_FORBIDDEN" || errorCode === "COURSE_NOT_FOUND";

  useEffect(() => {
    if (!isError || !isAccessDenied) return;

    if (errorCode === "LECTURER_COURSE_FORBIDDEN") {
      toast.error("Bạn không có quyền truy cập lớp học phần này.", {
        id: "lecturer-course-forbidden",
      });
    } else {
      toast.error("Lớp học phần không còn tồn tại.", {
        id: "lecturer-course-not-found",
      });
    }
    router.replace(lecturerCoursesPath());
  }, [errorCode, isAccessDenied, isError, router]);

  return { errorCode, isAccessDenied };
}

export function useLecturerCourseProgress(courseId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LECTURER_COURSE_QUERY_KEYS.lecturerCourseProgress(courseId),
    queryFn: () => LecturerCourseService.getCourseProgress(courseId),
    enabled: (options?.enabled ?? true) && Boolean(courseId && courseId.trim()),
    staleTime: 1000 * 30,
  });
}
