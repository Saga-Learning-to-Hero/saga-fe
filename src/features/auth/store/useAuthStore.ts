import { showErrorToast, showInfoToast } from "@/lib/api-error";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/types/auth";
import type { StudentCourse } from "@/features/student/courses/types/student-course";
import { AuthService } from "../api/auth-service";
import { performLogout } from "../lib/logout-orchestrator";
import { isUnauthorizedError } from "@/lib/api-error";
import { closeUserEvents, resetAccountDisabledState } from "../lib/user-events";
import { getQueryClient } from "@/providers/query-provider";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  selectedCourse: StudentCourse | null;
  passwordSetupRequired: boolean;

  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  setUser: (user: User | null, passwordSetupRequired?: boolean) => void;
  loginWithCredentials: (identifier: string, password: string) => Promise<User>;
  checkSession: () => Promise<User | null>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
  setSelectedCourse: (course: StudentCourse | null) => void;
  updateUserProfile: (updatedFields: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      selectedCourse: null,
      passwordSetupRequired: false,
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      setUser: (user, passwordSetupRequired = false) =>
        set((state) => ({
          isAuthenticated: Boolean(user),
          user,
          passwordSetupRequired: user ? passwordSetupRequired : false,
          selectedCourse: user && state.user?.id === user.id ? state.selectedCourse : null,
        })),

      loginWithCredentials: async (identifier, password) => {
        resetAccountDisabledState();
        const res = await AuthService.login({ identifier, password });
        if (res.authenticated && res.user) {
          const mappedUser: User = {
            id: res.user.id,
            name: res.user.fullName,
            fullName: res.user.fullName,
            email: res.user.email,
            avatar: res.user.avatarUrl || "",
            role: res.user.role,
            status: "ACTIVE",
          };

          set((state) => ({
            isAuthenticated: true,
            user: mappedUser,
            passwordSetupRequired: res.passwordSetupRequired,
            selectedCourse: state.user?.id === mappedUser.id ? state.selectedCourse : null,
          }));

          return mappedUser;
        }
        throw new Error("Không thể xác thực phiên đăng nhập từ máy chủ SAGA");
      },

      checkSession: async () => {
        try {
          const res = await AuthService.getMe();
          if (res.authenticated && res.user) {
            const mappedUser: User = {
              id: res.user.id,
              name: res.user.fullName,
              fullName: res.user.fullName,
              email: res.user.email,
              avatar: res.user.avatarUrl || "",
              role: res.user.role,
              status: "ACTIVE",
            };

            set((state) => ({
              isAuthenticated: true,
              user: mappedUser,
              passwordSetupRequired: res.passwordSetupRequired,
              selectedCourse: state.user?.id === mappedUser.id ? state.selectedCourse : null,
            }));

            return mappedUser;
          } else {
            if (get().isAuthenticated || get().user) {
              set({ isAuthenticated: false, user: null, passwordSetupRequired: false, selectedCourse: null });
            }
            return null;
          }
        } catch (error) {
          // authenticated=false đã xử lý phía trên; 401 mới xóa phiên, lỗi mạng/5xx giữ danh tính.
          if (isUnauthorizedError(error)) {
            if (get().isAuthenticated || get().user) {
              set({ isAuthenticated: false, user: null, passwordSetupRequired: false, selectedCourse: null });
            }
            return null;
          }
          throw error;
        }
      },

      logout: async () => {
        closeUserEvents();
        try {
          getQueryClient().clear();
        } catch {
        }
        await performLogout();
      },

      switchRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
          selectedCourse: null,
        })),

      setSelectedCourse: (course) => set({ selectedCourse: course }),
      updateUserProfile: (updatedFields) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updatedFields } : null })),
    }),
    {
      name: "saga-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        selectedCourse: state.selectedCourse,
        passwordSetupRequired: state.passwordSetupRequired,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

if (typeof window !== "undefined") {
  // Lắng nghe sự kiện tài khoản bị khóa qua SSE hoặc qua HTTP 403 ACCOUNT_DISABLED
  window.addEventListener("saga:account-disabled", (e: Event) => {
    const customEvt = e as CustomEvent<{ message?: string }>;
    closeUserEvents();

    const store = useAuthStore.getState();
    if (store.isAuthenticated || store.user) {
      store.setUser(null);
      try {
        getQueryClient().clear();
      } catch {
        // Bỏ qua nếu queryClient chưa sẵn sàng
      }

      // Best-effort logout (không chặn hay phụ thuộc vào response)
      AuthService.logout().catch(() => { });

      const noticeMsg =
        customEvt.detail?.message ||
        "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên nếu bạn cần hỗ trợ.";
      showErrorToast(noticeMsg);

      if (window.location.pathname !== "/account-disabled") {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/account-disabled";
      }
    }
  });

  // Lắng nghe sự kiện hết hạn phiên / 401 INVALID_CREDENTIALS
  window.addEventListener("saga:unauthorized", (e: Event) => {
    const customEvt = e as CustomEvent<{ url?: string; pathname?: string; code?: string; message?: string }>;
    closeUserEvents();

    const store = useAuthStore.getState();
    if (store.isAuthenticated || store.user) {
      store.setUser(null);
      try {
        getQueryClient().clear();
      } catch {
        // Bỏ qua nếu queryClient chưa sẵn sàng
      }

      const currentPath = customEvt.detail?.pathname || window.location.pathname;
      const isAuthRoute =
        currentPath.startsWith("/login") ||
        currentPath.startsWith("/register") ||
        currentPath.startsWith("/auth/") ||
        currentPath.startsWith("/account-disabled");

      showInfoToast(customEvt.detail?.message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

      if (!isAuthRoute) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
      }
    }
  });
}

