import { apiClient } from "@/lib/axios";
import { requireSprintId, requireTeamId } from "@/lib/api-error";
import {
  assertNoLegacySubmitFields,
  buildSubmitPeerReviewPayload,
  parsePeerReviewCandidatesResponse,
  parsePeerReviewRubric,
  parseSubmitPeerReviewResponse,
} from "../lib/peer-review-payload";
import type {
  PeerReviewCandidatesResponse,
  PeerReviewRubric,
  SubmitPeerReviewInput,
  SubmitPeerReviewResponse,
} from "../types/peer-review";

export class PeerReviewService {
  static async getTeamRubric(teamId: string): Promise<PeerReviewRubric> {
    const id = requireTeamId(teamId);
    const res = await apiClient.get(`/api/teams/${encodeURIComponent(id)}/peer-review-rubric`);
    return parsePeerReviewRubric(res.data);
  }

  static async getDefaultRubric(): Promise<PeerReviewRubric> {
    const res = await apiClient.get("/api/peer-review-rubrics/default");
    return parsePeerReviewRubric(res.data);
  }

  static async getCandidates(teamId: string, sprintId: string): Promise<PeerReviewCandidatesResponse> {
    const id = requireTeamId(teamId);
    const sprint = requireSprintId(sprintId);
    const res = await apiClient.get(
      `/api/teams/${encodeURIComponent(id)}/sprints/${encodeURIComponent(sprint)}/peer-reviews/candidates`
    );
    return parsePeerReviewCandidatesResponse(res.data);
  }

  static async submitReview(
    teamId: string,
    sprintId: string,
    input: SubmitPeerReviewInput
  ): Promise<SubmitPeerReviewResponse> {
    const id = requireTeamId(teamId);
    const sprint = requireSprintId(sprintId);
    const payload = buildSubmitPeerReviewPayload(input);
    assertNoLegacySubmitFields(payload);
    const res = await apiClient.post(
      `/api/teams/${encodeURIComponent(id)}/sprints/${encodeURIComponent(sprint)}/peer-reviews`,
      payload
    );
    return parseSubmitPeerReviewResponse(res.data, { sprintId: sprint, revieweeId: payload.revieweeId });
  }
}
