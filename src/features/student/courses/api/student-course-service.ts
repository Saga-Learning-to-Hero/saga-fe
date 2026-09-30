import { apiClient } from "@/lib/axios";
import { getApiErrorCode, requireCourseId } from "@/lib/api-error";
import type {
  CoursePagedParams,
  StudentCoursePagedResponse,
  StudentCourseResponse,
  StudentTeamResponse,
} from "../types/student-course";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

function toPageIndex(value: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function toPageSize(value: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(MAX_PAGE_SIZE, Math.floor(value));
}

function toPagedQuery(params: CoursePagedParams) {
  const page = toPageIndex(params.page);
  const size = toPageSize(params.size);
  const search = params.search?.trim() || undefined;
  const semesterId = params.semesterId?.trim() || undefined;

  return {
    page,
    size,
    ...(search ? { search } : {}),
    ...(semesterId ? { semesterId } : {}),
  };
}

function normalizePagedResponse(
  data: Partial<StudentCoursePagedResponse> | null | undefined,
  query: { page: number; size: number }
): StudentCoursePagedResponse {
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    page: typeof data?.page === "number" && Number.isFinite(data.page) ? data.page : query.page,
    size: typeof data?.size === "number" && Number.isFinite(data.size) ? data.size : query.size,
    total:
      typeof data?.total === "number" && Number.isFinite(data.total) && data.total >= 0
        ? Math.floor(data.total)
        : 0,
  };
}

export class StudentCourseService {
  static async getCourses(): Promise<StudentCourseResponse[]> {
    const response = await apiClient.get<StudentCourseResponse[]>("/api/student/courses");
    return Array.isArray(response.data) ? response.data : [];
  }

  static async getCoursesPaged(params: CoursePagedParams): Promise<StudentCoursePagedResponse> {
    const query = toPagedQuery(params);
    const response = await apiClient.get<StudentCoursePagedResponse>("/api/student/courses/paged", {
      params: query,
    });
    return normalizePagedResponse(response.data, query);
  }

  static async getMyTeam(courseId: string): Promise<StudentTeamResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<StudentTeamResponse>(
      `/api/student/courses/${id}/team`
    );
    return response.data;
  }

  static isTeamNotFound(error: unknown): boolean {
    return getApiErrorCode(error) === "TEAM_NOT_FOUND";
  }
}
