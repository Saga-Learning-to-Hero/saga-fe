import { apiClient } from "@/lib/axios";
import type {
  AiAnalysisResponse,
  AiAcademicClassificationResponse,
  AiAcademicReviewRequest,
} from "../types";

export const AcademicAiService = {
  async submitTaskAcademic(
    projectId: string,
    taskId: string
  ): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/tasks/${taskId}/academic-analyses`
    );
    return response.data;
  },

  async getTaskAcademicClassifications(
    projectId: string,
    taskId: string
  ): Promise<AiAcademicClassificationResponse[]> {
    const response = await apiClient.get<AiAcademicClassificationResponse[]>(
      `/api/projects/${projectId}/ai/tasks/${taskId}/academic-classifications`
    );
    return response.data;
  },

  async submitCommitAcademic(
    projectId: string,
    gitCommitId: string
  ): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/commits/${gitCommitId}/academic-analyses`
    );
    return response.data;
  },

  async getCommitAcademicClassifications(
    projectId: string,
    gitCommitId: string
  ): Promise<AiAcademicClassificationResponse[]> {
    const response = await apiClient.get<AiAcademicClassificationResponse[]>(
      `/api/projects/${projectId}/ai/commits/${gitCommitId}/academic-classifications`
    );
    return response.data;
  },

  async reviewAcademicClassification(
    projectId: string,
    classificationId: string,
    data: AiAcademicReviewRequest
  ): Promise<AiAcademicClassificationResponse> {
    const response = await apiClient.post<AiAcademicClassificationResponse>(
      `/api/projects/${projectId}/ai/academic-classifications/${classificationId}/review`,
      data
    );
    return response.data;
  },
};
