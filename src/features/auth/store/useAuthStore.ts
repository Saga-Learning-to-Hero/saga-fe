import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from '@/types/auth';
import type { StudentCourse } from '@/features/student/courses/types/student-course';

const MOCK_USER: User = {
  id: 'mock-001',
  name: 'Lê Hoàng Hải',
  email: 'hailhhe170504@fpt.edu.vn',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=saga-user',
  role: 'STUDENT',
  phone: '0987654321',
  studentCode: 'HE170504',
  department: 'Kỹ thuật phần mềm (SE)',
  adminClass: 'SE1701',
  bio: 'Sinh viên K17 ngành Kỹ thuật phần mềm. Đang thực hiện đồ án tốt nghiệp SAGA - Đồ thị hỗ trợ quản lý học tập.',
  jiraIntegration: {
    connected: true,
    serverUrl: 'https://saga-capstone.atlassian.net',
    email: 'hailhhe170504@fpt.edu.vn',
    apiToken: 'ATATT3xFfGF0k9X...91a2',
    projectKey: 'SWP490_SAGA',
    lastSyncedAt: '5 phút trước',
  },
  githubIntegration: {
    connected: true,
    username: 'lehoanghai-fpt',
    accessToken: 'ghp_7a9f8b1c2d3e4f5g6h7i8j9k0l',
    repository: 'Saga-Learning-to-Hero/saga-fe',
    defaultBranch: 'main',
    lastSyncedAt: '12 phút trước',
  },
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  selectedCourse: StudentCourse | null;
  login: () => void;
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

      updateUserProfile: (updatedFields: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
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
