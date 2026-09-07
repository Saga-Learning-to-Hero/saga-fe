import { useQuery } from "@tanstack/react-query";
import { UserIntegrationsService } from "../api/user-integrations-service";
import type { UserIdentityItem } from "../types/user-integrations";

export const USER_INTEGRATIONS_QUERY_KEY = ["user-integrations-me"] as const;
const STORAGE_CACHE_KEY = "saga_user_identities_cache";

export function getCachedUserIdentities(): UserIdentityItem[] | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function saveCachedUserIdentities(identities: UserIdentityItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(identities));
  } catch {
    // ignore
  }
}

export function useUserIdentities() {
  const query = useQuery<UserIdentityItem[], Error>({
    queryKey: USER_INTEGRATIONS_QUERY_KEY,
    queryFn: async () => {
      const data = await UserIntegrationsService.getUserIdentities();
      saveCachedUserIdentities(data);
      return data;
    },
    // Nạp ngay lập tức dữ liệu từ bộ nhớ cục bộ khi reload (0ms)
    initialData: () => getCachedUserIdentities(),
    // Luôn gọi ngầm API để đồng bộ dữ liệu mới nhất từ server
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const identities = query.data || [];

  const jiraIdentity = identities.find(
    (i) => i.provider?.toUpperCase() === "JIRA"
  );

  const githubIdentity = identities.find(
    (i) => i.provider?.toUpperCase() === "GITHUB"
  );

  return {
    ...query,
    identities,
    jiraIdentity,
    githubIdentity,
    isJiraConnected: Boolean(jiraIdentity),
    isGitHubConnected: Boolean(githubIdentity),
    isInitialLoading: query.isLoading && !query.data,
  };
}
