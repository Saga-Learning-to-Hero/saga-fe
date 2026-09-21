import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import { AdminDashboardService } from "@/features/admin/dashboard/api/admin-dashboard-service";
import type { AdminDashboardSummaryResponse } from "@/features/admin/dashboard/types/dashboard";

const summary: AdminDashboardSummaryResponse = {
  selectedSemester: {
    id: "semester-1",
    code: "FA26",
    name: "Fall 2026",
    startDate: "2026-09-01",
    endDate: "2026-12-15",
    totalWeeks: 16,
    currentWeekIndex: 3,
    active: true,
  },
  availableSemesters: [
    {
      id: "semester-1",
      code: "FA26",
      name: "Fall 2026",
      startDate: "2026-09-01",
      endDate: "2026-12-15",
      active: true,
      periodStatus: "IN_PROGRESS",
    },
  ],
  kpis: {
    totalStudents: 120,
    studentsGrowthPercentage: 12.5,
    comparedSemesterCode: "SU26",
    totalCourses: 8,
    totalTeams: 24,
    connectedTeamsCount: 20,
    connectedTeamsRate: 83.33,
    totalCommitsSynced: 900,
    totalJiraTasksSynced: 400,
    traceabilityRate: 62.5,
  },
  weeklyTimeline: [],
  unconnectedTeamsAlert: [],
  integrationPulse: [],
  cacheMetadata: {
    cachedAt: "2026-09-20T04:00:00Z",
    expiresAt: "2026-09-20T04:10:00Z",
    ttlSecondsRemaining: 580,
    refreshPending: false,
  },
};

describe("AdminDashboardService - Tổng quan điều hành Admin", () => {
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
      executedDate: "20/09/2026",
      description: "Lấy dashboard của học kỳ active khi không truyền query parameter",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: summary });

      await expect(AdminDashboardService.getSummary()).resolves.toEqual(summary);
      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/dashboard/summary");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "20/09/2026",
      description: "Truyền semesterId đúng contract để xem dashboard học kỳ được chọn",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: summary });

      await AdminDashboardService.getSummary({ semesterId: "semester-1" });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/admin/dashboard/summary?semesterId=semester-1"
      );
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "20/09/2026",
      description: "Gửi forceRefresh=true cùng semesterId khi Admin làm mới dữ liệu",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: summary });

      await AdminDashboardService.getSummary({
        semesterId: "semester-1",
        forceRefresh: true,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/admin/dashboard/summary?semesterId=semester-1&forceRefresh=true"
      );
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "20/09/2026",
      description: "Không gửi forceRefresh=false dư thừa trong URL",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: summary });

      await AdminDashboardService.getSummary({ forceRefresh: false });

      expect(apiClient.get).toHaveBeenCalledWith("/api/admin/dashboard/summary");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "20/09/2026",
      description: "Truyền AbortSignal xuống Axios để hủy request học kỳ đã lỗi thời",
    },
    async () => {
      const controller = new AbortController();
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: summary });

      await AdminDashboardService.getSummary({ signal: controller.signal });

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/admin/dashboard/summary",
        { signal: controller.signal }
      );
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "20/09/2026",
      description: "Lan truyền lỗi máy chủ để hook hiển thị error state chính xác",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        new Error("SEMESTER_NOT_FOUND")
      );

      await expect(AdminDashboardService.getSummary()).rejects.toThrow(
        "SEMESTER_NOT_FOUND"
      );
    }
  );
});
