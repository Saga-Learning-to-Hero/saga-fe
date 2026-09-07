/**
 * Kiểu dữ liệu danh tính nhà cung cấp liên kết cho người dùng hiện tại
 * API: GET /api/integrations/me
 */

export type IntegrationProvider = "JIRA" | "GITHUB" | (string & {});

export interface UserIdentityItem {
  id: string;
  provider: IntegrationProvider;
  providerSubject?: string;
  login?: string;
  displayName?: string;
  primary?: boolean;
  status?: string;
  linkedAt?: string;
}

export interface UserIdentitiesResponse {
  identities: UserIdentityItem[];
}
