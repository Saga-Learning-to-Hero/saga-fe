import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectGraphService, type GraphFetchOptions } from "../api/project-graph-service";
import { getApiErrorCode } from "@/lib/api-error";
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
    } else if (graphType === "ACTIVITY") {
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
    queryFn: async ({ signal, client, queryKey }) => {
      const cached = client.getQueryData<CytoscapeGraphResponse>(queryKey);
      const request: GraphFetchOptions = {
        signal,
        ifNoneMatch: cached?.etag ?? null,
        previous: cached ?? null,
      };
      switch (graphType) {
        case "OVERVIEW":
          return ProjectGraphService.getProjectOverviewGraph(trimmedProject, mergedParams, request);
        case "CONTRIBUTION":
          return ProjectGraphService.getStudentContributionGraph(
            trimmedProject,
            resolvedStudentProfileId!,
            mergedParams,
            request
          );
        case "ACTIVITY":
          return ProjectGraphService.getSprintActivityGraph(
            trimmedProject,
            effectiveSprint!,
            subgraphParams || undefined,
            request
          );
        case "ATTRIBUTION":
          return ProjectGraphService.getProjectAttributionGraph(trimmedProject, mergedParams, request);
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

export function mergeGraphPages(pages: CytoscapeGraphResponse[]): CytoscapeGraphResponse {
  const nodes = new Map<string, CytoscapeGraphResponse["nodes"][number]>();
  const edges = new Map<string, CytoscapeGraphResponse["edges"][number]>();
  for (const page of pages) {
    for (const node of page.nodes) {
      nodes.set(node.data.id, node);
    }
    for (const edge of page.edges) {
      edges.set(edge.data.id, edge);
    }
  }
  const last = pages[pages.length - 1];
  return {
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    meta: last?.meta,
    etag: last?.etag,
  };
}

export function useAccumulatedProjectGraph(options: UseProjectGraphOptions) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [extraPages, setExtraPages] = useState<CytoscapeGraphResponse[]>([]);
  const [appliedCursor, setAppliedCursor] = useState<string | null>(null);
  const scopeKey = JSON.stringify({
    projectId: options.projectId,
    graphType: options.graphType,
    sprintId: options.sprintId ?? null,
    studentProfileId: options.studentProfileId ?? null,
    subgraphParams: options.subgraphParams ?? null,
    enabled: options.enabled ?? true,
  });
  const [seenScope, setSeenScope] = useState(scopeKey);
  const scopeChanged = scopeKey !== seenScope;
  if (scopeChanged) {
    setSeenScope(scopeKey);
    setCursor(null);
    setExtraPages([]);
    setAppliedCursor(null);
  }

  const baseQuery = useProjectGraph(options);
  const revision = baseQuery.data?.etag ?? baseQuery.data?.meta?.revision ?? null;
  const [seenRevision, setSeenRevision] = useState<string | null>(revision);
  const revisionChanged = revision !== seenRevision;
  if (revisionChanged) {
    setSeenRevision(revision);
    if (seenRevision !== null) {
      setCursor(null);
      setExtraPages([]);
      setAppliedCursor(null);
    }
  }

  const continuationEnabled = Boolean(
    !scopeChanged && !revisionChanged && cursor && (options.enabled ?? true)
  );
  const pageQuery = useProjectGraph({
    ...options,
    subgraphParams: cursor ? { ...(options.subgraphParams ?? {}), cursor } : options.subgraphParams,
    enabled: continuationEnabled,
  });

  const pageErrorCode = pageQuery.isError ? getApiErrorCode(pageQuery.error) : null;
  if (cursor && pageErrorCode === "REQUEST_INVALID") {
    setCursor(null);
    setExtraPages([]);
    setAppliedCursor(null);
  }

  if (cursor && pageQuery.data && cursor !== appliedCursor && !pageQuery.isFetching && !pageQuery.isPlaceholderData) {
    setAppliedCursor(cursor);
    setExtraPages((current) => [...current, pageQuery.data as CytoscapeGraphResponse]);
  }
  if (!cursor && appliedCursor) {
    setAppliedCursor(null);
  }

  const data = useMemo(() => {
    if (!baseQuery.data) return undefined;
    if (extraPages.length === 0) return baseQuery.data;
    return mergeGraphPages([baseQuery.data, ...extraPages]);
  }, [baseQuery.data, extraPages]);

  const tail = extraPages.at(-1) ?? baseQuery.data;
  const nextCursor = tail?.meta?.truncated ? tail.meta.nextCursor?.trim() || null : null;

  return {
    ...baseQuery,
    data,
    loadMore: () => {
      if (nextCursor && !pageQuery.isFetching) {
        setCursor(nextCursor);
      }
    },
    canLoadMore: Boolean(nextCursor) && !pageQuery.isFetching,
    isLoadingMore: continuationEnabled && pageQuery.isFetching,
  };
}

