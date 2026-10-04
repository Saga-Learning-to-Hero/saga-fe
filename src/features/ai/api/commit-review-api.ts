import { apiClient } from "@/lib/axios";
import type {
  CourseAiTeamAccessResponse,
  CommitAiBackfillResult,
  CommitAiReviewDetail,
  SaveTeamAiKeyRequest,
  TeamAiKeyStatus,
} from "../types";

export const REQUEST_REVIEW_TIMEOUT_MS = 60_000;

const base = (projectId: string) => `/api/projects/${encodeURIComponent(projectId)}`;

/** AI review of commits, the team's own AI key and manual commit-task attachments. */
export const CommitReviewService = {
  async getReview(projectId: string, commitId: string): Promise<CommitAiReviewDetail> {
    const response = await apiClient.get<CommitAiReviewDetail>(
      `${base(projectId)}/commits/${encodeURIComponent(commitId)}/ai-review`
    );
    return response.data;
  },

  async requestReview(projectId: string, commitId: string): Promise<CommitAiReviewDetail> {
    // The backend reads the commit's diff from GitHub before queueing (a large commit took ~25s);
    // the default 15s timeout cancelled the request and showed "cannot reach the server".
    const response = await apiClient.post<CommitAiReviewDetail>(
      `${base(projectId)}/commits/${encodeURIComponent(commitId)}/ai-review`,
      undefined,
      { timeout: REQUEST_REVIEW_TIMEOUT_MS }
    );
    return response.data;
  },

  async backfill(projectId: string, limit?: number): Promise<CommitAiBackfillResult> {
    const response = await apiClient.post<CommitAiBackfillResult>(
      `${base(projectId)}/commits/ai-review/backfill`,
      undefined,
      { params: limit ? { limit } : undefined }
    );
    return response.data;
  },

  async linkTask(projectId: string, commitId: string, taskId: string): Promise<CommitAiReviewDetail> {
    const response = await apiClient.post<CommitAiReviewDetail>(
      `${base(projectId)}/commits/${encodeURIComponent(commitId)}/manual-task-links`,
      { taskId }
    );
    return response.data;
  },

  async unlinkTask(projectId: string, commitId: string, taskId: string): Promise<CommitAiReviewDetail> {
    const response = await apiClient.delete<CommitAiReviewDetail>(
      `${base(projectId)}/commits/${encodeURIComponent(commitId)}/manual-task-links/${encodeURIComponent(taskId)}`
    );
    return response.data;
  },

  async getTeamKey(projectId: string): Promise<TeamAiKeyStatus> {
    const response = await apiClient.get<TeamAiKeyStatus>(`${base(projectId)}/ai-team-key`);
    return response.data;
  },

  async saveTeamKey(projectId: string, request: SaveTeamAiKeyRequest): Promise<TeamAiKeyStatus> {
    const response = await apiClient.put<TeamAiKeyStatus>(`${base(projectId)}/ai-team-key`, request);
    return response.data;
  },

  async removeTeamKey(projectId: string): Promise<TeamAiKeyStatus> {
    const response = await apiClient.delete<TeamAiKeyStatus>(`${base(projectId)}/ai-team-key`);
    return response.data;
  },

  async getTeamAccess(courseId: string): Promise<CourseAiTeamAccessResponse> {
    const response = await apiClient.get<CourseAiTeamAccessResponse>(
      `/api/lecturer/courses/${encodeURIComponent(courseId)}/ai/team-access`
    );
    return response.data;
  },

  async setTeamAccess(courseId: string, projectId: string, allowed: boolean): Promise<CourseAiTeamAccessResponse> {
    const response = await apiClient.put<CourseAiTeamAccessResponse>(
      `/api/lecturer/courses/${encodeURIComponent(courseId)}/ai/team-access/${encodeURIComponent(projectId)}`,
      { allowed }
    );
    return response.data;
  },
};
