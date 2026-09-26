"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, getApiErrorMessage, getApiErrorStatus, getApiErrorCode } from "@/lib/api-error";
import { PeerReviewService } from "../api/peer-review-service";
import type {
  PeerReviewCandidatesResponse,
  SubmitPeerReviewInput,
} from "../types/peer-review";

export const PEER_REVIEW_QUERY_KEYS = {
  all: ["peer-review"] as const,
  teamRubric: (teamId?: string | null) => [...PEER_REVIEW_QUERY_KEYS.all, "team-rubric", teamId] as const,
  defaultRubric: () => [...PEER_REVIEW_QUERY_KEYS.all, "default-rubric"] as const,
  candidates: (teamId?: string | null, sprintId?: string | null) =>
    [...PEER_REVIEW_QUERY_KEYS.all, "candidates", teamId, sprintId] as const,
};

function shouldRetryPeerReviewQuery(failureCount: number, error: unknown): boolean {
  const status = getApiErrorStatus(error);
  if (status === 400 || status === 403 || status === 404) return false;
  return failureCount < 1;
}

export function useTeamPeerReviewRubric(teamId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PEER_REVIEW_QUERY_KEYS.teamRubric(teamId),
    queryFn: () => PeerReviewService.getTeamRubric(teamId!),
    enabled: (options?.enabled ?? true) && Boolean(teamId && teamId.trim()),
    staleTime: 1000 * 60 * 5,
    retry: shouldRetryPeerReviewQuery,
  });
}

export function useDefaultPeerReviewRubric(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PEER_REVIEW_QUERY_KEYS.defaultRubric(),
    queryFn: () => PeerReviewService.getDefaultRubric(),
    enabled: options?.enabled ?? false,
    staleTime: 1000 * 60 * 5,
    retry: shouldRetryPeerReviewQuery,
  });
}

export function usePeerReviewCandidates(
  teamId?: string | null,
  sprintId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PEER_REVIEW_QUERY_KEYS.candidates(teamId, sprintId),
    queryFn: () => PeerReviewService.getCandidates(teamId!, sprintId!),
    enabled:
      (options?.enabled ?? true) &&
      Boolean(teamId && teamId.trim() && sprintId && sprintId.trim()),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    retry: shouldRetryPeerReviewQuery,
  });
}

export function mapPeerReviewSubmitError(error: unknown): { code?: string; message: string } {
  const code = getApiErrorCode(error);
  if (code === "PEER_REVIEW_FORBIDDEN") {
    return { code, message: "Bạn không được gửi đánh giá chéo cho Sprint này." };
  }
  if (code === "TEAM_NOT_FOUND") {
    return { code, message: "Không tìm thấy nhóm. Hãy chọn lại lớp học phần." };
  }
  if (code === "PROJECT_NOT_FOUND") {
    return { code, message: "Nhóm chưa có dự án nên chưa mở đánh giá chéo theo Sprint." };
  }
  if (code === "PEER_REVIEW_INVALID") {
    return { code, message: "Nội dung đánh giá chưa hợp lệ. Kiểm tra lại số sao từng tiêu chí." };
  }
  if (code === "REQUEST_INVALID") {
    return { code, message: "Yêu cầu không hợp lệ. Không gửi lại với dữ liệu cũ." };
  }
  return { code, message: getApiErrorMessage(error, "Không gửi được đánh giá chéo. Form vẫn được giữ.") };
}

export function useSubmitPeerReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teamId,
      sprintId,
      input,
    }: {
      teamId: string;
      sprintId: string;
      input: SubmitPeerReviewInput;
    }) => PeerReviewService.submitReview(teamId, sprintId, input),
    retry: 0,
    onSuccess: async (data, variables) => {
      const candidatesKey = PEER_REVIEW_QUERY_KEYS.candidates(
        variables.teamId,
        variables.sprintId,
      );
      queryClient.setQueryData<PeerReviewCandidatesResponse>(
        candidatesKey,
        (current) =>
          current
            ? {
                ...current,
                candidates: current.candidates.map((candidate) =>
                  candidate.studentId === variables.input.revieweeId
                    ? {
                        ...candidate,
                        alreadyReviewed: true,
                        existingTotalStarRating:
                          data.starRating ?? candidate.existingTotalStarRating,
                      }
                    : candidate,
                ),
              }
            : current,
      );
      await queryClient.invalidateQueries({
        queryKey: candidatesKey,
      });
      showSuccessToast("Đã gửi đánh giá chéo theo Sprint.");
    },
  });
}