import { describe, expect, vi, beforeEach } from "vitest";
import { PeerReviewService } from "@/features/student/assessment/api/peer-review-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import {
  buildSubmitPeerReviewPayload,
  parsePeerReviewRubric,
} from "@/features/student/assessment/lib/peer-review-payload";
import type { SubmitPeerReviewInput } from "@/features/student/assessment/types/peer-review";

vi.mock("@/lib/axios");

const teamId = "team-1";
const sprintId = "sprint-1";
const encodedTeam = encodeURIComponent("team 1/x");
const encodedSprint = encodeURIComponent("sprint 2/y");
const reviewerId = "stu-1";

const fourCriteria = [
  { rubricId: "r-attitude", criteriaName: "Thái độ hợp tác", description: "Tinh thần làm việc nhóm" },
  { rubricId: "r-quality", criteriaName: "Chất lượng công việc", description: "Độ hoàn thiện sản phẩm" },
  { rubricId: "r-deadline", criteriaName: "Đúng hạn", description: "Giao đúng thời hạn Sprint" },
  { rubricId: "r-communication", criteriaName: "Giao tiếp", description: null },
];

const teamRubric = {
  teamId,
  subjectId: "subject-swp391",
  criteria: fourCriteria,
};

const candidatesWrapper = {
  teamId,
  sprintId,
  reviewerId,
  candidates: [
    {
      studentId: "stu-2",
      fullName: "Nguyen Van B",
      studentCode: "SE2",
      alreadyReviewed: false,
      existingReviewId: null,
      existingTotalStarRating: null,
    },
    {
      studentId: "stu-3",
      fullName: "Nguyen Van C",
      studentCode: "SE3",
      alreadyReviewed: true,
      existingReviewId: "pr-old",
      existingTotalStarRating: 16,
    },
  ],
};

function baseInput(overrides: Partial<SubmitPeerReviewInput> = {}): SubmitPeerReviewInput {
  return {
    revieweeId: "stu-2",
    hasExistingReview: false,
    comment: "Tot",
    ratings: { "r-attitude": 4, "r-quality": 5, "r-deadline": 4, "r-communication": 3 },
    rubricIds: fourCriteria.map((item) => item.rubricId),
    allowedRevieweeIds: ["stu-2", "stu-3"],
    reviewerId,
    ...overrides,
  };
}

describe("PeerReviewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "URL encode dung teamId va sprintId khi tai candidates wrapper",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: candidatesWrapper });
      await PeerReviewService.getCandidates("team 1/x", "sprint 2/y");
      expect(getSpy).toHaveBeenCalledWith(
        `/api/teams/${encodedTeam}/sprints/${encodedSprint}/peer-reviews/candidates`
      );
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "15/09/2026",
      description: "Team rubric bon tieu chi doc dung rubricId va criteriaName, khong goi default",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: teamRubric });
      const team = await PeerReviewService.getTeamRubric(teamId);
      expect(team.teamId).toBe(teamId);
      expect(team.subjectId).toBe("subject-swp391");
      expect(team.criteria).toHaveLength(4);
      expect(team.criteria.map((item) => item.rubricId)).toEqual(fourCriteria.map((item) => item.rubricId));
      expect(team.criteria[0].criteriaName).toBe("Thái độ hợp tác");
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(getSpy).toHaveBeenCalledWith(`/api/teams/${teamId}/peer-review-rubric`);
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "15/09/2026",
      description: "Candidates giu reviewerId; POST dung revieweeId va rubricId, khong co field cu",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: candidatesWrapper });
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          teamId,
          sprintId,
          reviewerId,
          revieweeId: "stu-2",
          starRating: 16,
          criteriaRatings: [{ rubricId: "r-attitude", starRating: 4 }],
          createdAt: "2026-09-15T10:00:00.000Z",
          updatedAt: "2026-09-15T10:05:00.000Z",
        },
      });
      const candidates = await PeerReviewService.getCandidates(teamId, sprintId);
      expect(candidates.reviewerId).toBe(reviewerId);
      expect(candidates.candidates).toHaveLength(2);
      expect(candidates.candidates[0].alreadyReviewed).toBe(false);
      expect(candidates.candidates[1].existingReviewId).toBe("pr-old");

      const submitted = await PeerReviewService.submitReview(teamId, sprintId, baseInput());
      expect(submitted.revieweeId).toBe("stu-2");
      expect(submitted.starRating).toBe(16);
      expect(submitted.createdAt).toBe("2026-09-15T10:00:00.000Z");
      expect(submitted.updatedAt).toBe("2026-09-15T10:05:00.000Z");

      const body = postSpy.mock.calls[0][1] as Record<string, unknown>;
      expect(body.revieweeId).toBe("stu-2");
      expect(body.reviewerId).toBeUndefined();
      expect(body.existingReviewId).toBeUndefined();
      expect(body.totalStarRating).toBeUndefined();
      expect(body.revieweeStudentId).toBeUndefined();
      expect(body.criterionId).toBeUndefined();
      expect(JSON.stringify(body)).not.toMatch(/revieweeStudentId|criterionId|alreadySubmitted|totalStarRating/);
      expect(body.criteriaRatings).toEqual([
        { rubricId: "r-attitude", starRating: 4 },
        { rubricId: "r-quality", starRating: 5 },
        { rubricId: "r-deadline", starRating: 4 },
        { rubricId: "r-communication", starRating: 3 },
      ]);
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "15/09/2026",
      description: "Throw khi teamId hoac sprintId rong",
    },
    async () => {
      await expect(PeerReviewService.getTeamRubric("  ")).rejects.toThrow("Team ID is required");
      await expect(PeerReviewService.getCandidates(teamId, "")).rejects.toThrow("Sprint ID is required");
      await expect(PeerReviewService.submitReview("", sprintId, baseInput())).rejects.toThrow("Team ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "15/09/2026",
      description: "Throw khi self-review theo reviewerId hoac candidate khong hop le",
    },
    () => {
      expect(() => buildSubmitPeerReviewPayload(baseInput({ revieweeId: reviewerId }))).toThrow("Self-review");
      expect(() => buildSubmitPeerReviewPayload(baseInput({ revieweeId: "stu-99" }))).toThrow("Candidate is not valid");
      expect(() => buildSubmitPeerReviewPayload(baseInput({ revieweeId: "" }))).toThrow("Reviewee ID is required");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "15/09/2026",
      description: "Throw khi thieu hoac thua tieu chi rubric",
    },
    () => {
      expect(() =>
        buildSubmitPeerReviewPayload(
          baseInput({ ratings: { "r-attitude": 4 }, rubricIds: ["r-attitude", "r-quality"] })
        )
      ).toThrow("Rubric criteria mismatch");
      expect(() =>
        buildSubmitPeerReviewPayload(baseInput({ ratings: { ...baseInput().ratings, extra: 3 } }))
      ).toThrow("Rubric criteria mismatch");
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "15/09/2026",
      description: "Khong goi API list toan nhom peer-reviews",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({ data: candidatesWrapper });
      await PeerReviewService.getCandidates(teamId, sprintId);
      expect(getSpy.mock.calls.some((call) => String(call[0]).endsWith("/peer-reviews"))).toBe(false);
      expect(String(getSpy.mock.calls[0][0])).toContain("/peer-reviews/candidates");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "15/09/2026",
      description: "Sao 1 va 5 hop le, 0 6 va so thap phan bi loai",
    },
    () => {
      const minMax = buildSubmitPeerReviewPayload(
        baseInput({ ratings: { "r-attitude": 1, "r-quality": 5, "r-deadline": 1, "r-communication": 5 } })
      );
      expect(minMax.criteriaRatings[0].starRating).toBe(1);
      expect(() =>
        buildSubmitPeerReviewPayload(baseInput({ ratings: { ...baseInput().ratings, "r-attitude": 0 } }))
      ).toThrow("Star rating");
      expect(() =>
        buildSubmitPeerReviewPayload(baseInput({ ratings: { ...baseInput().ratings, "r-attitude": 6 } }))
      ).toThrow("Star rating");
      expect(() =>
        buildSubmitPeerReviewPayload(baseInput({ ratings: { ...baseInput().ratings, "r-attitude": 4.5 } }))
      ).toThrow("Star rating");
    }
  );

  fptTest(
    {
      id: "UTCID09",
      type: "B",
      executedDate: "15/09/2026",
      description: "Comment 0 ky tu bi bo, 4000 hop le, 4001 throw",
    },
    () => {
      const empty = buildSubmitPeerReviewPayload(baseInput({ comment: "" }));
      expect(empty.comment).toBeUndefined();
      const max = "x".repeat(4000);
      expect(buildSubmitPeerReviewPayload(baseInput({ comment: max })).comment).toHaveLength(4000);
      expect(() => buildSubmitPeerReviewPayload(baseInput({ comment: `${max}y` }))).toThrow("4000");
    }
  );

  fptTest(
    {
      id: "UTCID10",
      type: "A",
      executedDate: "15/09/2026",
      description: "Mapper loai tieu chi cu id/name va mang candidates thô khong phai wrapper",
    },
    async () => {
      const legacy = parsePeerReviewRubric({
        id: "legacy",
        criteria: [{ id: "c1", name: "Thai do", criterionId: "c1" }],
      });
      expect(legacy.criteria).toHaveLength(0);
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: [{ studentId: "stu-2", fullName: "An", alreadyReviewed: false }],
      });
      const parsed = await PeerReviewService.getCandidates(teamId, sprintId);
      expect(parsed.reviewerId).toBeNull();
      expect(parsed.candidates).toHaveLength(0);
    }
  );

  fptTest(
    {
      id: "UTCID11",
      type: "B",
      executedDate: "15/09/2026",
      description: "Default rubric rong criteria van parse dung shape Backend",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { teamId: null, subjectId: null, criteria: [] },
      });
      const fallback = await PeerReviewService.getDefaultRubric();
      expect(fallback.subjectId).toBeNull();
      expect(fallback.criteria).toEqual([]);
    }
  );

  fptTest(
    {
      id: "UTCID12",
      type: "A",
      executedDate: "15/09/2026",
      description: "Khong tao payload va khong goi API khi da danh gia thanh vien trong Sprint",
    },
    async () => {
      const postSpy = vi.spyOn(apiClient, "post");
      expect(() =>
        buildSubmitPeerReviewPayload(baseInput({ hasExistingReview: true }))
      ).toThrow("already been submitted");
      await expect(
        PeerReviewService.submitReview(
          teamId,
          sprintId,
          baseInput({ hasExistingReview: true })
        )
      ).rejects.toThrow("already been submitted");
      expect(postSpy).not.toHaveBeenCalled();
    }
  );
});
