import { apiClient } from "@/lib/axios";
import type {
  AiAnalysisResponse,
  AiLatestAnalysisResponse,
  AiAdjudicationResponse,
} from "../types";

export const ProjectAiService = {
  async submitCommitAnalysis(
    projectId: string,
    gitCommitId: string
  ): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/commits/${gitCommitId}/analyses`
    );
    return response.data;
  },

  async getCommitAnalysesHistory(
    projectId: string,
    gitCommitId: string,
    page?: number,
    size?: number
  ): Promise<{ content: AiAnalysisResponse[]; totalElements: number; totalPages: number }> {
    const response = await apiClient.get(
      `/api/projects/${projectId}/ai/commits/${gitCommitId}/analyses`,
      { params: { page, size } }
    );
    return response.data;
  },

  async submitTaskIntelligence(
    projectId: string,
    taskId: string
  ): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/tasks/${taskId}/intelligence-analyses`
    );
    return response.data;
  },

  async getLatestTaskIntelligence(
    projectId: string,
    taskId: string
  ): Promise<AiLatestAnalysisResponse> {
    const response = await apiClient.get<AiLatestAnalysisResponse>(
      `/api/projects/${projectId}/ai/tasks/${taskId}/intelligence-analyses/latest`
    );
    return response.data;
  },

  async submitTaskRisk(
    projectId: string,
    taskId: string
  ): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/tasks/${taskId}/risk-analyses`
    );
    return response.data;
  },

  async getLatestTaskRisk(
    projectId: string,
    taskId: string
  ): Promise<AiLatestAnalysisResponse> {
    const response = await apiClient.get<AiLatestAnalysisResponse>(
      `/api/projects/${projectId}/ai/tasks/${taskId}/risk-analyses/latest`
    );
    return response.data;
  },

  async submitStudentRisk(
    projectId: string,
    studentId: string
  ): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/students/${studentId}/risk-analyses`
    );
    return response.data;
  },

  async getLatestStudentRisk(
    projectId: string,
    studentId: string
  ): Promise<AiLatestAnalysisResponse> {
    const response = await apiClient.get<AiLatestAnalysisResponse>(
      `/api/projects/${projectId}/ai/students/${studentId}/risk-analyses/latest`
    );
    return response.data;
  },

  async submitTeamRisk(projectId: string): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/team/risk-analyses`
    );
    return response.data;
  },

  async getLatestTeamRisk(projectId: string): Promise<AiLatestAnalysisResponse> {
    const response = await apiClient.get<AiLatestAnalysisResponse>(
      `/api/projects/${projectId}/ai/team/risk-analyses/latest`
    );
    return response.data;
  },

  async submitStudentProgress(
    projectId: string,
    studentId: string
  ): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/students/${studentId}/progress-analyses`
    );
    return response.data;
  },

  async getLatestStudentProgress(
    projectId: string,
    studentId: string
  ): Promise<AiLatestAnalysisResponse> {
    const response = await apiClient.get<AiLatestAnalysisResponse>(
      `/api/projects/${projectId}/ai/students/${studentId}/progress-analyses/latest`
    );
    return response.data;
  },

  async submitTeamProgress(projectId: string): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/team/progress-analyses`
    );
    return response.data;
  },

  async getLatestTeamProgress(projectId: string): Promise<AiLatestAnalysisResponse> {
    const response = await apiClient.get<AiLatestAnalysisResponse>(
      `/api/projects/${projectId}/ai/team/progress-analyses/latest`
    );
    return response.data;
  },

  async getAnalysis(
    projectId: string,
    analysisId: string
  ): Promise<AiAnalysisResponse> {
    const response = await apiClient.get<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/analyses/${analysisId}`
    );
    return response.data;
  },

  async getAdjudication(
    projectId: string,
    analysisId: string
  ): Promise<AiAdjudicationResponse> {
    const response = await apiClient.get<AiAdjudicationResponse>(
      `/api/projects/${projectId}/ai/analyses/${analysisId}/adjudication`
    );
    return response.data;
  },

  async exportProjectProgressDocx(
    projectId: string,
    analysisId: string
  ): Promise<Blob> {
    const response = await apiClient.get(
      `/api/projects/${projectId}/ai/analyses/${analysisId}/export.docx`,
      { responseType: "blob" }
    );
    return response.data;
  },
};
