import { render, screen } from "@testing-library/react";
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
      refetch: vi.fn(),
    } as never);
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "21/09/2026",
      description: "Tự chọn Sprint active sau khi danh sách Sprint được tải",
    },
    () => {
      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={[
            { id: "future", name: "Sprint 5", state: "future" },
            { id: "active", name: "Sprint 4", state: "active" },
            { id: "closed", name: "Sprint 3", state: "closed" },
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
      executedDate: "21/09/2026",
      description: "Fallback về Sprint đầu tiên khi không có Sprint active",
    },
    () => {
      render(
        <SprintBurndownChart
          courseId="course-1"
          teamId="team-1"
          sprints={[
            { id: "future", name: "Sprint 5", state: "future" },
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
});
