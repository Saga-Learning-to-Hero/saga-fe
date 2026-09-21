export interface TimelineTaskSummary {
  id: string;
  externalKey?: string | null;
  title?: string | null;
}

export interface TimelineSessionItem {
  id: string;
  userId: string;
  studentId?: string | null;
  studentCode?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  startedAt: string;
  endedAt?: string | null;
  status: "OPEN" | "COMPLETED" | string;
  elapsedSeconds: number;
}

export interface TimelineWorkSessionsBlock {
  sessionCount: number;
  totalElapsedSeconds: number;
  openSessions: TimelineSessionItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sessions: TimelineSessionItem[];
}

export interface TimelineCommitItem {
  id: string;
  sha: string;
  message: string;
  repositoryFullName?: string | null;
  authorStudentId?: string | null;
  committedAt?: string | null;
  linkedAt: string;
  linkSource?: string | null;
}

export interface TimelineCommitsBlock {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: TimelineCommitItem[];
}

export interface TaskWorkSessionTimelineResponse {
  task: TimelineTaskSummary;
  workSessions: TimelineWorkSessionsBlock;
  commits: TimelineCommitsBlock;
}

export interface GetTaskWorkSessionTimelineParams {
  sessionPage?: number;
  sessionSize?: number;
  commitPage?: number;
  commitSize?: number;
}
