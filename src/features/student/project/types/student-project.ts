import type { RoleInTeam } from "@/types/auth";

export type ProjectCategory =
  | "Web Application / EdTech"
  | "Mobile Application"
  | "AI & Machine Learning"
  | "Cloud & DevOps"
  | "Blockchain & Fintech"
  | "IoT & Embedded Systems";

export interface ProjectTeamMember {
  id: string;
  studentCode: string;
  name: string;
  fullName?: string;
  role: RoleInTeam;
  email: string;
  avatar?: string;
  tasksAssigned: number;
  tasksCompleted: number;
  traceabilityScore: number;
  commitsCount?: number;
}

export interface ProjectJiraConfig {
  serverUrl: string;
  projectKey: string;
  projectName?: string;
  connected: boolean;
  lastSyncedAt?: string;
  tasksCount?: number;
}

export interface ProjectGitHubRepo {
  id: string;
  repository: string;
  alias?: string;
  defaultBranch: string;
  connected: boolean;
  lastSyncedAt?: string;
  commitsCount?: number;
  pullRequestsCount?: number;
}

export interface StudentProjectDetails {
  id: string;
  name: string;
  projectName?: string;
  category: ProjectCategory;
  description: string;
  status: "ACTIVE" | "COMPLETED" | "DRAFT" | "PLANNED";
  courseCode: string;
  courseName: string;
  semesterCode: string;
  adminClassCode: string;
  groupName: string;
  lecturer: {
    name: string;
    fullName?: string;
    email: string;
    avatar?: string;
  };
  members: ProjectTeamMember[];
  techStack: string[];
  jiraConfig?: ProjectJiraConfig;
  githubRepositories?: ProjectGitHubRepo[];
  jiraProjectKey?: string;
  githubRepository?: string;
  githubRepo?: string;
  createdAt: string;
  updatedAt: string;
}
