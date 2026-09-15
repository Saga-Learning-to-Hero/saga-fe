import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import type { ProjectSprintResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import {
  buildPeerReviewKpis,
  buildReviewMatrix,
  buildScorePercentDistribution,
  formatScoreOutOfMax,
  formatSprintState,
  formatTeamOptionLabel,
  getPeerReviewMaxScore,
  isLongComment,
  pickDefaultLecturerPeerReviewSprintId,
  resolveCriteriaColumns,
  resolveMatrixMembers,
  resolvePeerReviewViewState,
  reviewsWithComments,
} from "./lecturer-peer-review";
import type { LecturerPeerReviewItem } from "../types/lecturer-peer-review";

function sprint(partial: Partial<ProjectSprintResponse> & Pick<ProjectSprintResponse, "id">): ProjectSprintResponse {
  return {
    name: partial.name || partial.id,
    state: "active",
    ...partial,
  };
}

const reviews: LecturerPeerReviewItem[] = [
  {
    id: "1",
    sprintId: "s1",
    sprintName: "Sprint 1",
    reviewerId: "a",
    reviewerName: "A",
    revieweeId: "b",
    revieweeName: "B",
    starRating: 18,
    criteriaRatings: [{ rubricId: "r1", starRating: 5, criteriaName: "Chất lượng" }],
    comment: "Tot",
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "2",
    sprintId: "s1",
    sprintName: "Sprint 1",
    reviewerId: "b",
    reviewerName: "B",
    revieweeId: "a",
    revieweeName: "A",
    starRating: 18,
    criteriaRatings: [],
    comment: "   ",
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "3",
    sprintId: "s1",
    sprintName: "Sprint 1",
    reviewerId: "c",
    reviewerName: "C",
    revieweeId: "a",
    revieweeName: "A",
    starRating: 12,
    criteriaRatings: [],
    comment: null,
    createdAt: null,
    updatedAt: null,
  },
];

describe("lecturer-peer-review helpers", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Mac dinh Sprint closed moi nhat, sau do active",
    },
    () => {
      expect(
        pickDefaultLecturerPeerReviewSprintId([
          sprint({ id: "old", state: "closed", completeDate: "2026-08-01T00:00:00.000Z" }),
          sprint({ id: "new", state: "closed", completeDate: "2026-09-01T00:00:00.000Z" }),
          sprint({ id: "act", state: "active" }),
        ])
      ).toBe("new");
      expect(pickDefaultLecturerPeerReviewSprintId([sprint({ id: "act", state: "active" })])).toBe("act");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "B",
      executedDate: "15/09/2026",
      description: "Danh sach sprint rong tra null",
    },
    () => {
      expect(pickDefaultLecturerPeerReviewSprintId([])).toBeNull();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "15/09/2026",
      description: "Phan bo phan tram luon du 4 khoang va loc binh luan",
    },
    () => {
      const buckets = buildScorePercentDistribution(reviews, 20);
      expect(buckets).toHaveLength(4);
      expect(buckets.map((item) => item.label)).toEqual(["<50%", "50–69%", "70–84%", "85–100%"]);
      expect(buckets.every((item) => item.fill.startsWith("var(--"))).toBe(true);
      expect(buckets.find((item) => item.id === "excellent")?.count).toBe(2);
      expect(buckets.find((item) => item.id === "mid")?.count).toBe(1);
      expect(reviewsWithComments(reviews)).toHaveLength(1);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "N",
      executedDate: "15/09/2026",
      description: "Dich trang thai Sprint va nhan nhom sang tieng Viet",
    },
    () => {
      expect(formatSprintState("closed")).toBe("Đã kết thúc");
      expect(formatSprintState("active")).toBe("Đang diễn ra");
      expect(formatSprintState("future")).toBe("Sắp diễn ra");
      expect(formatTeamOptionLabel(2, "Beta")).toBe("Nhóm 2 — Beta");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "15/09/2026",
      description: "viewState khong cho phep loading error va success dong thoi",
    },
    () => {
      expect(
        resolvePeerReviewViewState({
          canLoad: true,
          hasReviewsData: false,
          reviewsError: false,
          reviewsEmpty: false,
          rubricError: true,
        })
      ).toBe("loading");
      expect(
        resolvePeerReviewViewState({
          canLoad: true,
          hasReviewsData: false,
          reviewsError: true,
          reviewsEmpty: false,
          rubricError: false,
        })
      ).toBe("reviewsError");
      expect(
        resolvePeerReviewViewState({
          canLoad: true,
          hasReviewsData: true,
          reviewsError: false,
          reviewsEmpty: false,
          rubricError: true,
        })
      ).toBe("partial");
      expect(
        resolvePeerReviewViewState({
          canLoad: true,
          hasReviewsData: true,
          reviewsError: false,
          reviewsEmpty: false,
          rubricError: false,
        })
      ).toBe("success");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "B",
      executedDate: "15/09/2026",
      description: "Diem 18/20, rubric rong van lay ten tieu chi tu review",
    },
    () => {
      expect(getPeerReviewMaxScore(4)).toBe(20);
      expect(formatScoreOutOfMax(18, 20)).toMatch(/18\/20/);
      expect(formatScoreOutOfMax(16.5, 20)).toMatch(/16[,.]5\/20/);
      const columns = resolveCriteriaColumns({ teamId: "t", subjectId: null, criteria: [] }, reviews);
      expect(columns[0]?.criteriaName).toBe("Chất lượng");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "15/09/2026",
      description: "Ma tran danh dau cap thieu va thanh vien chua danh gia",
    },
    () => {
      const members = resolveMatrixMembers(
        [
          { studentProfileId: "a", fullName: "A" },
          { studentProfileId: "b", fullName: "B" },
        ],
        reviews
      );
      const cells = buildReviewMatrix(members, reviews);
      const missing = cells.filter((cell) => !cell.isSelf && !cell.review);
      expect(missing.length).toBeGreaterThan(0);
      const kpis = buildPeerReviewKpis(members, reviews, 20);
      expect(kpis.expectedCount).toBe(6);
      expect(kpis.submittedCount).toBe(3);
      expect(kpis.membersWithoutReviewCount).toBe(0);
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "15/09/2026",
      description: "Binh luan dai can xem day du, thieu endDate khong anh huong helper nay",
    },
    () => {
      expect(isLongComment("ngan")).toBe(false);
      expect(isLongComment("x".repeat(90))).toBe(true);
      expect(isLongComment("dong 1\ndong 2")).toBe(true);
    }
  );
});
