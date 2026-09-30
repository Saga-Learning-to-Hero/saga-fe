export type IssueType = "EPIC" | "STORY" | "TASK" | "BUG" | "SUBTASK";
export type IssuePriority = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
export type IssueStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type SprintStatus = "ACTIVE" | "PLANNED" | "COMPLETED";

export interface SprintIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  storyPoints: number;
  assignee: {
    id: string;
    studentId?: string | null;
    name: string;
    avatar: string;
    studentCode: string;
    accountId?: string | null;
  };
  /** Jira parent identity. Present for subtasks and, depending on Jira project type, epic children. */
  parent?: {
    externalId?: string | null;
    externalKey?: string | null;
  };
  epic?: {
    id: string;
    name: string;
    color: string;
  };
  labels?: string[];
  sprintId: string;
  dueDate?: string;
  startDate?: string;
  githubCommitCount?: number;
  evidenceCount?: number;
  hasEvidence?: boolean;
  createdAt: string;
  superseded?: boolean;
  migratedFrom?: { taskId: string; externalKey: string } | null;
  migratedTo?: { taskId: string; externalKey: string } | null;
  jiraIntegrationId?: string | null;
  sourceProjectKey?: string | null;
}

export interface SprintOverlapItem {
  sprintId: string;
  name: string;
  state: string;
  jiraIntegrationId?: string | null;
  siteName?: string;
}

export interface SprintOverlapInfo {
  sprintName?: string;
  siteName?: string;
  startDate?: string;
  endDate?: string;
}

export interface Sprint {
  id: string;
  externalSprintId?: string | number | null;
  name: string;
  goal: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  totalStoryPoints: number;
  completedStoryPoints: number;
  overlaps?: SprintOverlapItem[];
  hasOverlap?: boolean;
  overlapWith?: SprintOverlapInfo | null;
}

export interface Epic {
  id: string;
  key: string;
  name: string;
  color: string;
  description: string;
  progressPercent: number;
}
