import { apiClient } from "@/lib/axios";
import type {
  GitHubLinkResponse,
  GitHubPrimaryResponse,
} from "../types/github-integrations";

export class GitHubIntegrationsService {
  /**
   * Khởi tạo liên kết tài khoản GitHub cá nhân qua OAuth
   * POST /api/integrations/github/link?returnPath={returnPath}
   *
   * @param returnPath Đường dẫn quay lại sau khi hoàn tất OAuth
   * @returns authorizationUrl và state
   */
  static async startLink(returnPath?: string): Promise<GitHubLinkResponse> {
    const params = returnPath ? { returnPath: returnPath.trim() } : undefined;
    const response = await apiClient.post<GitHubLinkResponse>(
      "/api/integrations/github/link",
      null,
      { params }
    );
    return response.data;
  }

  /**
   * Đặt định danh GitHub làm tài khoản chính (Primary)
   * PATCH /api/integrations/github/{identityId}/primary
   *
   * @param identityId UUID của bản ghi identity
   */
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

  /**
   * Xử lý callback OAuth GitHub (trao đổi code và state)
   * GET /api/integrations/github/oauth/callback?code={code}&state={state}
   *
   * @param code Mã ủy quyền từ GitHub OAuth
   * @param state Mã trạng thái CSRF OAuth
   */
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

  /**
   * Hủy liên kết danh tính GitHub cá nhân
   * DELETE /api/integrations/github/{identityId}
   *
   * @param identityId UUID của identity cần hủy liên kết
   */
  static async deleteIdentity(identityId: string): Promise<void> {
    if (!identityId || identityId.trim() === "") {
      throw new Error("Throw ValidationException: identityId is required");
    }
    const cleanId = identityId.trim();
    await apiClient.delete(`/api/integrations/github/${encodeURIComponent(cleanId)}`);
  }
}
