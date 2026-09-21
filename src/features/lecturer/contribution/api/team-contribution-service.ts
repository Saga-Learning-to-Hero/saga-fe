import { apiClient } from "@/lib/axios";
import { requireTeamId } from "@/lib/api-error";
import {
  parseContributionEvaluation,
  type ContributionEvaluation,
} from "../types/contribution";

export class TeamContributionService {
  static async getEvaluation(teamId: string): Promise<ContributionEvaluation> {
    const id = requireTeamId(teamId);
    const response = await apiClient.get(`/api/teams/${id}/contribution-evaluation`);
    return parseContributionEvaluation(response.data, id);
  }
}
