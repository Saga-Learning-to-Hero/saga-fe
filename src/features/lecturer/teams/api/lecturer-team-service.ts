import { apiClient } from "@/lib/axios";
import { requireCourseId } from "@/lib/api-error";
import type {
  ConfirmTeamImportRequest,
  ConfirmTeamImportResponse,
  LecturerTeamsResponse,
  TeamPreviewResponse,
} from "../types/lecturer-team";

export class LecturerTeamService {
  static async getTemplate(courseId: string): Promise<Blob> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<Blob>(`/api/lecturer/courses/${id}/teams/template`, {
      responseType: "blob",
      adapter: "fetch",
    });
    return response.data;
  }

  static async previewImport(courseId: string, file: File): Promise<TeamPreviewResponse> {
    const id = requireCourseId(courseId);
    if (!file) {
      throw new Error("Throw ValidationException: Excel file is required");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<TeamPreviewResponse>(
      `/api/lecturer/courses/${id}/teams/import/preview`,
      formData,
      {
        transformRequest: [
          (data, headers) => {
            if (typeof FormData !== "undefined" && data instanceof FormData) {
              headers.delete("Content-Type");
            }
            return data;
          },
        ],
      }
    );
    return response.data;
  }

  static async confirmImport(
    courseId: string,
    data: ConfirmTeamImportRequest
  ): Promise<ConfirmTeamImportResponse> {
    const id = requireCourseId(courseId);
    if (!data.previewToken || !data.previewToken.trim()) {
      throw new Error("Throw ValidationException: Preview token is required");
    }

    const response = await apiClient.post<ConfirmTeamImportResponse>(
      `/api/lecturer/courses/${id}/teams/import/confirm`,
      { previewToken: data.previewToken.trim() }
    );
    return response.data;
  }

  static async getTeams(courseId: string): Promise<LecturerTeamsResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get<LecturerTeamsResponse>(`/api/lecturer/courses/${id}/teams`);
    const data = response.data;

    return {
      courseId: data?.courseId || id,
      teams: Array.isArray(data?.teams) ? data.teams : [],
    };
  }
}
