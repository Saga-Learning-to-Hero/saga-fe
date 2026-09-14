import type { CustomSelectOption } from "@/components/common/custom-select";

export const UNASSIGNED_LANE_ID = "unassigned";
export const BACKLOG_SPRINT_ID = "backlog";

export interface PipelineMember {
  studentId: string;
  fullName: string;
  studentCode: string;
  teamRole: string;
}

export interface PipelineTask {
  id: string;
  key: string;
  title: string;
  status: string;
  issueTypeName: string;
  parent?: { externalId?: string | null; externalKey?: string | null } | null;
  assigneeStudentId: string | null;
  assigneeDisplayName: string | null;
  assigneeExternalId: string | null;
  sprintId: string;
  sprintName: string;
  storyPoint: number | null;
  priority: string | null;
  linkedCommitCount: number;
}

export interface PipelineCommit {
  id: string;
  sha: string;
  shortHash: string;
  message: string;
  authorStudentId: string | null;
  authorExternalId: string | null;
  authorLabel: string;
  committedAt: string;
  repositoryFullName: string;
  headRef?: string | null;
}

export interface PipelineLane {
  id: string;
  member: PipelineMember | null;
  tasks: PipelineTask[];
}

export interface PipelineSprintOption {
  id: string;
  name: string;
  state?: string;
}

export interface PipelineStats {
  totalMembers: number;
  totalTasks: number;
  totalCommits: number | null;
  tasksWithLinkedCommits: number;
  doneWithoutLinkedCommits: number;
}

export type PipelineAnomalyFilterType = "ALL" | "DONE_NO_COMMIT" | "UNASSIGNED" | "MISSING_COMMITS";

export interface PipelineFilterState {
  studentId: string;
  sprintId: string;
  anomaliesOnly?: boolean;
  anomalyType?: PipelineAnomalyFilterType;
  searchQuery?: string;
  branchName?: string;
}

export type PipelineFilterOption = CustomSelectOption;
