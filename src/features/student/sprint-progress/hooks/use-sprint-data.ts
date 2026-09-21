export const JIRA_SPRINT_QUERY_KEYS = {
  all: ["jira-sprint"] as const,
  sprints: (projectId?: string | null) => [...JIRA_SPRINT_QUERY_KEYS.all, "sprints", projectId] as const,
  sprintDetail: (projectId?: string | null, sprintId?: string | null) =>
    [...JIRA_SPRINT_QUERY_KEYS.all, "sprint", projectId, sprintId] as const,
  tasks: (projectId?: string | null) => [...JIRA_SPRINT_QUERY_KEYS.all, "tasks", projectId] as const,
  taskDetail: (projectId?: string | null, taskId?: string | null) =>
    [...JIRA_SPRINT_QUERY_KEYS.all, "task", projectId, taskId] as const,
  taskOptions: (projectId?: string | null) =>
    [...JIRA_SPRINT_QUERY_KEYS.all, "task-options", projectId] as const,
  taskTransitions: (projectId?: string | null, taskId?: string | null) =>
    [...JIRA_SPRINT_QUERY_KEYS.all, "task-transitions", projectId, taskId] as const,
  parentTaskOptions: (projectId?: string | null, params?: unknown) =>
    [...JIRA_SPRINT_QUERY_KEYS.all, "parent-task-options", projectId, params] as const,
  taskEvidence: (projectId?: string | null, taskId?: string | null, params?: unknown) =>
    [...JIRA_SPRINT_QUERY_KEYS.all, "task-evidence", projectId, taskId, params] as const,
  taskTimeline: (projectId?: string | null, taskId?: string | null, params?: unknown) =>
    [...JIRA_SPRINT_QUERY_KEYS.all, "task-timeline", projectId, taskId, params] as const,
};

export * from "./use-project-sprints";
export * from "./use-project-tasks";
