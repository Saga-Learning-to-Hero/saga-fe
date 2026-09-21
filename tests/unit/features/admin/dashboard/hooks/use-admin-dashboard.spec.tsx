import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import { toast } from "sonner";
import { fptTest } from "@/testing/fpt-test-helper";
import { AdminDashboardService } from "@/features/admin/dashboard/api/admin-dashboard-service";
import {
  ADMIN_DASHBOARD_QUERY_KEYS,
  prefetchAdminDashboardSummary,
  useAdminDashboardForceRefresh,
} from "@/features/admin/dashboard/hooks/use-admin-dashboard";
import type { AdminDashboardSummaryResponse } from "@/features/admin/dashboard/types/dashboard";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

const summary = {
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
  availableSemesters: [],
  kpis: {
    totalStudents: 1,
    studentsGrowthPercentage: null,
    comparedSemesterCode: null,
    totalCourses: 1,
    totalTeams: 1,
    connectedTeamsCount: 1,
    connectedTeamsRate: 100,
    totalCommitsSynced: 1,
    totalJiraTasksSynced: 1,
    traceabilityRate: 100,
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
} satisfies AdminDashboardSummaryResponse;

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("Admin dashboard query hooks", () => {
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
      description: "Force refresh ghi response canonical trực tiếp vào cache đúng học kỳ",
    },
    async () => {
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      vi.spyOn(AdminDashboardService, "getSummary").mockResolvedValueOnce(summary);
      const { result } = renderHook(() => useAdminDashboardForceRefresh(), {
        wrapper: createWrapper(queryClient),
      });

      act(() => result.current.mutate("semester-1"));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(AdminDashboardService.getSummary).toHaveBeenCalledWith({
        semesterId: "semester-1",
        forceRefresh: true,
      });
      expect(
        queryClient.getQueryData(
          ADMIN_DASHBOARD_QUERY_KEYS.summary("semester-1")
        )
      ).toEqual(summary);
      expect(toast.success).toHaveBeenCalled();
      queryClient.clear();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "20/09/2026",
      description: "Hiển thị cảnh báo khi Backend trả snapshot refreshPending",
    },
    async () => {
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      vi.spyOn(AdminDashboardService, "getSummary").mockResolvedValueOnce({
        ...summary,
        cacheMetadata: { ...summary.cacheMetadata, refreshPending: true },
      });
      const { result } = renderHook(() => useAdminDashboardForceRefresh(), {
        wrapper: createWrapper(queryClient),
      });

      act(() => result.current.mutate("semester-1"));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.warning).toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
      queryClient.clear();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "20/09/2026",
      description: "Force refresh thất bại hiển thị lỗi và không retry vô hạn",
    },
    async () => {
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      vi.spyOn(AdminDashboardService, "getSummary").mockRejectedValueOnce(
        new Error("Redis unavailable")
      );
      const { result } = renderHook(() => useAdminDashboardForceRefresh(), {
        wrapper: createWrapper(queryClient),
      });

      act(() => result.current.mutate("semester-1"));

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(AdminDashboardService.getSummary).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalled();
      queryClient.clear();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "20/09/2026",
      description: "Prefetch học kỳ ghi dữ liệu vào đúng query key dùng bởi dashboard",
    },
    async () => {
      const queryClient = new QueryClient();
      vi.spyOn(AdminDashboardService, "getSummary").mockResolvedValueOnce(summary);

      await prefetchAdminDashboardSummary(queryClient, "semester-1");

      expect(AdminDashboardService.getSummary).toHaveBeenCalledWith({
        semesterId: "semester-1",
        signal: expect.any(AbortSignal),
      });
      expect(
        queryClient.getQueryData(
          ADMIN_DASHBOARD_QUERY_KEYS.summary("semester-1")
        )
      ).toEqual(summary);
      queryClient.clear();
    }
  );
});
