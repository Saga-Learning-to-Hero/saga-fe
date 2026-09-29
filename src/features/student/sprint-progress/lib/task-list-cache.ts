import { mapProjectTaskToSprintIssue } from "./task-mapper";
import type { ProjectTaskItem } from "@/features/student/project/types/student-project";
import type { ProjectTaskResponse } from "../types/jira-task-types";
import type { SprintIssue } from "../types/sprint-progress";

type TaskListItem = ProjectTaskResponse | ProjectTaskItem;

function taskId(task: TaskListItem): string {
  return task.id;
}

/** Thay task cùng id, giữ nguyên thứ tự các phần tử còn lại. */
export function upsertProjectTaskInList<T extends TaskListItem>(
  list: T[] | undefined,
  updated: T
): T[] {
  if (!list || list.length === 0) return [updated];
  const index = list.findIndex((task) => taskId(task) === taskId(updated));
  if (index < 0) return [...list, updated];
  return list.map((task, currentIndex) => (currentIndex === index ? { ...task, ...updated } : task));
}

/** Chỉ bỏ overlay status khi GET /tasks đã khớp trạng thái kéo thả. */
export function shouldDropStatusOverride(
  serverTask: TaskListItem | undefined,
  override?: Partial<SprintIssue>
): boolean {
  const overlayStatus = override?.status;
  if (!overlayStatus || !serverTask) return false;
  const mappedStatus = mapProjectTaskToSprintIssue(serverTask).status;
  return mappedStatus === overlayStatus;
}

export function dropMatchedStatusOverrides(
  overrides: Record<string, Partial<SprintIssue>>,
  serverTasks: TaskListItem[]
): Record<string, Partial<SprintIssue>> {
  if (Object.keys(overrides).length === 0) return overrides;

  const byId = new Map(serverTasks.map((task) => [taskId(task), task]));
  let changed = false;
  const next: Record<string, Partial<SprintIssue>> = {};

  for (const [id, override] of Object.entries(overrides)) {
    if (!shouldDropStatusOverride(byId.get(id), override)) {
      next[id] = override;
      continue;
    }

    changed = true;
    const rest: Partial<SprintIssue> = { ...override };
    delete rest.status;
    if (Object.keys(rest).length > 0) {
      next[id] = rest;
    }
  }

  return changed ? next : overrides;
}
