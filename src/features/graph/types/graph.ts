export type CanonicalNodeType =
  | "STUDENT"
  | "TEAM"
  | "PROJECT"
  | "SPRINT"
  | "TASK"
  | "COMMIT"
  | "CRITERION"
  | "IDENTITY";

export type NodeType = CanonicalNodeType;

export type CanonicalEdgeLabel =
  | "MEMBER_OF"
  | "OWNS"
  | "HAS_SPRINT"
  | "CONTAINS"
  | "ASSIGNED_TO"
  | "EVIDENCED_BY"
  | "CLASSIFIED_AS"
  | "AUTHORED_BY"
  | "MAPS_TO"
  | "REVIEWED";

export type EdgeType = CanonicalEdgeLabel;

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED" | string;
export type TaskWeight = "CODE" | "TEST" | "DOCUMENT" | "RESEARCH";

export interface CytoscapeNodeData {
  id: string;
  label: string;
  subLabel?: string;
  type: CanonicalNodeType;
  status?: TaskStatus;
  weightType?: TaskWeight;
  isAnomaly?: boolean;
  avatar?: string;
  role?: string;
  storyPoint?: number;
}

export type GraphNodeData = CytoscapeNodeData;

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  label: CanonicalEdgeLabel;
  weight?: number;
  isAnomaly?: boolean;
}

export interface GraphMeta {
  revision: string;
  totalNodes: number;
  totalEdges: number;
  returnedNodes: number;
  returnedEdges: number;
  truncated: boolean;
  nextCursor?: string;
}

export interface CytoscapeGraphResponse {
  nodes: Array<{ data: CytoscapeNodeData }>;
  edges: Array<{ data: CytoscapeEdgeData }>;
  meta?: GraphMeta;
}

export interface GraphNode {
  id: string;
  type: CanonicalNodeType;
  label: string;
  subLabel?: string;
  status?: string;
  data: CytoscapeNodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: CanonicalEdgeLabel;
  label: string;
  weight?: number;
  isAnomaly?: boolean;
}

export type GraphType =
  | "OVERVIEW"
  | "CONTRIBUTION"
  | "ACTIVITY"
  | "ATTRIBUTION"
  | "PEER_REVIEW";

export interface GraphSubgraphFilterParams {
  sprintId?: string | null;
  focusNodeId?: string | null;
  depth?: number | null;
  nodeTypes?: readonly CanonicalNodeType[] | CanonicalNodeType[] | string | null;
  edgeTypes?: readonly CanonicalEdgeLabel[] | CanonicalEdgeLabel[] | string | null;
  anomaliesOnly?: boolean | null;
  maxNodes?: number | null;
  cursor?: string | null;
  continuationToken?: string | null;
  includeCommits?: boolean | null;
}

export interface GraphQueryParams extends GraphSubgraphFilterParams {
  projectId: string;
  graphType: GraphType;
  studentProfileId?: string | null;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  anomalyNodesCount: number;
}
