import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '@/types/auth';
import type { StudentCourse } from '@/features/student/courses/types/student-course';
import { MOCK_USERS } from '../data/mock-users';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  selectedCourse: StudentCourse | null;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (role: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  setSelectedCourse: (course: StudentCourse | null) => void;
  updateUserProfile: (updatedFields: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      selectedCourse: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      login: (role) => set({ isAuthenticated: true, user: MOCK_USERS[role] }),
      logout: () => set({ isAuthenticated: false, user: null, selectedCourse: null }),
      switchRole: (role) => set({ user: MOCK_USERS[role], selectedCourse: null }),
      setSelectedCourse: (course) => set({ selectedCourse: course }),
      updateUserProfile: (updatedFields) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updatedFields } : null })),
    }),
    {
      name: 'saga-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        selectedCourse: state.selectedCourse,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
