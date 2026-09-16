"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { connectUserEvents, closeUserEvents } from "../lib/user-events";

/**
 * Hook duy trì duy nhất 1 kết nối SSE /api/users/me/events trong toàn bộ phiên authenticated.
 * Tự động ngắt kết nối khi đăng xuất hoặc unmount.
 */
export function useUserEvents() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      closeUserEvents();
      return;
    }

    connectUserEvents();

    return () => {
      // Khi unmount khỏi layout hoặc đổi trạng thái auth
      closeUserEvents();
    };
  }, [isAuthenticated, user]);
}
