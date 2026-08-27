export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface JiraIntegration {
  connected: boolean;
  serverUrl: string; // VD: https://saga-capstone.atlassian.net
  email: string; // VD: hailhhe170504@fpt.edu.vn
  apiToken: string;
  projectKey: string; // VD: SAGA-CAPSTONE
  lastSyncedAt?: string;
}

export interface GitHubIntegration {
  connected: boolean;
  username: string; // VD: lehoanghai-fpt
  accessToken: string;
  repository: string; // VD: Saga-Learning-to-Hero/saga-fe
  defaultBranch: string; // VD: main
  lastSyncedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  phone?: string;
  studentCode?: string;
  department?: string;
  adminClass?: string;
  bio?: string;
  jiraIntegration?: JiraIntegration;
  githubIntegration?: GitHubIntegration;
}
