import type { SprintIssue } from "../types/sprint-progress";

export function isTaskOwnedByCurrentStudent(
  issue: SprintIssue | null | undefined,
  currentStudentId?: string | null,
  currentStudentCode?: string | null
): boolean {
  if (!issue?.assignee) return false;

  if (currentStudentId?.trim() && issue.assignee.studentId?.trim()) {
    return issue.assignee.studentId === currentStudentId;
  }

  return Boolean(
    currentStudentCode?.trim() &&
      issue.assignee.studentCode?.trim() &&
      issue.assignee.studentCode === currentStudentCode
  );
}
