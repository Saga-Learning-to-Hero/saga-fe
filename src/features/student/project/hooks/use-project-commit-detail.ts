"use client";

import { useQuery } from "@tanstack/react-query";
import { ProjectProjectionService } from "../api/project-projection-service";
import type { ProjectCommitDetailResponse } from "../types/student-project";

export const PROJECT_COMMIT_DETAIL_QUERY_KEY = "project-commit-detail";

export function useProjectCommitDetail(
  projectId?: string | null,
  gitCommitId?: string | null,
  options?: { enabled?: boolean }
) {
  const isEnabled = Boolean(
    projectId &&
    projectId.trim() &&
    gitCommitId &&
    gitCommitId.trim() &&
    options?.enabled !== false
  );

  return useQuery<ProjectCommitDetailResponse>({
    queryKey: [PROJECT_COMMIT_DETAIL_QUERY_KEY, projectId, gitCommitId],
    queryFn: () =>
      ProjectProjectionService.getProjectCommitDetail(
        projectId as string,
        gitCommitId as string
      ),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
  });
}
