import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { delayCasesApi } from "../api/delay-cases-api";
import type {
  ExplainDelayCaseRequest,
  LeaderReviewRequest,
  LecturerReviewRequest,
} from "../types/delay-cases";

export const DELAY_CASES_QUERY_KEYS = {
  all: ["delay-cases"] as const,
  lists: () => [...DELAY_CASES_QUERY_KEYS.all, "list"] as const,
  list: (projectId: string, params?: { status?: string | string[]; taskId?: string }) =>
    [...DELAY_CASES_QUERY_KEYS.lists(), projectId, params] as const,
  details: () => [...DELAY_CASES_QUERY_KEYS.all, "detail"] as const,
  detail: (projectId: string, caseId: string) =>
    [...DELAY_CASES_QUERY_KEYS.details(), projectId, caseId] as const,
  lecturerQueue: (params?: { status?: string | string[] }) =>
    [...DELAY_CASES_QUERY_KEYS.all, "lecturer-queue", params] as const,
  onTimeRate: (projectId: string) => ["on-time-rate", projectId] as const,
};

export function useDelayCases(
  projectId: string,
  params?: { status?: string | string[]; taskId?: string }
) {
  return useQuery({
    queryKey: DELAY_CASES_QUERY_KEYS.list(projectId, params),
    queryFn: () => delayCasesApi.getDelayCases(projectId, params),
    enabled: !!projectId,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useDelayCaseDetail(projectId: string, caseId: string) {
  return useQuery({
    queryKey: DELAY_CASES_QUERY_KEYS.detail(projectId, caseId),
    queryFn: () => delayCasesApi.getDelayCaseDetails(projectId, caseId),
    enabled: !!projectId && !!caseId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

export function useLecturerDelayQueue(params?: { status?: string | string[] }) {
  return useQuery({
    queryKey: DELAY_CASES_QUERY_KEYS.lecturerQueue(params),
    queryFn: () => delayCasesApi.getLecturerQueue(params),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

// Mutations
export function useExplainDelayCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      caseId,
      payload,
    }: {
      projectId: string;
      caseId: string;
      payload: ExplainDelayCaseRequest;
    }) => delayCasesApi.explainDelayCase(projectId, caseId, payload),
    onSuccess: (updatedCase, { projectId, caseId }) => {
      queryClient.setQueryData(
        DELAY_CASES_QUERY_KEYS.detail(projectId, caseId),
        updatedCase
      );
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.lecturerQueue() });
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.onTimeRate(projectId) });
    },
  });
}

export function useLeaderReviewDelayCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      caseId,
      payload,
    }: {
      projectId: string;
      caseId: string;
      payload: LeaderReviewRequest;
    }) => delayCasesApi.leaderReview(projectId, caseId, payload),
    onSuccess: (updatedCase, { projectId, caseId }) => {
      queryClient.setQueryData(
        DELAY_CASES_QUERY_KEYS.detail(projectId, caseId),
        updatedCase
      );
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.lecturerQueue() });
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.onTimeRate(projectId) });
    },
  });
}

export function useLecturerReviewDelayCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      caseId,
      payload,
    }: {
      projectId: string;
      caseId: string;
      payload: LecturerReviewRequest;
    }) => delayCasesApi.lecturerReview(projectId, caseId, payload),
    onSuccess: (updatedCase, { projectId, caseId }) => {
      queryClient.setQueryData(
        DELAY_CASES_QUERY_KEYS.detail(projectId, caseId),
        updatedCase
      );
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.lecturerQueue() });
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.onTimeRate(projectId) });
    },
  });
}

export function useReopenDelayCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      caseId,
    }: {
      projectId: string;
      caseId: string;
    }) => delayCasesApi.reopenDelayCase(projectId, caseId),
    onSuccess: (updatedCase, { projectId, caseId }) => {
      queryClient.setQueryData(
        DELAY_CASES_QUERY_KEYS.detail(projectId, caseId),
        updatedCase
      );
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.lecturerQueue() });
      queryClient.invalidateQueries({ queryKey: DELAY_CASES_QUERY_KEYS.onTimeRate(projectId) });
    },
  });
}
