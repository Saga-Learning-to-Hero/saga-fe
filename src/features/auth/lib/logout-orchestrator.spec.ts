import { describe, it, expect, vi, beforeEach } from "vitest";
import { performLogout, getPushInstallationStorageKey } from "./logout-orchestrator";
import { AuthService } from "../api/auth-service";
import { useAuthStore } from "../store/useAuthStore";
import { NotificationService } from "@/features/notification/api/notification-service";
import * as firebaseClient from "@/lib/firebase/firebase-client";

vi.mock("../api/auth-service", () => ({
  AuthService: {
    logout: vi.fn(),
  },
}));

vi.mock("@/features/notification/api/notification-service", () => ({
  NotificationService: {
    revokePushInstallation: vi.fn(),
  },
}));

vi.mock("@/lib/firebase/firebase-client", () => ({
  deletePushToken: vi.fn(),
}));

describe("LogoutOrchestrator", () => {
  const mockQueryClient = {
    setQueryData: vi.fn(),
    clear: vi.fn(),
  } as unknown as import("@tanstack/react-query").QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: "user-123",
        name: "Test User",
        fullName: "Test User",
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

  it("UTCID01 - [N] Normal: Logout thanh cong, thu hoi push va xoa token day du", async () => {
    const storageKey = getPushInstallationStorageKey("user-123");
    localStorage.setItem(storageKey, "install-xyz");

    vi.mocked(NotificationService.revokePushInstallation).mockResolvedValueOnce();
    vi.mocked(firebaseClient.deletePushToken).mockResolvedValueOnce(true);
    vi.mocked(AuthService.logout).mockResolvedValueOnce();

    const onRedirect = vi.fn();
    await performLogout({ queryClient: mockQueryClient, onRedirect });

    expect(NotificationService.revokePushInstallation).toHaveBeenCalledWith("install-xyz");
    expect(firebaseClient.deletePushToken).toHaveBeenCalled();
    expect(AuthService.logout).toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockQueryClient.clear).toHaveBeenCalled();
    expect(onRedirect).toHaveBeenCalled();
  });

  it("UTCID02 - [A] Abnormal: Revoke push that bai thi VAN PHAI logout thanh cong", async () => {
    const storageKey = getPushInstallationStorageKey("user-123");
    localStorage.setItem(storageKey, "install-xyz");

    vi.mocked(NotificationService.revokePushInstallation).mockRejectedValueOnce(
      new Error("Network Error")
    );
    vi.mocked(firebaseClient.deletePushToken).mockResolvedValueOnce(true);
    vi.mocked(AuthService.logout).mockResolvedValueOnce();

    const onRedirect = vi.fn();
    await performLogout({ queryClient: mockQueryClient, onRedirect });

    expect(NotificationService.revokePushInstallation).toHaveBeenCalledWith("install-xyz");
    expect(AuthService.logout).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockQueryClient.clear).toHaveBeenCalled();
    expect(onRedirect).toHaveBeenCalled();
  });

  it("UTCID03 - [A] Abnormal: Delete firebase token that bai thi VAN PHAI logout thanh cong", async () => {
    vi.mocked(firebaseClient.deletePushToken).mockRejectedValueOnce(new Error("Firebase internal"));
    vi.mocked(AuthService.logout).mockResolvedValueOnce();

    const onRedirect = vi.fn();
    await performLogout({ queryClient: mockQueryClient, onRedirect });

    expect(AuthService.logout).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(onRedirect).toHaveBeenCalled();
  });

  it("UTCID04 - [B] Boundary: Khong co installationId luu trong localStorage thi bo qua revoke", async () => {
    vi.mocked(firebaseClient.deletePushToken).mockResolvedValueOnce(true);
    vi.mocked(AuthService.logout).mockResolvedValueOnce();

    const onRedirect = vi.fn();
    await performLogout({ queryClient: mockQueryClient, onRedirect });

    expect(NotificationService.revokePushInstallation).not.toHaveBeenCalled();
    expect(AuthService.logout).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(onRedirect).toHaveBeenCalled();
  });
});
