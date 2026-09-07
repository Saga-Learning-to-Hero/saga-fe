/**
 * Kiểu dữ liệu tích hợp GitHub cá nhân
 * APIs:
 * - POST /api/integrations/github/link
 * - PATCH /api/integrations/github/{identityId}/primary
 * - GET /api/integrations/github/oauth/callback
 * - DELETE /api/integrations/github/{identityId}
 */

export interface GitHubLinkResponse {
  authorizationUrl: string;
  state: string;
}

export interface GitHubLinkParams {
  returnPath?: string;
}

export type GitHubPrimaryResponse = Record<string, boolean>;

export interface GitHubOAuthCallbackParams {
  code: string;
  state: string;
}
