import { apiClient } from "@/lib/axios";
import type {
  JiraLinkResponse,
  JiraPrimaryResponse,
} from "../types/jira-integrations";

export class JiraIntegrationsService {
  static async startLink(returnPath?: string): Promise<JiraLinkResponse> {
    const params = returnPath ? { returnPath: returnPath.trim() } : undefined;
    const response = await apiClient.post<JiraLinkResponse>(
      "/api/integrations/jira/link",
      null,
      { params }
    );
    return response.data;
  }

  static async setPrimaryIdentity(identityId: string): Promise<JiraPrimaryResponse> {
    if (!identityId || identityId.trim() === "") {
      throw new Error("Throw ValidationException: identityId is required");
    }
    const cleanId = identityId.trim();
    const response = await apiClient.patch<JiraPrimaryResponse>(
      `/api/integrations/jira/${encodeURIComponent(cleanId)}/primary`
    );
    return response.data;
  }

  static async handleOAuthCallback(code: string, state: string): Promise<unknown> {
    if (!code || !state) {
      throw new Error("Throw ValidationException: code and state are required");
    }
    const response = await apiClient.get("/api/integrations/jira/oauth/callback", {
      params: {
        code: code.trim(),
        state: state.trim(),
      },
    });
    return response.data;
  }

  static async deleteIdentity(identityId: string): Promise<void> {
    if (!identityId || identityId.trim() === "") {
      throw new Error("Throw ValidationException: identityId is required");
    }
    const cleanId = identityId.trim();
    await apiClient.delete(`/api/integrations/jira/${encodeURIComponent(cleanId)}`);
  }
}
