"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "@/components/ui/sonner";
import { StudentProjectService } from "../api/student-project-service";
import { STUDENT_COURSE_QUERY_KEYS } from "@/features/student/courses/hooks/use-student-courses";
import type {
  StudentTeamProjectResponse,
  ProjectTypeItem,
  CreateStudentProjectRequest,
  StudentCourseTeamResponse,
} from "../types/student-project";

export const STUDENT_PROJECT_QUERY_KEY = (courseId?: string | null) =>
  ["student", "courses", courseId, "project"] as const;

export const STUDENT_TEAM_QUERY_KEY = STUDENT_COURSE_QUERY_KEYS.studentMyTeam;

export const PROJECT_TYPES_QUERY_KEY = ["student", "project-types"] as const;

/**
 * Hook truy vấn thông tin nhóm và danh sách thành viên của sinh viên theo courseId
 * GET /api/student/courses/{courseId}/team
 */
export function useStudentTeam(courseId?: string | null) {
  return useQuery<StudentCourseTeamResponse | null, Error>({
    queryKey: STUDENT_TEAM_QUERY_KEY(courseId),
    queryFn: async () => {
      if (!courseId) {
        throw new Error("Course ID is not available");
      }
      try {
        return await StudentProjectService.getStudentTeam(courseId);
      } catch (error: unknown) {
        const status =
          (error as { status?: number })?.status ??
          (isAxiosError(error) ? error.response?.status : undefined);
        if (status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(courseId && courseId.trim() !== ""),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

/**
 * Hook truy vấn thông tin dự án nhóm của sinh viên theo courseId
 *
 * @param courseId UUID của môn học / lớp học phần
 */
export function useStudentProject(courseId?: string | null) {
  return useQuery<StudentTeamProjectResponse | null, Error>({
    queryKey: STUDENT_PROJECT_QUERY_KEY(courseId),
    queryFn: async () => {
      if (!courseId) {
        throw new Error("Course ID is not available");
      }
      try {
        return await StudentProjectService.getStudentTeamProject(courseId);
      } catch (error: unknown) {
        const status =
          (error as { status?: number })?.status ??
          (isAxiosError(error) ? error.response?.status : undefined);
        // Nếu backend trả về 404 (chưa có dự án), trả về null thay vì ném lỗi để cache và phản hồi ngay lập tức
        if (status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(courseId && courseId.trim() !== ""),
    staleTime: 1000 * 60 * 5, // Caching 5 phút
    retry: false, // Không retry để phản hồi UI ngay lập tức
  });
}

/**
 * Hook truy vấn danh sách loại dự án (Seed Data)
 * GET /api/student/project-types
 */
export function useProjectTypes() {
  return useQuery<ProjectTypeItem[], Error>({
    queryKey: PROJECT_TYPES_QUERY_KEY,
    queryFn: async () => {
      return await StudentProjectService.getProjectTypes();
    },
    staleTime: 1000 * 60 * 30, // Dữ liệu danh mục hạt giống, cache 30 phút
  });
}

/**
 * Hook tạo mới dự án nhóm cho môn học (Team Leader only)
 * POST /api/student/courses/{courseId}/project
 */
export function useCreateStudentProject() {
  const queryClient = useQueryClient();

  return useMutation<
    StudentTeamProjectResponse,
    Error,
    { courseId: string; payload: CreateStudentProjectRequest }
  >({
    mutationFn: async ({ courseId, payload }) => {
      return await StudentProjectService.createStudentProject(courseId, payload);
    },
    onSuccess: (data, variables) => {
      toast.success("Tạo dự án nhóm thành công!", {
        description: `Dự án "${data.name}" đã được ghi nhận trên hệ thống SAGA.`,
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_PROJECT_QUERY_KEY(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_COURSE_QUERY_KEYS.studentMyTeam(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_COURSE_QUERY_KEYS.studentCourses,
      });
    },
    onError: (error: unknown) => {
      let message = "Không thể tạo dự án. Vui lòng thử lại!";
      if (isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error("Tạo dự án thất bại", { description: message });
    },
  });
}
