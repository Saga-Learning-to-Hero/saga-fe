/**
 * Kiểu dữ liệu tích hợp Atlassian Jira cá nhân
 * APIs:
 * - POST /api/integrations/jira/link
 * - PATCH /api/integrations/jira/{identityId}/primary
 * - GET /api/integrations/jira/oauth/callback
 * - DELETE /api/integrations/jira/{identityId}
 */

export interface JiraLinkResponse {
  authorizationUrl: string;
  state: string;
}

export interface JiraLinkParams {
  returnPath?: string;
}

export type JiraPrimaryResponse = Record<string, boolean>;

export interface JiraOAuthCallbackParams {
  code: string;
  state: string;
}
