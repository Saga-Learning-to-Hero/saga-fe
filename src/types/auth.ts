export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';

export type RoleInTeam = 'LEADER' | 'MEMBER' | 'MENTOR';

export const TEAM_ROLE_LABELS: Record<RoleInTeam, string> = {
  LEADER: 'Trưởng nhóm',
  MEMBER: 'Thành viên',
  MENTOR: 'Cố vấn / GVHD',
};

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BANNED';

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
}
