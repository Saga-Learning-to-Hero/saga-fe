export interface TaskWorkSessionResponse {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt?: string | null;
  status: string;
  elapsedSeconds: number;
}

export interface TaskWorkSessionsResponse {
  taskId: string;
  activeSession: TaskWorkSessionResponse | null;
  sessions: TaskWorkSessionResponse[];
}

export interface TaskWebLinkItem {
  id: string;
  taskId: string;
  url: string;
  title: string;
  source: string;
  createdByUserId: string;
  createdAt: string;
}

export interface CreateTaskWebLinkPayload {
  url: string;
  title?: string;
}

export interface TaskFileItem {
  id: string;
  taskId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  source: string;
  createdByUserId: string;
  createdAt: string;
}

export interface CreateContributionConfirmationPayload {
  commitShas?: string[];
  pullRequests?: string[];
}

export interface ContributionConfirmationResponse {
  id: string;
  evidenceHash: string;
  state: string;
}

export type TaskEvidenceType = "COMMIT" | "FILE" | "WEB_LINK";

export interface TaskEvidenceCommitDetail {
  gitCommitId: string;
  sha: string;
  shortSha: string;
  message: string;
  committedAt: string;
  repositoryFullName: string;
}

export interface TaskEvidenceFileDetail {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  downloadPath: string;
}

export interface TaskEvidenceWebLinkDetail {
  url: string;
  title: string;
}

export interface TaskEvidenceItem {
  type: TaskEvidenceType;
  id: string;
  title: string;
  createdAt: string;
  source?: string | null;
  commit?: TaskEvidenceCommitDetail | null;
  file?: TaskEvidenceFileDetail | null;
  webLink?: TaskEvidenceWebLinkDetail | null;
}

export interface TaskEvidenceGroup {
  total: number;
  items: TaskEvidenceItem[];
}

export interface TaskEvidenceGroupedResponse {
  taskId: string;
  groups: {
    COMMIT: TaskEvidenceGroup;
    FILE: TaskEvidenceGroup;
    WEB_LINK: TaskEvidenceGroup;
  };
}

export interface TaskEvidencePageResponse {
  taskId: string;
  type: TaskEvidenceType;
  page: number;
  size: number;
  total: number;
  items: TaskEvidenceItem[];
}

export interface GetTaskEvidenceParams {
  type?: TaskEvidenceType;
  page?: number;
  size?: number;
}
