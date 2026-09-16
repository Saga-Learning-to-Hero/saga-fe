import type { QueryClient } from "@tanstack/react-query";
import { AuthService } from "../api/auth-service";
import { useAuthStore } from "../store/useAuthStore";
import { AUTH_QUERY_KEY } from "../hooks/useAuth";
import { NotificationService } from "@/features/notification/api/notification-service";
import { deletePushToken } from "@/lib/firebase/firebase-client";

export function getPushInstallationStorageKey(userId?: string | null): string {
  return userId ? `saga_push_installation_id_${userId}` : "saga_push_installation_id";
}

export interface LogoutOptions {
  queryClient?: QueryClient | null;
  onRedirect?: () => void;
  showToast?: boolean;
}

export async function performLogout(options?: LogoutOptions): Promise<void> {
  const currentUser = useAuthStore.getState().user;
  const storageKey = getPushInstallationStorageKey(currentUser?.id);

  if (typeof window !== "undefined") {
    const installationId = localStorage.getItem(storageKey);
    if (installationId) {
      try {
        await NotificationService.revokePushInstallation(installationId);
      } catch {
      } finally {
        localStorage.removeItem(storageKey);
      }
    }
  }

  try {
    await deletePushToken();
  } catch {
  }

  try {
    await AuthService.logout();
  } catch {
  } finally {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      selectedCourse: null,
      passwordSetupRequired: false,
    });

    if (options?.queryClient) {
      options.queryClient.setQueryData(AUTH_QUERY_KEY, {
        authenticated: false,
        passwordSetupRequired: false,
        user: null,
      });
      options.queryClient.clear();
    }

    if (options?.onRedirect) {
      options.onRedirect();
    } else if (typeof window !== "undefined") {
      window.open("/login", "_self");
    }
  }
}
