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
