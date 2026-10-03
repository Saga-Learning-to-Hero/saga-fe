import type { IssueType } from "../types/sprint-progress";
import type {
  CreateProjectTaskRequest,
  IssueTypeLevel,
  JiraTaskParent,
  PatchProjectTaskRequest,
  ProjectTaskOptionItem,
} from "../types/jira-task-types";

export const ISSUE_TYPE_LEVELS: readonly IssueTypeLevel[] = [
  "EPIC",
  "STANDARD",
  "SUBTASK",
  "ABOVE_EPIC",
  "UNKNOWN",
] as const;

export type ParentAction =
  | { type: "UNCHANGED" }
  | { type: "SET"; taskId: string }
  | { type: "CLEAR" };

export type ParentActionType = ParentAction["type"];

export interface IssueTypeUiRules {
  showParent: boolean;
  parentRequired: boolean;
  parentLabel: string;
  parentOptionalHint: string;
  canSelectParent: boolean;
  showSprint: boolean;
  canAssignSprint: boolean;
  canSubmit: boolean;
  canChangeIssueType: boolean;
  unknownMessage?: string;
  sprintFollowsParentHint?: string;
}

/** Chỉ đọc cấp loại thẻ từ BE; không suy từ tên Task/Story/Subtask. */
export function normalizeIssueTypeLevel(value?: string | null): IssueTypeLevel {
  const upper = (value || "").trim().toUpperCase();
  if (
    upper === "EPIC" ||
    upper === "STANDARD" ||
    upper === "SUBTASK" ||
    upper === "ABOVE_EPIC" ||
    upper === "UNKNOWN"
  ) {
    return upper;
  }
  return "UNKNOWN";
}

/** Icon UI: STANDARD map Task/Story/Bug theo tên hiển thị, không dùng tên để quyết định parent/sprint. */
export function issueTypeIconFromLevelAndName(
  level: IssueTypeLevel,
  name?: string | null
): IssueType {
  if (level === "EPIC") return "EPIC";
  if (level === "SUBTASK") return "SUBTASK";
  if (level === "STANDARD") {
    const upperName = (name || "").toUpperCase();
    if (upperName.includes("STORY")) return "STORY";
    if (upperName.includes("BUG")) return "BUG";
    return "TASK";
  }
  return "TASK";
}

export function getIssueTypeUiRules(
  level: IssueTypeLevel,
  isEditing: boolean
): IssueTypeUiRules {
  switch (level) {
    case "EPIC":
      return {
        showParent: false,
        parentRequired: false,
        parentLabel: "",
        parentOptionalHint: "",
        canSelectParent: false,
        showSprint: false,
        canAssignSprint: false,
        canSubmit: true,
        canChangeIssueType: false,
      };
    case "STANDARD":
      return {
        showParent: true,
        parentRequired: false,
        parentLabel: "Epic cha",
        parentOptionalHint: "(Tùy chọn)",
        canSelectParent: true,
        showSprint: true,
        canAssignSprint: true,
        canSubmit: true,
        canChangeIssueType: true,
      };
    case "SUBTASK":
      return {
        showParent: true,
        parentRequired: true,
        parentLabel: "Task cha",
        parentOptionalHint: isEditing ? "(Theo task cha)" : "(Bắt buộc)",
        canSelectParent: !isEditing,
        showSprint: false,
        canAssignSprint: false,
        canSubmit: true,
        canChangeIssueType: false,
        sprintFollowsParentHint: "Theo sprint của",
      };
    case "ABOVE_EPIC":
      return {
        showParent: false,
        parentRequired: false,
        parentLabel: "",
        parentOptionalHint: "",
        canSelectParent: false,
        showSprint: false,
        canAssignSprint: false,
        canSubmit: false,
        canChangeIssueType: false,
      };
    case "UNKNOWN":
    default:
      return {
        showParent: false,
        parentRequired: false,
        parentLabel: "",
        parentOptionalHint: "",
        canSelectParent: false,
        showSprint: false,
        canAssignSprint: false,
        canSubmit: false,
        canChangeIssueType: false,
        unknownMessage: "Chưa xác định cấp, vui lòng đồng bộ lại Jira.",
      };
  }
}

export function canChangeIssueType(
  currentLevel: IssueTypeLevel,
  nextLevel: IssueTypeLevel
): boolean {
  return currentLevel === "STANDARD" && nextLevel === "STANDARD";
}

/**
 * Edit only allows STANDARD -> STANDARD, so changing Task/Story/Feature must not
 * silently clear an existing Epic parent. Create flows reset the parent because
 * the valid parent level can change with the selected issue type.
 */
export function shouldPreserveParentOnIssueTypeChange(input: {
  isEditing: boolean;
  currentLevel: IssueTypeLevel;
  nextLevel: IssueTypeLevel;
}): boolean {
  return (
    input.isEditing &&
    input.currentLevel === "STANDARD" &&
    input.nextLevel === "STANDARD"
  );
}

export function hydratedParentTaskId(parent?: JiraTaskParent | null): string {
  return parent?.taskId?.trim() || "";
}

export function parentActionTypeForSelection(input: {
  isEditing: boolean;
  selectedParentTaskId: string;
  originalParentTaskId: string | null;
}): ParentActionType {
  const selected = input.selectedParentTaskId.trim();
  const original = input.originalParentTaskId?.trim() || "";
  if (!input.isEditing) return selected ? "SET" : "UNCHANGED";
  if (selected && selected === original) return "UNCHANGED";
  return selected ? "SET" : "CLEAR";
}

export function canDragIssueSprint(level: IssueTypeLevel): boolean {
  return level === "STANDARD";
}

export function isSubtaskLevel(level?: IssueTypeLevel | null): boolean {
  return level === "SUBTASK";
}

export function pickStandardIssueType(
  issueTypes: ProjectTaskOptionItem[] | undefined | null
): ProjectTaskOptionItem | null {
  if (!issueTypes?.length) return null;
  return (
    issueTypes.find((item) => normalizeIssueTypeLevel(item.level) === "STANDARD") ?? null
  );
}

export function resolveParentAction(input: {
  isEditing: boolean;
  selectedParentTaskId: string;
  originalParentTaskId: string | null;
  parentResolution?: "RESOLVED" | "UNRESOLVED" | null;
  requestedAction?: ParentActionType;
}): ParentAction {
  const selected = input.selectedParentTaskId.trim();
  const original = input.originalParentTaskId?.trim() || "";

  if (!input.isEditing) {
    return selected ? { type: "SET", taskId: selected } : { type: "UNCHANGED" };
  }

  if (input.requestedAction === "UNCHANGED") {
    return { type: "UNCHANGED" };
  }
  if (input.requestedAction === "CLEAR") {
    return { type: "CLEAR" };
  }
  if (input.requestedAction === "SET") {
    return selected ? { type: "SET", taskId: selected } : { type: "UNCHANGED" };
  }

  if (input.parentResolution === "UNRESOLVED") {
    if (!selected || selected === original) {
      return { type: "UNCHANGED" };
    }
    return { type: "SET", taskId: selected };
  }

  if (!selected) {
    return original ? { type: "CLEAR" } : { type: "UNCHANGED" };
  }
  if (selected === original) {
    return { type: "UNCHANGED" };
  }
  return { type: "SET", taskId: selected };
}

export function parentFieldsForCreate(
  action: ParentAction
): Pick<CreateProjectTaskRequest, "jiraParentTaskId"> {
  if (action.type === "SET") {
    return { jiraParentTaskId: action.taskId };
  }
  return {};
}

export function parentFieldsForPatch(
  action: ParentAction
): Pick<PatchProjectTaskRequest, "jiraParentTaskId" | "clearJiraParent"> {
  if (action.type === "SET") {
    return { jiraParentTaskId: action.taskId };
  }
  if (action.type === "CLEAR") {
    return { clearJiraParent: true };
  }
  return {};
}

export function parentResolutionLabel(
  reason?: "PARENT_NOT_SYNCED" | "PARENT_SOURCE_REVOKED" | null
): string {
  if (reason === "PARENT_SOURCE_REVOKED") {
    return "Nguồn Jira của task cha đã bị thu hồi.";
  }
  if (reason === "PARENT_NOT_SYNCED") {
    return "Task cha chưa được đồng bộ về SAGA.";
  }
  return "Task cha chưa gắn được với task SAGA.";
}
