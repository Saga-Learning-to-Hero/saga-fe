import { apiClient } from "@/lib/axios";
import type { UserIdentitiesResponse, UserIdentityItem } from "../types/user-integrations";

export class UserIntegrationsService {
  /**
   * Lấy danh sách danh tính các nhà cung cấp liên kết của người dùng hiện tại (Jira, GitHub)
   * GET /api/integrations/me
   *
   * @returns Danh sách identities của user
   */
  static async getUserIdentities(): Promise<UserIdentityItem[]> {
    const response = await apiClient.get<UserIdentitiesResponse>("/api/integrations/me");
    return response.data?.identities || [];
  }
}
