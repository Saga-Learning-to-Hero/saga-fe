import { apiClient } from "@/lib/axios";
import type { UserIdentitiesResponse, UserIdentityItem } from "../types/user-integrations";

export class UserIntegrationsService {
  static async getUserIdentities(): Promise<UserIdentityItem[]> {
    const response = await apiClient.get<UserIdentitiesResponse>("/api/integrations/me");
    return response.data?.identities || [];
  }
}
