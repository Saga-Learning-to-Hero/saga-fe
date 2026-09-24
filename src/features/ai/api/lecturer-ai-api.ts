import { apiClient } from "@/lib/axios";
import type {
  CourseAiSettingsResponse,
  CourseAiSettingsUpdateRequest,
  CourseAiBindingsUpdateRequest,
  CourseAiCredentialResponse,
  CourseAiCredentialPutRequest,
  AiProviderCatalogResponse,
  AiAnalysisResponse,
  AiLatestAnalysisResponse,
  AiProviderRole,
  LecturerCourseAcademicClassificationPageResponse,
  CourseAcademicClassificationFilterParams,
} from "../types";

export const CourseAiService = {
  async getProviderCatalog(courseId: string): Promise<AiProviderCatalogResponse> {
    const response = await apiClient.get<AiProviderCatalogResponse>(
      `/api/lecturer/courses/${courseId}/ai-provider-catalog`
    );
    return response.data;
  },

  async getSettings(courseId: string): Promise<CourseAiSettingsResponse> {
    const response = await apiClient.get<CourseAiSettingsResponse>(
      `/api/lecturer/courses/${courseId}/ai-settings`
    );
    return response.data;
  },

  async updateSettings(
    courseId: string,
    data: CourseAiSettingsUpdateRequest
  ): Promise<CourseAiSettingsResponse> {
    const response = await apiClient.patch<CourseAiSettingsResponse>(
      `/api/lecturer/courses/${courseId}/ai-settings`,
      data
    );
    return response.data;
  },

  async updateBindings(
    courseId: string,
    data: CourseAiBindingsUpdateRequest
  ): Promise<CourseAiSettingsResponse> {
    const response = await apiClient.put<CourseAiSettingsResponse>(
      `/api/lecturer/courses/${courseId}/ai-settings/bindings`,
      data
    );
    return response.data;
  },

  async getAllCredentials(courseId: string): Promise<CourseAiCredentialResponse[]> {
    const response = await apiClient.get<CourseAiCredentialResponse[]>(
      `/api/lecturer/courses/${courseId}/ai-credentials`
    );
    return response.data;
  },

  async getCredential(
    courseId: string,
    role: AiProviderRole,
    provider?: string
  ): Promise<CourseAiCredentialResponse> {
    const path = provider
      ? `/api/lecturer/courses/${courseId}/ai-credentials/${role}/${provider}`
      : `/api/lecturer/courses/${courseId}/ai-credentials/${role}`;
    const response = await apiClient.get<CourseAiCredentialResponse>(path);
    return response.data;
  },

  async putCredential(
    courseId: string,
    role: AiProviderRole,
    data: CourseAiCredentialPutRequest,
    provider?: string
  ): Promise<CourseAiCredentialResponse> {
    const targetProvider = provider || data.provider;
    if (targetProvider) {
      const response = await apiClient.put<CourseAiCredentialResponse>(
        `/api/lecturer/courses/${courseId}/ai-credentials/${role}/${targetProvider}`,
        { apiKey: data.apiKey }
      );
      return response.data;
    }
    const response = await apiClient.put<CourseAiCredentialResponse>(
      `/api/lecturer/courses/${courseId}/ai-credentials/${role}`,
      data
    );
    return response.data;
  },

  async revokeCredential(
    courseId: string,
    role: AiProviderRole,
    provider?: string
  ): Promise<void> {
    const path = provider
      ? `/api/lecturer/courses/${courseId}/ai-credentials/${role}/${provider}`
      : `/api/lecturer/courses/${courseId}/ai-credentials/${role}`;
    await apiClient.delete(path);
  },

  async submitCourseProgress(courseId: string): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/lecturer/courses/${courseId}/ai/progress-analyses`
    );
    return response.data;
  },

  async getLatestCourseProgress(courseId: string): Promise<AiLatestAnalysisResponse> {
    const response = await apiClient.get<AiLatestAnalysisResponse>(
      `/api/lecturer/courses/${courseId}/ai/progress-analyses/latest`
    );
    return response.data;
  },

  async getCourseAnalysis(courseId: string, analysisId: string): Promise<AiAnalysisResponse> {
    const response = await apiClient.get<AiAnalysisResponse>(
      `/api/lecturer/courses/${courseId}/ai/analyses/${analysisId}`
    );
    return response.data;
  },

  async exportCourseProgressDocx(courseId: string, analysisId: string): Promise<Blob> {
    const response = await apiClient.get(
      `/api/lecturer/courses/${courseId}/ai/analyses/${analysisId}/export.docx`,
      { responseType: "blob" }
    );
    return response.data;
  },

  async getCourseAcademicClassifications(
    courseId: string,
    params?: CourseAcademicClassificationFilterParams
  ): Promise<LecturerCourseAcademicClassificationPageResponse> {
    const response = await apiClient.get<LecturerCourseAcademicClassificationPageResponse>(
      `/api/lecturer/courses/${courseId}/ai/academic-classifications`,
      { params }
    );
    return response.data;
  },
};
