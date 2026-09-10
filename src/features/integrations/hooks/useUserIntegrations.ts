import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserIntegrationsService } from "../api/user-integrations-service";
import type { UserIdentityItem } from "../types/user-integrations";

export const USER_INTEGRATIONS_QUERY_KEY = ["user-integrations-me"] as const;

export function useUserIdentities() {
  const query = useQuery<UserIdentityItem[], Error>({
    queryKey: USER_INTEGRATIONS_QUERY_KEY,
    queryFn: () => UserIntegrationsService.getUserIdentities(),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const identities = query.data || [];

  const jiraIdentities = identities.filter(
    (i) => i.provider === "JIRA" || i.provider?.toUpperCase() === "JIRA"
  );

  const githubIdentities = identities.filter(
    (i) => i.provider === "GITHUB" || i.provider?.toUpperCase() === "GITHUB"
  );

  const primaryJiraIdentity =
    jiraIdentities.find((i) => i.primary) || jiraIdentities[0] || null;

  const primaryGitHubIdentity =
    githubIdentities.find((i) => i.primary) || githubIdentities[0] || null;

  return {
    ...query,
    identities,
    jiraIdentities,
    githubIdentities,
    jiraIdentity: primaryJiraIdentity,
    githubIdentity: primaryGitHubIdentity,
    primaryJiraIdentity,
    primaryGitHubIdentity,
    isJiraConnected: jiraIdentities.length > 0,
    isGitHubConnected: githubIdentities.length > 0,
    isInitialLoading: query.isLoading && !query.data,
  };
}

export function useRefreshUserIntegrations() {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    await queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
  }, [queryClient]);
}
