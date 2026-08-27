import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '@/types/auth';
import { MOCK_USERS } from '../data/mock-users';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  /** Login as the mock user for `role`. In production this would accept credentials and call an API. */
  login: (role: Role) => void;
  logout: () => void;
  /** Dev-only: switch role without re-authenticating (keeps the matching mock user data). */
  switchRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: (role: Role) =>
        set({
          isAuthenticated: true,
          user: MOCK_USERS[role],
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
        }),

      switchRole: (role: Role) =>
        set({
          user: MOCK_USERS[role],
        }),
    }),
    {
      name: 'saga-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
