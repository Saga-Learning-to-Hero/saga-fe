import type {
  ProjectSprintResponse,
  ProjectTaskOptionsResponse,
} from "../types/jira-task-types";

interface JiraSourceScopedTask {
  sprintId?: string | null;
}

interface JiraSourceScopedIssue {
  jiraIntegrationId?: string | null;
}

export function scopeIssuesToJiraSource<T extends JiraSourceScopedIssue>(
  issues: T[],
  jiraIntegrationId?: string,
  activeSourceCount = 1
): T[] {
  if (!jiraIntegrationId) return issues;

  return issues.filter(
    (issue) =>
      issue.jiraIntegrationId === jiraIntegrationId ||
      (activeSourceCount <= 1 && !issue.jiraIntegrationId)
  );
}

export function scopeSprintsToJiraSource(
  sprints: ProjectSprintResponse[],
  sourceSprintOptions: ProjectTaskOptionsResponse["sprints"] | undefined,
  sourceTasks: JiraSourceScopedTask[] = [],
  selectedJiraIntegrationId?: string
): ProjectSprintResponse[] {
  if (selectedJiraIntegrationId) {
    const hasProvenance = sprints.some(
      (sprint) => Boolean(sprint.source?.jiraIntegrationId || sprint.jiraIntegrationId)
    );
    if (hasProvenance) {
      return sprints.filter((sprint) => {
        const id = sprint.source?.jiraIntegrationId || sprint.jiraIntegrationId;
        return id === selectedJiraIntegrationId;
      });
    }
  }

  const providerSprintIds = new Set(
    (sourceSprintOptions || []).map((sprint) => String(sprint.id))
  );
  const projectedSprintIds = new Set(
    sourceTasks
      .map((task) => task.sprintId)
      .filter((sprintId): sprintId is string => Boolean(sprintId && sprintId !== "backlog"))
  );

  if (providerSprintIds.size === 0 && projectedSprintIds.size === 0) {
    return [];
  }

  return sprints.filter((sprint) => {
    if (projectedSprintIds.has(String(sprint.id))) return true;

    const externalSprintId = sprint.externalSprintId;
    return externalSprintId !== null && externalSprintId !== undefined
      ? providerSprintIds.has(String(externalSprintId))
      : false;
  });
}
