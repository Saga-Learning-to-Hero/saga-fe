import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectAiService } from "../api/project-ai-api";
import { AcademicAiService } from "../api/academic-ai-api";
import type {
  AiLatestAnalysisResponse,
  AiAcademicClassificationResponse,
  AiAcademicReviewRequest,
} from "../types";

export const AI_PROJECT_QUERY_KEYS = {
  latestTaskIntelligence: (projectId: string, taskId: string) =>
    ["projects", projectId, "ai", "tasks", taskId, "intelligence", "latest"] as const,
  latestTaskRisk: (projectId: string, taskId: string) =>
    ["projects", projectId, "ai", "tasks", taskId, "risk", "latest"] as const,
  latestStudentRisk: (projectId: string, studentId: string) =>
    ["projects", projectId, "ai", "students", studentId, "risk", "latest"] as const,
  latestTeamRisk: (projectId: string) =>
    ["projects", projectId, "ai", "team", "risk", "latest"] as const,
  latestStudentProgress: (projectId: string, studentId: string) =>
    ["projects", projectId, "ai", "students", studentId, "progress", "latest"] as const,
  latestTeamProgress: (projectId: string) =>
    ["projects", projectId, "ai", "team", "progress", "latest"] as const,
  taskAcademicClassifications: (projectId: string, taskId: string) =>
    ["projects", projectId, "ai", "tasks", taskId, "academic-classifications"] as const,
  commitAcademicClassifications: (projectId: string, gitCommitId: string) =>
    ["projects", projectId, "ai", "commits", gitCommitId, "academic-classifications"] as const,
  commitAnalysesHistory: (
    projectId: string,
    gitCommitId: string,
    page?: number,
    size?: number
  ) =>
    ["projects", projectId, "ai", "commits", gitCommitId, "analyses", page, size] as const,
};

export function useLatestTaskIntelligence(projectId: string, taskId: string) {
  return useQuery<AiLatestAnalysisResponse>({
    queryKey: AI_PROJECT_QUERY_KEYS.latestTaskIntelligence(projectId, taskId),
    queryFn: () => ProjectAiService.getLatestTaskIntelligence(projectId, taskId),
    enabled: Boolean(projectId && taskId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitTaskIntelligence(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ProjectAiService.submitTaskIntelligence(projectId, taskId),
    onSuccess: (run) => {
      queryClient.setQueryData<AiLatestAnalysisResponse>(
        AI_PROJECT_QUERY_KEYS.latestTaskIntelligence(projectId, taskId),
        { status: "FOUND", analysis: run }
      );
    },
  });
}

export function useLatestTaskRisk(projectId: string, taskId: string) {
  return useQuery<AiLatestAnalysisResponse>({
    queryKey: AI_PROJECT_QUERY_KEYS.latestTaskRisk(projectId, taskId),
    queryFn: () => ProjectAiService.getLatestTaskRisk(projectId, taskId),
    enabled: Boolean(projectId && taskId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitTaskRisk(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ProjectAiService.submitTaskRisk(projectId, taskId),
    onSuccess: (run) => {
      queryClient.setQueryData<AiLatestAnalysisResponse>(
        AI_PROJECT_QUERY_KEYS.latestTaskRisk(projectId, taskId),
        { status: "FOUND", analysis: run }
      );
    },
  });
}

export function useLatestTeamRisk(projectId: string) {
  return useQuery<AiLatestAnalysisResponse>({
    queryKey: AI_PROJECT_QUERY_KEYS.latestTeamRisk(projectId),
    queryFn: () => ProjectAiService.getLatestTeamRisk(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitTeamRisk(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ProjectAiService.submitTeamRisk(projectId),
    onSuccess: (run) => {
      queryClient.setQueryData<AiLatestAnalysisResponse>(
        AI_PROJECT_QUERY_KEYS.latestTeamRisk(projectId),
        { status: "FOUND", analysis: run }
      );
    },
  });
}

export function useLatestStudentRisk(projectId: string, studentId: string) {
  return useQuery<AiLatestAnalysisResponse>({
    queryKey: AI_PROJECT_QUERY_KEYS.latestStudentRisk(projectId, studentId),
    queryFn: () => ProjectAiService.getLatestStudentRisk(projectId, studentId),
    enabled: Boolean(projectId && studentId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitStudentRisk(projectId: string, studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ProjectAiService.submitStudentRisk(projectId, studentId),
    onSuccess: (run) => {
      queryClient.setQueryData<AiLatestAnalysisResponse>(
        AI_PROJECT_QUERY_KEYS.latestStudentRisk(projectId, studentId),
        { status: "FOUND", analysis: run }
      );
    },
  });
}

export function useLatestTeamProgress(projectId: string) {
  return useQuery<AiLatestAnalysisResponse>({
    queryKey: AI_PROJECT_QUERY_KEYS.latestTeamProgress(projectId),
    queryFn: () => ProjectAiService.getLatestTeamProgress(projectId),
    enabled: Boolean(projectId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitTeamProgress(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ProjectAiService.submitTeamProgress(projectId),
    onSuccess: (run) => {
      queryClient.setQueryData<AiLatestAnalysisResponse>(
        AI_PROJECT_QUERY_KEYS.latestTeamProgress(projectId),
        { status: "FOUND", analysis: run }
      );
    },
  });
}

export function useLatestStudentProgress(projectId: string, studentId: string) {
  return useQuery<AiLatestAnalysisResponse>({
    queryKey: AI_PROJECT_QUERY_KEYS.latestStudentProgress(projectId, studentId),
    queryFn: () => ProjectAiService.getLatestStudentProgress(projectId, studentId),
    enabled: Boolean(projectId && studentId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitStudentProgress(projectId: string, studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ProjectAiService.submitStudentProgress(projectId, studentId),
    onSuccess: (run) => {
      queryClient.setQueryData<AiLatestAnalysisResponse>(
        AI_PROJECT_QUERY_KEYS.latestStudentProgress(projectId, studentId),
        { status: "FOUND", analysis: run }
      );
    },
  });
}

export function useCommitAnalysesHistory(
  projectId: string,
  gitCommitId: string,
  page?: number,
  size?: number
) {
  return useQuery({
    queryKey: AI_PROJECT_QUERY_KEYS.commitAnalysesHistory(projectId, gitCommitId, page, size),
    queryFn: () =>
      ProjectAiService.getCommitAnalysesHistory(projectId, gitCommitId, page, size),
    enabled: Boolean(projectId && gitCommitId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitCommitAnalysis(projectId: string, gitCommitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ProjectAiService.submitCommitAnalysis(projectId, gitCommitId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AI_PROJECT_QUERY_KEYS.commitAnalysesHistory(projectId, gitCommitId),
      });
    },
  });
}

export function useTaskAcademicClassifications(projectId: string, taskId: string) {
  return useQuery<AiAcademicClassificationResponse[]>({
    queryKey: AI_PROJECT_QUERY_KEYS.taskAcademicClassifications(projectId, taskId),
    queryFn: () => AcademicAiService.getTaskAcademicClassifications(projectId, taskId),
    enabled: Boolean(projectId && taskId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitTaskAcademic(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AcademicAiService.submitTaskAcademic(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AI_PROJECT_QUERY_KEYS.taskAcademicClassifications(projectId, taskId),
      });
    },
  });
}

export function useCommitAcademicClassifications(projectId: string, gitCommitId: string) {
  return useQuery<AiAcademicClassificationResponse[]>({
    queryKey: AI_PROJECT_QUERY_KEYS.commitAcademicClassifications(projectId, gitCommitId),
    queryFn: () => AcademicAiService.getCommitAcademicClassifications(projectId, gitCommitId),
    enabled: Boolean(projectId && gitCommitId),
    staleTime: 1000 * 30,
  });
}

export function useSubmitCommitAcademic(projectId: string, gitCommitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AcademicAiService.submitCommitAcademic(projectId, gitCommitId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AI_PROJECT_QUERY_KEYS.commitAcademicClassifications(projectId, gitCommitId),
      });
    },
  });
}

export function useReviewAcademicClassification(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classificationId,
      request,
    }: {
      classificationId: string;
      request: AiAcademicReviewRequest;
    }) => AcademicAiService.reviewAcademicClassification(projectId, classificationId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "ai"],
      });
    },
  });
}
