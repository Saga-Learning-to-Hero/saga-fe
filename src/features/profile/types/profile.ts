export interface ProfileFormValues {
  name: string;
  username?: string;
  email: string;
  avatar: string;
}

export interface JiraSettingsValues {
  serverUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export interface GitHubSettingsValues {
  username: string;
  accessToken: string;
  repository: string;
  defaultBranch: string;
}
