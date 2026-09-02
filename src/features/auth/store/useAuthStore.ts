import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/types/auth";
import type { StudentCourse } from "@/features/student/courses/types/student-course";
import { AuthService } from "../api/auth-service";

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
        set({
          isAuthenticated: Boolean(user),
          user,
          passwordSetupRequired: user ? passwordSetupRequired : false,
          selectedCourse: user ? get().selectedCourse : null,
        }),

      loginWithCredentials: async (identifier, password) => {
        const res = await AuthService.login({ identifier, password });
        if (res.authenticated && res.user) {
          const mappedUser: User = {
            id: res.user.id,
            name: res.user.fullName,
            fullName: res.user.fullName,
            email: res.user.email,
            avatar: res.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${res.user.id}`,
            role: res.user.role,
            status: "ACTIVE",
          };

          set({
            isAuthenticated: true,
            user: mappedUser,
            passwordSetupRequired: res.passwordSetupRequired,
          });

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
              avatar: res.user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${res.user.id}`,
              role: res.user.role,
              status: "ACTIVE",
            };

            set({
              isAuthenticated: true,
              user: mappedUser,
              passwordSetupRequired: res.passwordSetupRequired,
            });

            return mappedUser;
          } else {
            if (get().isAuthenticated || get().user) {
              set({ isAuthenticated: false, user: null, passwordSetupRequired: false, selectedCourse: null });
            }
            return null;
          }
        } catch {
          if (get().isAuthenticated || get().user) {
            set({ isAuthenticated: false, user: null, passwordSetupRequired: false, selectedCourse: null });
          }
          return null;
        }
      },

      logout: async () => {
        try {
          await AuthService.logout();
        } catch {
        } finally {
          set({
            isAuthenticated: false,
            user: null,
            selectedCourse: null,
            passwordSetupRequired: false,
          });
        }
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
  window.addEventListener("saga:unauthorized", (e: Event) => {
    const customEvt = e as CustomEvent<{ url?: string; pathname?: string }>;
    const store = useAuthStore.getState();
    if (store.isAuthenticated || store.user) {
      store.setUser(null);
      const currentPath = customEvt.detail?.pathname || window.location.pathname;
      const isAuthRoute =
        currentPath.startsWith("/login") ||
        currentPath.startsWith("/register") ||
        currentPath.startsWith("/auth/");

      if (!isAuthRoute) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
      }
    }
  });
}

