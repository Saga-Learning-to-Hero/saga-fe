"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { NotificationService } from "../api/notification-service";
import type {
  NotificationPageResponse,
  NotificationQueryParams,
  UnreadNotificationCountResponse,
} from "../types/notification";

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  lists: () => ["notifications", "list"] as const,
  list: (params?: NotificationQueryParams) => ["notifications", "list", params ?? {}] as const,
  unreadCount: () => ["notifications", "unread-count"] as const,
};

export function useNotifications(params?: NotificationQueryParams) {
  return useQuery<NotificationPageResponse>({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => NotificationService.getNotifications(params),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useUnreadNotificationCount() {
  return useQuery<UnreadNotificationCountResponse>({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: () => NotificationService.getUnreadCount(),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });

      const prevUnread = queryClient.getQueryData<UnreadNotificationCountResponse>(
        NOTIFICATION_QUERY_KEYS.unreadCount()
      );
      if (prevUnread && prevUnread.unreadCount > 0) {
        queryClient.setQueryData<UnreadNotificationCountResponse>(
          NOTIFICATION_QUERY_KEYS.unreadCount(),
          { unreadCount: Math.max(0, prevUnread.unreadCount - 1) }
        );
      }

      queryClient.setQueriesData<NotificationPageResponse>(
        { queryKey: NOTIFICATION_QUERY_KEYS.lists() },
        (old) => {
          if (!old || !Array.isArray(old.items)) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item
            ),
          };
        }
      );

      return { prevUnread };
    },
    onError: (_err, _id, context) => {
      if (context?.prevUnread) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount(), context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });

      const prevUnread = queryClient.getQueryData<UnreadNotificationCountResponse>(
        NOTIFICATION_QUERY_KEYS.unreadCount()
      );
      queryClient.setQueryData<UnreadNotificationCountResponse>(
        NOTIFICATION_QUERY_KEYS.unreadCount(),
        { unreadCount: 0 }
      );

      const now = new Date().toISOString();
      queryClient.setQueriesData<NotificationPageResponse>(
        { queryKey: NOTIFICATION_QUERY_KEYS.lists() },
        (old) => {
          if (!old || !Array.isArray(old.items)) return old;
          return {
            ...old,
            items: old.items.map((item) => ({ ...item, readAt: item.readAt || now })),
          };
        }
      );

      return { prevUnread };
    },
    onError: (_err, _variables, context) => {
      if (context?.prevUnread) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount(), context.prevUnread);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
}

export function useDebouncedNotificationInvalidate(delayMs = 300) {
  const queryClient = useQueryClient();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      timerRef.current = null;
    }, delayMs);
  }, [queryClient, delayMs]);
}
