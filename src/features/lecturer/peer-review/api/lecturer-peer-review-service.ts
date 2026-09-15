import { apiClient } from "@/lib/axios";
import { requireSprintId, requireTeamId } from "@/lib/api-error";
import { parseLecturerPeerReviewList, parseLecturerPeerReviewRubric } from "../lib/lecturer-peer-review";
import type {
  LecturerPeerReviewListResponse,
  LecturerPeerReviewRubric,
} from "../types/lecturer-peer-review";

export class LecturerPeerReviewService {
  static async getTeamRubric(teamId: string): Promise<LecturerPeerReviewRubric> {
    const id = requireTeamId(teamId);
    const res = await apiClient.get(`/api/teams/${encodeURIComponent(id)}/peer-review-rubric`);
    return parseLecturerPeerReviewRubric(res.data);
  }

  static async getSprintReviews(teamId: string, sprintId: string): Promise<LecturerPeerReviewListResponse> {
    const id = requireTeamId(teamId);
    const sprint = requireSprintId(sprintId);
    const res = await apiClient.get(
      `/api/teams/${encodeURIComponent(id)}/sprints/${encodeURIComponent(sprint)}/peer-reviews`
    );
    return parseLecturerPeerReviewList(res.data);
  }
}
