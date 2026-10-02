import { apiClient } from "@/lib/axios";
import { requireProjectId } from "@/lib/api-error";
import { mapDelayCase, type DelayCaseDetail } from "../types/delay-case";

function requireCaseId(caseId: string): string {
  if (!caseId || !caseId.trim()) {
    throw new Error("Throw ValidationException: Delay case ID is required");
  }
  return caseId.trim();
}

export class DelayCaseService {
  static async getDelayCase(projectId: string, caseId: string): Promise<DelayCaseDetail> {
    const project = requireProjectId(projectId);
    const delayCaseId = requireCaseId(caseId);
    const response = await apiClient.get(
      `/api/projects/${encodeURIComponent(project)}/delay-cases/${encodeURIComponent(delayCaseId)}`
    );
    return mapDelayCase(response.data);
  }
}
