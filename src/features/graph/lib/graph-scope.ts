import type { GraphSubgraphFilterParams, GraphType } from "@/features/graph/types/graph";

export type GraphScopeMode = "COMPACT" | "FULL" | "FILE";

const FOCUS_NODE_TYPES = ["TASK", "COMMIT", "FILE", "WEB_LINK", "STUDENT"] as const;
const FOCUS_EDGE_TYPES = ["ASSIGNED_TO", "EVIDENCED_BY", "PARENT_OF", "HAS_WORK_ITEM"] as const;

export function buildGraphScopeParams(input: {
  graphType: GraphType;
  scopeMode: GraphScopeMode;
  focusNodeId?: string | null;
  anomaliesOnly?: boolean;
  usedCriteriaOnly?: boolean;
  cursor?: string | null;
}): GraphSubgraphFilterParams | null {
  const params: GraphSubgraphFilterParams = {};
  const focusNodeId = input.focusNodeId?.trim();

  if (focusNodeId) {
    params.focusNodeId = focusNodeId;
    params.depth = 1;
    params.includeEvidence = true;
    params.maxNodes = 200;
    params.nodeTypes = [...FOCUS_NODE_TYPES];
    params.edgeTypes = [...FOCUS_EDGE_TYPES];
  } else if (
    input.scopeMode === "FULL" &&
    (input.graphType === "OVERVIEW" || input.graphType === "ACTIVITY")
  ) {
    params.includeEvidence = true;
  } else if (
    input.scopeMode === "FILE" &&
    (input.graphType === "OVERVIEW" || input.graphType === "ACTIVITY")
  ) {
    params.evidenceTypes = ["FILE"];
  }

  if (input.graphType === "CONTRIBUTION" && input.usedCriteriaOnly) {
    params.usedCriteriaOnly = true;
  }
  if (input.anomaliesOnly) {
    params.anomaliesOnly = true;
  }
  const cursor = input.cursor?.trim();
  if (cursor) {
    params.cursor = cursor;
  }

  return Object.keys(params).length > 0 ? params : null;
}
