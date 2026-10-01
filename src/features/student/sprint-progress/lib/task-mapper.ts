import type { ProjectTaskItem } from "@/features/student/project/types/student-project";
import type { JiraTaskParent, ProjectTaskResponse } from "../types/jira-task-types";
import type { SprintIssue, IssueStatus, IssuePriority } from "../types/sprint-progress";
import { resolveHttpAvatarUrl } from "@/lib/avatar-url";
import {
  issueTypeIconFromLevelAndName,
  normalizeIssueTypeLevel,
} from "./issue-type-rules";
import { mapTaskEvidenceCheck } from "./subtask-allocation";

export interface SimpleTeamMember {
  id: string;
  name?: string;
  fullName?: string;
  studentCode?: string;
  avatar?: string;
  avatarUrl?: string | null;
  accountId?: string | null;
}

export function mapProjectTaskToSprintIssue(
  task: ProjectTaskResponse | ProjectTaskItem,
  members: SimpleTeamMember[] = [],
  defaultSprintId?: string
): SprintIssue {
  const taskResponse = task as ProjectTaskResponse;
  const issueTypeLevel = normalizeIssueTypeLevel(taskResponse.issueTypeLevel ?? task.issueTypeLevel);
  const type = issueTypeIconFromLevelAndName(issueTypeLevel, task.issueTypeName);

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
    issueTypeId: taskResponse.issueTypeId ?? task.issueTypeId ?? null,
    issueTypeName: task.issueTypeName || null,
    issueTypeLevel,
    jiraHierarchyLevel: taskResponse.jiraHierarchyLevel ?? task.jiraHierarchyLevel ?? null,
    priority,
    status,
    storyPoints:
      typeof taskResponse.storyPoint === "number" && !Number.isNaN(taskResponse.storyPoint)
        ? taskResponse.storyPoint
        : null,
    assignee: {
      id: member?.id || task.assigneeStudentId || task.assigneeExternalId || "unassigned",
      studentId: task.assigneeStudentId || taskResponse.assignee?.studentId || null,
      name: displayName,
      avatar:
        resolveHttpAvatarUrl(taskResponse.assignee?.avatarUrl, member?.avatarUrl, member?.avatar) ||
        "",
      studentCode: member?.studentCode || "",
      accountId: taskAssigneeAccountId,
    },
    parent: mapJiraTaskParent(taskResponse.parent ?? task.parent),
    labels: Array.isArray(taskResponse.labels)
      ? taskResponse.labels
      : Array.isArray(task.labels)
        ? task.labels
        : [],
    sprintId: taskSprintId,
    dueDate: taskResponse.dueDate || (task as ProjectTaskItem).dueDate || undefined,
    startDate: taskResponse.startDate || (task as ProjectTaskItem).startDate || undefined,
    githubCommitCount: task.linkedCommitCount || 0,
    evidenceCount: task.evidenceCount,
    hasEvidence: task.hasEvidence,
    evidenceCheck: mapTaskEvidenceCheck(taskResponse.evidenceCheck),
    createdAt: task.createdAt,
    superseded: Boolean(
      taskResponse.migration?.superseded ?? taskResponse.superseded ?? false
    ),
    migratedFrom: (taskResponse.migration?.migratedFrom ?? taskResponse.migratedFrom)
      ? {
        taskId: (taskResponse.migration?.migratedFrom ?? taskResponse.migratedFrom)!.taskId,
        externalKey: (taskResponse.migration?.migratedFrom ?? taskResponse.migratedFrom)!.externalKey,
      }
      : null,
    migratedTo: (taskResponse.migration?.migratedTo ?? taskResponse.migratedTo)
      ? {
        taskId: (taskResponse.migration?.migratedTo ?? taskResponse.migratedTo)!.taskId,
        externalKey: (taskResponse.migration?.migratedTo ?? taskResponse.migratedTo)!.externalKey,
      }
      : null,
    jiraIntegrationId: taskResponse.source?.integrationId ?? taskResponse.jiraIntegrationId ?? null,
    sourceProjectKey: taskResponse.source?.projectKey ?? null,
  };
}

function mapJiraTaskParent(
  parent?: ProjectTaskResponse["parent"] | ProjectTaskItem["parent"] | null
): JiraTaskParent | undefined {
  if (!parent) return undefined;
  const externalId = parent.externalId?.trim() || "";
  const externalKey = parent.externalKey?.trim() || "";
  if (!externalId && !externalKey) return undefined;

  const taskId = "taskId" in parent ? parent.taskId ?? null : null;
  const resolution =
    "resolution" in parent && (parent.resolution === "RESOLVED" || parent.resolution === "UNRESOLVED")
      ? parent.resolution
      : taskId
        ? "RESOLVED"
        : "UNRESOLVED";
  const resolutionReason =
    "resolutionReason" in parent
      ? parent.resolutionReason ?? null
      : resolution === "UNRESOLVED"
        ? "PARENT_NOT_SYNCED"
        : null;

  return {
    externalId,
    externalKey,
    taskId,
    resolution,
    resolutionReason,
  };
}
