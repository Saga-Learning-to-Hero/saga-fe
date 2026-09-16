import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserRealtimeProvider } from "./user-realtime-provider";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import * as logoutOrchestrator from "@/features/auth/lib/logout-orchestrator";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/features/auth/lib/logout-orchestrator", () => ({
  performLogout: vi.fn(),
  getPushInstallationStorageKey: vi.fn().mockReturnValue("key"),
}));

vi.mock("@/lib/firebase/firebase-client", () => ({
  isFirebaseMessagingSupported: vi.fn().mockResolvedValue(false),
  getClientMessaging: vi.fn().mockReturnValue(null),
}));

class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  options?: EventSourceInit;
  listeners: Record<string, ((event?: unknown) => void)[]> = {};
  closed = false;

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.options = options;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event?: unknown) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event?: unknown) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
    }
  }

  close() {
    this.closed = true;
  }

  emit(type: string, data?: unknown) {
    if (this.listeners[type]) {
      this.listeners[type].forEach((l) => l(data));
    }
  }
}

describe("UserRealtimeProvider", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    MockEventSource.instances = [];
    // @ts-expect-error Mocking global EventSource
    global.EventSource = MockEventSource;

    queryClient = new QueryClient();
    vi.spyOn(queryClient, "invalidateQueries");

    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: "user-test-1",
        name: "Test",
        fullName: "Test",
        username: "test",
        email: "test@example.com",
        avatar: "",
        role: "STUDENT",
        status: "ACTIVE",
      },
      selectedCourse: null,
      passwordSetupRequired: false,
    });
  });

  it("UTCID01 - [N] Normal: Khoi tao dung mot EventSource voi withCredentials", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserRealtimeProvider>
          <div>Child Content</div>
        </UserRealtimeProvider>
      </QueryClientProvider>
    );

    expect(MockEventSource.instances).toHaveLength(1);
    const instance = MockEventSource.instances[0];
    expect(instance.url).toContain("/api/users/me/events");
    expect(instance.options?.withCredentials).toBe(true);
  });

  it("UTCID02 - [N] Normal: Su kien READY va NOTIFICATION_CREATED chi kich hoat invalidate query", async () => {
    vi.useFakeTimers();

    render(
      <QueryClientProvider client={queryClient}>
        <UserRealtimeProvider>
          <div>Child Content</div>
        </UserRealtimeProvider>
      </QueryClientProvider>
    );

    const instance = MockEventSource.instances[0];

    act(() => {
      instance.emit("READY", { type: "READY" });
      instance.emit("NOTIFICATION_CREATED", { type: "NOTIFICATION_CREATED", notificationId: "123" });
    });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(queryClient.invalidateQueries).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("UTCID03 - [A] Abnormal: Su kien ACCOUNT_DISABLED dong EventSource va goi performLogout", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserRealtimeProvider>
          <div>Child Content</div>
        </UserRealtimeProvider>
      </QueryClientProvider>
    );

    const instance = MockEventSource.instances[0];

    act(() => {
      instance.emit("ACCOUNT_DISABLED", { type: "ACCOUNT_DISABLED" });
    });

    expect(instance.closed).toBe(true);
    expect(logoutOrchestrator.performLogout).toHaveBeenCalled();
  });

  it("UTCID04 - [B] Boundary: Dong EventSource khi unmount", () => {
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <UserRealtimeProvider>
          <div>Child Content</div>
        </UserRealtimeProvider>
      </QueryClientProvider>
    );

    const instance = MockEventSource.instances[0];
    expect(instance.closed).toBe(false);

    unmount();
    expect(instance.closed).toBe(true);
  });
});
