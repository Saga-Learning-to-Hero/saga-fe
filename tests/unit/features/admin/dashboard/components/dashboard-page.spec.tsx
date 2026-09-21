import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, vi } from "vitest";
import { DashboardPage } from "@/features/admin/dashboard/components/dashboard-page";
import type { AdminDashboardSummaryResponse } from "@/features/admin/dashboard/types/dashboard";
import { fptTest } from "@/testing/fpt-test-helper";

const mocks = vi.hoisted(() => ({
  useSummary: vi.fn(),
  useForceRefresh: vi.fn(),
  prefetch: vi.fn(),
  mutate: vi.fn(),
  toastError: vi.fn(),
  queryClient: {},
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => mocks.queryClient,
  };
});

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

vi.mock("@/features/admin/dashboard/hooks/use-admin-dashboard", () => ({
  useAdminDashboardSummary: (semesterId?: string) =>
    mocks.useSummary(semesterId),
  useAdminDashboardForceRefresh: () => mocks.useForceRefresh(),
  prefetchAdminDashboardSummary: (...args: unknown[]) =>
    mocks.prefetch(...args),
}));

vi.mock("@/features/admin/dashboard/components/dashboard-charts", () => ({
  DashboardChartsSection: () => <div>Biểu đồ dashboard</div>,
}));

vi.mock("@/features/admin/dashboard/components/webhook-integration-card", () => ({
  WebhookIntegrationSection: () => <div>Tích hợp dashboard</div>,
}));

vi.mock("@/features/admin/dashboard/components/recent-audit-stream", () => ({
  RecentAuditSection: () => <div>Nhật ký dashboard</div>,
}));

const summary = {
  selectedSemester: {
    id: "semester-1",
    code: "FA26",
    name: "Fall 2026",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    totalWeeks: 18,
    currentWeekIndex: 3,
    active: true,
  },
  availableSemesters: [
    {
      id: "semester-1",
      code: "FA26",
      name: "Fall 2026",
      startDate: "2026-09-01",
      endDate: "2026-12-31",
      active: true,
      periodStatus: "IN_PROGRESS",
    },
    {
      id: "semester-2",
      code: "SP27",
      name: "Spring 2027",
      startDate: "2027-01-01",
      endDate: "2027-04-30",
      active: false,
      periodStatus: "UPCOMING",
    },
  ],
  kpis: {
    totalStudents: 6,
    studentsGrowthPercentage: null,
    comparedSemesterCode: null,
    totalCourses: 11,
    totalTeams: 2,
    connectedTeamsCount: 1,
    connectedTeamsRate: 50,
    totalCommitsSynced: 428,
    totalJiraTasksSynced: 128,
    traceabilityRate: 41.4,
  },
  weeklyTimeline: [],
  unconnectedTeamsAlert: [],
  integrationPulse: [],
  cacheMetadata: {
    cachedAt: "2026-09-20T11:38:00Z",
    expiresAt: "2026-09-20T11:48:00Z",
    ttlSecondsRemaining: 599,
    refreshPending: false,
  },
} satisfies AdminDashboardSummaryResponse;

function successfulQuery(data = summary) {
  return {
    data,
    isPending: false,
    isFetching: false,
    isPlaceholderData: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
}

describe("DashboardPage performance states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSummary.mockImplementation(() => successfulQuery());
    mocks.useForceRefresh.mockReturnValue({
      mutate: mocks.mutate,
      isPending: false,
    });
    mocks.prefetch.mockResolvedValue(undefined);
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "21/09/2026",
      description: "Hiển thị dashboard canonical với câu chữ tinh gọn và không lộ TTL trên giao diện chính",
    },
    () => {
      render(<DashboardPage />);

      expect(screen.getByText("Sinh viên đang học")).toBeInTheDocument();
      expect(screen.getByText("Tỷ lệ commit liên kết task")).toBeInTheDocument();
      expect(screen.queryByText("Dữ liệu máy chủ")).not.toBeInTheDocument();
      expect(screen.queryByText(/TTL:/)).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "21/09/2026",
      description: "Giữ dashboard cũ khi chuyển học kỳ và prefetch option theo intent",
    },
    async () => {
      const user = userEvent.setup();
      mocks.useSummary.mockImplementation((semesterId?: string) =>
        semesterId === "semester-2"
          ? {
              ...successfulQuery(),
              isFetching: true,
              isPlaceholderData: true,
            }
          : successfulQuery()
      );

      render(<DashboardPage />);
      await user.click(screen.getByRole("button", { name: /FA26/i }));
      const semesterOption = screen.getByRole("option", { name: /SP27/i });
      await user.hover(semesterOption);
      await user.click(semesterOption);

      expect(mocks.prefetch).toHaveBeenCalledWith(
        mocks.queryClient,
        "semester-2"
      );
      expect(screen.getByText("Sinh viên đang học")).toBeInTheDocument();
      expect(screen.getByText(/Đang tải SP27 · Spring 2027/)).toBeInTheDocument();
      expect(screen.queryByLabelText("Đang tải Admin Dashboard")).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "21/09/2026",
      description: "Filter lỗi giữ dữ liệu gần nhất, khôi phục học kỳ trước và thông báo không chặn",
    },
    async () => {
      const user = userEvent.setup();
      const semesterError = new Error("SEMESTER_NOT_FOUND");
      mocks.useSummary.mockImplementation((semesterId?: string) =>
        semesterId === "semester-2"
          ? {
              ...successfulQuery(),
              isError: true,
              error: semesterError,
            }
          : successfulQuery()
      );

      render(<DashboardPage />);
      await user.click(screen.getByRole("button", { name: /FA26/i }));
      await user.click(screen.getByRole("option", { name: /SP27/i }));

      await waitFor(() => expect(mocks.toastError).toHaveBeenCalledTimes(1));
      expect(screen.getByText("Sinh viên đang học")).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /FA26/i })).toBeInTheDocument()
      );
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "21/09/2026",
      description: "Làm mới giữ nội dung hiện tại và gửi đúng học kỳ đang hiển thị",
    },
    async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      await user.click(screen.getByRole("button", { name: "Làm mới" }));

      expect(mocks.mutate).toHaveBeenCalledWith("semester-1");
      expect(screen.getByText("Sinh viên đang học")).toBeInTheDocument();
    }
  );
});
