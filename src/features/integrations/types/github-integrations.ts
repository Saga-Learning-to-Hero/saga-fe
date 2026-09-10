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
