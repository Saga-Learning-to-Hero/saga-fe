import type { ProjectSyncStatusItem } from "../types/student-project";
import type { SSEConnectionStatus } from "../types/project-realtime-types";

export const SYNC_POLL_ACTIVE_MS = 3000;
export const SYNC_POLL_TIMEOUT_MS = 90_000;

const ACTIVE_SYNC_STATUSES = new Set([
  "QUEUED",
  "ENQUEUED",
  "IN_PROGRESS",
  "RUNNING",
  "SYNCING",
]);

const TERMINAL_SYNC_STATUSES = new Set([
  "SUCCEEDED",
  "FAILED",
  "COMPLETED",
  "CANCELLED",
  "CANCELED",
  "SKIPPED_NOT_CONFIGURED",
  "SKIPPED_NOT_ACTIVE",
  "SKIPPED_ALREADY_RUNNING",
  "SKIPPED_NO_CREDENTIAL",
]);

function normalizeStatus(status?: string | null): string {
  return (status || "").trim().toUpperCase();
}

export function isTerminalSyncStatus(status?: string | null): boolean {
  return TERMINAL_SYNC_STATUSES.has(normalizeStatus(status));
}

export function isActiveSyncStatus(status?: string | null): boolean {
  const normalized = normalizeStatus(status);
  if (!normalized || isTerminalSyncStatus(normalized)) return false;
  return ACTIVE_SYNC_STATUSES.has(normalized);
}

/** Job đang chạy: status whitelist và chưa có completedAt. Status lạ không poll vô hạn. */
export function isActiveSyncJob(job?: Pick<ProjectSyncStatusItem, "status" | "completedAt"> | null): boolean {
  if (!job) return false;
  if (job.completedAt) return false;
  return isActiveSyncStatus(job.status);
}

export function isActivelySyncing(
  jobs?: Array<Pick<ProjectSyncStatusItem, "status" | "completedAt">> | null
): boolean {
  return Boolean(jobs?.some((job) => isActiveSyncJob(job)));
}

/** POST /sync chỉ Leader. Member không hiện nút và không gọi mutation. */
export function canRequestProjectSync(isTeamLeader: boolean): boolean {
  return isTeamLeader === true;
}

export function hasExceededSyncPollWindow(
  startedAtMs?: number | null,
  now = Date.now(),
  timeoutMs = SYNC_POLL_TIMEOUT_MS
): boolean {
  if (startedAtMs == null) return false;
  return now - startedAtMs >= timeoutMs;
}

/**
 * Poll GET /sync-status:
 * - Job active trong 90s: 3s
 * - SSE OPEN và idle: không poll
 * - SSE ERROR: 3s tối đa 90s rồi dừng
 * - CLOSED/CONNECTING idle: không poll (query lần đầu vẫn chạy)
 */
export function resolveSyncStatusPollInterval(input: {
  isActivelySyncing: boolean;
  sseStatus?: SSEConnectionStatus;
  activeSinceMs?: number | null;
  errorSinceMs?: number | null;
  now?: number;
}): number | false {
  const now = input.now ?? Date.now();
  const sseStatus = input.sseStatus ?? "CLOSED";

  if (input.isActivelySyncing) {
    if (hasExceededSyncPollWindow(input.activeSinceMs, now)) return false;
    return SYNC_POLL_ACTIVE_MS;
  }

  if (sseStatus === "OPEN") return false;

  if (sseStatus === "ERROR") {
    if (hasExceededSyncPollWindow(input.errorSinceMs, now)) return false;
    return SYNC_POLL_ACTIVE_MS;
  }

  return false;
}
