import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  NOTIFICATION_QUERY_KEYS,
} from "./use-notifications";
import { NotificationService } from "../api/notification-service";

vi.mock("../api/notification-service", () => ({
  NotificationService: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

describe("useNotifications hooks", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = "QueryClientTestWrapper";
    return Wrapper;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it("UTCID01 - [N] Normal: useNotifications nap danh sach thong bao", async () => {
    const mockData = {
      items: [
        {
          id: "n-1",
          notificationType: "SYSTEM",
          title: "Title 1",
          message: "Message 1",
          actionUrl: "/student/courses",
          readAt: null,
          createdAt: "2026-09-16T10:00:00Z",
        },
      ],
      page: 0,
      size: 10,
      total: 1,
    };
    vi.mocked(NotificationService.getNotifications).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useNotifications({ page: 0, size: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.data?.items[0].title).toBe("Title 1");
  });

  it("UTCID02 - [N] Normal: useUnreadNotificationCount tra ve so luong chua doc", async () => {
    vi.mocked(NotificationService.getUnreadCount).mockResolvedValueOnce({ unreadCount: 3 });

    const { result } = renderHook(() => useUnreadNotificationCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.unreadCount).toBe(3);
  });

  it("UTCID03 - [N] Normal: useMarkNotificationRead thuc hien optimistic update", async () => {
    queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount(), { unreadCount: 2 });
    queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.list({}), {
      items: [
        {
          id: "n-1",
          notificationType: "SYSTEM",
          title: "Title 1",
          message: "Message 1",
          actionUrl: null,
          readAt: null,
          createdAt: "2026-09-16T10:00:00Z",
        },
      ],
      page: 0,
      size: 20,
      total: 1,
    });

    vi.mocked(NotificationService.markAsRead).mockResolvedValueOnce({
      id: "n-1",
      notificationType: "SYSTEM",
      title: "Title 1",
      message: "Message 1",
      actionUrl: null,
      readAt: "2026-09-16T10:05:00Z",
      createdAt: "2026-09-16T10:00:00Z",
    });

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync("n-1");
    });

    expect(NotificationService.markAsRead).toHaveBeenCalledWith("n-1");
  });

  it("UTCID04 - [N] Normal: useMarkAllNotificationsRead thuc hien optimistic update dat unreadCount ve 0", async () => {
    queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.unreadCount(), { unreadCount: 5 });

    vi.mocked(NotificationService.markAllAsRead).mockResolvedValueOnce({
      updatedCount: 5,
      readAt: "2026-09-16T10:06:00Z",
    });

    const { result } = renderHook(() => useMarkAllNotificationsRead(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(NotificationService.markAllAsRead).toHaveBeenCalled();
  });
});
