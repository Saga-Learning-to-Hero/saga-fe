"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorStatus } from "@/lib/api-error";
import { LecturerTeamService } from "@/features/lecturer/teams/api/lecturer-team-service";
import { LECTURER_TEAM_QUERY_KEYS } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import { LecturerPeerReviewService } from "../api/lecturer-peer-review-service";

export const LECTURER_PEER_REVIEW_QUERY_KEYS = {
  all: ["lecturer-peer-review"] as const,
  rubric: (teamId?: string | null) => [...LECTURER_PEER_REVIEW_QUERY_KEYS.all, "rubric", teamId] as const,
  reviews: (teamId?: string | null, sprintId?: string | null) =>
    [...LECTURER_PEER_REVIEW_QUERY_KEYS.all, "reviews", teamId, sprintId] as const,
};

function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = getApiErrorStatus(error);
  if (status === 400 || status === 403 || status === 404) return false;
  return failureCount < 1;
}

export function useLecturerPeerReviewRubric(teamId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LECTURER_PEER_REVIEW_QUERY_KEYS.rubric(teamId),
    queryFn: () => LecturerPeerReviewService.getTeamRubric(teamId!),
    enabled: (options?.enabled ?? true) && Boolean(teamId && teamId.trim()),
    staleTime: 1000 * 60 * 5,
    retry: shouldRetry,
    placeholderData: keepPreviousData,
  });
}

export function useLecturerSprintPeerReviews(
  teamId?: string | null,
  sprintId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: LECTURER_PEER_REVIEW_QUERY_KEYS.reviews(teamId, sprintId),
    queryFn: () => LecturerPeerReviewService.getSprintReviews(teamId!, sprintId!),
    enabled:
      (options?.enabled ?? true) &&
      Boolean(teamId && teamId.trim() && sprintId && sprintId.trim()),
    staleTime: 1000 * 30,
    retry: shouldRetry,
    placeholderData: keepPreviousData,
  });
}

export function usePrefetchLecturerPeerReviews() {
  const queryClient = useQueryClient();
  return (courseId: string) => {
    if (!courseId.trim()) return;
    // Teams only. Sprints are not prefetched: a project with several Jira sites needs the site
    // (GET /sprints without one is 409 JIRA_SOURCE_REQUIRED), and the page resolves it itself
    // through useProjectSprints under its own query key.
    void queryClient.prefetchQuery({
      queryKey: LECTURER_TEAM_QUERY_KEYS.lecturerTeams(courseId),
      queryFn: () => LecturerTeamService.getTeams(courseId),
      staleTime: 1000 * 60 * 3,
    });
  };
}
