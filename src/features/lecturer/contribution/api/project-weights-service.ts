import { apiClient } from "@/lib/axios";
import { requireProjectId } from "@/lib/api-error";
import {
  parseProjectGroupWeights,
  type ProjectGroupWeights,
  type ProjectGroupWeightsRequest,
} from "../types/contribution";

export class ProjectWeightsService {
  static async getGroupWeights(projectId: string): Promise<ProjectGroupWeights> {
    const id = requireProjectId(projectId);
    const response = await apiClient.get(`/api/projects/${id}/group-weights`);
    return parseProjectGroupWeights(response.data, id);
  }

  static async updateGroupWeights(
    projectId: string,
    payload: ProjectGroupWeightsRequest
  ): Promise<ProjectGroupWeights> {
    const id = requireProjectId(projectId);
    const body: ProjectGroupWeightsRequest = {
      codeWeight: payload.codeWeight,
      testWeight: payload.testWeight,
      documentWeight: payload.documentWeight,
      researchWeight: payload.researchWeight,
    };
    if (payload.teamId) body.teamId = payload.teamId;
    if (payload.note !== undefined) body.note = payload.note;

    const response = await apiClient.put(`/api/projects/${id}/group-weights`, body);
    return parseProjectGroupWeights(response.data, id);
  }
}
