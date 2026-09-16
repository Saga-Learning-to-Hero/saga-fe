"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { onMessage } from "firebase/messaging";
import { toast } from "@/components/ui/sonner";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { performLogout } from "@/features/auth/lib/logout-orchestrator";
import { useDebouncedNotificationInvalidate } from "../hooks/use-notifications";
import { getClientMessaging, isFirebaseMessagingSupported } from "@/lib/firebase/firebase-client";

interface UserRealtimeContextValue {
  isConnected: boolean;
}

const UserRealtimeContext = createContext<UserRealtimeContextValue>({ isConnected: false });

export function useUserRealtime() {
  return useContext(UserRealtimeContext);
}

export function UserRealtimeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const debouncedInvalidate = useDebouncedNotificationInvalidate(300);
  const eventSourceRef = useRef<EventSource | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const sseUrl = `${apiBase}/api/users/me/events`;
    const es = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = es;

    const handleReady = () => {
      debouncedInvalidate();
    };

    const handleNotificationCreated = () => {
      debouncedInvalidate();
    };

    const handleAccountDisabled = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      toast.error("Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa.");
      void performLogout({
        queryClient,
        onRedirect: () => router.replace("/login"),
      });
    };

    es.addEventListener("READY", handleReady);
    es.addEventListener("NOTIFICATION_CREATED", handleNotificationCreated);
    es.addEventListener("ACCOUNT_DISABLED", handleAccountDisabled);

    return () => {
      es.removeEventListener("READY", handleReady);
      es.removeEventListener("NOTIFICATION_CREATED", handleNotificationCreated);
      es.removeEventListener("ACCOUNT_DISABLED", handleAccountDisabled);
      es.close();
      if (eventSourceRef.current === es) {
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated, userId, debouncedInvalidate, queryClient, router]);

  useEffect(() => {
    if (!isAuthenticated || !userId || typeof window === "undefined") return;

    let unsubscribe: (() => void) | undefined;

    void isFirebaseMessagingSupported().then((supported) => {
      if (!supported) return;
      const messaging = getClientMessaging();
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        debouncedInvalidate();
        const title = payload.notification?.title || payload.data?.title;
        const body = payload.notification?.body || payload.data?.message;
        if (title) {
          toast.info(title, {
            id: `fcm-${payload.messageId || Date.now()}`,
            description: body || undefined,
          });
        }
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated, userId, debouncedInvalidate]);

  return (
    <UserRealtimeContext.Provider value={{ isConnected: true }}>
      {children}
    </UserRealtimeContext.Provider>
  );
}
