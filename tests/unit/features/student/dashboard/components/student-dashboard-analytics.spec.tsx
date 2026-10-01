import { describe, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { fptTest } from "@/testing/fpt-test-helper";
import { StudentDashboardAnalytics } from "@/features/student/dashboard/components/student-dashboard-analytics";
import { useStudentCourseContext } from "@/features/student/courses/hooks/use-student-course-context";
import { useStudentDashboard } from "@/features/student/dashboard/hooks/use-student-dashboard";
import { useProjectSprints } from "@/features/student/sprint-progress/hooks/use-project-sprints";
import { useProjectProgress } from "@/features/student/project/hooks/useProjectSync";
import { useProjectRealtime } from "@/features/student/project/hooks/use-project-realtime";
import { useProjectJiraSourceSelection } from "@/features/student/project/hooks/use-project-jira-source-selection";

vi.mock("@/features/student/courses/hooks/use-student-course-context");
vi.mock("@/features/student/dashboard/hooks/use-student-dashboard");
vi.mock("@/features/student/sprint-progress/hooks/use-project-sprints");
vi.mock("@/features/student/project/hooks/useProjectSync");
vi.mock("@/features/student/project/hooks/use-project-realtime");
vi.mock("@/features/student/project/hooks/use-project-jira-source-selection");
vi.mock("@/features/student/dashboard/components/student-weekly-commits-chart", () => ({
  StudentWeeklyCommitsChart: () => <div data-testid="weekly-commits-chart" />,
}));
vi.mock("@/features/student/dashboard/components/student-active-tasks-card", () => ({
  StudentActiveTasksCard: () => <div data-testid="active-tasks-card" />,
}));
vi.mock("@/features/student/dashboard/components/student-recent-commits-card", () => ({
  StudentRecentCommitsCard: () => <div data-testid="recent-commits-card" />,
}));
vi.mock("@/features/student/dashboard/components/student-alerts-banner", () => ({
  StudentAlertsBanner: () => <div data-testid="alerts-banner" />,
}));

const mockDashboardData = {
  student: {
    studentId: "s-1",
    fullName: "Nguyen Van A",
    studentCode: "SE170001",
    teamRole: "MEMBER",
    avatarUrl: null,
  },
  team: {
    teamId: "t-1",
    teamNo: 1,
    teamName: "SAGA Warriors",
    projectId: "p-1",
  },
  currentSprint: {
    id: "sprint-1",
    name: "Sprint 1 - Thiết kế",
    state: "ACTIVE",
    completedTasks: 4,
    totalTasks: 10,
    completionPercent: 40,
  },
  myMetrics: {
    tasks: {
      done: 2,
      totalAssigned: 5,
      completionPercent: 40,
      completedStoryPoints: 6,
      totalStoryPoints: 15,
    },
    commits: {
      totalCommits: 8,
      traceabilityPercent: 85,
      lastCommittedAt: "2026-03-10T10:00:00Z",
    },
  },
  myActiveTasks: [],
  recentCommits: [],
  weeklyCommits: [],
  actionableAlerts: [],
  integrations: {
    jira: { connected: true, projectKey: "SAGA" },
    github: { connected: true, repositoryCount: 1 },
  },
};

describe("StudentDashboardAnalytics - Sprint Scope & Card Labels", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useStudentCourseContext).mockReturnValue({
      course: { id: "course-1", name: "SWP391" },
      courseId: "course-1",
      isLoading: false,
      isInvalidCourse: false,
    } as never);

    vi.mocked(useProjectSprints).mockReturnValue({
      data: [
        { id: "sprint-1", name: "Sprint 1", state: "active" },
        { id: "sprint-2", name: "Sprint 2", state: "future" },
      ],
      isLoading: false,
    } as never);

    vi.mocked(useProjectProgress).mockReturnValue({
      data: null,
      isLoading: false,
    } as never);

    vi.mocked(useProjectRealtime).mockReturnValue(undefined as never);
    vi.mocked(useProjectJiraSourceSelection).mockReturnValue({
      effectiveSourceId: undefined,
      sources: [],
      selectedSourceId: undefined,
      setSelectedSourceId: vi.fn(),
      needsSelection: false,
    } as never);
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Thẻ Nhiệm vụ và Minh chứng Git có nhãn 'Toàn dự án'",
    },
    () => {
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);

      render(<StudentDashboardAnalytics />);

      // Xác nhận có nhãn 'Toàn dự án' trên các thẻ
      const allProjectBadges = screen.getAllByText("Toàn dự án");
      expect(allProjectBadges.length).toBeGreaterThanOrEqual(2);

      // Bộ chọn Sprint nằm bên trong thẻ Sprint
      expect(
        screen.getByRole("button", { name: /Sprint 1/i })
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "29/09/2026",
      description: "Khi chuyển Sprint (isPlaceholderData=true), chỉ thẻ Sprint hiện trạng thái đang tải, các thẻ khác vẫn hiển thị số liệu",
    },
    () => {
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        isFetching: true,
        isPlaceholderData: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);

      render(<StudentDashboardAnalytics />);

      // Thẻ Sprint hiển thị trạng thái đang tải
      expect(screen.getByText("Đang tải số liệu Sprint...")).toBeInTheDocument();

      // Các thẻ toàn dự án khác vẫn hiển thị số liệu bình thường
      expect(screen.getByText("/ 5 tasks")).toBeInTheDocument();
      expect(screen.getByText("commits")).toBeInTheDocument();
      expect(screen.getByText("Nhiệm vụ của tôi")).toBeInTheDocument();
      expect(screen.getByText("Minh chứng Git")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "29/09/2026",
      description: "Thẻ Sprint hiển thị 'Sprint đang xem' cho cả Sprint active và Sprint đã đóng",
    },
    () => {
      // 1. Khi Sprint là active
      const { rerender } = render(<StudentDashboardAnalytics />);
      expect(screen.getByText("Sprint đang xem")).toBeInTheDocument();

      // 2. Khi chọn Sprint đã đóng
      const closedSprintData = {
        ...mockDashboardData,
        currentSprint: {
          id: "sprint-closed-uuid",
          name: "Sprint 0 - Khởi tạo",
          state: "CLOSED",
          completedTasks: 8,
          totalTasks: 8,
          completionPercent: 100,
        },
      };

      vi.mocked(useStudentDashboard).mockReturnValue({
        data: closedSprintData,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);

      rerender(<StudentDashboardAnalytics />);

      // Thẻ vẫn ghi "Sprint đang xem"
      expect(screen.getByText("Sprint đang xem")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "29/09/2026",
      description: "So khớp Sprint bằng ID (UUID) thay vì tên khi có các Sprint trùng tên từ nhiều nguồn Jira",
    },
    () => {
      vi.mocked(useProjectSprints).mockReturnValue({
        data: [
          { id: "uuid-jira-source-1", name: "Sprint 1", state: "closed" },
          { id: "uuid-jira-source-2", name: "Sprint 1", state: "active" },
        ],
        isLoading: false,
      } as never);

      const activeSprintFromSource2 = {
        ...mockDashboardData,
        currentSprint: {
          id: "uuid-jira-source-2",
          name: "Sprint 1",
          state: "ACTIVE",
          completedTasks: 3,
          totalTasks: 7,
          completionPercent: 43,
        },
      };

      vi.mocked(useStudentDashboard).mockReturnValue({
        data: activeSprintFromSource2,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);

      render(<StudentDashboardAnalytics />);

      // Nhận diện đúng Sprint qua UUID và hiển thị thẻ Sprint đang xem
      expect(screen.getByText("Sprint đang xem")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "01/10/2026",
      description: "Thanh bộ lọc hiển thị riêng 1 hàng với đầy đủ bộ lọc Site Jira và Sprint",
    },
    () => {
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);

      vi.mocked(useProjectJiraSourceSelection).mockReturnValue({
        activeSources: [
          {
            integrationId: "site-1",
            siteName: "hcm-cpl-team3",
            projectKey: "SAGA",
            boardId: "68",
            connectionStatus: "ACTIVE",
          },
          {
            integrationId: "site-2",
            siteName: "hoanghai175",
            projectKey: "HH",
            boardId: "69",
            connectionStatus: "ACTIVE",
          },
        ],
        effectiveSourceId: "site-1",
        hasMultipleSources: true,
        isLoading: false,
        selectSource: vi.fn(),
      } as never);

      render(<StudentDashboardAnalytics />);

      // Thanh bộ lọc riêng 1 hàng
      expect(screen.getByText("Bộ lọc hiển thị:")).toBeInTheDocument();
      expect(screen.getByText("Site:")).toBeInTheDocument();
      expect(screen.getByText("Sprint:")).toBeInTheDocument();

      // Kiểm tra có nút chọn Site và Sprint
      expect(screen.getByText("SAGA · hcm-cpl-team3")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "01/10/2026",
      description: "Lọc Sprint tương ứng theo Site và cho phép chuyển đổi nguồn Jira",
    },
    () => {
      const selectSourceMock = vi.fn();
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);

      vi.mocked(useProjectJiraSourceSelection).mockReturnValue({
        activeSources: [
          {
            integrationId: "site-1",
            siteName: "hcm-cpl-team3",
            projectKey: "SAGA",
            boardId: "68",
            connectionStatus: "ACTIVE",
          },
          {
            integrationId: "site-2",
            siteName: "hoanghai175",
            projectKey: "HH",
            boardId: "69",
            connectionStatus: "ACTIVE",
          },
        ],
        effectiveSourceId: "site-1",
        hasMultipleSources: true,
        isLoading: false,
        selectSource: selectSourceMock,
      } as never);

      // Sprints phân chia theo site
      vi.mocked(useProjectSprints).mockReturnValue({
        data: [
          { id: "sprint-site1", name: "Sprint 1 Site 1", state: "active", jiraIntegrationId: "site-1" },
          { id: "sprint-site2", name: "Sprint 2 Site 2", state: "active", jiraIntegrationId: "site-2" },
        ],
        isLoading: false,
      } as never);

      render(<StudentDashboardAnalytics />);

      // Chỉ hiển thị sprint của site-1 (effectiveSourceId)
      expect(screen.getByRole("button", { name: /Sprint 1 Site 1/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Sprint 2 Site 2/i })).not.toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "01/10/2026",
      description: "Khi dự án chỉ có 1 nguồn Jira hoặc chưa kết nối, bộ chọn Site vô hiệu hóa",
    },
    () => {
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);

      vi.mocked(useProjectJiraSourceSelection).mockReturnValue({
        activeSources: [
          {
            integrationId: "site-only",
            siteName: "single-site",
            projectKey: "SAGA",
            boardId: "1",
            connectionStatus: "ACTIVE",
          },
        ],
        effectiveSourceId: "site-only",
        hasMultipleSources: false,
        isLoading: false,
        selectSource: vi.fn(),
      } as never);

      render(<StudentDashboardAnalytics />);

      // Nút chọn site bị disabled khi chỉ có <= 1 site
      const siteSelectButton = screen.getByRole("button", { name: /single-site/i });
      expect(siteSelectButton).toBeDisabled();
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "01/10/2026",
      description: "Khi đổi Site, bộ lọc sprint tự động cập nhật sang sprint mới nhất của Site đó",
    },
    () => {
      vi.mocked(useStudentDashboard).mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        isFetching: false,
        isPlaceholderData: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as never);

      vi.mocked(useProjectJiraSourceSelection).mockReturnValue({
        activeSources: [
          {
            integrationId: "site-1",
            siteName: "site-alpha",
            projectKey: "ALP",
            boardId: "1",
            connectionStatus: "ACTIVE",
          },
          {
            integrationId: "site-2",
            siteName: "site-beta",
            projectKey: "BET",
            boardId: "2",
            connectionStatus: "ACTIVE",
          },
        ],
        effectiveSourceId: "site-2",
        hasMultipleSources: true,
        isLoading: false,
        selectSource: vi.fn(),
      } as never);

      vi.mocked(useProjectSprints).mockReturnValue({
        data: [
          { id: "sprint-alp-old", name: "Sprint Alpha Cu", state: "closed", jiraIntegrationId: "site-1" },
          { id: "sprint-bet-latest", name: "Sprint Beta Moi Nhat", state: "active", jiraIntegrationId: "site-2" },
        ],
        isLoading: false,
      } as never);

      render(<StudentDashboardAnalytics />);

      // Tự động nhận diện và hiển thị sprint mới nhất của site-2
      expect(screen.getByRole("button", { name: /Sprint Beta Moi Nhat/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Sprint Alpha Cu/i })).not.toBeInTheDocument();
    }
  );
});
