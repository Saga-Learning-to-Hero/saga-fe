import { useQuery } from "@tanstack/react-query";
import { StudentProjectService } from "../api/student-project-service";

export const PROJECT_INTEGRATIONS_QUERY_KEYS = {
  projectIntegrations: (projectId?: string | null) => ["projects", projectId, "integrations"] as const,
};

export function useProjectIntegrations(projectId?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PROJECT_INTEGRATIONS_QUERY_KEYS.projectIntegrations(projectId),
    queryFn: () => StudentProjectService.getProjectIntegrations(projectId!),
    enabled: (options?.enabled ?? true) && Boolean(projectId && projectId.trim()),
    staleTime: 1000 * 30,
  });
}
