import type {
  ProjectGitHubIntegration,
  ProjectIntegrationsResponse,
  ProjectSyncStatusItem,
} from "@/features/student/project/types/student-project";

export type GitHubConnectionStatus = "ACTIVE" | "REVOKED" | "NOT_CONNECTED";

export type GitHubSyncBadgeKind = "synced" | "syncing" | "failed" | "revoked" | "not_connected" | "idle";

function normalize(value?: string | null): string {
  return (value || "").trim().toUpperCase();
}

function asConnectionStatus(value?: string | null): GitHubConnectionStatus | null {
  const normalized = normalize(value);
  if (normalized === "ACTIVE" || normalized === "REVOKED" || normalized === "NOT_CONNECTED") {
    return normalized;
  }
  return null;
}

function hasActiveGitHubRepo(github?: ProjectGitHubIntegration | null): boolean {
  return Boolean(github?.repositories?.some((repo) => normalize(repo.status) === "ACTIVE"));
}

/** Ưu tiên connectionStatus trên dòng GITHUB của /sync-status; thiếu thì suy từ integrations. */
export function resolveGitHubConnectionStatus(
  syncRow?: Pick<ProjectSyncStatusItem, "connectionStatus"> | null,
  integrations?: Pick<ProjectIntegrationsResponse, "github"> | null
): GitHubConnectionStatus {
  const fromSync = asConnectionStatus(syncRow?.connectionStatus);
  if (fromSync) return fromSync;

  const github = integrations?.github;
  if (!github) return "NOT_CONNECTED";
  if (normalize(github.status) === "NOT_CONNECTED") return "NOT_CONNECTED";
  if (hasActiveGitHubRepo(github)) return "ACTIVE";
  if (normalize(github.status) === "REVOKED" || (github.repositories?.length ?? 0) > 0) {
    return "REVOKED";
  }
  if (normalize(github.status) === "ACTIVE") return "ACTIVE";
  return "NOT_CONNECTED";
}

export function isGitHubRepoActive(
  repo: { id?: string | null; fullPath?: string | null; fullName?: string | null } | null | undefined,
  integrations?: Pick<ProjectIntegrationsResponse, "github"> | null
): boolean {
  const repos = integrations?.github?.repositories || [];
  if (!repo || repos.length === 0) return false;
  const repoId = (repo.id || "").trim();
  const fullName = (repo.fullPath || repo.fullName || "").trim().toLowerCase();

  return repos.some((item) => {
    if (normalize(item.status) !== "ACTIVE") return false;
    if (repoId && item.id === repoId) return true;
    return Boolean(fullName && item.fullName.trim().toLowerCase() === fullName);
  });
}

export function resolveGitHubSyncBadgeKind(input: {
  connectionStatus: GitHubConnectionStatus;
  jobStatus?: string | null;
  isSyncing?: boolean;
}): GitHubSyncBadgeKind {
  if (input.connectionStatus === "REVOKED") return "revoked";
  if (input.connectionStatus === "NOT_CONNECTED") return "not_connected";
  if (input.isSyncing) return "syncing";
  const job = normalize(input.jobStatus);
  if (job === "FAILED") return "failed";
  if (job === "SUCCEEDED" || job === "COMPLETED") return "synced";
  return "idle";
}

export function formatSyncEnqueueLabel(code?: string | null): string {
  const normalized = normalize(code);
  if (!normalized) return "Không rõ";
  if (normalized === "QUEUED" || normalized === "ENQUEUED") return "Đã đưa vào hàng đợi";
  if (normalized === "SKIPPED_NOT_ACTIVE") return "GitHub đã bị ngắt kết nối, không thể đồng bộ.";
  if (normalized === "SKIPPED_NOT_CONFIGURED") return "Dự án chưa kết nối GitHub.";
  if (normalized === "SKIPPED_ALREADY_RUNNING") return "Đang có một lượt đồng bộ chạy.";
  if (normalized === "SKIPPED_NO_CREDENTIAL") return "Thiếu quyền truy cập, cần kết nối lại.";
  return code?.trim() || normalized;
}

export function formatProjectSyncEnqueueDescription(jira?: string | null, github?: string | null): string {
  return `Hàng đợi: Jira [${formatSyncEnqueueLabel(jira)}], GitHub [${formatSyncEnqueueLabel(github)}]. Dữ liệu sẽ tự cập nhật khi hoàn tất.`;
}
