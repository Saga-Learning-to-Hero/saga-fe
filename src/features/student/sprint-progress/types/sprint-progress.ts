export type IssueType = "STORY" | "TASK" | "BUG" | "SUBTASK";
export type IssuePriority = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
export type IssueStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type SprintStatus = "ACTIVE" | "PLANNED" | "COMPLETED";

export interface SprintIssue {
  id: string;
  key: string; // VD: SAGA-101
  summary: string;
  description?: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  storyPoints: number;
  assignee: {
    id: string;
    name: string;
    avatar: string;
    studentCode: string;
  };
  epic?: {
    id: string;
    name: string;
    color: string;
  };
  labels?: string[]; // VD: ["Frontend", "UI/UX"]
  sprintId: string;
  dueDate?: string;
  githubCommitCount?: number;
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string; // VD: Sprint 3 - Core Graph Engine
  goal: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  totalStoryPoints: number;
  completedStoryPoints: number;
}

export interface Epic {
  id: string;
  key: string; // VD: EPIC-01
  name: string; // VD: Graph Visualization
  color: string;
  description: string;
  progressPercent: number;
}
