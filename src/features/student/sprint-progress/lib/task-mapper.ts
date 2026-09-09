import type { ProjectTaskItem } from "@/features/student/project/types/student-project";
import type { SprintIssue, IssueStatus, IssueType } from "../types/sprint-progress";

export interface SimpleTeamMember {
  id: string;
  name?: string;
  fullName?: string;
  studentCode?: string;
  avatar?: string;
}

export function mapProjectTaskToSprintIssue(
  task: ProjectTaskItem,
  members: SimpleTeamMember[] = [],
  fallbackSprintId: string = "sprint-03"
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

  const member = members.find(
    (m) =>
      (task.assigneeStudentId && m.id === task.assigneeStudentId) ||
      (task.assigneeExternalId && m.studentCode && task.assigneeExternalId.includes(m.studentCode))
  );

  const memberName = member?.fullName || member?.name;
  const displayName = memberName || (task.assigneeExternalId ? `Jira (${task.assigneeExternalId.slice(0, 8)})` : "Chưa phân công");
  const avatarUrl = member?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  return {
    id: task.id,
    key: task.externalKey || task.id.slice(0, 8),
    summary: task.title || "Chưa có tiêu đề Jira",
    type,
    priority: "MEDIUM",
    status,
    storyPoints: 3,
    assignee: {
      id: member?.id || task.assigneeStudentId || task.assigneeExternalId || "unassigned",
      name: displayName,
      avatar: avatarUrl,
      studentCode: member?.studentCode || "",
    },
    sprintId: fallbackSprintId,
    githubCommitCount: task.linkedCommitCount || 0,
    createdAt: task.createdAt,
  };
}
