"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminAuditService } from "../api/admin-audit-service";
import type { GetAdminAuditLogsParams } from "../types/audit-log";

export const ADMIN_AUDIT_QUERY_KEYS = {
  all: ["admin-audit-logs"] as const,
  list: (params?: GetAdminAuditLogsParams) =>
    ["admin-audit-logs", "list", params] as const,
};

export function useAdminAuditLogs(
  params?: GetAdminAuditLogsParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ADMIN_AUDIT_QUERY_KEYS.list(params),
    queryFn: () => AdminAuditService.getAuditLogs(params),
    staleTime: 1000 * 30, // 30 giây per performance rules
    enabled: options?.enabled ?? true,
  });
}
