import { apiClient } from "@/lib/axios";
import type {
  AdminAuditLogsListResponse,
  GetAdminAuditLogsParams,
} from "../types/audit-log";

export class AdminAuditService {
  /**
   * Lấy danh sách nhật ký kiểm toán hệ thống qua API máy chủ SAGA.
   */
  static async getAuditLogs(
    params?: GetAdminAuditLogsParams
  ): Promise<AdminAuditLogsListResponse> {
    const cleanParams: Record<string, string | number> = {};

    if (params) {
      if (params.actorUserId && params.actorUserId.trim()) {
        cleanParams.actorUserId = params.actorUserId.trim();
      }
      if (params.action && params.action.trim()) {
        cleanParams.action = params.action.trim();
      }
      if (params.entityType && params.entityType.trim()) {
        cleanParams.entityType = params.entityType.trim();
      }
      if (params.entityId && params.entityId.trim()) {
        cleanParams.entityId = params.entityId.trim();
      }
      if (params.from && params.from.trim()) {
        cleanParams.from = params.from.trim();
      }
      if (params.to && params.to.trim()) {
        cleanParams.to = params.to.trim();
      }
      if (params.page !== undefined && params.page >= 0) {
        cleanParams.page = params.page;
      }
      if (params.size !== undefined && params.size > 0) {
        cleanParams.size = params.size;
      }
    }

    const response = await apiClient.get<AdminAuditLogsListResponse>(
      "/api/admin/audit-logs",
      {
        params: cleanParams,
      }
    );

    return response.data;
  }
}
