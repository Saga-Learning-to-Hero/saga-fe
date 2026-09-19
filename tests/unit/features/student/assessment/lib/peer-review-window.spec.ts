import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import type { ProjectSprintResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import {
  getPeerReviewWindowStart,
  isPeerReviewWindowOpen,
  pickDefaultPeerReviewSprintId,
} from "@/features/student/assessment/lib/peer-review-window";

const HOUR = 60 * 60 * 1000;
const now = Date.parse("2026-09-14T12:00:00.000Z");

function sprint(partial: Partial<ProjectSprintResponse> & Pick<ProjectSprintResponse, "id">): ProjectSprintResponse {
  return {
    name: partial.name || partial.id,
    state: "active",
    ...partial,
  };
}

describe("peer-review-window", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "14/09/2026",
      description: "Sprint closed luon mo cua so danh gia",
    },
    () => {
      expect(isPeerReviewWindowOpen(sprint({ id: "c1", state: "closed", endDate: null }), now)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "14/09/2026",
      description: "Sprint active nam trong 48 gio truoc endDate thi mo",
    },
    () => {
      const endDate = new Date(now + 24 * HOUR).toISOString();
      expect(isPeerReviewWindowOpen(sprint({ id: "a1", state: "active", endDate }), now)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "A",
      executedDate: "14/09/2026",
      description: "Thieu endDate va chua closed thi khoa form",
    },
    () => {
      expect(isPeerReviewWindowOpen(sprint({ id: "a2", state: "active", endDate: null }), now)).toBe(false);
      expect(getPeerReviewWindowStart({ endDate: null })).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "14/09/2026",
      description: "endDate sai dinh dang thi khoa form neu chua closed",
    },
    () => {
      expect(isPeerReviewWindowOpen(sprint({ id: "a3", state: "future", endDate: "not-a-date" }), now)).toBe(false);
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "14/09/2026",
      description: "Truoc dung 48 gio thi chua mo, dung bien 48 gio thi mo",
    },
    () => {
      const end = now + 48 * HOUR;
      const before = now - 1;
      expect(
        isPeerReviewWindowOpen(sprint({ id: "b1", state: "active", endDate: new Date(end).toISOString() }), before)
      ).toBe(false);
      expect(
        isPeerReviewWindowOpen(sprint({ id: "b2", state: "active", endDate: new Date(end).toISOString() }), now)
      ).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "15/09/2026",
      description: "Sau endDate neu Sprint chua closed van mo cua so cham",
    },
    () => {
      const endDate = new Date(now - 1).toISOString();
      expect(isPeerReviewWindowOpen(sprint({ id: "b3", state: "active", endDate }), now)).toBe(true);
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "N",
      executedDate: "14/09/2026",
      description: "Mac dinh uu tien Sprint active trong cua so, sau do closed moi nhat",
    },
    () => {
      const active = sprint({
        id: "active-now",
        state: "active",
        endDate: new Date(now + 10 * HOUR).toISOString(),
      });
      const closedOld = sprint({
        id: "closed-old",
        state: "closed",
        endDate: "2026-08-01T00:00:00.000Z",
        completeDate: "2026-08-01T00:00:00.000Z",
      });
      const closedNew = sprint({
        id: "closed-new",
        state: "closed",
        endDate: "2026-09-01T00:00:00.000Z",
        completeDate: "2026-09-01T00:00:00.000Z",
      });
      expect(pickDefaultPeerReviewSprintId([closedOld, active, closedNew], now)).toBe("active-now");
      expect(pickDefaultPeerReviewSprintId([closedOld, closedNew], now)).toBe("closed-new");
    }
  );
});
