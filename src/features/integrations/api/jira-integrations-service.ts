import { apiClient } from "@/lib/axios";
import type {
  JiraLinkResponse,
  JiraPrimaryResponse,
} from "../types/jira-integrations";

export class JiraIntegrationsService {
  /**
   * Khởi tạo liên kết tài khoản Atlassian Jira cá nhân qua OAuth 2.0
   * POST /api/integrations/jira/link?returnPath={returnPath}
   *
   * @param returnPath Đường dẫn quay lại sau khi hoàn tất OAuth
   * @returns authorizationUrl và state
   */
  static async startLink(returnPath?: string): Promise<JiraLinkResponse> {
    const params = returnPath ? { returnPath: returnPath.trim() } : undefined;
    const response = await apiClient.post<JiraLinkResponse>(
      "/api/integrations/jira/link",
      null,
      { params }
    );
    return response.data;
  }

  /**
   * Đặt định danh Jira làm tài khoản chính (Primary)
   * PATCH /api/integrations/jira/{identityId}/primary
   *
   * @param identityId UUID của bản ghi identity
   */
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

  /**
   * Xử lý callback OAuth Atlassian Jira (trao đổi code và state)
   * GET /api/integrations/jira/oauth/callback?code={code}&state={state}
   *
   * @param code Mã ủy quyền từ Atlassian OAuth
   * @param state Mã trạng thái CSRF OAuth
   */
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

  /**
   * Hủy liên kết danh tính Jira cá nhân
   * DELETE /api/integrations/jira/{identityId}
   *
   * @param identityId UUID của identity cần hủy liên kết
   */
  static async deleteIdentity(identityId: string): Promise<void> {
    if (!identityId || identityId.trim() === "") {
      throw new Error("Throw ValidationException: identityId is required");
    }
    const cleanId = identityId.trim();
    await apiClient.delete(`/api/integrations/jira/${encodeURIComponent(cleanId)}`);
  }
}
