import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseAiService } from "../api/lecturer-ai-api";
import type {
  CourseAiSettingsResponse,
  CourseAiSettingsUpdateRequest,
  CourseAiCredentialResponse,
  CourseAiCredentialPutRequest,
  AiAnalysisResponse,
  AiLatestAnalysisResponse,
  AiProviderRole,
  LecturerCourseAcademicClassificationPageResponse,
  CourseAcademicClassificationFilterParams,
} from "../types";

export const AI_LECTURER_QUERY_KEYS = {
  settings: (courseId: string) => ["lecturer", "courses", courseId, "ai-settings"] as const,
  credential: (courseId: string, role: AiProviderRole) =>
    ["lecturer", "courses", courseId, "ai-credential", role] as const,
  latestCourseProgress: (courseId: string) =>
    ["lecturer", "courses", courseId, "ai-progress", "latest"] as const,
  courseAnalysis: (courseId: string, analysisId: string) =>
    ["lecturer", "courses", courseId, "ai-analysis", analysisId] as const,
  academicClassifications: (courseId: string, params?: CourseAcademicClassificationFilterParams) =>
    ["lecturer", "courses", courseId, "academic-classifications", params] as const,
};

export function useCourseAiSettings(courseId: string) {
  return useQuery<CourseAiSettingsResponse>({
    queryKey: AI_LECTURER_QUERY_KEYS.settings(courseId),
    queryFn: () => CourseAiService.getSettings(courseId),
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateCourseAiSettings(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseAiSettingsUpdateRequest) =>
      CourseAiService.updateSettings(courseId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(AI_LECTURER_QUERY_KEYS.settings(courseId), updated);
    },
  });
}

export function useCourseAiCredential(courseId: string, role: AiProviderRole) {
  return useQuery<CourseAiCredentialResponse>({
    queryKey: AI_LECTURER_QUERY_KEYS.credential(courseId, role),
    queryFn: () => CourseAiService.getCredential(courseId, role),
    enabled: Boolean(courseId && role),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePutCourseAiCredential(courseId: string, role: AiProviderRole) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CourseAiCredentialPutRequest) =>
      CourseAiService.putCredential(courseId, role, data),
    onSuccess: (saved) => {
      queryClient.setQueryData(AI_LECTURER_QUERY_KEYS.credential(courseId, role), saved);
    },
  });
}

export function useRevokeCourseAiCredential(courseId: string, role: AiProviderRole) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => CourseAiService.revokeCredential(courseId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AI_LECTURER_QUERY_KEYS.credential(courseId, role),
      });
    },
  });
}

export function useLatestCourseProgress(courseId: string) {
  return useQuery<AiLatestAnalysisResponse>({
    queryKey: AI_LECTURER_QUERY_KEYS.latestCourseProgress(courseId),
    queryFn: () => CourseAiService.getLatestCourseProgress(courseId),
    enabled: Boolean(courseId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitCourseProgress(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation<AiAnalysisResponse, Error, void>({
    mutationFn: () => CourseAiService.submitCourseProgress(courseId),
    onSuccess: (run) => {
      queryClient.setQueryData<AiLatestAnalysisResponse>(
        AI_LECTURER_QUERY_KEYS.latestCourseProgress(courseId),
        { status: "FOUND", analysis: run }
      );
      queryClient.invalidateQueries({
        queryKey: AI_LECTURER_QUERY_KEYS.latestCourseProgress(courseId),
      });
    },
  });
}

export function useCourseAcademicClassifications(
  courseId: string,
  params?: CourseAcademicClassificationFilterParams
) {
  return useQuery<LecturerCourseAcademicClassificationPageResponse>({
    queryKey: AI_LECTURER_QUERY_KEYS.academicClassifications(courseId, params),
    queryFn: () => CourseAiService.getCourseAcademicClassifications(courseId, params),
    enabled: Boolean(courseId),
    staleTime: 1000 * 30,
  });
}

