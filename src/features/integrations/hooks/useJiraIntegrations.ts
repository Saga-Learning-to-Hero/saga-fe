import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JiraIntegrationsService } from "../api/jira-integrations-service";
import type { UserIdentityItem } from "../types/user-integrations";
import { USER_INTEGRATIONS_QUERY_KEY } from "./useUserIntegrations";

export function useStartJiraLink() {
  return useMutation({
    mutationFn: (returnPath?: string) => JiraIntegrationsService.startLink(returnPath),
  });
}

export function useSetPrimaryJiraIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) => JiraIntegrationsService.setPrimaryIdentity(identityId),
    onSuccess: (_, identityId) => {
      queryClient.setQueryData<UserIdentityItem[]>(USER_INTEGRATIONS_QUERY_KEY, (old = []) =>
        old.map((item) => ({
          ...item,
          primary: item.id === identityId,
        }))
      );
      queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    },
  });
}

export function useJiraOAuthCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      JiraIntegrationsService.handleOAuthCallback(code, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteJiraIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) => JiraIntegrationsService.deleteIdentity(identityId),
    onSuccess: (_, identityId) => {
      queryClient.setQueryData<UserIdentityItem[]>(USER_INTEGRATIONS_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== identityId)
      );
      queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    },
  });
}
