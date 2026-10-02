import { apiClient } from "@/lib/axios";
import type {
  DelayCaseResponse,
  ExplainDelayCaseRequest,
  LeaderReviewRequest,
  LecturerReviewRequest,
  OnTimeRateResponse,
} from "../types/delay-cases";

export const delayCasesApi = {
  getDelayCases: async (
    projectId: string,
    params?: { status?: string | string[]; taskId?: string }
  ): Promise<DelayCaseResponse[]> => {
    const urlParams = new URLSearchParams();
    if (params?.taskId) {
      urlParams.append("taskId", params.taskId);
    }
    if (params?.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach((s) => urlParams.append("status", s));
      } else {
        urlParams.append("status", params.status);
      }
    }
    const qs = urlParams.toString();
    const url = `/api/projects/${projectId}/delay-cases${qs ? `?${qs}` : ""}`;
    const { data } = await apiClient.get<DelayCaseResponse[]>(url);
    return data;
  },

  getDelayCaseDetails: async (
    projectId: string,
    caseId: string
  ): Promise<DelayCaseResponse> => {
    const { data } = await apiClient.get<DelayCaseResponse>(
      `/api/projects/${projectId}/delay-cases/${caseId}`
    );
    return data;
  },

  explainDelayCase: async (
    projectId: string,
    caseId: string,
    payload: ExplainDelayCaseRequest
  ): Promise<DelayCaseResponse> => {
    const { data } = await apiClient.post<DelayCaseResponse>(
      `/api/projects/${projectId}/delay-cases/${caseId}/explanation`,
      payload
    );
    return data;
  },

  leaderReview: async (
    projectId: string,
    caseId: string,
    payload: LeaderReviewRequest
  ): Promise<DelayCaseResponse> => {
    const { data } = await apiClient.post<DelayCaseResponse>(
      `/api/projects/${projectId}/delay-cases/${caseId}/leader-review`,
      payload
    );
    return data;
  },

  lecturerReview: async (
    projectId: string,
    caseId: string,
    payload: LecturerReviewRequest
  ): Promise<DelayCaseResponse> => {
    const { data } = await apiClient.post<DelayCaseResponse>(
      `/api/projects/${projectId}/delay-cases/${caseId}/lecturer-review`,
      payload
    );
    return data;
  },

  reopenDelayCase: async (
    projectId: string,
    caseId: string
  ): Promise<DelayCaseResponse> => {
    const { data } = await apiClient.post<DelayCaseResponse>(
      `/api/projects/${projectId}/delay-cases/${caseId}/reopen`
    );
    return data;
  },

  getOnTimeRate: async (projectId: string): Promise<OnTimeRateResponse> => {
    const { data } = await apiClient.get<OnTimeRateResponse>(
      `/api/projects/${projectId}/on-time-rate`
    );
    return data;
  },

  getLecturerQueue: async (
    params?: { status?: string | string[] }
  ): Promise<DelayCaseResponse[]> => {
    const urlParams = new URLSearchParams();
    if (params?.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach((s) => urlParams.append("status", s));
      } else {
        urlParams.append("status", params.status);
      }
    }
    const qs = urlParams.toString();
    const url = `/api/lecturer/delay-cases${qs ? `?${qs}` : ""}`;
    const { data } = await apiClient.get<DelayCaseResponse[]>(url);
    return data;
  },
};
