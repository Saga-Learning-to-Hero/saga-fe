import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '@/types/auth';
import type { StudentCourse } from '@/features/student/courses/types/student-course';

const MOCK_USER: User = {
  id: 'mock-001',
  name: 'Lê Hoàng Hải',
  email: 'hai.lh@university.edu.vn',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=saga-user',
  role: 'STUDENT',
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  selectedCourse: StudentCourse | null;
  login: () => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  setSelectedCourse: (course: StudentCourse | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      selectedCourse: null,

      login: () =>
        set({
          isAuthenticated: true,
          user: MOCK_USER,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          selectedCourse: null,
        }),

      switchRole: (role: Role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),

      setSelectedCourse: (course: StudentCourse | null) =>
        set({
          selectedCourse: course,
        }),
    }),
    {
      name: 'saga-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        selectedCourse: state.selectedCourse,
      }),
    }
  )
);
