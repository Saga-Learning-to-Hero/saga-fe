import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationBell } from "./notification-bell";
import * as notificationsHook from "../hooks/use-notifications";
import * as pushHook from "../hooks/use-push-notifications";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

describe("NotificationBell component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();

    vi.spyOn(pushHook, "usePushNotifications").mockReturnValue({
      permission: "default",
      isSupported: true,
      isRegistering: false,
      isRegistered: false,
      requestPermissionAndRegister: vi.fn().mockResolvedValue(true),
    });
  });

  it("UTCID01 - [N] Normal: Hien thi badge voi so luong thong bao chua doc", () => {
    vi.spyOn(notificationsHook, "useUnreadNotificationCount").mockReturnValue({
      data: { unreadCount: 7 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof notificationsHook.useUnreadNotificationCount>);

    vi.spyOn(notificationsHook, "useNotifications").mockReturnValue({
      data: { items: [], page: 0, size: 5, total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof notificationsHook.useNotifications>);

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell />
      </QueryClientProvider>
    );

    expect(screen.getByText("7")).toBeDefined();
  });

  it("UTCID02 - [B] Boundary: Badge hien thi 99+ khi unreadCount vuot qua 99", () => {
    vi.spyOn(notificationsHook, "useUnreadNotificationCount").mockReturnValue({
      data: { unreadCount: 150 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof notificationsHook.useUnreadNotificationCount>);

    vi.spyOn(notificationsHook, "useNotifications").mockReturnValue({
      data: { items: [], page: 0, size: 5, total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof notificationsHook.useNotifications>);

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell />
      </QueryClientProvider>
    );

    expect(screen.getByText("99+")).toBeDefined();
  });

  it("UTCID03 - [N] Normal: Click vao thong bao chua doc thi goi markRead va navigate actionUrl hop le", () => {
    const mockMarkRead = vi.fn();
    vi.spyOn(notificationsHook, "useMarkNotificationRead").mockReturnValue({
      mutate: mockMarkRead,
    } as unknown as ReturnType<typeof notificationsHook.useMarkNotificationRead>);

    vi.spyOn(notificationsHook, "useUnreadNotificationCount").mockReturnValue({
      data: { unreadCount: 1 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof notificationsHook.useUnreadNotificationCount>);

    vi.spyOn(notificationsHook, "useNotifications").mockReturnValue({
      data: {
        items: [
          {
            id: "notif-test-1",
            notificationType: "TASK",
            title: "Task mới được giao",
            message: "Bạn có task SAGA-100",
            actionUrl: "/student/sprint-progress",
            readAt: null,
            createdAt: new Date().toISOString(),
          },
        ],
        page: 0,
        size: 5,
        total: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof notificationsHook.useNotifications>);

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell />
      </QueryClientProvider>
    );

    const bellBtn = screen.getByRole("button", { name: "Thông báo" });
    fireEvent.click(bellBtn);

    const notifItem = screen.getByText("Task mới được giao");
    fireEvent.click(notifItem);

    expect(mockMarkRead).toHaveBeenCalledWith("notif-test-1");
    expect(mockPush).toHaveBeenCalledWith("/student/sprint-progress");
  });

  it("UTCID04 - [A] Abnormal: Thong bao co actionUrl khong an toan se khong navigate ngoai he thong", () => {
    const mockMarkRead = vi.fn();
    vi.spyOn(notificationsHook, "useMarkNotificationRead").mockReturnValue({
      mutate: mockMarkRead,
    } as unknown as ReturnType<typeof notificationsHook.useMarkNotificationRead>);

    vi.spyOn(notificationsHook, "useUnreadNotificationCount").mockReturnValue({
      data: { unreadCount: 0 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof notificationsHook.useUnreadNotificationCount>);

    vi.spyOn(notificationsHook, "useNotifications").mockReturnValue({
      data: {
        items: [
          {
            id: "notif-test-2",
            notificationType: "WARNING",
            title: "Cảnh báo bảo mật",
            message: "Liên kết độc hại",
            actionUrl: "https://evil.com/malware",
            readAt: "2026-09-16T10:00:00Z",
            createdAt: new Date().toISOString(),
          },
        ],
        page: 0,
        size: 5,
        total: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof notificationsHook.useNotifications>);

    render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell />
      </QueryClientProvider>
    );

    const bellBtn = screen.getByRole("button", { name: "Thông báo" });
    fireEvent.click(bellBtn);

    const notifItem = screen.getByText("Cảnh báo bảo mật");
    fireEvent.click(notifItem);

    expect(mockPush).not.toHaveBeenCalledWith("https://evil.com/malware");
  });
});
