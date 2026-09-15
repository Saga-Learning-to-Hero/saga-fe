"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorStatus } from "@/lib/api-error";
import { LecturerTeamService } from "@/features/lecturer/teams/api/lecturer-team-service";
import { LECTURER_TEAM_QUERY_KEYS } from "@/features/lecturer/teams/hooks/use-lecturer-teams";
import type { LecturerTeamsResponse } from "@/features/lecturer/teams/types/lecturer-team";
import { ProjectSprintService } from "@/features/student/sprint-progress/api/project-sprint-service";
import { JIRA_SPRINT_QUERY_KEYS } from "@/features/student/sprint-progress/hooks/use-sprint-data";
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
    void queryClient
      .prefetchQuery({
        queryKey: LECTURER_TEAM_QUERY_KEYS.lecturerTeams(courseId),
        queryFn: () => LecturerTeamService.getTeams(courseId),
        staleTime: 1000 * 60 * 3,
      })
      .then(() => {
        const cached = queryClient.getQueryData<LecturerTeamsResponse>(
          LECTURER_TEAM_QUERY_KEYS.lecturerTeams(courseId)
        );
        const projectId = [...(cached?.teams ?? [])]
          .sort((a, b) => a.teamNo - b.teamNo)
          .find((team) => team.projectId)?.projectId;
        if (!projectId) return;
        return queryClient.prefetchQuery({
          queryKey: JIRA_SPRINT_QUERY_KEYS.sprints(projectId),
          queryFn: () => ProjectSprintService.getSprints(projectId),
          staleTime: 1000 * 60,
        });
      });
  };
}
