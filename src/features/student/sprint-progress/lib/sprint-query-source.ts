import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";

export type SprintQuerySourceStatus =
  | "pending"
  | "no_source"
  | "needs_selection"
  | "ready";

export interface SprintQuerySourceInput {
  explicitIntegrationId?: string | null;
  sourcesSettled: boolean;
  activeSourceIds: string[];
}

export interface SprintQuerySourceResolution {
  status: SprintQuerySourceStatus;
  enabled: boolean;
  integrationId?: string;
  activeCount: number;
}

export interface JiraSourceSettleInput {
  hasExplicitId: boolean;
  canonicalFetched: boolean;
  canonicalCount: number;
  integrationsEnabled: boolean;
  integrationsFetched: boolean;
}

/** Chờ query nguồn Jira settle trước khi gọi /sprints, trừ khi caller đã truyền integrationId. */
export function areJiraSourceQueriesSettled(input: JiraSourceSettleInput): boolean {
  if (input.hasExplicitId) return true;
  if (!input.canonicalFetched) return false;
  if (input.canonicalCount > 0) return true;
  if (!input.integrationsEnabled) return true;
  return input.integrationsFetched;
}

/**
 * Quyết định có gọi GET /sprints hay chưa.
 * Nhiều source active: không tự lấy source đầu; chỉ gọi khi đã có id tường minh.
 */
export function resolveSprintQuerySource(
  input: SprintQuerySourceInput
): SprintQuerySourceResolution {
  const explicit = input.explicitIntegrationId?.trim() || "";
  const activeSourceIds = input.activeSourceIds.filter((id) => Boolean(id?.trim()));
  const activeCount = activeSourceIds.length;

  if (explicit) {
    return {
      status: "ready",
      enabled: true,
      integrationId: explicit,
      activeCount,
    };
  }

  if (!input.sourcesSettled) {
    return { status: "pending", enabled: false, activeCount };
  }

  if (activeCount === 0) {
    return { status: "no_source", enabled: false, activeCount: 0 };
  }

  if (activeCount === 1) {
    return {
      status: "ready",
      enabled: true,
      integrationId: activeSourceIds[0],
      activeCount: 1,
    };
  }

  return { status: "needs_selection", enabled: false, activeCount };
}

/** 409/403 và integration đã thu hồi không được retry để tránh kẹt spinner. */
export function shouldRetrySprintQuery(failureCount: number, error: unknown): boolean {
  const status = getApiErrorStatus(error);
  const code = getApiErrorCode(error);
  if (status === 409 || status === 403) return false;
  if (
    code === "INTEGRATION_REVOKED" ||
    code === "INTEGRATION_NOT_FOUND" ||
    code === "ACCESS_DENIED"
  ) {
    return false;
  }
  return failureCount < 1;
}

export function getSprintSourceUserMessage(input: {
  status?: SprintQuerySourceStatus;
  error?: unknown;
}): { title: string; description: string } {
  const errorStatus = input.error ? getApiErrorStatus(input.error) : undefined;
  const code = input.error ? getApiErrorCode(input.error) : undefined;

  if (input.status === "no_source") {
    return {
      title: "Chưa kết nối Jira",
      description:
        "Dự án nhóm chưa có nguồn Jira đang hoạt động. Hãy kết nối Jira trước khi xem Sprint.",
    };
  }

  if (input.status === "needs_selection" || errorStatus === 409) {
    return {
      title: "Chưa chọn nguồn Jira",
      description: "Dự án có nhiều kết nối Jira — hãy chọn một nguồn để xem danh sách Sprint.",
    };
  }

  if (errorStatus === 403 || code === "ACCESS_DENIED") {
    return {
      title: "Không có quyền xem dữ liệu này",
      description:
        "Tài khoản hiện tại không được phép tải tiến độ nhóm. Hãy dùng bảng điều khiển cá nhân.",
    };
  }

  return {
    title: "Không tải được danh sách Sprint",
    description: getApiErrorMessage(
      input.error,
      "Vui lòng thử lại hoặc kiểm tra kết nối Jira của dự án."
    ),
  };
}
