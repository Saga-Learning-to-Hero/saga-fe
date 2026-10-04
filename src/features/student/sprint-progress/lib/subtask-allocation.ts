import type { EvidenceCheckStatus, IssueTypeLevel, TaskEvidenceCheck } from "../types/jira-task-types";
import { normalizeIssueTypeLevel } from "./issue-type-rules";

/** Tổng tỷ trọng Subtask trên một task cha STANDARD: 1–10 tương ứng 10%–100%. */
export const SUBTASK_SHARE_TOTAL = 10;

export const SAGA_CONTRIBUTION_LABELS = [
  "saga:code",
  "saga:test",
  "saga:document",
  "saga:research",
] as const;

export type SagaContributionLabel = (typeof SAGA_CONTRIBUTION_LABELS)[number];

export type SprintDisplayRef = {
  id?: string | number | null;
  externalSprintId?: string | number | null;
  name?: string | null;
};

export type SprintDisplayTask = {
  id: string;
  sprint?: SprintDisplayRef | null;
};

export type SprintDisplayOption = {
  id: string | number;
  externalSprintId?: string | number | null;
  name: string;
};

const EVIDENCE_STATUSES: readonly EvidenceCheckStatus[] = [
  "MISSING_COMMIT",
  "MISSING_DOCUMENT",
  "MISSING_COMMIT_AND_DOCUMENT",
  "UNLABELED",
  "SATISFIED",
  "NOT_DONE",
];

export type ShareTaskLike = {
  id: string;
  issueTypeLevel?: string | null;
  parent?: { taskId?: string | null } | null;
  storyPoints?: number | null;
  storyPoint?: number | null;
};

export function isSubtaskShareValue(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= SUBTASK_SHARE_TOTAL;
}

/** Preview: 6 → 60%. Không dùng tính contribution cuối. */
export function getSubtaskPercent(storyPoint: number): number {
  return storyPoint * 10;
}

/** Preview: cha 10 SP × 6/10 = 6. Cha null dùng 1. Không dùng tính contribution cuối. */
export function getAllocatedPoint(
  parentStoryPoint: number | null,
  subtaskStoryPoint: number
): number {
  return ((parentStoryPoint ?? 1) * subtaskStoryPoint) / 10;
}

export function readShareValue(task: ShareTaskLike): number | null {
  if (isSubtaskShareValue(task.storyPoints)) return task.storyPoints;
  if (isSubtaskShareValue(task.storyPoint)) return task.storyPoint;
  return null;
}

export function readStoryPointValue(task: ShareTaskLike): number | null {
  if (typeof task.storyPoint === "number" && !Number.isNaN(task.storyPoint)) return task.storyPoint;
  if (typeof task.storyPoints === "number" && !Number.isNaN(task.storyPoints)) return task.storyPoints;
  return null;
}

/**
 * Tổng tỷ trọng sibling Subtask cùng parent.taskId.
 * `storyPoint = null` không chiếm tỷ trọng. Khi sửa, truyền excludeTaskId để loại chính Subtask đang sửa.
 */
export function sumSiblingUsedPoints(
  tasks: ShareTaskLike[],
  parentId: string,
  excludeTaskId?: string | null
): number {
  const parent = parentId.trim();
  if (!parent) return 0;

  return tasks.reduce((sum, task) => {
    if (excludeTaskId && task.id === excludeTaskId) return sum;
    if (normalizeIssueTypeLevel(task.issueTypeLevel) !== "SUBTASK") return sum;
    if ((task.parent?.taskId ?? "").trim() !== parent) return sum;
    const share = readShareValue(task);
    return share === null ? sum : sum + share;
  }, 0);
}

export function getRemainingShare(usedPoints: number): number {
  return Math.max(0, SUBTASK_SHARE_TOTAL - usedPoints);
}

export function getRemainingPercent(usedPoints: number): number {
  return getRemainingShare(usedPoints) * 10;
}

/** Max nhập khi sửa: phần còn lại sau khi loại tỷ trọng cũ. */
export function getMaxEditableShare(usedByOthers: number): number {
  return getRemainingShare(usedByOthers);
}

export function findParentStoryPoint(tasks: ShareTaskLike[], parentId: string): number | null {
  const parent = tasks.find((task) => task.id === parentId.trim());
  return parent ? readStoryPointValue(parent) : null;
}

export function isPlanningStoryPointIssue(issue: { issueTypeLevel?: string | null }): boolean {
  return normalizeIssueTypeLevel(issue.issueTypeLevel) === "STANDARD";
}

/** Chỉ cộng STANDARD. Null/0 không biến thành 1. Không cộng Subtask/Epic. */
export function sumPlanningStoryPoints(
  issues: Array<{ issueTypeLevel?: string | null; storyPoints?: number | null }>
): number {
  return issues.reduce((sum, issue) => {
    if (!isPlanningStoryPointIssue(issue)) return sum;
    const points = issue.storyPoints;
    if (typeof points !== "number" || Number.isNaN(points) || points <= 0) return sum;
    return sum + points;
  }, 0);
}

export function countUnestimatedStandardTasks(
  issues: Array<{ issueTypeLevel?: string | null; storyPoints?: number | null }>
): number {
  return issues.filter((issue) => {
    if (!isPlanningStoryPointIssue(issue)) return false;
    return typeof issue.storyPoints !== "number" || Number.isNaN(issue.storyPoints) || issue.storyPoints <= 0;
  }).length;
}

export function canQuickEditContributionPoints(level: IssueTypeLevel): boolean {
  return level === "STANDARD" || level === "SUBTASK";
}

export function formatIssuePointBadge(
  level: IssueTypeLevel,
  storyPoints: number | null | undefined
): string {
  if (level === "SUBTASK") {
    if (!isSubtaskShareValue(storyPoints)) return "Chưa phân bổ";
    return `${getSubtaskPercent(storyPoints)}%`;
  }
  if (typeof storyPoints === "number" && !Number.isNaN(storyPoints) && storyPoints > 0) {
    return `${storyPoints} SP`;
  }
  if (storyPoints === 0) return "0 SP";
  return "Chưa ước lượng";
}

export function canonicalSagaContributionLabel(label: string): SagaContributionLabel | null {
  const lower = label.trim().toLowerCase();
  if (lower === "saga:doc" || lower === "saga:docs") return "saga:document";
  return SAGA_CONTRIBUTION_LABELS.find((labelValue) => labelValue === lower) ?? null;
}

export function isSagaContributionLabel(label: string): boolean {
  return canonicalSagaContributionLabel(label) !== null;
}

export function splitTaskLabels(labels?: readonly string[] | null): {
  sagaLabels: SagaContributionLabel[];
  jiraLabels: string[];
} {
  const sagaLabels: SagaContributionLabel[] = [];
  const jiraLabels: string[] = [];

  for (const rawLabel of labels ?? []) {
    const canonical = canonicalSagaContributionLabel(rawLabel);
    if (canonical) {
      if (!sagaLabels.includes(canonical)) sagaLabels.push(canonical);
    } else if (rawLabel.trim()) {
      jiraLabels.push(rawLabel);
    }
  }

  return { sagaLabels, jiraLabels };
}

/** Chỉ nhận marker SAGA canonical và giữ tối đa lựa chọn mới nhất. */
export function normalizeContributionLabels(labels: readonly string[]): SagaContributionLabel[] {
  const normalized = labels
    .map(canonicalSagaContributionLabel)
    .filter((label): label is SagaContributionLabel => label !== null);
  return normalized.length > 0 ? [normalized[normalized.length - 1]] : [];
}

/** Label Jira cũ là chỉ đọc nhưng vẫn phải được gửi lại khi người dùng đổi marker SAGA. */
export function mergeReadonlyJiraLabelsWithSaga(
  originalLabels: readonly string[],
  selectedSagaLabels: readonly string[]
): string[] {
  const { jiraLabels } = splitTaskLabels(originalLabels);
  return [...jiraLabels, ...normalizeContributionLabels(selectedSagaLabels)];
}

export function areSagaLabelSelectionsEqual(
  originalLabels: readonly string[],
  selectedSagaLabels: readonly string[]
): boolean {
  const originalSagaLabels = splitTaskLabels(originalLabels).sagaLabels;
  const selected = selectedSagaLabels
    .map(canonicalSagaContributionLabel)
    .filter((label): label is SagaContributionLabel => label !== null);
  return (
    originalSagaLabels.length === selected.length &&
    originalSagaLabels.every((label, index) => label === selected[index])
  );
}

function sprintRefMatches(refId: string, sprint: SprintDisplayOption): boolean {
  return (
    String(sprint.id) === refId ||
    (sprint.externalSprintId !== null &&
      sprint.externalSprintId !== undefined &&
      String(sprint.externalSprintId) === refId)
  );
}

function findSprintDisplayName(
  ref: SprintDisplayRef | null | undefined,
  fallbackId: string | null | undefined,
  sprints: readonly SprintDisplayOption[]
): string | null {
  const directName = ref?.name?.trim();
  if (directName) return directName;

  const ids = [ref?.id, ref?.externalSprintId, fallbackId]
    .filter((value): value is string | number => value !== null && value !== undefined)
    .map(String)
    .filter((value) => value && value !== "backlog");
  for (const id of ids) {
    const match = sprints.find((sprint) => sprintRefMatches(id, sprint));
    if (match?.name.trim()) return match.name.trim();
  }
  return null;
}

export function resolveSubtaskSprintDisplay(input: {
  detailSprint?: SprintDisplayRef | null;
  detailLoaded: boolean;
  issueSprintId?: string | null;
  parentTaskId?: string | null;
  projectTasks: readonly SprintDisplayTask[];
  sprints: readonly SprintDisplayOption[];
}): string {
  const directName = findSprintDisplayName(input.detailSprint, null, input.sprints);
  if (directName) return directName;

  const parentTask = input.parentTaskId
    ? input.projectTasks.find((task) => task.id === input.parentTaskId)
    : undefined;
  const parentName = findSprintDisplayName(parentTask?.sprint, null, input.sprints);
  if (parentName) return parentName;

  if (input.detailLoaded && input.detailSprint === null) {
    return "Backlog (Chưa thuộc Sprint)";
  }

  const issueName = findSprintDisplayName(null, input.issueSprintId, input.sprints);
  if (issueName) return issueName;

  const isKnownBacklog =
    Boolean(parentTask && !parentTask.sprint) ||
    input.issueSprintId === "backlog";
  return isKnownBacklog
    ? "Backlog (Chưa thuộc Sprint)"
    : "Chưa xác định Sprint";
}

export function mapTaskEvidenceCheck(value?: TaskEvidenceCheck | null): TaskEvidenceCheck | null {
  if (!value || typeof value !== "object") return null;
  const status = value.status;
  if (!EVIDENCE_STATUSES.includes(status)) return null;
  return {
    status,
    requiresCommit: Boolean(value.requiresCommit),
    requiresDocument: Boolean(value.requiresDocument),
  };
}

export function shouldShowEvidenceWarning(check?: TaskEvidenceCheck | null): boolean {
  if (!check) return false;
  return (
    check.status === "MISSING_COMMIT" ||
    check.status === "MISSING_DOCUMENT" ||
    check.status === "MISSING_COMMIT_AND_DOCUMENT"
  );
}
