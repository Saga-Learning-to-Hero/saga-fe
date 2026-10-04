import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import { CourseDashboardContextBar } from "@/features/lecturer/courses/components/course-dashboard-context-bar";
import { resolveDashboardContext } from "@/features/lecturer/courses/lib/dashboard-context";
import type {
  LecturerDashboardSelection,
  LecturerDashboardTeam,
} from "@/features/lecturer/courses/types/lecturer-course-dashboard";

const date = "04/10/2026";

function team(partial: Partial<LecturerDashboardTeam> = {}): LecturerDashboardTeam {
  return {
    teamId: "team-1",
    teamNo: 1,
    teamName: "Alpha",
    projectId: "project-1",
    projectName: "SAGA",
    memberCount: 4,
    currentSprint: {
      sprintId: "sprint-1",
      sprintName: "Sprint 1",
      state: "active",
      startDate: null,
      endDate: null,
      elapsedPercent: null,
      source: {
        jiraIntegrationId: "jira-1",
        siteName: "FPT",
        projectKey: "SAGA",
        connectionStatus: "ACTIVE",
      },
    },
    sprintSelection: "DEFAULT",
    jiraSources: [
      {
        jiraIntegrationId: "jira-1",
        siteName: "FPT",
        projectKey: "SAGA",
        connectionStatus: "ACTIVE",
      },
      {
        jiraIntegrationId: "jira-2",
        siteName: "FE",
        projectKey: "CAP",
        connectionStatus: "ACTIVE",
      },
    ],
    sprintOptions: [
      { id: "sprint-1", name: "Sprint 1", state: "active" },
      { id: "sprint-2", name: "Sprint 2", state: "closed" },
    ],
    progress: null,
    activity: null,
    traceability: null,
    peerReview: null,
    sync: null,
    configuration: { contributionMode: "COURSE", contributionWeightsConfigured: true },
    previousSprintComparison: null,
    risk: { level: "HEALTHY", reasons: [] },
    reminder: null,
    ...partial,
  };
}

describe("dashboard context", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: date,
      description: "Chua chon team thi khoa Site va Sprint",
    },
    () => {
      const view = resolveDashboardContext({
        teams: [team()],
        selectedTeamId: null,
        selection: { mode: "default" },
        controlsLocked: false,
      });

      expect(view.siteDisabled).toBe(true);
      expect(view.sprintDisabled).toBe(true);
      expect(view.siteOptions).toEqual([]);
    },
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: date,
      description: "Chon team lay Site tu teams va hien DEFAULT",
    },
    () => {
      const view = resolveDashboardContext({
        teams: [team()],
        selectedTeamId: "team-1",
        selection: { mode: "default" },
        controlsLocked: false,
      });

      expect(view.siteOptions.map((item) => item.value)).toEqual(["jira-1", "jira-2"]);
      expect(view.siteValue).toBe("jira-1");
      expect(view.sprintValue).toBe("sprint-1");
      expect(view.selectionLabel).toBe("Mặc định");
      expect(view.siteDisabled).toBe(false);
    },
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: date,
      description: "Doi Site dang tai thi xoa Sprint cu va khoa ca hai dropdown",
    },
    () => {
      const selection: LecturerDashboardSelection = {
        mode: "site",
        teamId: "team-1",
        jiraIntegrationId: "jira-2",
      };
      const view = resolveDashboardContext({
        teams: [team({ sprintOptions: [{ id: "sprint-9", name: "Sprint moi", state: "active" }] })],
        selectedTeamId: "team-1",
        selection,
        controlsLocked: true,
      });

      expect(view.siteValue).toBe("jira-2");
      expect(view.sprintValue).toBe("");
      expect(view.sprintOptions.map((item) => item.value)).toEqual(["sprint-9"]);
      expect(view.siteDisabled).toBe(true);
      expect(view.sprintDisabled).toBe(true);
    },
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: date,
      description: "sprintSelection la thi khong suy ra Da chon hay Mac dinh",
    },
    () => {
      const view = resolveDashboardContext({
        teams: [team({ sprintSelection: null })],
        selectedTeamId: "team-1",
        selection: { mode: "default" },
        controlsLocked: false,
      });

      expect(view.selectionLabel).toBeNull();
    },
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: date,
      description: "Team khong co du an, Site hoac Sprint thi khoa dung dropdown",
    },
    () => {
      const noProject = resolveDashboardContext({
        teams: [team({ projectId: null, jiraSources: [], sprintOptions: [], currentSprint: null })],
        selectedTeamId: "team-1",
        selection: { mode: "default" },
        controlsLocked: false,
      });
      const noSite = resolveDashboardContext({
        teams: [team({ jiraSources: [], sprintOptions: [] })],
        selectedTeamId: "team-1",
        selection: { mode: "default" },
        controlsLocked: false,
      });
      const noSprint = resolveDashboardContext({
        teams: [team({ sprintOptions: [], currentSprint: null })],
        selectedTeamId: "team-1",
        selection: { mode: "default" },
        controlsLocked: false,
      });

      expect(noProject.hint).toBe("Nhóm này chưa có dự án.");
      expect(noProject.siteDisabled).toBe(true);
      expect(noSite.hint).toBe("Nhóm này chưa có Site Jira.");
      expect(noSite.siteDisabled).toBe(true);
      expect(noSprint.hint).toBe("Chưa có Sprint để chọn.");
      expect(noSprint.sprintDisabled).toBe(true);
    },
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: date,
      description: "currentSprint null van cho chon Sprint neu BE tra sprintOptions",
    },
    () => {
      const view = resolveDashboardContext({
        teams: [team({ currentSprint: null, sprintSelection: "SELECTED" })],
        selectedTeamId: "team-1",
        selection: { mode: "default" },
        controlsLocked: false,
      });

      expect(view.sprintValue).toBe("");
      expect(view.sprintDisabled).toBe(false);
      expect(view.hint).toBe("Chưa có Sprint đang chạy.");
      expect(view.selectionLabel).toBe("Đã chọn");
    },
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: date,
      description: "Thanh chon khoa Site khi chua co team va khong co bo loc chart",
    },
    () => {
      render(
        <CourseDashboardContextBar
          teams={[team()]}
          selectedTeamId={null}
          selection={{ mode: "default" }}
          controlsLocked={false}
          onTeamChange={vi.fn()}
          onSiteChange={vi.fn()}
          onSprintChange={vi.fn()}
        />,
      );

      expect(screen.getByLabelText("Site")).toBeDisabled();
      expect(screen.getByLabelText("Sprint")).toBeDisabled();
      expect(screen.queryByLabelText("Lọc theo nhóm")).toBeNull();
    },
  );
});
