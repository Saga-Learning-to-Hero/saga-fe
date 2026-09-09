import { apiClient } from "@/lib/axios";
import { requireStudentProfileId, requireTeamId } from "@/lib/api-error";
import {
  parseContributionEvaluation,
  parseContributionOverride,
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
    const studentProfileId = requireStudentProfileId(payload.studentProfileId);
    if (!Number.isFinite(payload.percentage)) {
      throw new Error("Throw ValidationException: Percentage is required");
    }

    const response = await apiClient.post(`/api/teams/${id}/contribution-override`, {
      studentProfileId,
      percentage: payload.percentage,
      reason: payload.reason,
    });
    return parseContributionOverride(response.data);
  }
}
