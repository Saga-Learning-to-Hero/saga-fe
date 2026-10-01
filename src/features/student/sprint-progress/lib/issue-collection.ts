import type { SprintIssue } from "../types/sprint-progress";
import { isSubtaskLevel, normalizeIssueTypeLevel } from "./issue-type-rules";

/** Jira counts top-level work items on its board; subtasks belong to their parent work item. */
export function getTopLevelSprintIssues(issues: SprintIssue[]): SprintIssue[] {
  return issues.filter((issue) => !isSubtaskIssue(issue));
}

export interface SprintIssueHierarchy {
  workItems: SprintIssue[];
  subtasksByParentId: Map<string, SprintIssue[]>;
  /** @deprecated Dùng subtasksByParentId; giữ alias cho UI đang tra theo parent.id. */
  subtasksByParentKey: Map<string, SprintIssue[]>;
  orphanSubtasks: SprintIssue[];
}

/**
 * Nhóm Subtask theo parent.taskId. Orphan khi taskId null (UNRESOLVED)
 * hoặc parent chưa có trong list hiện tại. Không nhóm theo tên hay externalKey.
 */
export function groupSprintIssuesByParent(issues: SprintIssue[]): SprintIssueHierarchy {
  const workItems = getTopLevelSprintIssues(issues);
  const workItemIds = new Set(workItems.map((issue) => issue.id));
  const subtasksByParentId = new Map<string, SprintIssue[]>();
  const orphanSubtasks: SprintIssue[] = [];

  for (const issue of issues) {
    if (!isSubtaskIssue(issue)) continue;

    const parentTaskId = issue.parent?.taskId?.trim() || "";
    if (!parentTaskId || !workItemIds.has(parentTaskId)) {
      orphanSubtasks.push(issue);
      continue;
    }

    const siblings = subtasksByParentId.get(parentTaskId) || [];
    siblings.push(issue);
    subtasksByParentId.set(parentTaskId, siblings);
  }

  return {
    workItems,
    subtasksByParentId,
    subtasksByParentKey: subtasksByParentId,
    orphanSubtasks,
  };
}

/**
 * Keep an optimistic/local item only until its projected Jira counterpart is available.
 * API data wins because it is authoritative and React list keys must remain unique.
 */
export function mergeProjectedAndLocalIssues(
  projectedIssues: SprintIssue[],
  localIssues: SprintIssue[]
): SprintIssue[] {
  const projectedIds = new Set(projectedIssues.map((issue) => issue.id));
  const projectedKeys = new Set(projectedIssues.map((issue) => issue.key));

  return [
    ...projectedIssues,
    ...localIssues.filter(
      (issue) => !projectedIds.has(issue.id) && !projectedKeys.has(issue.key)
    ),
  ];
}

function isSubtaskIssue(issue: SprintIssue): boolean {
  return isSubtaskLevel(normalizeIssueTypeLevel(issue.issueTypeLevel));
}
