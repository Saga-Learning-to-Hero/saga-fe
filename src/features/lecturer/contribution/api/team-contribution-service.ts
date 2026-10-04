import { apiClient } from "@/lib/axios";
import { requireTeamId } from "@/lib/api-error";
import {
  parseContributionEvaluation,
  type ContributionEvaluation,
  type ContributionOverrideRequest,
  type ContributionOverrideResponse,
} from "../types/contribution";

export class TeamContributionService {
  static async getEvaluation(teamId: string): Promise<ContributionEvaluation> {
    const id = requireTeamId(teamId);
    const response = await apiClient.get(`/api/teams/${id}/contribution-evaluation`);
    return parseContributionEvaluation(response.data, id);
  }

  static async overrideContribution(
    teamId: string,
    payload: ContributionOverrideRequest
  ): Promise<ContributionOverrideResponse> {
    const id = requireTeamId(teamId);
    if (!payload?.studentProfileId || !payload.studentProfileId.trim()) {
      throw new Error("Mã hồ sơ sinh viên không được để trống.");
    }
    if (
      payload.percentage === undefined ||
      payload.percentage === null ||
      !Number.isFinite(payload.percentage) ||
      payload.percentage < 0 ||
      payload.percentage > 100
    ) {
      throw new Error("Tỷ lệ phần trăm đóng góp phải nằm trong khoảng từ 0% đến 100%.");
    }
    if (!payload?.reason || !payload.reason.trim()) {
      throw new Error("Vui lòng cung cấp lý do điều chỉnh tỷ lệ đóng góp.");
    }

    const response = await apiClient.post<ContributionOverrideResponse>(
      `/api/teams/${id}/contribution-override`,
      {
        studentProfileId: payload.studentProfileId.trim(),
        percentage: payload.percentage,
        reason: payload.reason.trim(),
      }
    );
    return response.data;
  }
}

