import { describe, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fptTest } from "@/testing/fpt-test-helper";

const getTeamRubric = vi.fn();
const getDefaultRubric = vi.fn();
const getCandidates = vi.fn();
const submitReview = vi.fn();

vi.mock("../api/peer-review-service", () => ({
  PeerReviewService: {
    getTeamRubric: (...args: unknown[]) => getTeamRubric(...args),
    getDefaultRubric: (...args: unknown[]) => getDefaultRubric(...args),
    getCandidates: (...args: unknown[]) => getCandidates(...args),
    submitReview: (...args: unknown[]) => submitReview(...args),
  },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import {
  mapPeerReviewSubmitError,
  useDefaultPeerReviewRubric,
  usePeerReviewCandidates,
  useSubmitPeerReview,
  useTeamPeerReviewRubric,
  PEER_REVIEW_QUERY_KEYS,
} from "./use-peer-review";

describe("use-peer-review", () => {
  let wrapper: React.FC<{ children: React.ReactNode }>;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wrapper = ({ children }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
    getTeamRubric.mockResolvedValue({
      teamId: "team-1",
      subjectId: "subject-1",
      criteria: [{ rubricId: "r-attitude", criteriaName: "Thái độ hợp tác" }],
    });
    getDefaultRubric.mockResolvedValue({
      teamId: null,
      subjectId: null,
      criteria: [{ rubricId: "r-default", criteriaName: "Chất lượng" }],
    });
    getCandidates.mockResolvedValue({
      teamId: "team-1",
      sprintId: "sprint-1",
      reviewerId: "stu-1",
      candidates: [],
    });
    submitReview.mockResolvedValue({
      revieweeId: "stu-2",
      starRating: 16,
      createdAt: "2026-09-15T10:00:00.000Z",
      updatedAt: "2026-09-15T10:00:00.000Z",
    });
  });

  fptTest(
    {
      id: "UTCID01",
      type: "N",
      executedDate: "15/09/2026",
      description: "Default rubric tat khi enabled false",
    },
    () => {
      renderHook(() => useDefaultPeerReviewRubric({ enabled: false }), { wrapper });
      expect(getDefaultRubric).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID02",
      type: "A",
      executedDate: "15/09/2026",
      description: "Khong goi candidates khi Sprint chua du dieu kien",
    },
    () => {
      renderHook(() => usePeerReviewCandidates("team-1", "sprint-1", { enabled: false }), { wrapper });
      expect(getCandidates).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID03",
      type: "N",
      executedDate: "15/09/2026",
      description: "Submit thanh cong danh dau da danh gia ngay va lam moi dung query candidates",
    },
    async () => {
      const candidatesKey = PEER_REVIEW_QUERY_KEYS.candidates(
        "team-1",
        "sprint-1",
      );
      queryClient.setQueryData(candidatesKey, {
        teamId: "team-1",
        sprintId: "sprint-1",
        reviewerId: "stu-1",
        candidates: [
          {
            studentId: "stu-2",
            studentCode: "SE2",
            fullName: "Nguyen Van B",
            alreadyReviewed: false,
            existingReviewId: null,
            existingTotalStarRating: null,
          },
        ],
      });
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useSubmitPeerReview(), { wrapper });
      await result.current.mutateAsync({
        teamId: "team-1",
        sprintId: "sprint-1",
        input: {
          revieweeId: "stu-2",
          hasExistingReview: false,
          ratings: { "r-attitude": 5 },
          rubricIds: ["r-attitude"],
          allowedRevieweeIds: ["stu-2"],
          reviewerId: "stu-1",
        },
      });
      await waitFor(() => expect(invalidate).toHaveBeenCalled());
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: candidatesKey,
      });
      expect(
        queryClient.getQueryData<{
          candidates: Array<{
            alreadyReviewed: boolean;
            existingTotalStarRating: number | null;
          }>;
        }>(candidatesKey)?.candidates[0],
      ).toMatchObject({
        alreadyReviewed: true,
        existingTotalStarRating: 16,
      });
    }
  );

  fptTest(
    {
      id: "UTCID04",
      type: "A",
      executedDate: "15/09/2026",
      description: "Map ma loi PEER_REVIEW_FORBIDDEN TEAM_NOT_FOUND PROJECT_NOT_FOUND",
    },
    () => {
      expect(mapPeerReviewSubmitError({ code: "PEER_REVIEW_FORBIDDEN" }).message).toContain("không được gửi");
      expect(mapPeerReviewSubmitError({ code: "TEAM_NOT_FOUND" }).message).toContain("nhóm");
      expect(mapPeerReviewSubmitError({ code: "PROJECT_NOT_FOUND" }).message).toContain("dự án");
      expect(mapPeerReviewSubmitError({ code: "PEER_REVIEW_INVALID" }).message).toContain("sao");
      expect(mapPeerReviewSubmitError({ code: "REQUEST_INVALID" }).message).toContain("không hợp lệ");
    }
  );

  fptTest(
    {
      id: "UTCID05",
      type: "B",
      executedDate: "15/09/2026",
      description: "Team rubric van goi khi co teamId, khong dung API list toan nhom",
    },
    async () => {
      renderHook(() => useTeamPeerReviewRubric("team-1"), { wrapper });
      await waitFor(() => expect(getTeamRubric).toHaveBeenCalledWith("team-1"));
      expect(getCandidates).not.toHaveBeenCalled();
    }
  );

  fptTest(
    {
      id: "UTCID06",
      type: "N",
      executedDate: "15/09/2026",
      description: "Default rubric chi goi khi enabled true (criteria team rong)",
    },
    async () => {
      renderHook(() => useDefaultPeerReviewRubric({ enabled: true }), { wrapper });
      await waitFor(() => expect(getDefaultRubric).toHaveBeenCalledTimes(1));
    }
  );

  fptTest(
    {
      id: "UTCID07",
      type: "A",
      executedDate: "15/09/2026",
      description: "Mutation that bai khong invalidate candidates",
    },
    async () => {
      submitReview.mockRejectedValueOnce({ code: "PEER_REVIEW_INVALID" });
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useSubmitPeerReview(), { wrapper });
      await expect(
        result.current.mutateAsync({
          teamId: "team-1",
          sprintId: "sprint-1",
          input: {
            revieweeId: "stu-2",
            hasExistingReview: false,
            ratings: { "r-attitude": 5 },
            rubricIds: ["r-attitude"],
            allowedRevieweeIds: ["stu-2"],
          },
        })
      ).rejects.toMatchObject({ code: "PEER_REVIEW_INVALID" });
      expect(invalidate).not.toHaveBeenCalled();
    }
  );
});
