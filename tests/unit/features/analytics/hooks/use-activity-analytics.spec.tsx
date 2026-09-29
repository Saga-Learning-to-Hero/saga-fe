import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";
import { ActivityAnalyticsService } from "@/features/analytics/api/activity-analytics-service";
import {
  useTeamHeatmap,
  useSprintBurndown,
} from "@/features/analytics/hooks/use-activity-analytics";

vi.mock("@/features/analytics/api/activity-analytics-service", () => ({
  ActivityAnalyticsService: {
    getTeamHeatmap: vi.fn(),
    getSprintBurndown: vi.fn(),
  },
}));

describe("useActivityAnalytics Hooks", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "useTeamHeatmap không giữ placeholderData từ Sprint cũ khi chuyển Sprint, kích hoạt trạng thái loading chuẩn xác",
    },
    async () => {
      let resolveFirst: (value: unknown) => void;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      vi.mocked(ActivityAnalyticsService.getTeamHeatmap).mockReturnValueOnce(
        firstPromise as never
      );

      const { result, rerender } = renderHook(
        ({ startDate, endDate }) =>
          useTeamHeatmap("c1", "t1", { startDate, endDate }),
        {
          wrapper,
          initialProps: { startDate: "2026-03-01", endDate: "2026-03-14" },
        }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Giải quyết kết quả cho Sprint 1
      resolveFirst!({
        courseId: "c1",
        teamId: "t1",
        studentId: null,
        startDate: "2026-03-01",
        endDate: "2026-03-14",
        students: [],
        days: [{ date: "2026-03-05", totalActivities: 10 }],
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.data?.days).toHaveLength(1);

      // Chuyển sang Sprint 2 với mock delay
      let resolveSecond: (value: unknown) => void;
      const secondPromise = new Promise((resolve) => {
        resolveSecond = resolve;
      });
      vi.mocked(ActivityAnalyticsService.getTeamHeatmap).mockReturnValueOnce(
        secondPromise as never
      );

      rerender({ startDate: "2026-03-15", endDate: "2026-03-28" });

      // Vì không còn placeholderData, khi đổi sang query mới data của Sprint 1 không được dùng lại làm placeholder
      // và trạng thái isLoading / isFetching phản ánh chính xác là đang tải
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(true);

      resolveSecond!({
        courseId: "c1",
        teamId: "t1",
        studentId: null,
        startDate: "2026-03-15",
        endDate: "2026-03-28",
        students: [],
        days: [{ date: "2026-03-20", totalActivities: 5 }],
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.data?.days[0]?.totalActivities).toBe(5);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "29/09/2026",
      description: "useSprintBurndown không giữ placeholderData từ Sprint cũ khi chuyển Sprint, kích hoạt trạng thái loading chuẩn xác",
    },
    async () => {
      let resolveSprint1: (value: unknown) => void;
      const sprint1Promise = new Promise((resolve) => {
        resolveSprint1 = resolve;
      });

      vi.mocked(ActivityAnalyticsService.getSprintBurndown).mockReturnValueOnce(
        sprint1Promise as never
      );

      const { result, rerender } = renderHook(
        ({ sprintId }) => useSprintBurndown("c1", "t1", sprintId),
        {
          wrapper,
          initialProps: { sprintId: "sprint-1" },
        }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      resolveSprint1!({
        totalScope: 20,
        points: [{ date: "2026-03-01", actualRemaining: 20 }],
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.data?.totalScope).toBe(20);

      // Chuyển sang Sprint 2
      let resolveSprint2: (value: unknown) => void;
      const sprint2Promise = new Promise((resolve) => {
        resolveSprint2 = resolve;
      });
      vi.mocked(ActivityAnalyticsService.getSprintBurndown).mockReturnValueOnce(
        sprint2Promise as never
      );

      rerender({ sprintId: "sprint-2" });

      // Không còn previousData ở Sprint mới, data là undefined và isLoading = true
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(true);

      resolveSprint2!({
        totalScope: 35,
        points: [{ date: "2026-03-15", actualRemaining: 35 }],
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      expect(result.current.data?.totalScope).toBe(35);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "29/09/2026",
      description: "useSprintBurndown không kích hoạt truy vấn khi sprintId rỗng hoặc enabled=false",
    },
    () => {
      const { result } = renderHook(
        () => useSprintBurndown("c1", "t1", ""),
        { wrapper }
      );

      expect(result.current.fetchStatus).toBe("idle");
      expect(ActivityAnalyticsService.getSprintBurndown).not.toHaveBeenCalled();
    }
  );
});
