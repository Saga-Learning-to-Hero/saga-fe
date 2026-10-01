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

export function isSagaContributionLabel(label: string): boolean {
  const lower = label.trim().toLowerCase();
  return (
    lower === "saga:code" ||
    lower === "saga:test" ||
    lower === "saga:document" ||
    lower === "saga:doc" ||
    lower === "saga:research"
  );
}

export function getInheritedContributionLabels(parentLabels?: string[] | null): string[] {
  return (parentLabels ?? []).filter(isSagaContributionLabel);
}

export function mergeSubtaskLabelsForPatch(
  originalLabels: string[],
  editedLabels: string[]
): string[] {
  const originalSaga = originalLabels.filter(isSagaContributionLabel);
  const regular = editedLabels.filter((label) => !isSagaContributionLabel(label));
  return [...regular, ...originalSaga];
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
