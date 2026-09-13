import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentProjectService } from "../api/student-project-service";
import type {
  ProjectIntegrationsResponse,
  ProjectGitHubSetupCallbackParams,
  ConnectProjectGitHubOptions,
} from "../types/student-project";

export const PROJECT_INTEGRATIONS_QUERY_KEYS = {
  projectIntegrations: (projectId?: string | null) =>
    ["projects", projectId, "integrations"] as const,
  availableGitHubRepositories: (projectId?: string | null) =>
    ["projects", projectId, "integrations", "github", "repositories"] as const,
  githubReconnectCandidates: (projectId?: string | null) =>
    ["projects", projectId, "integrations", "github", "reconnect-candidates"] as const,
  jiraSites: (projectId?: string | null) =>
    ["projects", projectId, "integrations", "jira", "sites"] as const,
  jiraProjects: (projectId?: string | null, cloudId?: string | null) =>
    ["projects", projectId, "integrations", "jira", "projects", cloudId] as const,
  jiraBoards: (
    projectId?: string | null,
    cloudId?: string | null,
    jiraProjectId?: string | null
  ) => ["projects", projectId, "integrations", "jira", "boards", cloudId, jiraProjectId] as const,
};

export function useProjectIntegrations(
  projectId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
    queryFn: () => StudentProjectService.getProjectIntegrations(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useDisconnectProjectJira() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => StudentProjectService.disconnectProjectJira(projectId),
    onSuccess: async (_, projectId) => {
      queryClient.setQueryData(
        PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        (old: ProjectIntegrationsResponse | undefined) => {
          if (!old) return old;
          return { ...old, jira: old.jira ? { ...old.jira, status: "REVOKED" } : null };
        }
      );
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        exact: true,
      });
    },
  });
}

export function useDisconnectProjectGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => StudentProjectService.disconnectProjectGitHub(projectId),
    onSuccess: async (_, projectId) => {
      queryClient.setQueryData(
        PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        (old: ProjectIntegrationsResponse | undefined) => {
          if (!old) return old;
          return { ...old, github: null };
        }
      );
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        exact: true,
      });
    },
  });
}

export function useConnectProjectGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      ...options
    }: { projectId: string } & ConnectProjectGitHubOptions) =>
      StudentProjectService.connectProjectGitHub(projectId, options),
    onSuccess: async (_, { projectId }) => {
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        exact: true,
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.availableGitHubRepositories(projectId),
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.githubReconnectCandidates(projectId),
      });
    },
  });
}

export function useProjectGitHubReconnectCandidates(
  projectId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.githubReconnectCandidates(projectId),
    queryFn: () => StudentProjectService.getProjectGitHubReconnectCandidates(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectAvailableGitHubRepositories(
  projectId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.availableGitHubRepositories(projectId),
    queryFn: () => StudentProjectService.getProjectAvailableGitHubRepositories(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}

export function useProjectGitHubSetupCallback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      ...params
    }: ProjectGitHubSetupCallbackParams & { projectId: string }) =>
      StudentProjectService.handleProjectGitHubSetupCallback(projectId, params),
    onSuccess: async (_, { projectId }) => {
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        exact: true,
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.availableGitHubRepositories(projectId),
      });
    },
  });
}

export function useUpdateProjectGitHubRepositories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      repositories,
    }: {
      projectId: string;
      repositories: import("../types/student-project").SelectProjectGitHubRepoPayloadItem[];
    }) => StudentProjectService.updateProjectGitHubRepositories(projectId, repositories),
    onSuccess: async (_, { projectId }) => {
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        exact: true,
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.availableGitHubRepositories(projectId),
      });
    },
  });
}

export function useConnectProjectJira() {
  return useMutation({
    mutationFn: ({ projectId, returnPath }: { projectId: string; returnPath?: string }) =>
      StudentProjectService.connectProjectJira(projectId, returnPath),
  });
}

export function useProjectJiraSites(
  projectId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.jiraSites(projectId),
    queryFn: () => StudentProjectService.getProjectJiraSites(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useProjectJiraProjects(
  projectId?: string | null,
  cloudId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.jiraProjects(projectId, cloudId),
    queryFn: () => StudentProjectService.getProjectJiraProjects(projectId!, cloudId!),
    enabled:
      (options?.enabled ?? true) &&
      Boolean(projectId && projectId.trim()) &&
      Boolean(cloudId && cloudId.trim()),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useProjectJiraBoards(
  projectId?: string | null,
  cloudId?: string | null,
  jiraProjectId?: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.jiraBoards(projectId, cloudId, jiraProjectId),
    queryFn: () =>
      StudentProjectService.getProjectJiraBoards(projectId!, cloudId!, jiraProjectId!),
    enabled:
      (options?.enabled ?? true) &&
      Boolean(projectId && projectId.trim()) &&
      Boolean(cloudId && cloudId.trim()) &&
      Boolean(jiraProjectId && jiraProjectId.trim()),
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useUpdateProjectJira() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: import("../types/student-project").UpdateProjectJiraPayload;
    }) => StudentProjectService.updateProjectJira(projectId, payload),
    onSuccess: async (_, { projectId }) => {
      queryClient.removeQueries({
        queryKey: ["projects", projectId, "integrations", "jira"],
      });
      await queryClient.invalidateQueries({
        queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
        exact: true,
      });
    },
  });
}

