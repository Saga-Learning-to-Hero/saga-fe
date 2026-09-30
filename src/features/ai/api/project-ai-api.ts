import { apiClient } from "@/lib/axios";
import type {
  AiAnalysisResponse,
  AiLatestAnalysisResponse,
  AiAdjudicationResponse,
} from "../types";

async function fetchLatestAnalysis(url: string): Promise<AiLatestAnalysisResponse> {
  try {
    const response = await apiClient.get<AiAnalysisResponse>(url);
    if (response.data && response.data.id) {
      return { status: "FOUND", analysis: response.data };
    }
    return { status: "NOT_ANALYZED", analysis: null };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 404) {
      return { status: "NOT_ANALYZED", analysis: null };
    }
    throw error;
  }
}

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
  ): Promise<{ items: AiAnalysisResponse[]; total: number; page: number; size: number }> {
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
    return fetchLatestAnalysis(
      `/api/projects/${projectId}/ai/tasks/${taskId}/intelligence-analyses/latest`
    );
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
    return fetchLatestAnalysis(
      `/api/projects/${projectId}/ai/tasks/${taskId}/risk-analyses/latest`
    );
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
    return fetchLatestAnalysis(
      `/api/projects/${projectId}/ai/students/${studentId}/risk-analyses/latest`
    );
  },

  async submitTeamRisk(projectId: string): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/team/risk-analyses`
    );
    return response.data;
  },

  async getLatestTeamRisk(projectId: string): Promise<AiLatestAnalysisResponse> {
    return fetchLatestAnalysis(
      `/api/projects/${projectId}/ai/team/risk-analyses/latest`
    );
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
    return fetchLatestAnalysis(
      `/api/projects/${projectId}/ai/students/${studentId}/progress-analyses/latest`
    );
  },

  async submitTeamProgress(projectId: string): Promise<AiAnalysisResponse> {
    const response = await apiClient.post<AiAnalysisResponse>(
      `/api/projects/${projectId}/ai/team/progress-analyses`
    );
    return response.data;
  },

  async getLatestTeamProgress(projectId: string): Promise<AiLatestAnalysisResponse> {
    return fetchLatestAnalysis(
      `/api/projects/${projectId}/ai/team/progress-analyses/latest`
    );
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
