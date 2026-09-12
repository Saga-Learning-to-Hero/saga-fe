export type ProjectRealtimeEventType =
  | "READY"
  | "TASKS_CHANGED"
  | "SPRINTS_CHANGED"
  | "COMMITS_CHANGED"
  | "TASK_LINKS_CHANGED"
  | "TASK_EVIDENCE_CHANGED"
  | "SYNC_STATUS_CHANGED";

export interface ProjectRealtimeEvent {
  type: ProjectRealtimeEventType;
  projectId: string;
  entityId?: string;
  occurredAt: string;
}

export type SSEConnectionStatus = "CONNECTING" | "OPEN" | "CLOSED" | "ERROR";

export interface UseProjectRealtimeOptions {
  enabled?: boolean;
  onEvent?: (event: ProjectRealtimeEvent) => void;
}

export interface UseProjectRealtimeReturn {
  status: SSEConnectionStatus;
  lastEvent: ProjectRealtimeEvent | null;
  lastEventTime: Date | null;
  reconnect: () => void;
}
