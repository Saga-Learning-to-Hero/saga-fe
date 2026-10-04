"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommitReviewService } from "../api/commit-review-api";
import type { CommitAiReviewDetail, SaveTeamAiKeyRequest, TeamAiKeyStatus } from "../types";

export const COMMIT_REVIEW_QUERY_KEYS = {
  review: (projectId?: string | null, commitId?: string | null) =>
    ["projects", projectId, "commits", commitId, "ai-review"] as const,
  teamKey: (projectId?: string | null) => ["projects", projectId, "ai-team-key"] as const,
};

/** Commit lists carry the review badge: refresh them after a review, a link or a key change. */
const COMMIT_LIST_PREFIX = ["project-projections"] as const;

export function useCommitReview(projectId?: string | null, commitId?: string | null, options?: { enabled?: boolean }) {
  return useQuery<CommitAiReviewDetail>({
    queryKey: COMMIT_REVIEW_QUERY_KEYS.review(projectId, commitId),
    queryFn: () => CommitReviewService.getReview(projectId as string, commitId as string),
    enabled: (options?.enabled ?? true) && Boolean(projectId && commitId),
    staleTime: 1000 * 15,
    // poll while the AI is still working
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 3000 : false),
  });
}

function useStoreReview(projectId?: string | null, commitId?: string | null) {
  const queryClient = useQueryClient();
  return (detail: CommitAiReviewDetail) => {
    queryClient.setQueryData(COMMIT_REVIEW_QUERY_KEYS.review(projectId, commitId), detail);
    void queryClient.invalidateQueries({ queryKey: COMMIT_LIST_PREFIX });
  };
}

export function useRequestCommitReview(projectId?: string | null, commitId?: string | null) {
  const store = useStoreReview(projectId, commitId);
  return useMutation({
    mutationFn: () => CommitReviewService.requestReview(projectId as string, commitId as string),
    onSuccess: store,
  });
}

export function useLinkCommitTask(projectId?: string | null, commitId?: string | null) {
  const store = useStoreReview(projectId, commitId);
  return useMutation({
    mutationFn: (taskId: string) => CommitReviewService.linkTask(projectId as string, commitId as string, taskId),
    onSuccess: store,
  });
}

export function useUnlinkCommitTask(projectId?: string | null, commitId?: string | null) {
  const store = useStoreReview(projectId, commitId);
  return useMutation({
    mutationFn: (taskId: string) => CommitReviewService.unlinkTask(projectId as string, commitId as string, taskId),
    onSuccess: store,
  });
}

export function useBackfillCommitReviews(projectId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (limit?: number) => CommitReviewService.backfill(projectId as string, limit),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMMIT_LIST_PREFIX });
    },
  });
}

export function useTeamAiKey(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery<TeamAiKeyStatus>({
    queryKey: COMMIT_REVIEW_QUERY_KEYS.teamKey(projectId),
    queryFn: () => CommitReviewService.getTeamKey(projectId as string),
    enabled: (options?.enabled ?? true) && Boolean(projectId),
    staleTime: 1000 * 30,
  });
}

function useStoreTeamKey(projectId?: string | null) {
  const queryClient = useQueryClient();
  return (status: TeamAiKeyStatus) => {
    queryClient.setQueryData(COMMIT_REVIEW_QUERY_KEYS.teamKey(projectId), status);
    void queryClient.invalidateQueries({ queryKey: COMMIT_LIST_PREFIX });
  };
}

export function useSaveTeamAiKey(projectId?: string | null) {
  const store = useStoreTeamKey(projectId);
  return useMutation({
    mutationFn: (request: SaveTeamAiKeyRequest) => CommitReviewService.saveTeamKey(projectId as string, request),
    onSuccess: store,
  });
}

export function useRemoveTeamAiKey(projectId?: string | null) {
  const store = useStoreTeamKey(projectId);
  return useMutation({
    mutationFn: () => CommitReviewService.removeTeamKey(projectId as string),
    onSuccess: store,
  });
}
