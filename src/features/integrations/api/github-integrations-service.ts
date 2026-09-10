import { apiClient } from "@/lib/axios";
import type {
  GitHubLinkResponse,
  GitHubPrimaryResponse,
} from "../types/github-integrations";

export class GitHubIntegrationsService {
  static async startLink(returnPath?: string): Promise<GitHubLinkResponse> {
    const params = returnPath ? { returnPath: returnPath.trim() } : undefined;
    const response = await apiClient.post<GitHubLinkResponse>(
      "/api/integrations/github/link",
      null,
      { params }
    );
    return response.data;
  }

  static async setPrimaryIdentity(identityId: string): Promise<GitHubPrimaryResponse> {
    if (!identityId || identityId.trim() === "") {
      throw new Error("Throw ValidationException: identityId is required");
    }
    const cleanId = identityId.trim();
    const response = await apiClient.patch<GitHubPrimaryResponse>(
      `/api/integrations/github/${encodeURIComponent(cleanId)}/primary`
    );
    return response.data;
  }

  static async handleOAuthCallback(code: string, state: string): Promise<unknown> {
    if (!code || !state) {
      throw new Error("Throw ValidationException: code and state are required");
    }
    const response = await apiClient.get("/api/integrations/github/oauth/callback", {
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
    await apiClient.delete(`/api/integrations/github/${encodeURIComponent(cleanId)}`);
  }
}
