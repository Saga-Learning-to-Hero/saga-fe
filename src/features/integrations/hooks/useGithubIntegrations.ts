import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GitHubIntegrationsService } from "../api/github-integrations-service";
import type { UserIdentityItem } from "../types/user-integrations";
import {
  USER_INTEGRATIONS_QUERY_KEY,
  saveCachedUserIdentities,
} from "./useUserIntegrations";

/**
 * Hook khởi tạo liên kết GitHub cá nhân (POST /api/integrations/github/link)
 */
export function useStartGitHubLink() {
  return useMutation({
    mutationFn: (returnPath?: string) => GitHubIntegrationsService.startLink(returnPath),
  });
}

/**
 * Hook đặt định danh GitHub làm primary (PATCH /api/integrations/github/{identityId}/primary)
 */
export function useSetPrimaryGitHubIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) => GitHubIntegrationsService.setPrimaryIdentity(identityId),
    onSuccess: (_, identityId) => {
      queryClient.setQueryData<UserIdentityItem[]>(USER_INTEGRATIONS_QUERY_KEY, (old = []) => {
        const updated = old.map((item) => ({
          ...item,
          primary: item.id === identityId,
        }));
        saveCachedUserIdentities(updated);
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    },
  });
}

/**
 * Hook xử lý OAuth Callback từ GitHub (GET /api/integrations/github/oauth/callback)
 */
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

/**
 * Hook hủy liên kết GitHub cá nhân (DELETE /api/integrations/github/{identityId})
 */
export function useDeleteGitHubIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) => GitHubIntegrationsService.deleteIdentity(identityId),
    onSuccess: (_, identityId) => {
      queryClient.setQueryData<UserIdentityItem[]>(USER_INTEGRATIONS_QUERY_KEY, (old = []) => {
        const updated = old.filter((item) => item.id !== identityId);
        saveCachedUserIdentities(updated);
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: USER_INTEGRATIONS_QUERY_KEY });
    },
  });
}
