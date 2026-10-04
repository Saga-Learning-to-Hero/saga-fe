import { apiClient } from "@/lib/axios";
import type { CytoscapeGraphResponse, GraphSubgraphFilterParams } from "../types/graph";
import { resolveStudentProfileId } from "../lib/student-profile-id";

export interface GraphFetchOptions {
  signal?: AbortSignal;
  ifNoneMatch?: string | null;
  previous?: CytoscapeGraphResponse | null;
}

function isAbortSignal(value: unknown): value is AbortSignal {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AbortSignal).aborted === "boolean" &&
    typeof (value as AbortSignal).addEventListener === "function"
  );
}

function isGraphFetchOptions(value: unknown): value is GraphFetchOptions {
  if (!value || typeof value !== "object" || isAbortSignal(value)) return false;
  return "ifNoneMatch" in value || "previous" in value;
}

export function asGraphFetchOptions(value?: AbortSignal | GraphFetchOptions): GraphFetchOptions {
  if (!value) return {};
  if (isAbortSignal(value)) return { signal: value };
  if (isGraphFetchOptions(value)) return value;
  return {};
}

function readEtag(headers: unknown): string | undefined {
  if (!headers || typeof headers !== "object") return undefined;
  const record = headers as {
    get?: (name: string) => unknown;
    etag?: unknown;
    ETag?: unknown;
  };
  const fromGetter = typeof record.get === "function" ? record.get("etag") ?? record.get("ETag") : undefined;
  const raw = fromGetter ?? record.etag ?? record.ETag;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

async function fetchGraph(
  url: string,
  requestInput?: AbortSignal | GraphFetchOptions
): Promise<CytoscapeGraphResponse> {
  const request = asGraphFetchOptions(requestInput);
  const config: {
    signal?: AbortSignal;
    headers?: Record<string, string>;
    validateStatus?: (status: number) => boolean;
  } = { signal: request.signal };
  if (request.ifNoneMatch) {
    config.headers = { "If-None-Match": request.ifNoneMatch };
    config.validateStatus = (status) => status === 200 || status === 304;
  }

  const res = await apiClient.get<CytoscapeGraphResponse>(url, config);
  if (res.status === 304) {
    if (!request.previous) {
      throw new Error("Graph response 304 without a cached body");
    }
    const etag = readEtag(res.headers) || request.ifNoneMatch || undefined;
    return etag ? { ...request.previous, etag } : request.previous;
  }

  const etag = readEtag(res.headers);
  return etag ? { ...res.data, etag } : res.data;
}

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
  if (typeof params.includeEvidence === "boolean") {
    searchParams.set("includeEvidence", String(params.includeEvidence));
  }
  if (params.evidenceTypes) {
    const val =
      typeof params.evidenceTypes === "string"
        ? params.evidenceTypes.trim()
        : Array.isArray(params.evidenceTypes)
          ? params.evidenceTypes.filter(Boolean).join(",")
          : "";
    if (val) {
      searchParams.set("evidenceTypes", val);
    }
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
    signal?: AbortSignal | GraphFetchOptions
  ): Promise<CytoscapeGraphResponse> {
    const trimmedProject = projectId?.trim();
    if (!trimmedProject) {
      throw new Error("projectId is required");
    }

    const query = buildGraphQuery(params);
    const url = `/api/projects/${cleanId(trimmedProject)}/graph/overview${query}`;
    return fetchGraph(url, signal);
  },

  async getStudentContributionGraph(
    projectId: string,
    studentProfileId: string,
    params?: string | null | GraphSubgraphFilterParams,
    signal?: AbortSignal | GraphFetchOptions
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
    return fetchGraph(url, signal);
  },

  async getSprintActivityGraph(
    projectId: string,
    sprintIdOrParams: string | GraphSubgraphFilterParams,
    paramsOrSignal?: GraphSubgraphFilterParams | AbortSignal | GraphFetchOptions,
    signal?: AbortSignal | GraphFetchOptions
  ): Promise<CytoscapeGraphResponse> {
    const trimmedProject = projectId?.trim();
    if (!trimmedProject) {
      throw new Error("projectId is required");
    }

    let sprintId = "";
    let queryParams: GraphSubgraphFilterParams | undefined;
    let request: AbortSignal | GraphFetchOptions | undefined;

    const isRequest = (value: unknown): value is AbortSignal | GraphFetchOptions =>
      isAbortSignal(value) || isGraphFetchOptions(value);

    if (typeof sprintIdOrParams === "string") {
      sprintId = sprintIdOrParams.trim();
      if (isRequest(paramsOrSignal)) {
        request = paramsOrSignal;
      } else {
        queryParams = paramsOrSignal;
        request = signal;
      }
    } else {
      sprintId = sprintIdOrParams.sprintId?.trim() || "";
      queryParams = sprintIdOrParams;
      request = isRequest(paramsOrSignal) ? paramsOrSignal : signal;
    }

    if (!sprintId) {
      throw new Error("sprintId is required");
    }

    const query = buildGraphQuery(queryParams ? { ...queryParams, sprintId: undefined } : undefined);
    const url = `/api/projects/${cleanId(trimmedProject)}/sprints/${cleanId(sprintId)}/graph/activity${query}`;
    return fetchGraph(url, request);
  },

  async getProjectAttributionGraph(
    projectId: string,
    params?: string | null | GraphSubgraphFilterParams,
    signal?: AbortSignal | GraphFetchOptions
  ): Promise<CytoscapeGraphResponse> {
    const trimmedProject = projectId?.trim();
    if (!trimmedProject) {
      throw new Error("projectId is required");
    }

    const query = buildGraphQuery(params);
    const url = `/api/projects/${cleanId(trimmedProject)}/graph/attribution${query}`;
    return fetchGraph(url, signal);
  },
};
