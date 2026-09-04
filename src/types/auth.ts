export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';

export type RoleInTeam = 'LEADER' | 'MEMBER' | 'MENTOR';

export const TEAM_ROLE_LABELS: Record<RoleInTeam, string> = {
  LEADER: 'Trưởng nhóm',
  MEMBER: 'Thành viên',
  MENTOR: 'Cố vấn / GVHD',
};

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BANNED';

export interface JiraIntegration {
  id?: string;
  name?: string;
  connected: boolean;
  serverUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  isPrimary?: boolean;
  lastSyncedAt?: string;
  syncedTasksCount?: number;
  status?: 'ACTIVE' | 'SYNCING' | 'ERROR';
}

export interface GitHubIntegration {
  id?: string;
  alias?: string;
  connected: boolean;
  username: string;
  accessToken: string;
  repository: string;
  defaultBranch: string;
  isPrimary?: boolean;
  lastSyncedAt?: string;
  syncedCommitsCount?: number;
  syncedPRsCount?: number;
  status?: 'ACTIVE' | 'SYNCING' | 'ERROR';
}

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  avatar: string;
  role: Role;
  phone?: string;
  studentCode?: string;
  lecturerCode?: string;
  department?: string;
  adminClass?: string;
  bio?: string;
  status?: UserStatus;
  jiraIntegration?: JiraIntegration;
  githubIntegration?: GitHubIntegration;
  jiraIntegrations?: JiraIntegration[];
  githubIntegrations?: GitHubIntegration[];
}
