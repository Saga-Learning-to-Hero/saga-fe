import type { CytoscapeNodeData } from "../types/graph";

export interface GraphFileDownloadContext {
  taskId: string;
  fileId: string;
  filename: string;
}

type GraphEdgeLike = {
  data?: {
    source?: string;
    target?: string;
    label?: string;
  };
  source?: string;
  target?: string;
  label?: string;
};

const FILE_PREFIX = "file:";
const TASK_PREFIX = "task:";

function edgeFields(edge: GraphEdgeLike) {
  return {
    source: edge.data?.source ?? edge.source ?? "",
    target: edge.data?.target ?? edge.target ?? "",
    label: edge.data?.label ?? edge.label ?? "",
  };
}

export function resolveGraphFileDownloadContext(
  nodeData: Pick<CytoscapeNodeData, "id" | "type" | "label"> | null | undefined,
  edges: readonly GraphEdgeLike[] | null | undefined
): GraphFileDownloadContext | null {
  if (!nodeData || nodeData.type !== "FILE") return null;

  const nodeId = nodeData.id?.trim() ?? "";
  if (!nodeId.startsWith(FILE_PREFIX)) return null;
  const fileId = nodeId.slice(FILE_PREFIX.length).trim();
  const filename = nodeData.label?.trim() ?? "";
  if (!fileId || !filename) return null;

  const match = (edges ?? []).find((edge) => {
    const { source, target, label } = edgeFields(edge);
    return label === "EVIDENCED_BY" && target === nodeId && source.startsWith(TASK_PREFIX);
  });
  if (!match) return null;

  const taskId = edgeFields(match).source.slice(TASK_PREFIX.length).trim();
  if (!taskId) return null;

  return { taskId, fileId, filename };
}
