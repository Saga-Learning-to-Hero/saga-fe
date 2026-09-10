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
