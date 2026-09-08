import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GitHubIntegrationsService } from "../api/github-integrations-service";
import type { UserIdentityItem } from "../types/user-integrations";
import { USER_INTEGRATIONS_QUERY_KEY } from "./useUserIntegrations";

export function useStartGitHubLink() {
  return useMutation({
    mutationFn: (returnPath?: string) => GitHubIntegrationsService.startLink(returnPath),
  });
}

export function useSetPrimaryGitHubIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) => GitHubIntegrationsService.setPrimaryIdentity(identityId),
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

export function useGitHubOAuthCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      GitHubIntegrationsService.handleOAuthCallback(code, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteGitHubIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) => GitHubIntegrationsService.deleteIdentity(identityId),
    onSuccess: (_, identityId) => {
      queryClient.setQueryData<UserIdentityItem[]>(USER_INTEGRATIONS_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== identityId)
      );
      queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    },
  });
}
