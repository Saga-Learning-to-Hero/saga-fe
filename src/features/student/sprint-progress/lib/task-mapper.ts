import type { ProjectTaskItem } from "@/features/student/project/types/student-project";
import type { ProjectTaskResponse } from "../types/jira-task-types";
import type { SprintIssue, IssueStatus, IssueType, IssuePriority } from "../types/sprint-progress";

export interface SimpleTeamMember {
  id: string;
  name?: string;
  fullName?: string;
  studentCode?: string;
  avatar?: string;
}

export function mapProjectTaskToSprintIssue(
  task: ProjectTaskResponse | ProjectTaskItem,
  members: SimpleTeamMember[] = [],
  defaultSprintId?: string
): SprintIssue {
  const rawType = (task.issueTypeName || "").toUpperCase();
  let type: IssueType = "TASK";
  if (rawType.includes("STORY")) type = "STORY";
  else if (rawType.includes("BUG")) type = "BUG";
  else if (rawType.includes("SUB")) type = "SUBTASK";

  const rawStatus = (task.status || "").toUpperCase();
  let status: IssueStatus = "TODO";
  if (["DONE", "COMPLETED", "RESOLVED", "CLOSED"].some((s) => rawStatus.includes(s))) {
    status = "DONE";
  } else if (["REVIEW", "TEST", "QA"].some((s) => rawStatus.includes(s))) {
    status = "IN_REVIEW";
  } else if (["IN_PROGRESS", "IN PROGRESS", "DOING"].some((s) => rawStatus.includes(s))) {
    status = "IN_PROGRESS";
  }

  const rawPriority = ((task as ProjectTaskResponse).priority || "").toUpperCase();
  let priority: IssuePriority = "MEDIUM";
  if (rawPriority.includes("HIGHEST") || rawPriority.includes("BLOCKER")) priority = "HIGHEST";
  else if (rawPriority.includes("HIGH") || rawPriority.includes("CRITICAL")) priority = "HIGH";
  else if (rawPriority.includes("LOW") || rawPriority.includes("TRIVIAL")) priority = "LOW";

  const taskResponse = task as ProjectTaskResponse;
  const member = members.find(
    (m) =>
      (task.assigneeStudentId && m.id === task.assigneeStudentId) ||
      (taskResponse.assignee?.studentId && m.id === taskResponse.assignee.studentId) ||
      (task.assigneeExternalId && m.studentCode && task.assigneeExternalId.includes(m.studentCode))
  );

  const memberName =
    member?.fullName ||
    member?.name ||
    taskResponse.assignee?.displayName ||
    taskResponse.assigneeDisplayName;
  const displayName =
    memberName ||
    (task.assigneeExternalId ? `Jira (${task.assigneeExternalId.slice(0, 8)})` : "Chưa phân công");
  const avatarUrl =
    member?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  const resolvedSprintId =
    taskResponse.sprint?.id ??
    taskResponse.sprint?.externalSprintId ??
    defaultSprintId ??
    "backlog";
  const taskSprintId = resolvedSprintId ? String(resolvedSprintId) : "backlog";

  return {
    id: task.id,
    key: task.externalKey || task.id.slice(0, 8),
    summary: task.title || "Chưa có tiêu đề Jira",
    description: taskResponse.description || undefined,
    type,
    priority,
    status,
    storyPoints:
      typeof taskResponse.storyPoint === "number" && !Number.isNaN(taskResponse.storyPoint)
        ? taskResponse.storyPoint
        : 0,
    assignee: {
      id: member?.id || task.assigneeStudentId || task.assigneeExternalId || "unassigned",
      name: displayName,
      avatar: avatarUrl,
      studentCode: member?.studentCode || "",
    },
    sprintId: taskSprintId,
    githubCommitCount: task.linkedCommitCount || 0,
    createdAt: task.createdAt,
  };
}
