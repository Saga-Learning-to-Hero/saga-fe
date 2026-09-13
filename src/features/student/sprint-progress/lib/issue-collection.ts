import type { SprintIssue } from "../types/sprint-progress";

/** Jira counts top-level work items on its board; subtasks belong to their parent work item. */
export function getTopLevelSprintIssues(issues: SprintIssue[]): SprintIssue[] {
  return issues.filter((issue) => issue.type !== "SUBTASK");
}

export interface SprintIssueHierarchy {
  workItems: SprintIssue[];
  subtasksByParentKey: Map<string, SprintIssue[]>;
  orphanSubtasks: SprintIssue[];
}

/**
 * Groups subtasks only when Jira supplied a factual parent key that exists in the same list.
 * Any missing/out-of-scope parent stays visible in the fallback group instead of being guessed.
 */
export function groupSprintIssuesByParent(issues: SprintIssue[]): SprintIssueHierarchy {
  const workItems = getTopLevelSprintIssues(issues);
  const workItemKeys = new Set(workItems.map((issue) => issue.key));
  const subtasksByParentKey = new Map<string, SprintIssue[]>();
  const orphanSubtasks: SprintIssue[] = [];

  for (const issue of issues) {
    if (issue.type !== "SUBTASK") continue;

    const parentKey = issue.parent?.externalKey?.trim();
    if (!parentKey || !workItemKeys.has(parentKey)) {
      orphanSubtasks.push(issue);
      continue;
    }

    const siblings = subtasksByParentKey.get(parentKey) || [];
    siblings.push(issue);
    subtasksByParentKey.set(parentKey, siblings);
  }

  return { workItems, subtasksByParentKey, orphanSubtasks };
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
