import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  ActivityHeatmapGrid,
  HeatmapCellTooltip,
} from "@/features/analytics/components/activity-heatmap-grid";
import { useTeamHeatmap } from "@/features/analytics/hooks/use-activity-analytics";

vi.mock("@/features/analytics/hooks/use-activity-analytics", () => ({
  useTeamHeatmap: vi.fn(),
}));

describe("HeatmapCellTooltip", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "18/09/2026",
      description: "Tooltip heatmap hien thi ngay va tung loai hoat dong ro rang",
    },
    () => {
      render(
        <HeatmapCellTooltip
          formattedDate="Thứ Năm, 17/09"
          cell={{
            date: "2026-09-17",
            commits: 11,
            tasks: 5,
            peerReviews: 9,
            documents: 2,
            totalActivities: 27,
            actors: [
              {
                studentId: "sv-01",
                studentCode: "SE170001",
                fullName: "Nguyen Van A",
                avatar: null,
              },
            ],
          }}
        />
      );

      expect(screen.getByText("Thứ Năm, 17/09")).toBeTruthy();
      expect(screen.getByText("Commit Git").parentElement?.textContent).toContain("11");
      expect(screen.getByText("Task Jira").parentElement?.textContent).toContain("5");
      expect(screen.getByText("Đánh giá chéo").parentElement?.textContent).toContain("9");
      expect(screen.getByText("Tài liệu").parentElement?.textContent).toContain("2");
      expect(screen.getByText("Tổng hoạt động").parentElement?.textContent).toContain("27");
      expect(screen.getByText("Nguyen Van A")).toBeTruthy();
    }
  );
});

describe("ActivityHeatmapGrid", () => {
  beforeEach(() => {
    vi.mocked(useTeamHeatmap).mockReturnValue({
      data: {
        courseId: "c-1",
        teamId: "t-1",
        studentId: null,
        startDate: "2026-03-01",
        endDate: "2026-03-14",
        students: [],
        days: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
  });

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "29/09/2026",
      description: "Hien thi banner ghi ro pham vi hoat dong trong khoang ngay cua Sprint khi chon Theo Sprint",
    },
    () => {
      render(
        <ActivityHeatmapGrid
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

      expect(
        screen.getByText(/Đang hiển thị dữ liệu theo mốc thời gian của Sprint/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Lưới hoạt động tổng hợp/i)
      ).toBeInTheDocument();
      expect(useTeamHeatmap).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        { startDate: "2026-03-01", endDate: "2026-03-14" },
        { enabled: true }
      );
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "29/09/2026",
      description: "Sprint thieu ngay bat dau hoac ket thuc thi khong goi API va hien thi Sprint chua co ngay",
    },
    () => {
      render(
        <ActivityHeatmapGrid
          courseId="course-1"
          teamId="team-1"
          sprints={[
            {
              id: "sprint-nodates",
              name: "Sprint 2",
              startDate: null,
              endDate: null,
            },
          ]}
        />
      );

      expect(useTeamHeatmap).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        { startDate: "", endDate: "" },
        { enabled: false }
      );
      expect(
        screen.getByText("Sprint chưa có ngày bắt đầu và kết thúc trên Jira")
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "29/09/2026",
      description: "Khoang thoi gian vuot qua 366 ngay thi khong goi API va hien thi canh bao",
    },
    () => {
      render(
        <ActivityHeatmapGrid
          courseId="course-1"
          teamId="team-1"
          sprints={[
            {
              id: "sprint-long",
              name: "Sprint Long",
              startDate: "2025-01-01T00:00:00Z",
              endDate: "2026-02-01T00:00:00Z", // 397 days
            },
          ]}
        />
      );

      expect(useTeamHeatmap).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        { startDate: "2025-01-01", endDate: "2026-02-01" },
        { enabled: false }
      );
      expect(
        screen.getByText("Khoảng thời gian vượt quá giới hạn tối đa 366 ngày")
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "29/09/2026",
      description: "Hiển thị thông báo lỗi khi Backend trả về mã lỗi REQUEST_INVALID",
    },
    () => {
      const errorWithCode = Object.assign(new Error("Invalid range"), {
        code: "REQUEST_INVALID",
      });
      vi.mocked(useTeamHeatmap).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: errorWithCode,
        refetch: vi.fn(),
      } as never);

      render(
        <ActivityHeatmapGrid
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

      expect(
        screen.getByText("Khoảng thời gian không hợp lệ hoặc vượt quá 366 ngày")
      ).toBeInTheDocument();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "29/09/2026",
      description: "Hiển thị thông báo khi Backend trả về PROJECT_NOT_FOUND hoặc TEAM_NOT_FOUND",
    },
    () => {
      const errorWithCode = Object.assign(new Error("Team not found"), {
        code: "TEAM_NOT_FOUND",
      });
      vi.mocked(useTeamHeatmap).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: errorWithCode,
        refetch: vi.fn(),
      } as never);

      render(
        <ActivityHeatmapGrid
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
        <ActivityHeatmapGrid
          courseId="course-1"
          teamId="team-1"
          sprints={sprints}
          initialSprintId="sprint-1"
        />
      );

      expect(useTeamHeatmap).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        expect.objectContaining({
          startDate: "2026-03-01",
          endDate: "2026-03-14",
        }),
        expect.anything()
      );

      // Re-render khi component cha truyền initialSprintId mới
      rerender(
        <ActivityHeatmapGrid
          courseId="course-1"
          teamId="team-1"
          sprints={sprints}
          initialSprintId="sprint-2"
        />
      );

      expect(useTeamHeatmap).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        expect.objectContaining({
          startDate: "2026-03-15",
          endDate: "2026-03-28",
        }),
        expect.anything()
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
        <ActivityHeatmapGrid
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

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "29/09/2026",
      description: "Tự động chọn Sprint active khi không truyền initialSprintId",
    },
    () => {
      const sprints = [
        {
          id: "sprint-1",
          name: "Sprint 1",
          state: "closed",
          startDate: "2026-03-01T00:00:00Z",
          endDate: "2026-03-14T00:00:00Z",
        },
        {
          id: "sprint-2",
          name: "Sprint 2",
          state: "active",
          startDate: "2026-03-15T00:00:00Z",
          endDate: "2026-03-28T00:00:00Z",
        },
      ];

      render(
        <ActivityHeatmapGrid
          courseId="course-1"
          teamId="team-1"
          sprints={sprints}
        />
      );

      expect(useTeamHeatmap).toHaveBeenCalledWith(
        "course-1",
        "team-1",
        expect.objectContaining({
          startDate: "2026-03-15",
          endDate: "2026-03-28",
        }),
        expect.anything()
      );
    }
  );
});
