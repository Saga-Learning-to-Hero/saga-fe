import { apiClient } from "@/lib/axios";
import { requireCourseId, requireTeamId, requireTeamMemberId } from "@/lib/api-error";
import { requireRemovalReason } from "@/lib/removal-reason";
import {
  parseLecturerTeamsResponse,
  type ConfirmTeamImportRequest,
  type ConfirmTeamImportResponse,
  type LecturerTeamsResponse,
  type TeamPreviewResponse,
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
    const response = await apiClient.get(`/api/lecturer/courses/${id}/teams`);
    return parseLecturerTeamsResponse(response.data, id);
  }

  static async replaceLeader(
    courseId: string,
    teamId: string,
    teamMemberId: string
  ): Promise<LecturerTeamsResponse> {
    const cid = requireCourseId(courseId);
    const tid = requireTeamId(teamId);
    const mid = requireTeamMemberId(teamMemberId);
    const response = await apiClient.put(`/api/lecturer/courses/${cid}/teams/${tid}/leader`, {
      teamMemberId: mid,
    });
    return parseLecturerTeamsResponse(response.data, cid);
  }

  static async addMember(
    courseId: string,
    teamId: string,
    courseEnrollmentId: string
  ): Promise<LecturerTeamsResponse> {
    const cid = requireCourseId(courseId);
    const tid = requireTeamId(teamId);
    if (!courseEnrollmentId || !courseEnrollmentId.trim()) {
      throw new Error("Throw ValidationException: Course enrollment ID is required");
    }
    const response = await apiClient.post(
      `/api/lecturer/courses/${cid}/teams/${tid}/members`,
      { courseEnrollmentId: courseEnrollmentId.trim() }
    );
    return parseLecturerTeamsResponse(response.data, cid);
  }

  static async moveMember(
    courseId: string,
    teamMemberId: string,
    targetTeamId: string
  ): Promise<LecturerTeamsResponse> {
    const cid = requireCourseId(courseId);
    const mid = requireTeamMemberId(teamMemberId);
    if (!targetTeamId || !targetTeamId.trim()) {
      throw new Error("Throw ValidationException: Target team ID is required");
    }
    const targetId = targetTeamId.trim();
    const response = await apiClient.patch(`/api/lecturer/courses/${cid}/team-members/${mid}/team`, {
      targetTeamId: targetId,
    });
    return parseLecturerTeamsResponse(response.data, cid);
  }

  static async removeMember(
    courseId: string,
    teamMemberId: string,
    reason: string
  ): Promise<LecturerTeamsResponse> {
    const cid = requireCourseId(courseId);
    const mid = requireTeamMemberId(teamMemberId);
    const trimmedReason = requireRemovalReason(reason);
    const response = await apiClient.delete(`/api/lecturer/courses/${cid}/team-members/${mid}`, {
      data: { reason: trimmedReason },
    });
    return parseLecturerTeamsResponse(response.data, cid);
  }
}
