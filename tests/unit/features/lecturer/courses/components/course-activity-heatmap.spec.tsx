import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { CourseActivityHeatmap } from "@/features/lecturer/courses/components/course-activity-heatmap";
import type { LecturerDashboardTeam } from "@/features/lecturer/courses/types/lecturer-course-dashboard";

function buildTeam(
  teamId: string,
  teamName: string,
  date: string,
  totalActivities: number
): LecturerDashboardTeam {
  return {
    teamId,
    teamNo: 1,
    teamName,
    projectId: "project-1",
    projectName: "SAGA",
    memberCount: 4,
    currentSprint: {
      sprintId: "sprint-1",
      sprintName: "Sprint 1",
      state: "ACTIVE",
      startDate: "2026-09-14",
      endDate: "2026-09-20",
      elapsedPercent: 50,
    },
    progress: null,
    activity: {
      lastActivityAt: null,
      inactiveDays: totalActivities === 0 ? 1 : 0,
      totalActivities,
      series: [{
        date,
        commits: totalActivities,
        tasks: 0,
        peerReviews: 0,
        documents: 0,
        totalActivities,
      }],
    },
    traceability: null,
    peerReview: null,
    sync: null,
    configuration: { contributionMode: "COURSE", contributionWeightsConfigured: true },
    previousSprintComparison: null,
    risk: { level: "HEALTHY", reasons: [] },
    reminder: null,
  };
}

describe("CourseActivityHeatmap", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "22/09/2026",
      description: "Hover o heatmap phat teamId de lam noi hang nhom va xoa khi roi chuot",
    },
    () => {
      const onHighlight = vi.fn();
      render(
        <CourseActivityHeatmap
          teams={[buildTeam("team-alpha", "Alpha", "2026-09-14", 3)]}
          onHighlightedTeamIdsChange={onHighlight}
        />
      );

      const cell = screen.getByRole("button", { name: /Alpha, 14[-/]09: 3 hoạt động/ });
      fireEvent.mouseEnter(cell);
      expect(onHighlight).toHaveBeenLastCalledWith(["team-alpha"]);
      fireEvent.mouseLeave(cell);
      expect(onHighlight).toHaveBeenLastCalledWith([]);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "22/09/2026",
      description: "Heatmap phan biet o co gia tri 0 voi ngay khong co du lieu",
    },
    () => {
      render(
        <CourseActivityHeatmap
          teams={[
            buildTeam("team-alpha", "Alpha", "2026-09-14", 0),
            buildTeam("team-beta", "Beta", "2026-09-15", 2),
          ]}
          onHighlightedTeamIdsChange={() => undefined}
        />
      );

      expect(screen.getByRole("button", { name: /Alpha, 14[-/]09: 0 hoạt động/ })).toBeTruthy();
      expect(screen.getByLabelText(/Alpha, 15[-/]09: chưa có dữ liệu/)).toBeTruthy();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "22/09/2026",
      description: "Moi chart chi hien bo loc nhom nho gon va dung Sprint hien tai tu API",
    },
    () => {
      render(
        <CourseActivityHeatmap
          teams={[buildTeam("team-alpha", "Alpha", "2026-09-14", 3)]}
          onHighlightedTeamIdsChange={() => undefined}
        />
      );

      expect(screen.getByLabelText("Lọc theo nhóm")).toBeTruthy();
      expect(screen.queryByLabelText("Lọc theo Sprint")).toBeNull();
    }
  );
});
