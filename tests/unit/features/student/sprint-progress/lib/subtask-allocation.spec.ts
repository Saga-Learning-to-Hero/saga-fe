import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  SUBTASK_SHARE_TOTAL,
  canQuickEditContributionPoints,
  countUnestimatedStandardTasks,
  formatIssuePointBadge,
  getAllocatedPoint,
  getInheritedContributionLabels,
  getMaxEditableShare,
  getRemainingShare,
  getSubtaskPercent,
  isSubtaskShareValue,
  mapTaskEvidenceCheck,
  mergeSubtaskLabelsForPatch,
  shouldShowEvidenceWarning,
  sumPlanningStoryPoints,
  sumSiblingUsedPoints,
} from "@/features/student/sprint-progress/lib/subtask-allocation";
import type { ShareTaskLike } from "@/features/student/sprint-progress/lib/subtask-allocation";

function task(partial: Partial<ShareTaskLike> & Pick<ShareTaskLike, "id">): ShareTaskLike {
  return {
    issueTypeLevel: "SUBTASK",
    parent: { taskId: "parent-1" },
    storyPoints: null,
    ...partial,
  };
}

describe("subtask-allocation", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "02/10/2026",
      description: "Chap nhan ty trong 1 va 10; 6 tuong duong 60% va 6/10 SP",
    },
    () => {
      expect(isSubtaskShareValue(1)).toBe(true);
      expect(isSubtaskShareValue(10)).toBe(true);
      expect(getSubtaskPercent(6)).toBe(60);
      expect(getAllocatedPoint(10, 6)).toBe(6);
      expect(getAllocatedPoint(10, 4)).toBe(4);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "02/10/2026",
      description: "Chan 0, so am, so thap phan va lon hon 10",
    },
    () => {
      expect(isSubtaskShareValue(0)).toBe(false);
      expect(isSubtaskShareValue(-1)).toBe(false);
      expect(isSubtaskShareValue(6.5)).toBe(false);
      expect(isSubtaskShareValue(11)).toBe(false);
      expect(isSubtaskShareValue(null)).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "02/10/2026",
      description: "Sibling dung 6 thi chi cho them toi da 4; tong 8 van hop le",
    },
    () => {
      const siblings = [
        task({ id: "a", storyPoints: 6 }),
        task({ id: "b", storyPoints: 2 }),
      ];
      const used = sumSiblingUsedPoints(siblings, "parent-1");
      expect(used).toBe(8);
      expect(getRemainingShare(used)).toBe(2);
      expect(getMaxEditableShare(6)).toBe(4);
      expect(used + 2).toBeLessThanOrEqual(SUBTASK_SHARE_TOTAL);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "02/10/2026",
      description: "Tong 11 bi chan vi vuot 100%",
    },
    () => {
      const used = sumSiblingUsedPoints(
        [task({ id: "a", storyPoints: 6 }), task({ id: "b", storyPoints: 5 })],
        "parent-1"
      );
      expect(used).toBe(11);
      expect(getRemainingShare(used)).toBe(0);
      expect(used > SUBTASK_SHARE_TOTAL).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "N",
      executedDate: "02/10/2026",
      description: "Khi sua, ty trong cu cua chinh Subtask duoc loai khoi tong",
    },
    () => {
      const tasks = [
        task({ id: "self", storyPoints: 6 }),
        task({ id: "sib", storyPoints: 3 }),
      ];
      expect(sumSiblingUsedPoints(tasks, "parent-1", "self")).toBe(3);
      expect(getMaxEditableShare(3)).toBe(7);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "02/10/2026",
      description: "Legacy storyPoint null khong chiem ty trong",
    },
    () => {
      const used = sumSiblingUsedPoints(
        [
          task({ id: "legacy", storyPoints: null, storyPoint: null }),
          task({ id: "ok", storyPoints: 4 }),
        ],
        "parent-1"
      );
      expect(used).toBe(4);
      expect(formatIssuePointBadge("SUBTASK", null)).toBe("Chưa phân bổ");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "B",
      executedDate: "02/10/2026",
      description: "Parent storyPoint null dung 1 khi preview diem du kien",
    },
    () => {
      expect(getAllocatedPoint(null, 6)).toBe(0.6);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "N",
      executedDate: "02/10/2026",
      description: "Planning chi cong STANDARD; parent 10 va Subtask 6-4 van la 10",
    },
    () => {
      const total = sumPlanningStoryPoints([
        { issueTypeLevel: "STANDARD", storyPoints: 10 },
        { issueTypeLevel: "SUBTASK", storyPoints: 6 },
        { issueTypeLevel: "SUBTASK", storyPoints: 4 },
        { issueTypeLevel: "EPIC", storyPoints: 20 },
      ]);
      expect(total).toBe(10);
      expect(formatIssuePointBadge("SUBTASK", 6)).toBe("60%");
      expect(formatIssuePointBadge("STANDARD", 10)).toBe("10 SP");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "02/10/2026",
      description: "STANDARD chua uoc luong khong bien thanh 1 trong planning",
    },
    () => {
      expect(sumPlanningStoryPoints([{ issueTypeLevel: "STANDARD", storyPoints: null }])).toBe(0);
      expect(countUnestimatedStandardTasks([{ issueTypeLevel: "STANDARD", storyPoints: null }])).toBe(1);
      expect(canQuickEditContributionPoints("EPIC")).toBe(false);
      expect(canQuickEditContributionPoints("UNKNOWN")).toBe(false);
      expect(canQuickEditContributionPoints("SUBTASK")).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "02/10/2026",
      description: "Khong dung Subtask cua cha khac; khong suy evidence tu commit count",
    },
    () => {
      const used = sumSiblingUsedPoints(
        [task({ id: "other", parent: { taskId: "parent-2" }, storyPoints: 9 })],
        "parent-1"
      );
      expect(used).toBe(0);
      expect(shouldShowEvidenceWarning(null)).toBe(false);
      expect(shouldShowEvidenceWarning({ status: "SATISFIED", requiresCommit: false, requiresDocument: false })).toBe(
        false
      );
      expect(
        shouldShowEvidenceWarning({ status: "MISSING_COMMIT", requiresCommit: true, requiresDocument: false })
      ).toBe(true);
      expect(mapTaskEvidenceCheck({ status: "SATISFIED", requiresCommit: true, requiresDocument: false })).toEqual({
        status: "SATISFIED",
        requiresCommit: true,
        requiresDocument: false,
      });
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "N",
      executedDate: "02/10/2026",
      description: "Subtask ke thua saga label tu cha va khong tu xoa label Jira thuong",
    },
    () => {
      expect(getInheritedContributionLabels(["saga:code", "frontend", "saga:test"])).toEqual([
        "saga:code",
        "saga:test",
      ]);
      expect(mergeSubtaskLabelsForPatch(["saga:code", "frontend"], ["backend"])).toEqual([
        "backend",
        "saga:code",
      ]);
    }
  );
});
