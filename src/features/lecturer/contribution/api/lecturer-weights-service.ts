import { apiClient } from "@/lib/axios";
import { requireCourseId } from "@/lib/api-error";
import {
  parseContributionTeamWeights,
  parseCourseContributionWeights,
  type ContributionConfigModeRequest,
  type ContributionSliceWeights,
  type ContributionSliceWeightsRequest,
  type ContributionTeamWeightsResponse,
} from "../types/contribution";

export class LecturerWeightsService {
  static async getSliceWeights(courseId: string): Promise<ContributionSliceWeights> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get(`/api/lecturer/courses/${id}/contribution-slice-weights`);
    return parseCourseContributionWeights(response.data);
  }

  static async updateSliceWeights(
    courseId: string,
    payload: ContributionSliceWeightsRequest
  ): Promise<ContributionSliceWeights> {
    const id = requireCourseId(courseId);
    const response = await apiClient.put(`/api/lecturer/courses/${id}/contribution-slice-weights`, {
      codeWeight: payload.codeWeight,
      testWeight: payload.testWeight,
      documentWeight: payload.documentWeight,
      researchWeight: payload.researchWeight,
    });
    return parseCourseContributionWeights(response.data);
  }

  static async updateConfigMode(
    courseId: string,
    payload: ContributionConfigModeRequest
  ): Promise<ContributionSliceWeights> {
    const id = requireCourseId(courseId);
    const response = await apiClient.put(`/api/lecturer/courses/${id}/contribution-config-mode`, {
      mode: payload.mode,
    });
    return parseCourseContributionWeights(response.data);
  }

  static async getTeamWeights(courseId: string): Promise<ContributionTeamWeightsResponse> {
    const id = requireCourseId(courseId);
    const response = await apiClient.get(`/api/lecturer/courses/${id}/contribution-team-weights`);
    return parseContributionTeamWeights(response.data, id);
  }
}
