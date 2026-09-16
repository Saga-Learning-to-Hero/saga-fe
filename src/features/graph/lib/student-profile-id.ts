import type { CustomSelectOption } from "@/components/common/custom-select";
import type { CytoscapeNodeData, GraphSubgraphFilterParams } from "../types/graph";

const STUDENT_NODE_PREFIX = "student:";

/** RFC 4122 UUID (version 1–8, variant RFC 4122). */
const STUDENT_PROFILE_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Query Overview Graph chỉ node STUDENT, không gắn sprint — dùng cho roster drill-down. */
export const STUDENT_ROSTER_SUBGRAPH_PARAMS: GraphSubgraphFilterParams = {
  nodeTypes: ["STUDENT"],
};

export interface GraphDrillDownStudent {
  studentProfileId: string;
  label: string;
}

export function isStudentProfileUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return STUDENT_PROFILE_UUID_PATTERN.test(value.trim());
}

/**
 * Chỉ nhận node STUDENT có id `student:{uuid}`.
 * Không nhận studentCode, UUID trần, Jira/GitHub id.
 */
export function parseStudentNodeProfileId(
  node: Pick<CytoscapeNodeData, "id" | "type"> | null | undefined
): string | null {
  if (!node || node.type !== "STUDENT") return null;
  return parsePrefixedStudentProfileId(node.id);
}

export function resolveStudentProfileId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed === "ALL") return null;

  const fromPrefix = parsePrefixedStudentProfileId(trimmed);
  if (fromPrefix) return fromPrefix;

  return isStudentProfileUuid(trimmed) ? trimmed.toLowerCase() : null;
}

export function mapStudentNodesToMemberOptions(
  nodes: Array<{ data: CytoscapeNodeData } | CytoscapeNodeData> | null | undefined
): CustomSelectOption[] {
  if (!nodes?.length) return [];

  const seen = new Set<string>();
  const options: CustomSelectOption[] = [];

  for (const raw of nodes) {
    const node = unwrapGraphNode(raw);
    if (!node) continue;
    const studentProfileId = parseStudentNodeProfileId(node);
    if (!studentProfileId || seen.has(studentProfileId)) continue;
    seen.add(studentProfileId);
    options.push({
      value: studentProfileId,
      label: node.label,
      subLabel: node.subLabel || node.role,
    });
  }

  return options;
}

export function resolveDrillDownStudent(
  input: string | null | undefined,
  options: {
    memberOptions?: CustomSelectOption[];
    fallbackLabel?: string | null;
  } = {}
): GraphDrillDownStudent | null {
  const studentProfileId = resolveStudentProfileId(input);
  if (!studentProfileId) return null;

  const found = options.memberOptions?.find((item) => item.value === studentProfileId);
  return {
    studentProfileId,
    label: found?.label || options.fallbackLabel || studentProfileId,
  };
}

function parsePrefixedStudentProfileId(rawId: string): string | null {
  const trimmed = rawId.trim();
  if (!trimmed.toLowerCase().startsWith(STUDENT_NODE_PREFIX)) return null;
  const remainder = trimmed.slice(STUDENT_NODE_PREFIX.length).trim();
  return isStudentProfileUuid(remainder) ? remainder.toLowerCase() : null;
}

function unwrapGraphNode(
  node: { data: CytoscapeNodeData } | CytoscapeNodeData
): CytoscapeNodeData | null {
  if ("data" in node && node.data?.id && node.data.type) {
    return node.data;
  }
  if ("id" in node && "type" in node && node.id && node.type) {
    return node;
  }
  return null;
}
