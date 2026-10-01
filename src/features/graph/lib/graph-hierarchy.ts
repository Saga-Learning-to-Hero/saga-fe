import type {
  CanonicalEdgeLabel,
  CytoscapeEdgeData,
  GraphEdge,
  IssueTypeLevel,
} from "../types/graph";

const BASE_NODE_WIDTH = 80;
const BASE_NODE_HEIGHT = 40;

const NODE_SIZE_SCALE: Record<string, number> = {
  PROJECT: 1.5,
  TEAM: 1.5,
  ABOVE_EPIC: 1.4,
  EPIC: 1.3,
  STANDARD: 1.0,
  SUBTASK: 0.78,
  COMMIT: 0.72,
};

export function normalizeGraphIssueTypeLevel(value?: string | null): IssueTypeLevel {
  const upper = (value || "").trim().toUpperCase();
  if (
    upper === "EPIC" ||
    upper === "STANDARD" ||
    upper === "SUBTASK" ||
    upper === "ABOVE_EPIC" ||
    upper === "UNKNOWN"
  ) {
    return upper;
  }
  return "UNKNOWN";
}

export function graphNodeSizeFor(
  nodeType: string,
  issueTypeLevel?: string | null
): { width: number; height: number } {
  if (nodeType === "COMMIT") {
    return scaledSize(NODE_SIZE_SCALE.COMMIT);
  }
  if (nodeType === "PROJECT" || nodeType === "TEAM") {
    return scaledSize(NODE_SIZE_SCALE.PROJECT);
  }
  if (nodeType === "TASK") {
    const level = normalizeGraphIssueTypeLevel(issueTypeLevel);
    const scale = NODE_SIZE_SCALE[level] ?? NODE_SIZE_SCALE.STANDARD;
    return scaledSize(scale);
  }
  return { width: BASE_NODE_WIDTH, height: BASE_NODE_HEIGHT };
}

function scaledSize(scale: number): { width: number; height: number } {
  return {
    width: Math.round(BASE_NODE_WIDTH * scale),
    height: Math.round(BASE_NODE_HEIGHT * scale),
  };
}

export function isParentOfEdge(
  edge: Pick<CytoscapeEdgeData, "label"> | Pick<GraphEdge, "type"> | { type?: string; label?: string }
): boolean {
  const rel = "type" in edge && edge.type ? edge.type : "label" in edge ? edge.label : undefined;
  return rel === "PARENT_OF";
}

export function isHasWorkItemEdge(
  edge: Pick<CytoscapeEdgeData, "label"> | Pick<GraphEdge, "type"> | { type?: string; label?: string }
): boolean {
  const rel = "type" in edge && edge.type ? edge.type : "label" in edge ? edge.label : undefined;
  return rel === "HAS_WORK_ITEM";
}

/** Cha của child chỉ suy từ cạnh PARENT_OF, không đọc field parent trên node. */
export function findParentOfEdge<T extends { target: string; type?: CanonicalEdgeLabel | string; label?: CanonicalEdgeLabel | string }>(
  edges: T[],
  childId: string
): T | undefined {
  return edges.find((edge) => {
    const rel = edge.type || edge.label;
    return rel === "PARENT_OF" && edge.target === childId;
  });
}

export function taskColumnForIssueTypeLevel(level: IssueTypeLevel): number {
  switch (level) {
    case "ABOVE_EPIC":
      return 0;
    case "EPIC":
      return 1;
    case "STANDARD":
    case "UNKNOWN":
      return 2;
    case "SUBTASK":
      return 3;
    default:
      return 2;
  }
}
