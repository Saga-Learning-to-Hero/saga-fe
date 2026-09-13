import type { SprintIssue } from "../types/sprint-progress";

export function moveLocalIssueToSprint(
  issues: SprintIssue[],
  issueId: string,
  sprintId: string
): SprintIssue[] {
  return issues.map((issue) => (issue.id === issueId ? { ...issue, sprintId } : issue));
}

export function setLocalSprintOverride(
  overrides: Record<string, Partial<SprintIssue>>,
  issueId: string,
  sprintId: string
): Record<string, Partial<SprintIssue>> {
  return {
    ...overrides,
    [issueId]: { ...overrides[issueId], sprintId },
  };
}

export function restoreLocalSprintOverride(
  overrides: Record<string, Partial<SprintIssue>>,
  issueId: string,
  previousOverride: Partial<SprintIssue> | undefined
): Record<string, Partial<SprintIssue>> {
  return {
    ...overrides,
    [issueId]: previousOverride || {},
  };
}
