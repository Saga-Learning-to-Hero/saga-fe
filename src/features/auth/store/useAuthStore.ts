import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '@/types/auth';

const MOCK_USER: User = {
  id: 'mock-002',
  name: 'Nguyễn Mạnh Cường',
  email: 'lecturer@fe.edu.vn',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=saga-user',
  role: 'LECTURER',
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: () =>
        set({
          isAuthenticated: true,
          user: MOCK_USER,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
        }),

      switchRole: (role: Role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
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
