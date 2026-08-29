export type NodeType = "STUDENT" | "TASK" | "COMMIT";

export type EdgeType = "AUTHORED" | "ASSIGNED_TO" | "IMPLEMENTS" | "REVIEWED" | "COMMENTED_ON";

export type TaskType = "STORY" | "TASK" | "BUG" | "SUBTASK" | "FEATURE";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskWeight = "CODE" | "TEST" | "DOC" | "RESEARCH";

export interface StudentNodeData {
  id: string;
  studentCode: string;
  name: string;
  avatar: string;
  role: "LEADER" | "MEMBER";
  commitsCount: number;
  tasksCount: number;
  traceabilityScore: number;
  isGhosting?: boolean;
}

export interface TaskNodeData {
  id: string;
  key: string;
  summary: string;
  taskType: TaskType;
  status: TaskStatus;
  storyPoints: number;
  sprintId: string;
  weightType: TaskWeight;
  assigneeId: string;
  assigneeName: string;
  isMSRAnomaly?: boolean; // Báo DONE nhưng không có commit code
  commitCount: number;
}

export interface CommitNodeData {
  id: string;
  hash: string;
  shortHash: string;
  message: string;
  authorId: string;
  authorName: string;
  branch: string;
  timestamp: string;
  additions: number;
  deletions: number;
  linkedTaskKey?: string;
  isVerified: boolean;
}

export type GraphNodeData = StudentNodeData | TaskNodeData | CommitNodeData;

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  subLabel?: string;
  status?: string;
  data: GraphNodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
  weight?: number; // Cho SNA graph
  isAnomaly?: boolean;
}

export interface TraceabilityGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    totalStudents: number;
    totalTasks: number;
    totalCommits: number;
    traceabilityRate: number;
    msrAnomaliesCount: number;
    unlinkedCommitsCount: number;
  };
}

export interface SNANodeMetrics {
  studentId: string;
  studentName: string;
  studentCode: string;
  avatar: string;
  inDegree: number;
  outDegree: number;
  centralityScore: number;
  reviewsGiven: number;
  reviewsReceived: number;
  isGhosting: boolean;
  isKeyContributor: boolean;
  statusLabel: "GHOSTING" | "KEY_CONTRIBUTOR" | "BALANCED";
}

export interface SNAGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics: SNANodeMetrics[];
}
