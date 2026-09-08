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
  lastVerifiedAt?: string;
}

export interface UserIdentitiesResponse {
  identities: UserIdentityItem[];
}
