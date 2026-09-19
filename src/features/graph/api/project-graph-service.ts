import { apiClient } from "@/lib/axios";
import type { CytoscapeGraphResponse, GraphSubgraphFilterParams } from "../types/graph";
import { resolveStudentProfileId } from "../lib/student-profile-id";

function cleanId(id: string): string {
  return encodeURIComponent(id.trim());
}

function buildGraphQuery(params?: string | null | GraphSubgraphFilterParams): string {
  if (!params) return "";
  if (typeof params === "string") {
    const trimmed = params.trim();
    return trimmed ? `?sprintId=${cleanId(trimmed)}` : "";
  }

  const searchParams = new URLSearchParams();

  if (params.sprintId?.trim()) {
    searchParams.set("sprintId", params.sprintId.trim());
  }
  if (params.focusNodeId?.trim()) {
    searchParams.set("focusNodeId", params.focusNodeId.trim());
  }
  if (typeof params.depth === "number" && !Number.isNaN(params.depth)) {
    searchParams.set("depth", String(params.depth));
  }
  if (params.nodeTypes) {
    const val =
      typeof params.nodeTypes === "string"
        ? params.nodeTypes.trim()
        : Array.isArray(params.nodeTypes)
          ? params.nodeTypes.filter(Boolean).join(",")
          : "";
    if (val) {
      searchParams.set("nodeTypes", val);
    }
  }
  if (params.edgeTypes) {
    const val =
      typeof params.edgeTypes === "string"
        ? params.edgeTypes.trim()
        : Array.isArray(params.edgeTypes)
          ? params.edgeTypes.filter(Boolean).join(",")
          : "";
    if (val) {
      searchParams.set("edgeTypes", val);
    }
  }
  if (params.anomaliesOnly === true) {
    searchParams.set("anomaliesOnly", "true");
  }
  if (typeof params.maxNodes === "number" && !Number.isNaN(params.maxNodes)) {
    searchParams.set("maxNodes", String(params.maxNodes));
  }
  const cursorVal = params.cursor?.trim() || params.continuationToken?.trim();
  if (cursorVal) {
    searchParams.set("cursor", cursorVal);
  }
  if (typeof params.includeCommits === "boolean") {
    searchParams.set("includeCommits", String(params.includeCommits));
  }
  if (typeof params.usedCriteriaOnly === "boolean") {
    searchParams.set("usedCriteriaOnly", String(params.usedCriteriaOnly));
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const ProjectGraphService = {
  async getProjectOverviewGraph(
    projectId: string,
    params?: string | null | GraphSubgraphFilterParams,
    signal?: AbortSignal
  ): Promise<CytoscapeGraphResponse> {
    const trimmedProject = projectId?.trim();
    if (!trimmedProject) {
      throw new Error("projectId is required");
    }

    const query = buildGraphQuery(params);
    const url = `/api/projects/${cleanId(trimmedProject)}/graph/overview${query}`;

    const res = await apiClient.get<CytoscapeGraphResponse>(url, { signal });
    return res.data;
  },

  async getStudentContributionGraph(
    projectId: string,
    studentProfileId: string,
    params?: string | null | GraphSubgraphFilterParams,
    signal?: AbortSignal
  ): Promise<CytoscapeGraphResponse> {
    const trimmedProject = projectId?.trim();
    if (!trimmedProject) {
      throw new Error("projectId is required");
    }

    const resolvedStudentProfileId = resolveStudentProfileId(studentProfileId);
    if (!resolvedStudentProfileId) {
      throw new Error("studentProfileId must be a UUID");
    }

    const query = buildGraphQuery(params);
    const url = `/api/projects/${cleanId(trimmedProject)}/students/${encodeURIComponent(resolvedStudentProfileId)}/graph/contribution${query}`;

    const res = await apiClient.get<CytoscapeGraphResponse>(url, { signal });
    return res.data;
  },

  async getSprintActivityGraph(
    projectId: string,
    sprintIdOrParams: string | GraphSubgraphFilterParams,
    paramsOrSignal?: GraphSubgraphFilterParams | AbortSignal,
    signal?: AbortSignal
  ): Promise<CytoscapeGraphResponse> {
    const trimmedProject = projectId?.trim();
    if (!trimmedProject) {
      throw new Error("projectId is required");
    }

    let sprintId = "";
    let queryParams: GraphSubgraphFilterParams | undefined;
    let abortSignal: AbortSignal | undefined;

    if (typeof sprintIdOrParams === "string") {
      sprintId = sprintIdOrParams.trim();
      if (paramsOrSignal instanceof AbortSignal) {
        abortSignal = paramsOrSignal;
      } else {
        queryParams = paramsOrSignal;
        abortSignal = signal;
      }
    } else {
      sprintId = sprintIdOrParams.sprintId?.trim() || "";
      queryParams = sprintIdOrParams;
      abortSignal = paramsOrSignal instanceof AbortSignal ? paramsOrSignal : signal;
    }

    if (!sprintId) {
      throw new Error("sprintId is required");
    }

    const query = buildGraphQuery(queryParams ? { ...queryParams, sprintId: undefined } : undefined);
    const url = `/api/projects/${cleanId(trimmedProject)}/sprints/${cleanId(sprintId)}/graph/activity${query}`;

    const res = await apiClient.get<CytoscapeGraphResponse>(url, { signal: abortSignal });
    return res.data;
  },

  async getProjectAttributionGraph(
    projectId: string,
    params?: string | null | GraphSubgraphFilterParams,
    signal?: AbortSignal
  ): Promise<CytoscapeGraphResponse> {
    const trimmedProject = projectId?.trim();
    if (!trimmedProject) {
      throw new Error("projectId is required");
    }

    const query = buildGraphQuery(params);
    const url = `/api/projects/${cleanId(trimmedProject)}/graph/attribution${query}`;

    const res = await apiClient.get<CytoscapeGraphResponse>(url, { signal });
    return res.data;
  },
};
