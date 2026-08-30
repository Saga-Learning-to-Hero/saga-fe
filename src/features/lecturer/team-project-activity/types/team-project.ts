import type { RoleInTeam } from "@/types/auth";

export type TeamMemberRole = RoleInTeam | "Leader" | "Member";
export type MemberStatus = "ACTIVE" | "INACTIVE" | "Active" | "Inactive";
export type TeamProjectStatus = "ACTIVE" | "PLANNED" | "COMPLETED" | "AT_RISK" | "Đang thực hiện" | "Chưa bắt đầu" | "Hoàn thành";

export interface TeamMember {
  id: string;
  studentCode: string; // MSSV chuẩn
  studentId?: string; // Tương thích ngược
  fullName: string;
  name?: string;
  email: string;
  avatar?: string;
  role: TeamMemberRole;
  groupId: string | null;
  groupName: string | null;
  status: MemberStatus;
  commitsCount?: number;
  tasksCount?: number;
}

export interface TeamProjectInfo {
  id: string; // teamId
  teamName: string;
  groupName?: string; // Tên nhóm chuẩn
  projectName: string;
  description: string;
  leaderId: string | null;
  members: TeamMember[];
  githubRepo: string | null;
  githubRepository?: string | null;
  jiraProjectKey: string | null;
  currentSprint: string | null;
  startDate: string;
  deadline: string;
  status: TeamProjectStatus;
  lastSyncAt: string | null;
}

export interface CommitActivity {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  shortSha: string;
  fullSha: string;
  hash?: string;
  shortHash?: string;
  branch: string;
  createdAt: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  jiraIssueKey: string | null;
  jiraKey?: string | null;
}

export type IssueType = "STORY" | "TASK" | "BUG" | "SUBTASK" | "Story" | "Task" | "Bug";
export type IssuePriority = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | "LOWEST" | "Highest" | "High" | "Medium" | "Low" | "Lowest";
export type IssueStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "TO DO" | "IN PROGRESS";

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  type: IssueType;
  priority: IssuePriority;
  assigneeId: string | null;
  storyPoint: number;
  labels: string[];
  dueDate: string | null;
  status: IssueStatus;
}

export interface SprintProgress {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
}
