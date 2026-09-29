import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import { SprintBurndownChart } from "@/features/analytics/components/sprint-burndown-chart";
import { useSprintBurndown } from "@/features/analytics/hooks/use-activity-analytics";
import { fptTest } from "@/testing/fpt-test-helper";

vi.mock("@/features/analytics/hooks/use-activity-analytics", () => ({
  useSprintBurndown: vi.fn(),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe("SprintBurndownChart", () => {
  beforeEach(() => {
    vi.mocked(useSprintBurndown).mockReturnValue({
      data: { totalScope: 0, points: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "29/09/2026",
      description: "Tự chọn Sprint active và kích hoạt truy vấn khi có đủ startDate và endDate",
    },
    () => {
      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={[
            { id: "future", name: "Sprint 5", state: "future" },
            {
              id: "active",
              name: "Sprint 4",
              state: "active",
              startDate: "2026-03-01T00:00:00Z",
              endDate: "2026-03-14T00:00:00Z",
            },
            {
              id: "closed",
              name: "Sprint 3",
              state: "closed",
              startDate: "2026-02-15T00:00:00Z",
              endDate: "2026-02-28T00:00:00Z",
            },
          ]}
        />
      );

      expect(screen.getByRole("button", { name: /Sprint 4/i })).toBeInTheDocument();
      expect(useSprintBurndown).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        "active",
        { enabled: true }
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "29/09/2026",
      description: "Fallback về Sprint đầu tiên khi không có Sprint active và kích hoạt truy vấn nếu có ngày",
    },
    () => {
      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={[
            {
              id: "future",
              name: "Sprint 5",
              state: "future",
              startDate: "2026-03-15T00:00:00Z",
              endDate: "2026-03-28T00:00:00Z",
            },
            { id: "closed", name: "Sprint 3", state: "closed" },
          ]}
        />
      );

      expect(useSprintBurndown).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        "future",
        { enabled: true }
      );
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "29/09/2026",
      description: "Sprint thiếu ngày bắt đầu hoặc kết thúc thì không gọi API và hiển thị Sprint chưa có ngày",
    },
    () => {
      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={[
            {
              id: "future-no-dates",
              name: "Sprint 6",
              state: "active",
              startDate: null,
              endDate: null,
            },
          ]}
        />
      );

      expect(useSprintBurndown).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        "future-no-dates",
        { enabled: false }
      );
      expect(screen.getByText("Sprint chưa có ngày")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "29/09/2026",
      description: "Hiển thị thông báo 'Không tìm thấy Sprint' khi Backend trả về mã lỗi PROJECT_NOT_FOUND",
    },
    () => {
      const errorWithCode = Object.assign(new Error("Project not found"), {
        code: "PROJECT_NOT_FOUND",
      });
      vi.mocked(useSprintBurndown).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: errorWithCode,
        refetch: vi.fn(),
      } as never);

      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={[
            {
              id: "sprint-404",
              name: "Sprint 1",
              startDate: "2026-03-01T00:00:00Z",
              endDate: "2026-03-14T00:00:00Z",
            },
          ]}
        />
      );

      expect(screen.getByText("Không tìm thấy Sprint")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "29/09/2026",
      description: "Hiển thị thông báo 'Không tìm thấy nhóm' khi Backend trả về mã lỗi TEAM_NOT_FOUND",
    },
    () => {
      const errorWithCode = Object.assign(new Error("Team not found"), {
        code: "TEAM_NOT_FOUND",
      });
      vi.mocked(useSprintBurndown).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: errorWithCode,
        refetch: vi.fn(),
      } as never);

      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={[
            {
              id: "sprint-1",
              name: "Sprint 1",
              startDate: "2026-03-01T00:00:00Z",
              endDate: "2026-03-14T00:00:00Z",
            },
          ]}
        />
      );

      expect(screen.getByText("Không tìm thấy nhóm")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "29/09/2026",
      description: "Hiển thị 'Chưa có thông tin Sprint' khi danh sách sprints rỗng",
    },
    () => {
      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={[]}
        />
      );

      expect(screen.getByText("Chưa có thông tin Sprint")).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "29/09/2026",
      description: "Đồng bộ và ưu tiên Sprint mới từ component cha khi initialSprintId thay đổi",
    },
    () => {
      const sprints = [
        {
          id: "sprint-1",
          name: "Sprint 1",
          startDate: "2026-03-01T00:00:00Z",
          endDate: "2026-03-14T00:00:00Z",
        },
        {
          id: "sprint-2",
          name: "Sprint 2",
          startDate: "2026-03-15T00:00:00Z",
          endDate: "2026-03-28T00:00:00Z",
        },
      ];

      const { rerender } = render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={sprints}
          initialSprintId="sprint-1"
        />
      );

      expect(useSprintBurndown).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        "sprint-1",
        { enabled: true }
      );

      // Re-render khi component cha truyền initialSprintId mới
      rerender(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={sprints}
          initialSprintId="sprint-2"
        />
      );

      expect(useSprintBurndown).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        "sprint-2",
        { enabled: true }
      );
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "29/09/2026",
      description: "Gọi callback onSelectSprint khi người dùng chọn Sprint khác",
    },
    () => {
      const handleSelectSprint = vi.fn();
      const sprints = [
        {
          id: "sprint-1",
          name: "Sprint 1",
          startDate: "2026-03-01T00:00:00Z",
          endDate: "2026-03-14T00:00:00Z",
        },
        {
          id: "sprint-2",
          name: "Sprint 2",
          startDate: "2026-03-15T00:00:00Z",
          endDate: "2026-03-28T00:00:00Z",
        },
      ];

      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={sprints}
          initialSprintId="sprint-1"
          onSelectSprint={handleSelectSprint}
        />
      );

      const triggerBtn = screen.getByRole("button", { name: /Sprint 1/i });
      fireEvent.click(triggerBtn);

      const optionSprint2 = screen.getByRole("option", { name: /Sprint 2/i });
      fireEvent.click(optionSprint2);

      expect(handleSelectSprint).toHaveBeenCalledWith("sprint-2");
    }
  );
});
