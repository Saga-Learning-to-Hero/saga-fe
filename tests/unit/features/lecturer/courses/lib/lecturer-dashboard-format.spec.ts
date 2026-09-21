import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import type {
  LecturerDashboardSummary,
  LecturerDashboardTeam,
} from "@/features/lecturer/courses/types/lecturer-course-dashboard";
import {
  buildActivityHeatmapData,
  buildPeerReviewChartData,
  buildTaskStatusChartData,
  buildTaskStatusTotalsFromTeams,
  canOpenDashboardProject,
  filterAttentionTeams,
  filterDashboardTeamsByScope,
  formatNullablePercent,
  formatRiskPolicyLegend,
  formatRiskReason,
  formatRiskReasonLabel,
  getAtRiskTeamCount,
  getActivityIntensityLevel,
  sortDashboardRiskReasons,
  sortDashboardTeamsByRisk,
} from "@/features/lecturer/courses/lib/lecturer-dashboard-format";

function team(partial: Partial<LecturerDashboardTeam>): LecturerDashboardTeam {
  return {
    teamId: "team-1",
    teamNo: 1,
    teamName: "Alpha",
    projectId: "project-1",
    projectName: "SAGA",
    memberCount: 4,
    currentSprint: null,
    progress: null,
    activity: null,
    traceability: null,
    peerReview: null,
    sync: null,
    configuration: {
      contributionMode: "COURSE",
      contributionWeightsConfigured: true,
    },
    previousSprintComparison: null,
    risk: { level: "HEALTHY", reasons: [] },
    reminder: null,
    ...partial,
  };
}

describe("lecturer-dashboard-format", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "22/09/2026",
      description: "Map SCHEDULE_LAG sang tieng Viet kem gia tri va nguong",
    },
    () => {
      expect(
        formatRiskReason({
          code: "SCHEDULE_LAG",
          severity: "WARNING",
          actualValue: 20,
          thresholdValue: 20,
          unit: "PERCENTAGE_POINT",
          affectedStudentProfileIds: [],
        })
      ).toBe("Trễ lịch (20 điểm % / ngưỡng 20 điểm %)");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "22/09/2026",
      description: "Loc can chu y chi lay WARNING CRITICAL UNKNOWN tu risk.level backend",
    },
    () => {
      const teams = [
        team({ teamId: "h", risk: { level: "HEALTHY", reasons: [] } }),
        team({ teamId: "w", risk: { level: "WARNING", reasons: [] } }),
        team({ teamId: "c", risk: { level: "CRITICAL", reasons: [] } }),
        team({ teamId: "u", risk: { level: "UNKNOWN", reasons: [] } }),
      ];

      expect(filterAttentionTeams(teams).map((item) => item.teamId)).toEqual(["w", "c", "u"]);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "22/09/2026",
      description: "atRisk cong warning + critical + unknown, khong doi risk.level",
    },
    () => {
      const summary: LecturerDashboardSummary = {
        enrolledStudents: 10,
        unassignedStudents: 1,
        totalTeams: 6,
        healthyTeams: 3,
        warningTeams: 1,
        criticalTeams: 1,
        unknownTeams: 1,
        teamsWithoutProject: 1,
        teamsWithoutActiveSprint: 0,
        teamsWithSyncFailure: 0,
      };

      expect(getAtRiskTeamCount(summary)).toBe(3);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "22/09/2026",
      description: "Ma reason la khong doi nguyen code, khong bia nhan Viet",
    },
    () => {
      expect(formatRiskReasonLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "22/09/2026",
      description: "Percent null hoac khong hop le hien —, khong thanh 0%",
    },
    () => {
      expect(formatNullablePercent(null)).toBe("—");
      expect(formatNullablePercent(undefined)).toBe("—");
      expect(formatNullablePercent(Number.NaN)).toBe("—");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "22/09/2026",
      description: "Percent bang 0 van hien 0%, vi 0 la gia tri that",
    },
    () => {
      expect(formatNullablePercent(0)).toBe("0%");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "22/09/2026",
      description: "projectId null hoac rong khong duoc mo progress",
    },
    () => {
      expect(canOpenDashboardProject(null)).toBe(false);
      expect(canOpenDashboardProject("   ")).toBe(false);
      expect(canOpenDashboardProject("proj-1")).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "22/09/2026",
      description: "Chart peer bo completionRate null, giu muc 0 that",
    },
    () => {
      const rows = buildPeerReviewChartData([
        team({
          teamId: "empty",
          peerReview: {
            expectedReviews: 0,
            submittedReviews: 0,
            completionRate: null,
            pendingStudentCount: 0,
            pendingStudentProfileIds: [],
            deadlineAt: null,
          },
        }),
        team({
          teamId: "zero",
          teamName: "Zero",
          peerReview: {
            expectedReviews: 6,
            submittedReviews: 0,
            completionRate: 0,
            pendingStudentCount: 3,
            pendingStudentProfileIds: [],
            deadlineAt: null,
          },
        }),
      ]);

      expect(rows).toHaveLength(1);
      expect(rows[0].teamId).toBe("zero");
      expect(rows[0].completionRate).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "22/09/2026",
      description: "Legend riskPolicy dung dung so backend, khong hard-code 3/5/20/35",
    },
    () => {
      const lines = formatRiskPolicyLegend({
        inactivityWarningDays: 4,
        inactivityCriticalDays: 9,
        scheduleLagWarningPercentagePoints: 15,
        scheduleLagCriticalPercentagePoints: 40,
        peerReviewWarningElapsedPercent: 70,
      });

      expect(lines[0]).toContain("4 ngày");
      expect(lines[0]).toContain("9 ngày");
      expect(lines[1]).toContain("15");
      expect(lines[1]).toContain("40");
      expect(lines[2]).toContain("70%");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "B",
      executedDate: "22/09/2026",
      description: "Danh sach nhom rong thi attention cung rong",
    },
    () => {
      expect(filterAttentionTeams([])).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "22/09/2026",
      description: "Sap xep nhom nghiem trong truoc, sau do can chu y, thieu du lieu va on dinh",
    },
    () => {
      const teams = [
        team({ teamId: "healthy", teamNo: 4, risk: { level: "HEALTHY", reasons: [] } }),
        team({ teamId: "unknown", teamNo: 3, risk: { level: "UNKNOWN", reasons: [] } }),
        team({ teamId: "warning", teamNo: 2, risk: { level: "WARNING", reasons: [] } }),
        team({ teamId: "critical", teamNo: 1, risk: { level: "CRITICAL", reasons: [] } }),
      ];

      expect(sortDashboardTeamsByRisk(teams).map((item) => item.teamId)).toEqual([
        "critical",
        "warning",
        "unknown",
        "healthy",
      ]);
      expect(teams[0].teamId).toBe("healthy");
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "B",
      executedDate: "22/09/2026",
      description: "Qua han la thong tin bo sung, khong lap lai thanh mot cot trang thai cong viec",
    },
    () => {
      const rows = buildTaskStatusChartData({
        total: 8,
        todo: 0,
        inProgress: 1,
        inReview: 7,
        done: 0,
        blocked: 0,
        overdue: 1,
        completionPercent: 0,
      });

      expect(rows.map((item) => item.key)).not.toContain("overdue");
      expect(rows).toHaveLength(5);
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "N",
      executedDate: "22/09/2026",
      description: "Heatmap hop nhat ngay, giu diem 0 va khong tu tao diem cho ngay bi thieu",
    },
    () => {
      const heatmap = buildActivityHeatmapData([
        team({
          teamId: "alpha",
          currentSprint: {
            sprintId: "sprint-1",
            sprintName: "Sprint 1",
            state: "ACTIVE",
            startDate: "2026-09-14",
            endDate: "2026-09-20",
            elapsedPercent: 50,
          },
          activity: {
            lastActivityAt: null,
            inactiveDays: 0,
            totalActivities: 5,
            series: [
              { date: "2026-09-14", commits: 0, tasks: 0, peerReviews: 0, documents: 0, totalActivities: 0 },
              { date: "2026-09-16", commits: 5, tasks: 0, peerReviews: 0, documents: 0, totalActivities: 5 },
            ],
          },
        }),
        team({
          teamId: "beta",
          currentSprint: {
            sprintId: "sprint-1",
            sprintName: "Sprint 1",
            state: "ACTIVE",
            startDate: "2026-09-14",
            endDate: "2026-09-20",
            elapsedPercent: 50,
          },
          activity: {
            lastActivityAt: null,
            inactiveDays: 1,
            totalActivities: 2,
            series: [
              { date: "2026-09-15", commits: 1, tasks: 1, peerReviews: 0, documents: 0, totalActivities: 2 },
            ],
          },
        }),
      ]);

      expect(heatmap.dates).toEqual(["2026-09-14", "2026-09-15", "2026-09-16"]);
      expect(heatmap.maxActivity).toBe(5);
      expect(heatmap.rows[0].pointsByDate.get("2026-09-14")?.totalActivities).toBe(0);
      expect(heatmap.rows[0].pointsByDate.has("2026-09-15")).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "B",
      executedDate: "22/09/2026",
      description: "Muc mau heatmap phan biet 0 va bon khoang cuong do",
    },
    () => {
      expect(getActivityIntensityLevel(0, 20)).toBe(0);
      expect(getActivityIntensityLevel(5, 20)).toBe(1);
      expect(getActivityIntensityLevel(10, 20)).toBe(2);
      expect(getActivityIntensityLevel(15, 20)).toBe(3);
      expect(getActivityIntensityLevel(20, 20)).toBe(4);
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "N",
      executedDate: "22/09/2026",
      description: "Ly do loi dong bo va cong viec bi chan duoc uu tien truoc thieu du lieu",
    },
    () => {
      const reason = (code: string) => ({
        code,
        severity: "WARNING" as const,
        actualValue: null,
        thresholdValue: null,
        unit: "COUNT" as const,
        affectedStudentProfileIds: [],
      });
      expect(sortDashboardRiskReasons([
        reason("DATA_UNAVAILABLE"),
        reason("BLOCKED_TASKS"),
        reason("JIRA_SYNC_FAILED"),
      ]).map((item) => item.code)).toEqual([
        "JIRA_SYNC_FAILED",
        "BLOCKED_TASKS",
        "DATA_UNAVAILABLE",
      ]);
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "N",
      executedDate: "22/09/2026",
      description: "Tong hop trang thai cong viec theo cac nhom da loc de cap nhat chart",
    },
    () => {
      const totals = buildTaskStatusTotalsFromTeams([
        team({
          progress: {
            totalTasks: 10,
            todo: 1,
            inProgress: 2,
            inReview: 1,
            done: 6,
            blocked: 0,
            overdue: 1,
            completionPercent: 60,
            scheduleGapPercentagePoints: 5,
          },
        }),
        team({
          teamId: "team-2",
          progress: {
            totalTasks: 5,
            todo: 0,
            inProgress: 1,
            inReview: 0,
            done: 3,
            blocked: 1,
            overdue: 0,
            completionPercent: 60,
            scheduleGapPercentagePoints: 0,
          },
        }),
      ]);

      expect(totals).toEqual({
        total: 15,
        todo: 1,
        inProgress: 3,
        inReview: 1,
        done: 9,
        blocked: 1,
        overdue: 1,
        completionPercent: 60,
      });
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "B",
      executedDate: "22/09/2026",
      description: "Khong co progress thi chart loc hien chua co du lieu thay vi 0 phan tram",
    },
    () => {
      const totals = buildTaskStatusTotalsFromTeams([team({ progress: null })]);
      expect(totals.total).toBe(0);
      expect(totals.completionPercent).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID18",
      type: "N",
      executedDate: "22/09/2026",
      description: "Filter rieng cua chart loc dung theo team va sprint",
    },
    () => {
      const withSprint = (teamId: string, sprintId: string) => team({
        teamId,
        currentSprint: {
          sprintId,
          sprintName: sprintId,
          state: "ACTIVE",
          startDate: null,
          endDate: null,
          elapsedPercent: null,
        },
      });
      const teams = [withSprint("team-1", "sprint-1"), withSprint("team-2", "sprint-2")];

      expect(filterDashboardTeamsByScope(teams, "team-2", "all").map((item) => item.teamId)).toEqual(["team-2"]);
      expect(filterDashboardTeamsByScope(teams, "all", "sprint-1").map((item) => item.teamId)).toEqual(["team-1"]);
      expect(filterDashboardTeamsByScope(teams, "team-1", "sprint-1")).toHaveLength(1);
    }
  );

  fptTest(
    {
      id: "UTCID19",
      type: "B",
      executedDate: "22/09/2026",
      description: "Filter sprint khong ton tai tra danh sach rong thay vi dung nham du lieu chart cu",
    },
    () => {
      expect(filterDashboardTeamsByScope([team({})], "all", "missing-sprint")).toEqual([]);
    }
  );
});
