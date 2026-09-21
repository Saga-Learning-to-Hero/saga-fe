import { useMemo, useState } from "react";
import { useProjectTasksData } from "@/features/student/sprint-progress/hooks/use-project-tasks";
import type { ProjectTaskResponse } from "@/features/student/sprint-progress/types/jira-task-types";
import { useProjectIntegrations } from "./useProjectIntegrations";
import type { JiraSourceSummary } from "../types/jira-sources";

interface ProjectJiraSourceSelectionOptions {
  readerMode?: boolean;
}

export function deriveJiraSourcesFromTasks(
  tasks: ProjectTaskResponse[]
): JiraSourceSummary[] {
  const sources = new Map<string, JiraSourceSummary>();

  for (const task of tasks) {
    const source = task.source;
    const integrationId = source?.integrationId || task.jiraIntegrationId;
    if (!integrationId || sources.has(integrationId)) continue;

    sources.set(integrationId, {
      integrationId,
      cloudId: "",
      siteName: source?.siteName?.trim() || "Jira",
      jiraProjectId: "",
      projectKey: source?.projectKey?.trim() || task.externalKey.split("-")[0] || "JIRA",
      boardId: source?.boardId || null,
      connectionStatus: source?.connectionStatus || "ACTIVE",
    });
  }

  return [...sources.values()];
}

export function useProjectJiraSourceSelection(
  projectId?: string | null,
  options?: ProjectJiraSourceSelectionOptions
) {
  const integrationsQuery = useProjectIntegrations(projectId, {
    enabled: Boolean(projectId) && !options?.readerMode,
  });
  const tasksQuery = useProjectTasksData(projectId);
  const [selection, setSelection] = useState<{
    projectId: string;
    integrationId: string;
  } | null>(null);

  const activeSources = useMemo(
    () => {
      const integrationSources = options?.readerMode
        ? []
        : integrationsQuery.data?.jiraSources || [];
      const taskSources = deriveJiraSourcesFromTasks(tasksQuery.data || []);
      const sources = integrationSources.length > 0 ? integrationSources : taskSources;

      return sources.filter(
        (source) => source.connectionStatus === "ACTIVE"
      );
    },
    [integrationsQuery.data?.jiraSources, options?.readerMode, tasksQuery.data]
  );

  const explicitlySelectedId =
    selection && selection.projectId === projectId ? selection.integrationId : null;
  const effectiveSourceId =
    activeSources.find((source) => source.integrationId === explicitlySelectedId)
      ?.integrationId || activeSources[0]?.integrationId;

  return {
    activeSources,
    effectiveSourceId,
    hasMultipleSources: activeSources.length > 1,
    isLoading: integrationsQuery.isLoading || tasksQuery.isLoading,
    integrationsQuery,
    tasksQuery,
    selectSource: (integrationId: string) => {
      if (!projectId) return;
      setSelection({ projectId, integrationId });
    },
  };
}
