import type { JiraIntegration, GitHubIntegration } from "@/types/auth";

export interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  studentCode: string;
  department: string;
  adminClass: string;
  bio: string;
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
