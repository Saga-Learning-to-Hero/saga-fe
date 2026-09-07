import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JiraIntegrationsService } from "../api/jira-integrations-service";
import type { UserIdentityItem } from "../types/user-integrations";
import {
  USER_INTEGRATIONS_QUERY_KEY,
  saveCachedUserIdentities,
} from "./useUserIntegrations";

/**
 * Hook khởi tạo liên kết Jira cá nhân (POST /api/integrations/jira/link)
 */
export function useStartJiraLink() {
  return useMutation({
    mutationFn: (returnPath?: string) => JiraIntegrationsService.startLink(returnPath),
  });
}

/**
 * Hook đặt định danh Jira làm primary (PATCH /api/integrations/jira/{identityId}/primary)
 */
export function useSetPrimaryJiraIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) => JiraIntegrationsService.setPrimaryIdentity(identityId),
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
 * Hook xử lý OAuth Callback từ Jira (GET /api/integrations/jira/oauth/callback)
 */
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

/**
 * Hook hủy liên kết Jira cá nhân (DELETE /api/integrations/jira/{identityId})
 */
export function useDeleteJiraIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identityId: string) => JiraIntegrationsService.deleteIdentity(identityId),
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
