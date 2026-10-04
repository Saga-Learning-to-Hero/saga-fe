import { apiClient } from "@/lib/axios";
import { requireCourseId } from "@/lib/api-error";
import { requireRemovalReason } from "@/lib/removal-reason";
import { resolveDashboardSelection } from "../lib/dashboard-selection";
import type {
  LecturerCourseDashboardResponse,
  LecturerDashboardCurrentSprint,
  LecturerDashboardJiraSource,
  LecturerDashboardSelection,
  LecturerDashboardSprintOption,
  LecturerDashboardSprintSelection,
  LecturerDashboardTeam,
} from "../types/lecturer-course-dashboard";
import type {
  CoursePagedParams,
  LecturerCoursePagedResponse,
  LecturerCourseProgressResponse,
  LecturerCourseResponse,
  LecturerRosterResponse,
} from "../types/lecturer-course";

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

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeJiraSource(value: unknown): LecturerDashboardJiraSource | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Partial<LecturerDashboardJiraSource>;
  const jiraIntegrationId = asText(source.jiraIntegrationId);
  if (!jiraIntegrationId) return null;
  return {
    jiraIntegrationId,
    siteName: asText(source.siteName),
    projectKey: asText(source.projectKey),
    connectionStatus: asText(source.connectionStatus),
  };
}

function normalizeSprintOption(value: unknown): LecturerDashboardSprintOption | null {
  if (!value || typeof value !== "object") return null;
  const option = value as Partial<LecturerDashboardSprintOption>;
  const id = asText(option.id);
  if (!id) return null;
  return {
    id,
    name: asText(option.name),
    state: asText(option.state),
  };
}

function normalizeSprintSelection(value: unknown): LecturerDashboardSprintSelection | null {
  return value === "SELECTED" || value === "DEFAULT" ? value : null;
}

function normalizeCurrentSprint(value: unknown): LecturerDashboardCurrentSprint | null {
  if (!value || typeof value !== "object") return null;
  const sprint = value as LecturerDashboardCurrentSprint;
  return {
    sprintId: sprint.sprintId,
    sprintName: sprint.sprintName,
    state: sprint.state,
    startDate: sprint.startDate ?? null,
    endDate: sprint.endDate ?? null,
    elapsedPercent: sprint.elapsedPercent ?? null,
    source: normalizeJiraSource(sprint.source),
  };
}

function normalizeDashboardTeam(team: LecturerDashboardTeam): LecturerDashboardTeam {
  return {
    ...team,
    currentSprint: normalizeCurrentSprint(team.currentSprint),
    sprintSelection: normalizeSprintSelection(team.sprintSelection),
    jiraSources: Array.isArray(team.jiraSources)
      ? team.jiraSources.flatMap((item) => {
          const source = normalizeJiraSource(item);
          return source ? [source] : [];
        })
      : [],
    sprintOptions: Array.isArray(team.sprintOptions)
      ? team.sprintOptions.flatMap((item) => {
          const option = normalizeSprintOption(item);
          return option ? [option] : [];
        })
      : [],
  };
}

function normalizePagedResponse(
  data: Partial<LecturerCoursePagedResponse> | null | undefined,
  query: { page: number; size: number },
): LecturerCoursePagedResponse {
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

export class LecturerCourseService {
  static async getCourses(): Promise<LecturerCourseResponse[]> {
    const response = await apiClient.get<LecturerCourseResponse[]>(
      "/api/lecturer/courses",
    );
    return Array.isArray(response.data) ? response.data : [];
  }

  static async getCoursesPaged(
    params: CoursePagedParams,
  ): Promise<LecturerCoursePagedResponse> {
    const query = toPagedQuery(params);
    const response = await apiClient.get<LecturerCoursePagedResponse>(
      "/api/lecturer/courses/paged",
      { params: query },
    );
    return normalizePagedResponse(response.data, query);
  }

  static async getCourseById(
    courseId: string,
  ): Promise<LecturerCourseResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<LecturerCourseResponse>(
      `/api/lecturer/courses/${id}`,
    );
    return response.data;
  }

  static async getRoster(courseId: string): Promise<LecturerRosterResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<LecturerRosterResponse>(
      `/api/lecturer/courses/${id}/roster`,
    );
    const data = response.data;

    return {
      courseId: data?.courseId || id,
      classCode: data?.classCode || "",
      enrolledCount:
        data?.enrolledCount ??
        (Array.isArray(data?.entries) ? data.entries.length : 0),
      entries: Array.isArray(data?.entries) ? data.entries : [],
    };
  }

  static async getCourseProgress(
    courseId: string,
  ): Promise<LecturerCourseProgressResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<LecturerCourseProgressResponse>(
      `/api/lecturer/courses/${id}/progress`,
    );
    const data = response.data;

    return {
      courseId: data?.courseId || id,
      teams: Array.isArray(data?.teams) ? data.teams : [],
    };
  }

  static async getCourseDashboard(
    courseId: string,
    selection?: LecturerDashboardSelection,
  ): Promise<LecturerCourseDashboardResponse> {
    const id = requireCourseId(courseId);
    const params = resolveDashboardSelection(selection);
    const response = params
      ? await apiClient.get<LecturerCourseDashboardResponse>(
          `/api/lecturer/courses/${id}/dashboard`,
          { params },
        )
      : await apiClient.get<LecturerCourseDashboardResponse>(
          `/api/lecturer/courses/${id}/dashboard`,
        );
    const data = response.data;

    return {
      ...data,
      courseId: data?.courseId || id,
      teams: Array.isArray(data?.teams) ? data.teams.map(normalizeDashboardTeam) : [],
    };
  }

  static async removeEnrollment(
    courseId: string,
    enrollmentId: string,
    reason: string,
  ): Promise<void> {
    const id = requireCourseId(courseId);
    if (!enrollmentId || !enrollmentId.trim()) {
      throw new Error("Throw ValidationException: Enrollment ID is required");
    }
    const trimmedReason = requireRemovalReason(reason);

    await apiClient.delete(
      `/api/lecturer/courses/${id}/roster/enrollments/${encodeURIComponent(enrollmentId.trim())}`,
      { data: { reason: trimmedReason } },
    );
  }
}
