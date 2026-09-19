import { describe, expect } from "vitest";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  excludeSelfReviewCandidates,
  parsePeerReviewRubric,
  resolvePeerReviewRubric,
  rubricSourceLabel,
  shouldFetchDefaultRubric,
} from "@/features/student/assessment/lib/peer-review-payload";
import type { PeerReviewCandidate, PeerReviewRubric } from "@/features/student/assessment/types/peer-review";

const fourCriteria = [
  { rubricId: "r-attitude", criteriaName: "Thái độ hợp tác", description: "Tinh thần làm việc nhóm" },
  { rubricId: "r-quality", criteriaName: "Chất lượng công việc", description: null },
  { rubricId: "r-deadline", criteriaName: "Đúng hạn", description: "Giao đúng hạn" },
  { rubricId: "r-communication", criteriaName: "Giao tiếp", description: "Phản hồi" },
];

const filled: PeerReviewRubric = {
  teamId: "team-1",
  subjectId: "subject-1",
  criteria: fourCriteria,
};

const emptyTeam: PeerReviewRubric = { teamId: "team-1", subjectId: "subject-1", criteria: [] };
const fallback: PeerReviewRubric = {
  teamId: null,
  subjectId: null,
  criteria: [{ rubricId: "r-default", criteriaName: "Chất lượng", description: "Mô tả" }],
};

describe("peer-review-payload rubric fallback", () => {
  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Uu tien rubric team khi da co bon tieu chi, khong can default",
    },
    () => {
      expect(resolvePeerReviewRubric(filled, fallback)?.criteria).toHaveLength(4);
      expect(shouldFetchDefaultRubric(filled, true)).toBe(false);
      expect(rubricSourceLabel(filled)).toBe("Tiêu chí môn học");
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "15/09/2026",
      description: "Chi goi default rubric khi criteria team rong",
    },
    () => {
      expect(shouldFetchDefaultRubric(emptyTeam, true)).toBe(true);
      expect(shouldFetchDefaultRubric(emptyTeam, false)).toBe(false);
      expect(resolvePeerReviewRubric(emptyTeam, fallback)?.criteria[0].rubricId).toBe("r-default");
      expect(rubricSourceLabel(fallback)).toBe("Tiêu chí mặc định");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "15/09/2026",
      description: "Loai self-review bang reviewerId, khong dung studentCode",
    },
    () => {
      const rows: PeerReviewCandidate[] = [
        {
          studentId: "stu-1",
          studentCode: "SE1",
          fullName: "Me",
          alreadyReviewed: false,
          existingReviewId: null,
          existingTotalStarRating: null,
        },
        {
          studentId: "stu-2",
          studentCode: "SE2",
          fullName: "Peer",
          alreadyReviewed: false,
          existingReviewId: null,
          existingTotalStarRating: null,
        },
      ];
      const filtered = excludeSelfReviewCandidates(rows, "stu-1");
      expect(filtered).toHaveLength(1);
      expect(filtered[0].studentId).toBe("stu-2");
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "B",
      executedDate: "15/09/2026",
      description: "Giu thu tu mang Backend va loai tieu chi thieu rubricId hoac criteriaName",
    },
    () => {
      const parsed = parsePeerReviewRubric({
        teamId: "team-1",
        subjectId: "subject-1",
        criteria: [
          { rubricId: "second", criteriaName: "Hai" },
          { rubricId: "", criteriaName: "Thieu id" },
          { rubricId: "third", criteriaName: "Ba" },
          { id: "legacy", name: "Cu" },
        ],
      });
      expect(parsed.criteria.map((item) => item.rubricId)).toEqual(["second", "third"]);
    }
  );
});
