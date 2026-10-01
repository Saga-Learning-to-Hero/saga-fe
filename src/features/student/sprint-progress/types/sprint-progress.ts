import type { IssueTypeLevel, JiraTaskParent, TaskEvidenceCheck } from "./jira-task-types";

export type IssueType = "EPIC" | "STORY" | "TASK" | "BUG" | "SUBTASK";
export type IssuePriority = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
export type IssueStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type SprintStatus = "ACTIVE" | "PLANNED" | "COMPLETED";
export type { IssueTypeLevel, JiraTaskParent };

export interface SprintIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  type: IssueType;
  issueTypeId?: string | null;
  issueTypeName?: string | null;
  issueTypeLevel: IssueTypeLevel;
  jiraHierarchyLevel?: number | null;
  priority: IssuePriority;
  status: IssueStatus;
  /** STANDARD: story point thực. SUBTASK: tỷ trọng 1–10; null = chưa phân bổ. */
  storyPoints: number | null;
  assignee: {
    id: string;
    studentId?: string | null;
    name: string;
    avatar: string;
    studentCode: string;
    accountId?: string | null;
  };
  /** Jira parent hierarchy. Cha/con chỉ tin field BE, không suy từ tên loại thẻ. */
  parent?: JiraTaskParent;
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
  evidenceCheck?: TaskEvidenceCheck | null;
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
