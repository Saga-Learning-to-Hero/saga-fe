import { describe, expect, vi, beforeEach } from "vitest";
import { LecturerPeerReviewService } from "@/features/lecturer/peer-review/api/lecturer-peer-review-service";
import { apiClient } from "@/lib/axios";
import { fptTest } from "@/testing/fpt-test-helper";
import { joinReviewCriteria, parseLecturerPeerReviewRubric } from "@/features/lecturer/peer-review/lib/lecturer-peer-review";

vi.mock("@/lib/axios");

function apiError(message: string, code: string, status: number) {
  const error = new Error(message) as Error & { code?: string; status?: number };
  error.code = code;
  error.status = status;
  return error;
}

const teamId = "team-1";
const sprintId = "sprint-1";
const encodedTeam = encodeURIComponent("team 1/x");
const encodedSprint = encodeURIComponent("sprint 2/y");

const rubricPayload = {
  teamId,
  subjectId: "subject-1",
  criteria: [
    { rubricId: "r-quality", criteriaName: "Hoàn thành & Chất lượng", description: "Làm đúng task" },
    { rubricId: "r-process", criteriaName: "Tiến độ & Quy trình", description: null },
  ],
};

const listPayload = {
  teamId,
  sprintId,
  sprintName: "Sprint 1",
  reviews: [
    {
      id: "pr-1",
      sprintId,
      sprintName: "Sprint 1",
      reviewerId: "stu-1",
      reviewerName: "An",
      revieweeId: "stu-2",
      revieweeName: "Binh",
      starRating: 9,
      criteriaRatings: [
        { rubricId: "r-quality", starRating: 5 },
        { rubricId: "r-process", starRating: 4 },
      ],
      comment: "Phối hợp tốt",
      createdAt: "2026-09-14T12:00:00",
      updatedAt: "2026-09-14T12:05:00",
    },
  ],
};

describe("LecturerPeerReviewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "GET rubric va list dung path encode, map field Backend",
    },
    async () => {
      const getSpy = vi
        .spyOn(apiClient, "get")
        .mockResolvedValueOnce({ data: rubricPayload })
        .mockResolvedValueOnce({ data: listPayload });
      const rubric = await LecturerPeerReviewService.getTeamRubric(teamId);
      const list = await LecturerPeerReviewService.getSprintReviews("team 1/x", "sprint 2/y");
      expect(rubric.criteria).toHaveLength(2);
      expect(rubric.criteria[0].criteriaName).toBe("Hoàn thành & Chất lượng");
      expect(list.sprintName).toBe("Sprint 1");
      expect(list.reviews[0].starRating).toBe(9);
      expect(getSpy).toHaveBeenNthCalledWith(1, `/api/teams/${teamId}/peer-review-rubric`);
      expect(getSpy).toHaveBeenNthCalledWith(
        2,
        `/api/teams/${encodedTeam}/sprints/${encodedSprint}/peer-reviews`
      );
      expect(getSpy.mock.calls[0][1]).toBeUndefined();
      expect(getSpy.mock.calls[1][1]).toBeUndefined();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "N",
      executedDate: "15/09/2026",
      description: "Ghep criteriaName tu rubric khi list chi co rubricId",
    },
    () => {
      const joined = joinReviewCriteria(
        [
          {
            id: "pr-1",
            sprintId,
            sprintName: "Sprint 1",
            reviewerId: "stu-1",
            reviewerName: "An",
            revieweeId: "stu-2",
            revieweeName: "Binh",
            starRating: 5,
            criteriaRatings: [{ rubricId: "r-quality", starRating: 5, criteriaName: null }],
            comment: null,
            createdAt: null,
            updatedAt: null,
          },
        ],
        parseLecturerPeerReviewRubric(rubricPayload)
      );
      expect(joined[0].criteriaRatings[0].criteriaName).toBe("Hoàn thành & Chất lượng");
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "B",
      executedDate: "15/09/2026",
      description: "List rong van hop le",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { teamId, sprintId, sprintName: "Sprint 1", reviews: [] },
      });
      const list = await LecturerPeerReviewService.getSprintReviews(teamId, sprintId);
      expect(list.reviews).toEqual([]);
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
      await expect(LecturerPeerReviewService.getTeamRubric("  ")).rejects.toThrow("Team ID is required");
      await expect(LecturerPeerReviewService.getSprintReviews(teamId, "")).rejects.toThrow(
        "Sprint ID is required"
      );
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "A",
      executedDate: "15/09/2026",
      description: "Khong goi candidates hoac POST peer-reviews",
    },
    async () => {
      const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({ data: listPayload });
      const postSpy = vi.spyOn(apiClient, "post");
      await LecturerPeerReviewService.getSprintReviews(teamId, sprintId);
      expect(getSpy.mock.calls.some((call) => String(call[0]).includes("/candidates"))).toBe(false);
      expect(postSpy).not.toHaveBeenCalled();
      expect(JSON.stringify(getSpy.mock.calls[0])).not.toContain("reviewerId");
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "A",
      executedDate: "15/09/2026",
      description: "403 PEER_REVIEW_FORBIDDEN va 404 TEAM_NOT_FOUND duoc nem ra",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Không được xem đánh giá chéo", "PEER_REVIEW_FORBIDDEN", 403)
      );
      await expect(LecturerPeerReviewService.getSprintReviews(teamId, sprintId)).rejects.toMatchObject({
        code: "PEER_REVIEW_FORBIDDEN",
        status: 403,
      });
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(apiError("Không tìm thấy nhóm", "TEAM_NOT_FOUND", 404));
      await expect(LecturerPeerReviewService.getTeamRubric(teamId)).rejects.toMatchObject({
        code: "TEAM_NOT_FOUND",
        status: 404,
      });
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "15/09/2026",
      description: "400 500 va network error duoc nem ra",
    },
    async () => {
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Yêu cầu không hợp lệ", "REQUEST_INVALID", 400)
      );
      await expect(LecturerPeerReviewService.getSprintReviews(teamId, sprintId)).rejects.toMatchObject({
        status: 400,
      });
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(
        apiError("Lỗi hệ thống", "INTERNAL_SERVER_ERROR", 500)
      );
      await expect(LecturerPeerReviewService.getTeamRubric(teamId)).rejects.toMatchObject({ status: 500 });
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(new Error("Network Error"));
      await expect(LecturerPeerReviewService.getSprintReviews(teamId, sprintId)).rejects.toThrow("Network Error");
    }
  );

  fptTest(
    {
      id: "UTCID08",
      type: "B",
      executedDate: "15/09/2026",
      description: "Mapper loai tieu chi thieu rubricId hoac criteriaName",
    },
    () => {
      const parsed = parseLecturerPeerReviewRubric({
        teamId,
        subjectId: null,
        criteria: [{ rubricId: "ok", criteriaName: "Ok" }, { id: "legacy", name: "Cu" }],
      });
      expect(parsed.criteria).toHaveLength(1);
      expect(parsed.subjectId).toBeNull();
    }
  );
});
