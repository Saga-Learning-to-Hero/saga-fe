import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  buildWeeklyCommitBuckets,
  formatCompletionPercent,
  formatLinkedCommitRatio,
  formatRelativeTime,
  formatSprintDue,
  getLatestSyncInfo,
  isIntegrationDegraded,
  normalizeMemberSummary,
  normalizeProjectProgress,
  NO_TASK_DATA_LABEL,
} from "./progress-format";

describe("progress-format", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "formatCompletionPercent quy doi 0 va 100 thanh phan tram",
    },
    () => {
      expect(formatCompletionPercent(0)).toBe("0%");
      expect(formatCompletionPercent(100)).toBe("100%");
      expect(formatCompletionPercent(67.4)).toBe("67%");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "14/09/2026",
      description: "formatCompletionPercent tra nhan chua co du lieu khi null hoac NaN",
    },
    () => {
      expect(formatCompletionPercent(null)).toBe(NO_TASK_DATA_LABEL);
      expect(formatCompletionPercent(undefined)).toBe(NO_TASK_DATA_LABEL);
      expect(formatCompletionPercent(Number.NaN)).toBe(NO_TASK_DATA_LABEL);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "14/09/2026",
      description: "isIntegrationDegraded chi true khi status khac ACTIVE",
    },
    () => {
      expect(isIntegrationDegraded("ACTIVE")).toBe(false);
      expect(isIntegrationDegraded("active")).toBe(false);
      expect(isIntegrationDegraded("REVOKED")).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "14/09/2026",
      description: "isIntegrationDegraded khong danh dau khi status rong hoac null",
    },
    () => {
      expect(isIntegrationDegraded(null)).toBe(false);
      expect(isIntegrationDegraded(undefined)).toBe(false);
      expect(isIntegrationDegraded("")).toBe(false);
      expect(isIntegrationDegraded("   ")).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "14/09/2026",
      description: "buildWeeklyCommitBuckets gom commit theo tuan ISO UTC",
    },
    () => {
      const buckets = buildWeeklyCommitBuckets([
        { committedAt: "2026-09-14T08:00:00.000Z", authorStudentId: "stu-1" },
        { committedAt: "2026-09-15T10:00:00.000Z", authorStudentId: "stu-1" },
        { committedAt: "2026-09-07T08:00:00.000Z", authorStudentId: "stu-2" },
      ]);

      expect(buckets).toHaveLength(2);
      expect(buckets[0].weekKey).toBe("2026-W37");
      expect(buckets[0].commits).toBe(1);
      expect(buckets[1].weekKey).toBe("2026-W38");
      expect(buckets[1].commits).toBe(2);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "14/09/2026",
      description: "buildWeeklyCommitBuckets tra mang rong khi khong co commit hop le",
    },
    () => {
      expect(buildWeeklyCommitBuckets([])).toEqual([]);
      expect(
        buildWeeklyCommitBuckets([{ committedAt: "khong-phai-ngay", authorStudentId: "stu-1" }])
      ).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "14/09/2026",
      description: "buildWeeklyCommitBuckets dung moc UTC khi commit lech mui gio",
    },
    () => {
      const buckets = buildWeeklyCommitBuckets([
        { committedAt: "2026-09-13T22:00:00+07:00", authorStudentId: "stu-1" },
      ]);

      expect(buckets).toHaveLength(1);
      expect(buckets[0].weekKey).toBe("2026-W37");
      expect(buckets[0].commits).toBe(1);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "14/09/2026",
      description: "formatLinkedCommitRatio xu ly tong 0 va loc theo studentId",
    },
    () => {
      expect(formatLinkedCommitRatio(3, 0)).toBe("0%");
      expect(formatLinkedCommitRatio(1, 4)).toBe("25%");

      const filtered = buildWeeklyCommitBuckets(
        [
          { committedAt: "2026-09-14T08:00:00.000Z", authorStudentId: "stu-1" },
          { committedAt: "2026-09-14T09:00:00.000Z", authorStudentId: "stu-2" },
        ],
        { studentId: "stu-1" }
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].commits).toBe(1);
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "N",
      executedDate: "14/09/2026",
      description: "normalizeMemberSummary chap nhan ca tasks/commits va taskSummary/commitSummary",
    },
    () => {
      const fromSummary = normalizeMemberSummary({
        studentId: "stu-1",
        fullName: "A",
        studentCode: "HE1",
        teamRole: "LEADER",
        taskSummary: { assigned: 4, completed: 2, incomplete: 2 },
        commitSummary: { total: 8, linkedToTasks: 3, lastCommitAt: "2026-09-14T00:00:00Z" },
        evidenceSummary: { confirmations: 2 },
      });

      expect(fromSummary.tasks.assigned).toBe(4);
      expect(fromSummary.tasks.assignedTotal).toBe(4);
      expect(fromSummary.tasks.incomplete).toBe(2);
      expect(fromSummary.commits.linkedToTasks).toBe(3);
      expect(fromSummary.commits.lastCommitAt).toBe("2026-09-14T00:00:00Z");
      expect(fromSummary.evidenceConfirmations).toBe(2);
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "14/09/2026",
      description: "normalizeProjectProgress tra null khi input khong hop le",
    },
    () => {
      expect(normalizeProjectProgress(null)).toBeNull();
      expect(normalizeProjectProgress("x")).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "A",
      executedDate: "14/09/2026",
      description: "formatSprintDue tra ve No end date khi input null hoac khong hop le",
    },
    () => {
      expect(formatSprintDue(null)).toEqual({
        label: "No end date",
        diffDays: null,
        urgency: "none",
      });
      expect(formatSprintDue("")).toEqual({
        label: "No end date",
        diffDays: null,
        urgency: "none",
      });
      expect(formatSprintDue("invalid-date")).toEqual({
        label: "No end date",
        diffDays: null,
        urgency: "none",
      });
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "N",
      executedDate: "14/09/2026",
      description: "formatSprintDue tra ve Ends today khi end date trung ngay voi reference date",
    },
    () => {
      const ref = new Date(2026, 8, 14, 9, 0, 0);
      const todayEnd = new Date(2026, 8, 14, 23, 59, 59).toISOString();
      const result = formatSprintDue(todayEnd, ref);
      expect(result).toEqual({
        label: "Ends today",
        diffDays: 0,
        urgency: "warning",
      });
    }
  );

  fptTest(
    {
      id: "UTCID13",
      type: "B",
      executedDate: "14/09/2026",
      description: "formatSprintDue tra ve 1 day hoac 2 days remaining voi muc urgency warning",
    },
    () => {
      const ref = new Date(2026, 8, 14, 9, 0, 0);
      const tomorrow = new Date(2026, 8, 15, 12, 0, 0).toISOString();
      const afterTomorrow = new Date(2026, 8, 16, 12, 0, 0).toISOString();
      expect(formatSprintDue(tomorrow, ref)).toEqual({
        label: "1 day remaining",
        diffDays: 1,
        urgency: "warning",
      });
      expect(formatSprintDue(afterTomorrow, ref)).toEqual({
        label: "2 days remaining",
        diffDays: 2,
        urgency: "warning",
      });
    }
  );

  fptTest(
    {
      id: "UTCID14",
      type: "N",
      executedDate: "14/09/2026",
      description: "formatSprintDue tra ve N days remaining khi con hon 2 ngay",
    },
    () => {
      const ref = new Date(2026, 8, 14, 9, 0, 0);
      const sixDaysLater = new Date(2026, 8, 20, 12, 0, 0).toISOString();
      expect(formatSprintDue(sixDaysLater, ref)).toEqual({
        label: "6 days remaining",
        diffDays: 6,
        urgency: "normal",
      });
    }
  );

  fptTest(
    {
      id: "UTCID15",
      type: "B",
      executedDate: "14/09/2026",
      description: "formatSprintDue tra ve Overdue by N days khi end date nho hon ngay hien tai",
    },
    () => {
      const ref = new Date(2026, 8, 14, 9, 0, 0);
      const yesterday = new Date(2026, 8, 13, 12, 0, 0).toISOString();
      const fourDaysAgo = new Date(2026, 8, 10, 12, 0, 0).toISOString();
      expect(formatSprintDue(yesterday, ref)).toEqual({
        label: "Overdue by 1 day",
        diffDays: -1,
        urgency: "overdue",
      });
      expect(formatSprintDue(fourDaysAgo, ref)).toEqual({
        label: "Overdue by 4 days",
        diffDays: -4,
        urgency: "overdue",
      });
    }
  );

  fptTest(
    {
      id: "UTCID16",
      type: "N",
      executedDate: "14/09/2026",
      description: "formatRelativeTime tinh dung cac khoang thoi gian tuong doi",
    },
    () => {
      const ref = new Date("2026-09-14T10:00:00Z");
      expect(formatRelativeTime(null)).toBe("—");
      expect(formatRelativeTime("invalid")).toBe("—");
      expect(formatRelativeTime("2026-09-14T09:59:45Z", ref)).toBe("just now");
      expect(formatRelativeTime("2026-09-14T09:55:00Z", ref)).toBe("5m ago");
      expect(formatRelativeTime("2026-09-14T08:00:00Z", ref)).toBe("2h ago");
      expect(formatRelativeTime("2026-09-11T10:00:00Z", ref)).toBe("3d ago");
    }
  );

  fptTest(
    {
      id: "UTCID17",
      type: "N",
      executedDate: "14/09/2026",
      description: "getLatestSyncInfo tong hop thong tin sync moi nhat va phat hien stale hoac missing",
    },
    () => {
      const ref = new Date("2026-09-14T10:00:00Z");
      const activeSync = {
        jiraStatus: "ACTIVE",
        jiraLastSyncedAt: "2026-09-14T09:30:00Z",
        githubStatus: "ACTIVE",
        githubLastSyncedAt: "2026-09-14T09:45:00Z",
      };
      const info = getLatestSyncInfo(activeSync, { referenceDate: ref });
      expect(info.latestSyncAt).toBe("2026-09-14T09:45:00Z");
      expect(info.relativeTime).toBe("15m ago");
      expect(info.isStaleOrMissing).toBe(false);
      expect(info.isJiraActive).toBe(true);
      expect(info.isGitHubActive).toBe(true);

      const degradedSync = {
        jiraStatus: "ACTIVE",
        jiraLastSyncedAt: "2026-09-14T09:30:00Z",
        githubStatus: "REVOKED",
        githubLastSyncedAt: "2026-09-14T09:00:00Z",
      };
      const degradedInfo = getLatestSyncInfo(degradedSync, { referenceDate: ref });
      expect(degradedInfo.isStaleOrMissing).toBe(true);
      expect(degradedInfo.isGitHubActive).toBe(false);

      const oldSync = {
        jiraStatus: "ACTIVE",
        jiraLastSyncedAt: "2026-09-10T09:30:00Z",
        githubStatus: "ACTIVE",
        githubLastSyncedAt: "2026-09-10T09:00:00Z",
      };
      const oldInfo = getLatestSyncInfo(oldSync, { referenceDate: ref, staleThresholdHours: 24 });
      expect(oldInfo.isStaleOrMissing).toBe(true);
    }
  );
});
