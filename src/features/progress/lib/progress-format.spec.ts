import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  buildWeeklyCommitBuckets,
  formatCompletionPercent,
  formatLinkedCommitRatio,
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
});
