import { describe, expect, beforeEach, afterEach, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { apiClient } from "@/lib/axios";
import { AdminAuditService } from "@/features/admin/audit-log/api/admin-audit-service";
import {
  mapAdminAuditLogResponseToItem,
  parseDiffChanges,
  type AdminAuditLogItemResponse,
  type AdminAuditLogsListResponse,
} from "@/features/admin/audit-log/types/audit-log";

const mockAuditItem: AdminAuditLogItemResponse = {
  id: "log-uuid-01",
  occurredAt: "2026-09-16T05:58:40.759Z",
  actorUserId: "user-uuid-admin",
  actorFullNameSnapshot: "Nguyen Van Admin",
  actorRoleSnapshot: "ADMIN",
  actorEmailSnapshot: "admin@fpt.edu.vn",
  actorStudentCodeSnapshot: null,
  contextClassId: "class-uuid-01",
  contextClassCodeSnapshot: "SE1705",
  contextClassNameSnapshot: "K17 Software Engineering",
  contextCourseId: "course-uuid-01",
  contextTeamId: "team-uuid-01",
  contextTeamNoSnapshot: 1,
  contextTeamNameSnapshot: "Team 01 - Alpha",
  contextProjectId: "project-uuid-01",
  contextProjectNameSnapshot: "SAGA System",
  action: "USER_STATUS_CHANGE",
  entityType: "USER",
  entityId: "user-uuid-target",
  before: JSON.stringify({ status: "ACTIVE", role: "STUDENT" }),
  after: JSON.stringify({ status: "INACTIVE", role: "STUDENT" }),
  metadata: JSON.stringify({ ip: "192.168.1.1" }),
  source: "WEB",
  requestId: "req-12345",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0",
};

const mockListResponse: AdminAuditLogsListResponse = {
  items: [mockAuditItem],
  page: 0,
  size: 10,
  total: 1,
};

describe("AdminAuditService - Quản lý Nhật ký kiểm toán hệ thống", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "16/09/2026",
      description: "getAuditLogs goi GET /api/admin/audit-logs va tra ve danh sach nhat ky phan trang",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockListResponse });

      const res = await AdminAuditService.getAuditLogs({ page: 0, size: 10 });
      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/audit-logs", {
        params: { page: 0, size: 10 },
      });
      expect(res.items.length).toBe(1);
      expect(res.total).toBe(1);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "16/09/2026",
      description: "getAuditLogs truyen dung cac tham so query (actorUserId, action, entityType, from, to, page, size)",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockListResponse });

      await AdminAuditService.getAuditLogs({
        actorUserId: "uuid-123",
        action: "USER_BAN",
        entityType: "USER",
        entityId: "target-456",
        from: "2026-09-01T00:00:00Z",
        to: "2026-09-16T00:00:00Z",
        page: 1,
        size: 20,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/audit-logs", {
        params: {
          actorUserId: "uuid-123",
          action: "USER_BAN",
          entityType: "USER",
          entityId: "target-456",
          from: "2026-09-01T00:00:00Z",
          to: "2026-09-16T00:00:00Z",
          page: 1,
          size: 20,
        },
      });
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "16/09/2026",
      description: "mapAdminAuditLogResponseToItem anh xa dung thong tin actor, target, context va parse diff state Before/After",
    },
    () => {
      const item = mapAdminAuditLogResponseToItem(mockAuditItem);

      expect(item.id).toBe("log-uuid-01");
      expect(item.actor.fullName).toBe("Nguyen Van Admin");
      expect(item.actor.role).toBe("ADMIN");
      expect(item.category).toBe("AUTH_SECURITY");
      expect(item.context?.classCode).toBe("SE1705");
      expect(item.context?.courseId).toBe("course-uuid-01");
      expect(item.context?.teamNo).toBe(1);
      expect(item.context?.teamName).toBe("Team 01 - Alpha");
      expect(item.context?.projectName).toBe("SAGA System");
      expect(item.changes?.length).toBe(1);
      expect(item.changes?.[0].field).toBe("status");
      expect(item.changes?.[0].oldValue).toBe("ACTIVE");
      expect(item.changes?.[0].newValue).toBe("INACTIVE");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "16/09/2026",
      description: "parseDiffChanges so sanh chinh xac cac truong thay doi giua 2 object JSON",
    },
    () => {
      const before = JSON.stringify({ name: "Class A", students: 30 });
      const after = JSON.stringify({ name: "Class B", students: 30 });

      const diff = parseDiffChanges(before, after);
      expect(diff.length).toBe(1);
      expect(diff[0].field).toBe("name");
      expect(diff[0].oldValue).toBe("Class A");
      expect(diff[0].newValue).toBe("Class B");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "16/09/2026",
      description: "Xu ly loi khi apiClient.get throw HTTP 500 Server Error",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Internal Server Error 500"));

      await expect(AdminAuditService.getAuditLogs()).rejects.toThrow("Internal Server Error 500");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "16/09/2026",
      description: "Xu ly loi khi apiClient.get throw HTTP 403 Forbidden",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Forbidden 403"));

      await expect(AdminAuditService.getAuditLogs()).rejects.toThrow("Forbidden 403");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "16/09/2026",
      description: "parseDiffChanges xu ly an toan khi before/after la chuoi van ban khong phai JSON",
    },
    () => {
      const diff = parseDiffChanges("raw-before-state", "raw-after-state");
      expect(diff.length).toBe(1);
      expect(diff[0].oldValue).toBe("raw-before-state");
      expect(diff[0].newValue).toBe("raw-after-state");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "A",
      executedDate: "16/09/2026",
      description: "mapAdminAuditLogResponseToItem xu ly an toan khi DTO thieu cac snapshot name hoac context",
    },
    () => {
      const minimalItem: AdminAuditLogItemResponse = {
        id: "log-min",
        occurredAt: "2026-09-16T00:00:00Z",
        actorUserId: "actor-01",
        action: "TEST_ACTION",
        entityType: "TEST_ENTITY",
        entityId: "entity-01",
      };

      const mapped = mapAdminAuditLogResponseToItem(minimalItem);
      expect(mapped.actor.fullName).toBe("Hệ thống SAGA");
      expect(mapped.actor.role).toBe("SYSTEM");
      expect(mapped.context?.className).toBeUndefined();
      expect(mapped.target.name).toBe("TEST_ENTITY");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "16/09/2026",
      description: "getAuditLogs goi thanh cong khi khong truyen tham so params (undefined)",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockListResponse });

      const res = await AdminAuditService.getAuditLogs();
      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/audit-logs", {
        params: {},
      });
      expect(res.total).toBe(1);
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "16/09/2026",
      description: "getAuditLogs loai bo cac tham so chuoi rong hoac whitespace",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockListResponse });

      await AdminAuditService.getAuditLogs({
        action: "   ",
        entityType: "",
        actorUserId: "   ",
      });

      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/audit-logs", {
        params: {},
      });
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "16/09/2026",
      description: "getAuditLogs giu nguyen page=0 va size>0",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: mockListResponse });

      await AdminAuditService.getAuditLogs({
        page: 0,
        size: 15,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/audit-logs", {
        params: { page: 0, size: 15 },
      });
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "16/09/2026",
      description: "parseDiffChanges tra ve mang rong khi before va after deu rong hoac null",
    },
    () => {
      expect(parseDiffChanges(null, null)).toEqual([]);
      expect(parseDiffChanges("", "")).toEqual([]);
      expect(parseDiffChanges(undefined, undefined)).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "16/09/2026",
      description: "parseDiffChanges xu ly an toan khi before va after la object da parse san (Axios response)",
    },
    () => {
      const beforeObj = { accountStatus: "ACTIVE" };
      const afterObj = { accountStatus: "INACTIVE" };
      const diff = parseDiffChanges(beforeObj, afterObj);

      expect(diff.length).toBe(1);
      expect(diff[0].field).toBe("accountStatus");
      expect(diff[0].oldValue).toBe("ACTIVE");
      expect(diff[0].newValue).toBe("INACTIVE");
      expect(typeof diff[0].oldValue).toBe("string");
      expect(typeof diff[0].newValue).toBe("string");
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "B",
      executedDate: "16/09/2026",
      description: "parseDiffChanges xu ly an toan khi before hoac after chua nested object",
    },
    () => {
      const beforeObj = { profile: { name: "Nguyen Van A" } };
      const afterObj = { profile: { name: "Nguyen Van B" } };
      const diff = parseDiffChanges(beforeObj, afterObj);

      expect(diff.length).toBe(1);
      expect(diff[0].field).toBe("profile");
      expect(typeof diff[0].oldValue).toBe("string");
      expect(typeof diff[0].newValue).toBe("string");
      expect(diff[0].oldValue).toContain("Nguyen Van A");
      expect(diff[0].newValue).toContain("Nguyen Van B");
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "17/09/2026",
      description: "mapAdminAuditLogResponseToItem anh xa dung contextProjectNameSnapshot vao target.name khi action la PROJECT_UPDATED",
    },
    () => {
      const projectLogItem: AdminAuditLogItemResponse = {
        id: "log-proj-01",
        occurredAt: "2026-09-17T06:07:30.542Z",
        actorUserId: "user-uuid-01",
        actorFullNameSnapshot: "Le Hoang Hai",
        action: "PROJECT_UPDATED",
        entityType: "PROJECT",
        entityId: "proj-uuid-100",
        contextProjectId: "proj-uuid-100",
        contextProjectNameSnapshot: "SAGA Hệ thống Quản trị dự án",
      };

      const mapped = mapAdminAuditLogResponseToItem(projectLogItem);
      expect(mapped.target.name).toBe("SAGA Hệ thống Quản trị dự án");
      expect(mapped.context?.projectName).toBe("SAGA Hệ thống Quản trị dự án");
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "N",
      executedDate: "17/09/2026",
      description: "mapAdminAuditLogResponseToItem anh xa dung contextTeamNameSnapshot va contextTeamNoSnapshot khi doi ten Team",
    },
    () => {
      const teamLogItem: AdminAuditLogItemResponse = {
        id: "log-team-01",
        occurredAt: "2026-09-17T06:07:30.542Z",
        actorUserId: "user-uuid-02",
        actorFullNameSnapshot: "Tran Thi B",
        action: "TEAM_RENAME",
        entityType: "TEAM",
        entityId: "team-uuid-200",
        contextTeamId: "team-uuid-200",
        contextTeamNoSnapshot: 2,
        contextTeamNameSnapshot: "Chiến binh SAGA",
      };

      const mapped = mapAdminAuditLogResponseToItem(teamLogItem);
      expect(mapped.target.name).toBe("Chiến binh SAGA");
      expect(mapped.context?.teamNo).toBe(2);
      expect(mapped.context?.teamName).toBe("Chiến binh SAGA");
    }
  );
});
