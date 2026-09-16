import { useQuery } from "@tanstack/react-query";
import { ProjectGraphService } from "../api/project-graph-service";
import { resolveStudentProfileId } from "../lib/student-profile-id";
import type { CytoscapeGraphResponse, GraphSubgraphFilterParams, GraphType } from "../types/graph";

export const PROJECT_GRAPH_QUERY_KEY = "project-graph";

export function getProjectGraphQueryKey(
  projectId: string,
  graphType: GraphType,
  sprintId?: string | null,
  studentProfileId?: string | null,
  subgraphParams?: GraphSubgraphFilterParams | null
) {
  if (!subgraphParams) {
    return [
      PROJECT_GRAPH_QUERY_KEY,
      projectId,
      graphType,
      sprintId ?? null,
      studentProfileId ?? null,
    ] as const;
  }
  return [
    PROJECT_GRAPH_QUERY_KEY,
    projectId,
    graphType,
    sprintId ?? null,
    studentProfileId ?? null,
    subgraphParams,
  ] as const;
}

export interface UseProjectGraphOptions {
  projectId: string;
  graphType: GraphType;
  sprintId?: string | null;
  studentProfileId?: string | null;
  subgraphParams?: GraphSubgraphFilterParams | null;
  enabled?: boolean;
}

export function useProjectGraph({
  projectId,
  graphType,
  sprintId,
  studentProfileId,
  subgraphParams,
  enabled = true,
}: UseProjectGraphOptions) {
  const trimmedProject = projectId?.trim();
  const trimmedSprint = sprintId?.trim();
  const resolvedStudentProfileId = resolveStudentProfileId(studentProfileId);

  let isQueryEnabled = Boolean(enabled && trimmedProject);
  if (isQueryEnabled) {
    if (graphType === "CONTRIBUTION") {
      isQueryEnabled = Boolean(resolvedStudentProfileId);
    } else if (graphType === "ACTIVITY" || graphType === "PEER_REVIEW") {
      isQueryEnabled = Boolean(trimmedSprint || subgraphParams?.sprintId);
    }
  }

  const effectiveSprint = trimmedSprint || subgraphParams?.sprintId || null;
  const mergedParams = subgraphParams
    ? { ...subgraphParams, ...(effectiveSprint ? { sprintId: effectiveSprint } : {}) }
    : effectiveSprint;

  return useQuery<CytoscapeGraphResponse>({
    queryKey: getProjectGraphQueryKey(
      trimmedProject || "",
      graphType,
      effectiveSprint,
      resolvedStudentProfileId,
      subgraphParams || null
    ),
    queryFn: async ({ signal }) => {
      switch (graphType) {
        case "OVERVIEW":
          return ProjectGraphService.getProjectOverviewGraph(trimmedProject, mergedParams, signal);
        case "CONTRIBUTION":
          return ProjectGraphService.getStudentContributionGraph(
            trimmedProject,
            resolvedStudentProfileId!,
            mergedParams,
            signal
          );
        case "ACTIVITY":
          return ProjectGraphService.getSprintActivityGraph(
            trimmedProject,
            effectiveSprint!,
            subgraphParams || undefined,
            signal
          );
        case "ATTRIBUTION":
          return ProjectGraphService.getProjectAttributionGraph(trimmedProject, mergedParams, signal);
        case "PEER_REVIEW":
          return ProjectGraphService.getSprintPeerReviewGraph(
            trimmedProject,
            effectiveSprint!,
            subgraphParams || undefined,
            signal
          );
      }
    },
    enabled: isQueryEnabled,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: unknown) => {
      const err = error as { status?: number };
      if (err?.status === 401 || err?.status === 403 || err?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

