import type { ProjectTaskItem } from "@/features/student/project/types/student-project";
import type { ProjectTaskResponse } from "../types/jira-task-types";
import type { SprintIssue, IssueStatus, IssueType, IssuePriority } from "../types/sprint-progress";

export interface SimpleTeamMember {
  id: string;
  name?: string;
  fullName?: string;
  studentCode?: string;
  avatar?: string;
  accountId?: string | null;
}

export function mapProjectTaskToSprintIssue(
  task: ProjectTaskResponse | ProjectTaskItem,
  members: SimpleTeamMember[] = [],
  defaultSprintId?: string
): SprintIssue {
  const taskResponse = task as ProjectTaskResponse;
  const rawType = (task.issueTypeName || "").toUpperCase();
  let type: IssueType = "TASK";
  if (rawType.includes("EPIC")) type = "EPIC";
  else if (rawType.includes("STORY")) type = "STORY";
  else if (rawType.includes("BUG")) type = "BUG";
  else if (rawType.includes("SUB")) type = "SUBTASK";

  const jiraStatus = (taskResponse.jiraStatusName || "").toUpperCase();
  const rawStatus = (task.status || "").toUpperCase();
  let status: IssueStatus = "TODO";
  if (["DONE", "COMPLETED", "RESOLVED", "CLOSED"].some((s) => jiraStatus.includes(s) || rawStatus.includes(s))) {
    status = "DONE";
  } else if (["REVIEW", "TEST", "QA", "PREVIEW"].some((s) => jiraStatus.includes(s) || rawStatus.includes(s))) {
    status = "IN_REVIEW";
  } else if (["IN_PROGRESS", "IN PROGRESS", "DOING"].some((s) => jiraStatus.includes(s) || rawStatus.includes(s))) {
    status = "IN_PROGRESS";
  }

  const rawPriority = (taskResponse.priority || "").toUpperCase();
  let priority: IssuePriority = "MEDIUM";
  if (rawPriority.includes("HIGHEST") || rawPriority.includes("BLOCKER")) priority = "HIGHEST";
  else if (rawPriority.includes("HIGH") || rawPriority.includes("CRITICAL")) priority = "HIGH";
  else if (rawPriority.includes("LOW") || rawPriority.includes("TRIVIAL")) priority = "LOW";

  const taskAssigneeAccountId = taskResponse.assignee?.accountId || task.assigneeExternalId || null;
  const rawAssigneeName =
    taskResponse.assignee?.displayName ||
    taskResponse.assigneeDisplayName ||
    task.assigneeDisplayName ||
    "";
  const cleanAssigneeName = rawAssigneeName.toLowerCase().replace(/\s+/g, " ").trim();

  const member = members.find((m) => {
    if (m.accountId && taskAssigneeAccountId && m.accountId === taskAssigneeAccountId) {
      return true;
    }
    if (task.assigneeStudentId && (m.id === task.assigneeStudentId || m.studentCode === task.assigneeStudentId)) {
      return true;
    }
    if (
      taskResponse.assignee?.studentId &&
      (m.id === taskResponse.assignee.studentId || m.studentCode === taskResponse.assignee.studentId)
    ) {
      return true;
    }
    if (
      task.assigneeExternalId &&
      m.studentCode &&
      task.assigneeExternalId.toLowerCase().includes(m.studentCode.toLowerCase())
    ) {
      return true;
    }
    if (m.studentCode && cleanAssigneeName && cleanAssigneeName.includes(m.studentCode.toLowerCase())) {
      return true;
    }
    const cleanMemberName = (m.fullName || m.name || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (cleanMemberName && cleanAssigneeName) {
      if (
        cleanMemberName === cleanAssigneeName ||
        cleanAssigneeName.includes(cleanMemberName) ||
        cleanMemberName.includes(cleanAssigneeName)
      ) {
        return true;
      }
    }
    return false;
  });

  const memberName =
    member?.fullName ||
    member?.name ||
    rawAssigneeName;
  const displayName =
    memberName ||
    (task.assigneeExternalId ? `Jira (${task.assigneeExternalId.slice(0, 8)})` : "Chưa phân công");

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
      avatar: member?.avatar || "",
      studentCode: member?.studentCode || "",
      accountId: taskAssigneeAccountId,
    },
    parent: taskResponse.parent
      ? {
        externalId: taskResponse.parent.externalId,
        externalKey: taskResponse.parent.externalKey,
      }
      : undefined,
    labels: Array.isArray(taskResponse.labels)
      ? taskResponse.labels
      : Array.isArray(task.labels)
        ? task.labels
        : [],
    sprintId: taskSprintId,
    githubCommitCount: task.linkedCommitCount || 0,
    createdAt: task.createdAt,
  };
}
